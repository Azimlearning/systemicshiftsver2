"""
Python Cloud Function for Hugging Face Image Generation using Inference API
This uses the Hugging Face Inference API directly (no model download needed!)
"""
import os
import json
import logging
from typing import Optional

import requests
from PIL import Image
from io import BytesIO
from google.cloud import storage
from google.cloud import firestore
from firebase_functions import https_fn
from firebase_functions.options import CorsOptions
from firebase_admin import initialize_app

# Initialize Firebase Admin
initialize_app()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize clients lazily
_storage_client = None
_firestore_client = None

def get_storage_client():
    global _storage_client
    if _storage_client is None:
        _storage_client = storage.Client()
    return _storage_client

def get_firestore_client():
    global _firestore_client
    if _firestore_client is None:
        _firestore_client = firestore.Client()
    return _firestore_client

# Configuration
MODEL_ID = os.environ.get("SD_MODEL_ID", "stabilityai/stable-diffusion-2-1")
BUCKET_NAME = os.environ.get("IMAGE_BUCKET_NAME", "systemicshiftv2.firebasestorage.app")
IMAGE_FOLDER = os.environ.get("IMAGE_FOLDER", "generated_images")
API_URL = f"https://api-inference.huggingface.co/models/{MODEL_ID}"

# Get HF token from Firebase Secrets
try:
    from firebase_functions.params import Secret
    HF_API_TOKEN_SECRET = Secret("HF_API_TOKEN")
    def get_hf_token():
        return HF_API_TOKEN_SECRET.value
except ImportError:
    # Fallback for local development
    def get_hf_token():
        return os.environ.get("HF_API_TOKEN")

def generate_image_via_api(
    prompt: str,
    num_inference_steps: int = 20,
    guidance_scale: float = 7.5,
    width: int = 512,
    height: int = 512
) -> bytes:
    """Generate image using Hugging Face Inference API and return as PNG bytes"""
    if not prompt:
        raise ValueError("prompt must be a non-empty string")
    
    hf_token = get_hf_token()
    if not hf_token:
        raise ValueError("HF_API_TOKEN secret is not set or is empty")
    
    logger.info(f"Generating image via HF API: prompt length={len(prompt)}, steps={num_inference_steps}, size={width}x{height}")
    
    try:
        # Call Hugging Face Inference API
        response = requests.post(
            API_URL,
            headers={"Authorization": f"Bearer {hf_token}"},
            json={
                "inputs": prompt,
                "parameters": {
                    "num_inference_steps": num_inference_steps,
                    "guidance_scale": guidance_scale,
                    "width": width,
                    "height": height
                }
            },
            timeout=300  # 5 minute timeout
        )
        
        response.raise_for_status()
        
        # Check if response is an image
        if response.headers.get("content-type", "").startswith("image/"):
            logger.info(f"Received image from HF API: {len(response.content)} bytes")
            return response.content
        else:
            # Might be JSON error response
            try:
                error_data = response.json()
                error_msg = error_data.get("error", str(error_data))
                raise RuntimeError(f"Hugging Face API error: {error_msg}")
            except json.JSONDecodeError:
                raise RuntimeError(f"Unexpected response from HF API: {response.text[:500]}")
                
    except requests.exceptions.Timeout:
        raise RuntimeError("Hugging Face API request timed out after 5 minutes")
    except requests.exceptions.RequestException as e:
        logger.exception("HF API request failed")
        raise RuntimeError(f"HF API request failed: {e}")

def upload_to_gcs(image_bytes: bytes, filename: str) -> str:
    """Upload image to Google Cloud Storage and return public URL"""
    bucket = get_storage_client().bucket(BUCKET_NAME)
    blob = bucket.blob(filename)
    
    blob.upload_from_string(image_bytes, content_type="image/png")
    blob.make_public()
    
    return f"https://storage.googleapis.com/{BUCKET_NAME}/{filename}"

@https_fn.on_request(
    cors=CorsOptions(
        cors_origins=["*"],
        cors_methods=["POST", "OPTIONS"],
    ),
    secrets=["HF_API_TOKEN"],
    timeout_sec=540,
    memory=512,  # Much less memory needed (no model download!)
)
def generateImageHfPython(req: https_fn.Request) -> https_fn.Response:
    """
    Cloud Function entry point for image generation using Hugging Face Inference API
    Deployed as: generateImageHfPython
    """
    # Handle CORS preflight
    if req.method == "OPTIONS":
        return https_fn.Response("", status=204)
    
    if req.method != "POST":
        return https_fn.Response(
            json.dumps({"error": "Only POST allowed"}),
            status=405,
            headers={"Content-Type": "application/json"}
        )
    
    try:
        # Parse request body
        request_json = req.get_json(silent=True) or {}
        prompt = request_json.get("prompt")
        doc_id = request_json.get("docId")
        
        if not prompt:
            return https_fn.Response(
                json.dumps({"error": "prompt is required"}),
                status=400,
                headers={"Content-Type": "application/json"}
            )
        
        # Get optional parameters
        num_steps = request_json.get("num_inference_steps") or request_json.get("steps") or 20
        guidance = request_json.get("guidance_scale") or request_json.get("guidance") or 7.5
        width = request_json.get("width") or 512
        height = request_json.get("height") or 512
        
        logger.info(f"Generating image for docId: {doc_id or 'none'}")
        
        # Generate image via HF Inference API
        image_bytes = generate_image_via_api(
            prompt=prompt,
            num_inference_steps=int(num_steps),
            guidance_scale=float(guidance),
            width=int(width),
            height=int(height)
        )
        
        logger.info(f"Image generated: {len(image_bytes)} bytes")
        
        # Upload to GCS
        filename = f"{IMAGE_FOLDER}/{os.urandom(8).hex()}.png"
        public_url = upload_to_gcs(image_bytes, filename)
        
        logger.info(f"Image uploaded to: {public_url}")
        
        # Update Firestore if docId provided
        if doc_id:
            try:
                doc_ref = get_firestore_client().collection("stories").document(doc_id)
                doc_ref.update({
                    "aiGeneratedImageUrl": public_url,
                    "analysisTimestamp": firestore.SERVER_TIMESTAMP
                })
                logger.info(f"Updated Firestore document: {doc_id}")
            except Exception as e:
                logger.error(f"Failed to update Firestore: {e}")
        
        # Return response
        return https_fn.Response(
            json.dumps({
                "status": "ok",
                "image_url": public_url
            }),
            status=200,
            headers={"Content-Type": "application/json"}
        )
        
    except Exception as e:
        logger.exception("Error in generateImageHfPython")
        return https_fn.Response(
            json.dumps({
                "status": "error",
                "message": str(e)
            }),
            status=500,
            headers={"Content-Type": "application/json"}
        )

