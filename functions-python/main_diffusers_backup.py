"""
Python Cloud Function for Hugging Face Image Generation using diffusers
Follows the documentation pattern using StableDiffusionPipeline
"""
import os
import json
import io
import logging
from typing import Optional

import torch
from diffusers import StableDiffusionPipeline, DPMSolverMultistepScheduler
from PIL import Image
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

# Initialize clients lazily (only when needed, not at module level)
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

# Global pipeline (loaded once, reused)
_pipeline: Optional[StableDiffusionPipeline] = None

def get_pipeline() -> StableDiffusionPipeline:
    """Get or create the Stable Diffusion pipeline (singleton pattern)"""
    global _pipeline
    if _pipeline is not None:
        return _pipeline
    
    logger.info(f"Loading Stable Diffusion pipeline: {MODEL_ID}")
    
    # Determine device and dtype
    device = "cuda" if torch.cuda.is_available() else "cpu"
    torch_dtype = torch.float16 if device == "cuda" else torch.float32
    
    logger.info(f"Using device: {device}, dtype: {torch_dtype}")
    
    try:
        # Get token first
        hf_token = get_hf_token()
        if not hf_token:
            raise ValueError("HF_API_TOKEN secret is not set or is empty")
        
        logger.info(f"Using HF token (length: {len(hf_token) if hf_token else 0})")
        
        # Load pipeline following documentation pattern
        # Note: Both 'token' and 'use_auth_token' work, but 'token' is preferred in newer versions
        scheduler = DPMSolverMultistepScheduler.from_pretrained(
            MODEL_ID, 
            subfolder="scheduler",
            token=hf_token
        )
        
        _pipeline = StableDiffusionPipeline.from_pretrained(
            MODEL_ID,
            scheduler=scheduler,
            torch_dtype=torch_dtype,
            token=hf_token  # Use 'token' parameter
        )
        _pipeline = _pipeline.to(device)
        
        # Enable attention slicing for memory efficiency (as in documentation)
        _pipeline.enable_attention_slicing()
        
        logger.info("Pipeline loaded successfully")
        return _pipeline
    except Exception as e:
        logger.error(f"Failed to load pipeline: {e}")
        raise

def generate_image_bytes(
    prompt: str,
    num_inference_steps: int = 20,
    guidance_scale: float = 7.5,
    width: int = 512,
    height: int = 512,
    seed: Optional[int] = None
) -> bytes:
    """Generate image from prompt and return as PNG bytes"""
    if not prompt:
        raise ValueError("prompt must be a non-empty string")
    
    pipe = get_pipeline()
    
    # Create generator with seed if provided
    generator = None
    if seed is not None:
        device = next(pipe.unet.parameters()).device
        generator = torch.Generator(device=device).manual_seed(seed)
    
    logger.info(f"Generating image: prompt length={len(prompt)}, steps={num_inference_steps}, size={width}x{height}")
    
    try:
        with torch.no_grad():
            result = pipe(
                prompt,
                num_inference_steps=num_inference_steps,
                guidance_scale=guidance_scale,
                width=width,
                height=height,
                generator=generator
            )
        
        if not hasattr(result, "images") or not result.images:
            raise RuntimeError("Pipeline returned no images")
        
        image: Image.Image = result.images[0]
        
        # Convert to PNG bytes
        buf = io.BytesIO()
        image.save(buf, format="PNG")
        return buf.getvalue()
    except Exception as e:
        logger.exception("Image generation failed")
        raise RuntimeError(f"Image generation failed: {e}") from e

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
    memory=2048,
)
def generateImageHfPython(req: https_fn.Request) -> https_fn.Response:
    """
    Cloud Function entry point for image generation using diffusers
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
        
        # Generate image
        image_bytes = generate_image_bytes(
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
