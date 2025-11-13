
import functions_framework
import os
import requests
from flask import jsonify
import re
import json

# --- Config ---
OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions"
# Using a standard, known image generation model
MODEL = "openai/gpt-5-image-mini"
API_KEY = os.environ.get("OPENROUTER_API_KEY")

@functions_framework.http
def generate_image_worker(request):
    if not API_KEY:
        return jsonify({"status": "error", "message": "API key missing"}), 500

    data = request.get_json(silent=True)
    prompt = data.get("prompt") if data else None
    if not prompt:
        return jsonify({"status": "error", "message": "Missing 'prompt'"}), 400

    headers = {
        "Authorization": f"Bearer {API_KEY}",
        "Content-Type": "application/json",
        "X-Title": "Systemic Shifts Infographic Gen", # Optional: For OpenRouter analytics
    }

    # Standard payload for DALL-E 3 via a chat completions-style API
    payload = {
        "model": MODEL,
        "messages": [{"role": "user", "content": prompt}],
    }

    try:
        # Using a long timeout, as image generation can be slow
        response = requests.post(OPENROUTER_URL, headers=headers, json=payload, timeout=180)
        response.raise_for_status() # Raises HTTPError for bad responses (4xx or 5xx)
        result = response.json()

        print(f"OpenRouter Full Response: {json.dumps(result, indent=2)}")

        choices = result.get("choices", [])
        if not choices:
            return jsonify({"status": "error", "message": "No 'choices' in OpenRouter response", "data": result}), 500

        content = choices[0].get("message", {}).get("content", "")
        if not content:
            return jsonify({"status": "error", "message": "Empty content in response choice", "data": result}), 500

        # Defensive parsing for multiple image data formats
        # 1. Markdown-wrapped data URI: ![...](data:image/png;base64,...)
        match = re.search(r'!\\[.*?]\\((data:image/[a-zA-Z]+;base64,[^\\)]+)\')', content)
        if match:
            image_url = match.group(1)
        # 2. Raw data URI: data:image/png;base64,...
        elif content.startswith("data:image/"):
            image_url = content
        # 3. Direct URL: http...
        elif content.startswith("http"):
            image_url = content
        # 4. Fallback: Assume it's a raw base64 string
        else:
            image_url = f"data:image/png;base64,{content}"

        return jsonify({"status": "success", "image_url": image_url})

    except requests.exceptions.HTTPError as e:
        err_status = e.response.status_code
        try:
            # Try to parse a structured error from the API
            err = e.response.json()
            msg = err.get("error", {}).get("message", f"HTTP {err_status}")
        except json.JSONDecodeError:
            # Fallback if the error response isn't JSON
            msg = e.response.text[:200] if e.response else "Unknown error"
        # Return a detailed error response, including the payload that was sent
        return jsonify({"status": "error", "message": msg, "code": err_status, "payload_sent": payload}), err_status

    except Exception as e:
        # Catch any other unexpected errors
        print(f"Unexpected Error: {e}")
        return jsonify({"status": "error", "message": str(e)}), 500
