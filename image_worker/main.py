# main.py (Python Cloud Function - Corrected for Generation)

import functions_framework
import json
import os
import requests
from flask import jsonify

# --- Configuration ---
# CRITICAL: Use the chat completions endpoint for multimodal tasks
OPENROUTER_CHAT_URL = "https://openrouter.ai/api/v1/chat/completions"
# Use a reliable, fast image model that supports the text-to-image structure
IMAGE_MODEL = "openai/gpt-5-image-mini" 
OPENROUTER_API_KEY = os.environ.get("OPENROUTER_API_KEY") 

@functions_framework.http
def generate_image_worker(request):
    """
    Parses the incoming HTTP request, calls the OpenRouter API for image generation,
    and returns the image URL in a JSON response.
    """
    
    # 1. Check for API Key
    if not OPENROUTER_API_KEY:
        return jsonify({"status": "error", "message": "Server configuration error: API key not set."}), 500

    # 2. Parse Incoming Request
    request_json = request.get_json(silent=True)
    if not request_json or 'prompt' not in request_json:
        return jsonify({"status": "error", "message": "Invalid request: 'prompt' is required."}), 400
    
    prompt = request_json['prompt']

    # 3. API Call Headers
    headers = {
        "Authorization": f"Bearer {OPENROUTER_API_KEY}",
        "Content-Type": "application/json",
        "HTTP-Referer": "systemic-shifts-python-worker",
        "X-Title": "Python Image Generator",
    }

    # 4. Payload (Corrected for Text-to-Image Generation)
    payload = {
        "model": IMAGE_MODEL,
        "messages": [
            {
                "role": "user",
                "content": prompt # ONLY SEND THE TEXT PROMPT
            }
        ],
        # CRITICAL: This is the structure that triggers image generation output
        "extra_body": {
            "response_format": {"type": "image"}, 
            "image_config": {"aspect_ratio": "16:9"} # Standard landscape for infographic banner
        }
    }

    # 5. Request and Error Handling
    try:
        response = requests.post(OPENROUTER_CHAT_URL, headers=headers, json=payload)
        response.raise_for_status()  # Raise HTTPError for bad status codes (4xx or 5xx)
        
        data = response.json()
        
        # 6. Extract Image URL
        if data.get("choices") and data["choices"][0].get("message"):
            image_url = data["choices"][0]["message"]["content"]
            
            result = {
                "status": "ok",
                "image_url": image_url,
                "model": IMAGE_MODEL
            }
            return jsonify(result), 200
        else:
            error_message = data.get('error', {}).get('message', 'API returned an unexpected response structure.')
            return jsonify({"status": "error", "message": error_message}), 500

    except requests.exceptions.RequestException as e:
        status_code = e.response.status_code if e.response is not None else 500
        error_body = e.response.text if e.response is not None else "Timeout or network error"
        return jsonify({"status": "error", "message": f"HTTP/Network Error: Status {status_code}", "details": error_body}), status_code
    except Exception as e:
        return jsonify({"status": "error", "message": f"Unexpected Error: {str(e)}"}), 500
