#!/usr/bin/env python3
"""Generate an image via OpenRouter Gemini models.

This script is intended to be invoked from the Firebase Cloud Function as a
fallback when the direct HTTP calls from Node.js fail. It posts a multimodal
request to the OpenRouter chat completions endpoint and returns the resulting
image URL (base64 data URL or direct link) as JSON on stdout.
"""

import argparse
import json
import os
import sys
import urllib.error
import urllib.request


OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions"


def build_request_data(model: str, prompt: str, aspect_ratio: str) -> bytes:
    payload = {
        "model": model,
        "messages": [
            {
                "role": "user",
                "content": prompt,
            }
        ],
        "modalities": ["text", "image"],
        "image_config": {
            "aspect_ratio": aspect_ratio,
        },
    }
    return json.dumps(payload).encode("utf-8")


def post_request(api_key: str, data: bytes) -> str:
    request = urllib.request.Request(OPENROUTER_URL, data=data, method="POST")
    request.add_header("Content-Type", "application/json")
    request.add_header("Authorization", f"Bearer {api_key}")

    with urllib.request.urlopen(request, timeout=120) as response:
        charset = response.headers.get_content_charset() or "utf-8"
        return response.read().decode(charset)


def main() -> int:
    parser = argparse.ArgumentParser(description="Generate images via OpenRouter")
    parser.add_argument("--model", required=True, help="Image-capable model identifier")
    parser.add_argument("--prompt", required=True, help="Prompt describing the desired image")
    parser.add_argument("--aspect_ratio", default="1:1", help="Optional aspect ratio (default 1:1)")
    args = parser.parse_args()

    api_key = os.getenv("OPENROUTER_API_KEY", "").strip()
    if not api_key:
        print(json.dumps({"status": "error", "message": "OPENROUTER_API_KEY is not set"}))
        return 1

    try:
        data = build_request_data(args.model, args.prompt, args.aspect_ratio)
        raw_response = post_request(api_key, data)
        parsed = json.loads(raw_response)
    except urllib.error.HTTPError as http_err:
        body = http_err.read().decode("utf-8", errors="replace")
        print(json.dumps({
            "status": "error",
            "message": body or str(http_err),
            "code": http_err.code,
        }))
        return 1
    except Exception as exc:  # noqa: BLE001
        print(json.dumps({"status": "error", "message": str(exc)}))
        return 1

    message = (parsed.get("choices") or [{}])[0].get("message", {})
    images = message.get("images") or []

    for image in images:
        if not isinstance(image, dict):
            continue
        image_url = image.get("image_url")
        if isinstance(image_url, dict):
            url_value = image_url.get("url")
        else:
            url_value = image_url

        if isinstance(url_value, str) and url_value:
            print(json.dumps({
                "status": "ok",
                "image_url": url_value,
                "model": args.model,
            }))
            return 0

    print(json.dumps({
        "status": "error",
        "message": "Image payload not present in response.",
        "raw": parsed,
    }))
    return 1


if __name__ == "__main__":
    sys.exit(main())


