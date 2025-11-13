# NOTE: Replace your existing image_worker/main.py with this file.
# The old, buggy parsing/regex is shown commented below for reference.
#
# Old broken regex snippet (original):
# match = re.search(r'!\\[.*?]\\((data:image/[a-zA-Z]+;base64,[^\\)]+)\')', content)
#
# This file implements a robust parsing flow and returns a consistent status "ok" on success.

import os
import re
import json
import logging
import requests
import functions_framework
from flask import jsonify, Request

# --- Config ---
OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions"
MODEL = "openai/gpt-5-image-mini"
API_KEY = os.environ.get("OPENROUTER_API_KEY")

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("image_worker")

@functions_framework.http
def generate_image_worker(request: Request):
    if not API_KEY:
        logger.error("Missing OPENROUTER_API_KEY")
        return jsonify({"status": "error", "message": "API key missing"}), 500

    data = request.get_json(silent=True)
    prompt = data.get("prompt") if data else None
    if not prompt:
        logger.warning("Request missing prompt")
        return jsonify({"status": "error", "message": "Missing 'prompt'"}), 400

    headers = {
        "Authorization": f"Bearer {API_KEY}",
        "Content-Type": "application/json",
        "X-Title": "Systemic Shifts Infographic Gen",
    }

    payload = {
        "model": MODEL,
        "messages": [{"role": "user", "content": prompt}],
    }

    try:
        response = requests.post(OPENROUTER_URL, headers=headers, json=payload, timeout=180)
        response.raise_for_status()
        result = response.json()
        logger.info("OpenRouter response received")

        # 1) If provider returns image-style data array (data[].url or data[].b64_json)
        if isinstance(result, dict) and result.get("data"):
            data_arr = result.get("data", [])
            if isinstance(data_arr, list) and len(data_arr) > 0:
                first = data_arr[0]
                if isinstance(first, dict):
                    if first.get("url"):
                        return jsonify({"status": "ok", "image_url": first.get("url")}), 200
                    if first.get("b64_json"):
                        return jsonify({"status": "ok", "image_url": f"data:image/png;base64,{first.get('b64_json')}"}), 200

        # 2) Chat-completions style content extraction
        choices = result.get("choices", []) if isinstance(result, dict) else []
        content = None
        if choices and isinstance(choices, list):
            # OpenRouter often nests message.content; handle both shapes
            first_choice = choices[0]
            if isinstance(first_choice.get("message"), dict):
                content = first_choice.get("message", {}).get("content")
            else:
                content = first_choice.get("message") or first_choice.get("text") or None

        # 3) fallback top-level fields
        if not content:
            if isinstance(result, dict):
                content = result.get("output") or result.get("text") or None

        if not content:
            logger.error("No usable content found in response", extra={"result_preview": str(result)[:1000]})
            return jsonify({"status": "error", "message": "Empty content in response choice", "data": result}), 500

        # Normalize to string for parsing
        content_str = json.dumps(content) if isinstance(content, (dict, list)) else str(content)

        # Try parsing content as JSON (some models return JSON text)
        try:
            parsed = json.loads(content_str)
            if isinstance(parsed, dict):
                if parsed.get("image_url"):
                    return jsonify({"status": "ok", "image_url": parsed.get("image_url")}), 200
                if parsed.get("url"):
                    return jsonify({"status": "ok", "image_url": parsed.get("url")}), 200
                if parsed.get("b64"):
                    return jsonify({"status": "ok", "image_url": f"data:image/png;base64,{parsed.get('b64')}"}), 200
                if parsed.get("b64_json"):
                    return jsonify({"status": "ok", "image_url": f"data:image/png;base64,{parsed.get('b64_json')}"}), 200
        except Exception:
            parsed = None

        # Data URI anywhere in text
        datauri_match = re.search(r'(data:image\/[a-zA-Z0-9+.-]+;base64,[A-Za-z0-9+/=]+)', content_str)
        if datauri_match:
            return jsonify({"status": "ok", "image_url": datauri_match.group(1)}), 200

        # Markdown image link: ![alt](URL_OR_DATAURI)
        md_match = re.search(r'!\\[.*?]\\((https?://[^\s)]+|data:image/[^\s)]+)\')', content_str)
        if md_match:
            return jsonify({"status": "ok", "image_url": md_match.group(1)}), 200

        # Plain URL in text
        url_match = re.search(r'(https?://[^\s\)]+)', content_str)
        if url_match:
            return jsonify({"status": "ok", "image_url": url_match.group(1)}), 200

        # As final fallback, if the content looks like a long base64 string
        snippet = content_str.strip()
        if len(snippet) > 200 and re.fullmatch(r'[A-Za-z0-9+/=\s]+', snippet):
            image_url = f"data:image/png;base64,{snippet.replace('\\n','')}"
            return jsonify({"status": "ok", "image_url": image_url}), 200

        logger.error("Unable to extract image from content", extra={"preview": snippet[:500]})
        return jsonify({"status": "error", "message": "Could not extract image from provider content", "content_preview": snippet[:500]}), 502

    except requests.exceptions.HTTPError as e:
        err_status = e.response.status_code if getattr(e, 'response', None) else 502
        msg = ""
        try:
            err = e.response.json() if e.response is not None else {}
            if isinstance(err, dict):
                msg = err.get("error", {}).get("message", f"HTTP {err_status}") if isinstance(err, dict) else str(err)
            else:
                msg = str(err)[:200]
        except Exception:
            msg = (e.response.text[:200] if getattr(e, 'response', None) else str(e))
        logger.exception("HTTP error from OpenRouter")
        return jsonify({"status": "error", "message": msg, "code": err_status, "payload_sent": payload}), err_status

    except Exception as exc:
        logger.exception("Unexpected error in image worker")
        return jsonify({"status": "error", "message": str(exc)}), 500