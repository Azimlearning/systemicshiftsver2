# functions/scripts/image_generator.py

import sys
import json
import os
import argparse
import requests

# --- Configuration ---
OPENROUTER_IMAGE_URL = "https://openrouter.ai/api/v1/images/generations"

def generate_image():
    """
    Parses command-line arguments and calls the OpenRouter Image API.
    Prints a JSON object containing the result to stdout.
    """
    
    # 1. Argument Parsing
    parser = argparse.ArgumentParser(description="Generate image via OpenRouter API.")
    parser.add_argument('--prompt', required=True, help='The text prompt for image generation.')
    parser.add_argument('--key', required=True, help='OpenRouter API Key.')
    parser.add_argument('--model', required=True, help='The image model to use (e.g., google/gemini-2.5-flash-image).')
    
    args = parser.parse_args()

    # 2. API Call Headers
    headers = {
        "Authorization": f"Bearer {args.key}",
        "Content-Type": "application/json",
        "HTTP-Referer": os.getenv("FUNCTION_TARGET") or "systemic-shifts-python-worker",
        "X-Title": "Python Image Generator",
    }

    # 3. Payload
    payload = {
        "model": args.model,
        "prompt": args.prompt,
        "size": "1024x1024",
        "n": 1,
        "response_format": "url",
    }

    # 4. Request and Error Handling
    try:
        response = requests.post(OPENROUTER_IMAGE_URL, headers=headers, json=payload)
        response.raise_for_status()  # Raise HTTPError for bad status codes (4xx or 5xx)
        
        data = response.json()
        
        if data.get('data') and len(data['data']) > 0:
            # Success: return the URL
            result = {
                "status": "ok",
                "image_url": data['data'][0]['url'],
                "model": args.model
            }
            print(json.dumps(result))
        else:
            # API returned 200 but no image data
            error_message = data.get('error', {}).get('message', 'API returned no image data.')
            print(json.dumps({"status": "error", "message": error_message}))

    except requests.exceptions.RequestException as e:
        # Network or HTTP error
        print(json.dumps({"status": "error", "message": f"HTTP/Network Error: {e.response.status if e.response is not None else 'Timeout'}"}))
        sys.exit(1)
    except Exception as e:
        # General JSON or unexpected error
        print(json.dumps({"status": "error", "message": f"Unexpected Error: {str(e)}"}))
        sys.exit(1)

if __name__ == "__main__":
    generate_image()
