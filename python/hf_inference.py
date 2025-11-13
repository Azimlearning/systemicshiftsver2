# Minimal Python example: call Hugging Face Inference API for text->image generation
# Works without local GPU or heavy model files. Requires HF_API_TOKEN in env.
# Save as python/hf_inference.py and run: python python/hf_inference.py
import os
import requests
import base64

# --- Config ---
# Get your token from https://huggingface.co/settings/tokens
API_TOKEN = os.environ.get("HF_API_TOKEN")

# Tip: find more models at https://huggingface.co/models?pipeline_tag=text-to-image
# Make sure to accept the license on the model page before using it.
MODEL_ID = "stabilityai/stable-diffusion-2-1"
API_URL = f"https://api-inference.huggingface.co/models/{MODEL_ID}"

HEADERS = {"Authorization": f"Bearer {API_TOKEN}"}

# --- Function ---
def query(payload):
    response = requests.post(API_URL, headers=HEADERS, json=payload)
    # Check for different success codes
    if response.status_code not in [200, 201]:
        # Try to get HF error message for debugging
        error_message = "Unknown error"
        try:
            res_json = response.json()
            if "error" in res_json:
                error_message = res_json["error"]
        except Exception:
            error_message = response.text
        raise RuntimeError(f"API request failed with status {response.status_code}: {error_message}")
    return response.content

# --- Main execution ---
if __name__ == "__main__":
    print(f"Querying model: {MODEL_ID}...")

    if not API_TOKEN:
        raise ValueError("HF_API_TOKEN environment variable not set. Get a token from huggingface.co/settings/tokens")

    # A simple prompt
    prompt = "A majestic lion jumping from a big stone at night, with a full moon in the background."

    try:
        # Make the API call
        image_bytes = query({
            "inputs": prompt,
        })

        # --- Handle the response ---
        # The API returns raw image bytes. We can save it or encode it.

        # 1. Save to a file
        output_filename = "output_hf.png"
        with open(output_filename, "wb") as f:
            f.write(image_bytes)
        print(f"Image saved to {os.path.abspath(output_filename)}")

        # 2. Or, create a base64 data URI (useful for web responses)
        base64_image = base64.b64encode(image_bytes).decode("utf-8")
        data_uri = f"data:image/png;base64,{base64_image}"
        # print("\nData URI (first 100 chars):", data_uri[:100] + "...")

    except Exception as e:
        print(f"\nAn error occurred: {e}")
