# image_worker/main.py (Python Cloud Function)

import functions_framework
import requests
import json
import os

# --- Configuration ---
OPENROUTER_CHAT_URL = "https://openrouter.ai/api/v1/chat/completions"
OPENROUTER_API_KEY = os.environ.get("OPENROUTER_API_KEY")

@functions_framework.http
def imageGeneratorHttp(request):
    """
    Receives a prompt and a model via HTTP, calls the OpenRouter API,
    and returns the resulting image URL.
    """
    try:
        if request.method != 'POST':
            return ('Method Not Allowed', 405)

        request_json = request.get_json(silent=True)
        
        # 1. Get Prompt and Model from Node.js
        prompt = request_json.get('prompt')
        model = request_json.get('model')

        if not prompt or not model:
            return (json.dumps({"status": "error", "message": "Missing 'prompt' or 'model' in request body."}), 400)

        if not OPENROUTER_API_KEY:
             raise ValueError("OPENROUTER_API_KEY is not set in environment.")

        # 2. API Call Headers
        headers = {
            "Authorization": f"Bearer {OPENROUTER_API_KEY}",
            "Content-Type": "application/json",
            "HTTP-Referer": os.environ.get("FUNCTION_TARGET") or "systemic-shifts-python-worker",
            "X-Title": "Python Image Worker",
        }

        # 3. Payload (Now with dynamic model)
        payload = {
            "model": model, # Use model from the request
            "messages": [
                {"role": "user", "content": prompt}
            ],
            "modalities": ["image", "text"],
            "image_config": {"aspect_ratio": "1:1"}
        }

        # 4. Request and Error Handling
        response = requests.post(OPENROUTER_CHAT_URL, headers=headers, json=payload)
        response.raise_for_status()
        
        data = response.json()
        
        # 5. Extract Image URL
        if data.get("choices") and data["choices"][0].get("message") and data["choices"][0]["message"].get("images"):
            image_url = data["choices"][0]["message"]["images"][0]["image_url"]["url"]
            return (json.dumps({"status": "ok", "image_url": image_url, "model_used": model}), 200)
        else:
            error_message = data.get('error', {}).get('message', 'API returned no image data.')
            return (json.dumps({"status": "error", "message": error_message, "model_attempted": model}), 500)

    except requests.exceptions.RequestException as e:
        status_code = e.response.status_code if e.response else 'Timeout'
        return (json.dumps({"status": "error", "message": f"Worker HTTP Error on model {model}: Status {status_code}"}), 500)
    except Exception as e:
        return (json.dumps({"status": "error", "message": f"Worker Error on model {model}: {str(e)}"}), 500)
