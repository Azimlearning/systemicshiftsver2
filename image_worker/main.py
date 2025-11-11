# image_worker/main.py (Python Cloud Function)

import functions_framework
import requests
import json
import os

# --- Configuration ---
OPENROUTER_CHAT_URL = "https://openrouter.ai/api/v1/chat/completions"
# Using a stable, standard image model for this type of API structure
IMAGE_MODEL = "stabilityai/stable-diffusion-xl" 
OPENROUTER_API_KEY = os.environ.get("OPENROUTER_API_KEY") 

@functions_framework.http
def generate_image_worker(request):
    """
    Receives JSON prompt via HTTP request from Node.js function,
    calls OpenRouter Multimodal API, and returns the image URL.
    """
    try:
        if request.method != 'POST':
            return ('Method Not Allowed', 405)

        if not OPENROUTER_API_KEY:
             raise ValueError("OPENROUTER_API_KEY is not set in environment.")

        request_json = request.get_json(silent=True)
        prompt = request_json.get('prompt')
        
        if not prompt:
            return (json.dumps({"status": "error", "message": "Missing 'prompt' in request body."}), 400)

        # 1. API Call Headers (Authorization is read from environment)
        headers = {
            "Authorization": f"Bearer {OPENROUTER_API_KEY}",
            "Content-Type": "application/json",
            "HTTP-Referer": os.environ.get("FUNCTION_TARGET") or "systemic-shifts-python-worker",
            "X-Title": "Python Image Worker",
        }

        # 2. Payload (Multimodal Chat API standard)
        payload = {
            "model": IMAGE_MODEL,
            "messages": [{"role": "user", "content": prompt}],
            "modalities": ["image", "text"], # CRITICAL: Enables image output
            "image_config": {
                "aspect_ratio": "16:9" 
            }
        }

        response = requests.post(OPENROUTER_CHAT_URL, headers=headers, json=payload)
        response.raise_for_status() # Raises HTTPError for 4xx or 5xx responses
        
        data = response.json()
        
        # 3. Extract Image URL from the nested structure
        if data.get("choices") and data["choices"][0].get("message") and data["choices"][0]["message"].get("images"):
            image_url = data["choices"][0]["message"]["images"][0]["image_url"]["url"]
            
            return (json.dumps({"status": "ok", "image_url": image_url, "model": IMAGE_MODEL}), 200)
        else:
            return (json.dumps({"status": "error", "message": "API succeeded but returned no image data."}), 500)

    except Exception as e:
        # Catch any exceptions during runtime and return 500 error
        return (json.dumps({"status": "error", "message": f"Worker Error: {str(e)}"}), 500)