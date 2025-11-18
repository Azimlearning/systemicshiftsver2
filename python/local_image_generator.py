"""
Local Image Generator Service
Monitors Firestore for stories needing image generation and processes them locally
Uses diffusers with local GPU (much faster than Cloud Functions!)
"""
import os
import json
import time
import logging
from datetime import datetime, timedelta, timezone
from typing import Optional

import torch
from diffusers import StableDiffusionPipeline, DPMSolverMultistepScheduler
from PIL import Image
from google.cloud import firestore
from google.cloud import storage
from firebase_admin import initialize_app, credentials
import requests

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Configuration
# Using CompVis/stable-diffusion-v1-4 (widely available via HF Inference API)
# Note: stabilityai/stable-diffusion-2-1 returns 410 Gone from HF Inference API
# Alternative: "runwayml/stable-diffusion-v1-5" (may also work)
MODEL_ID = os.environ.get("SD_MODEL_ID", "CompVis/stable-diffusion-v1-4")
BUCKET_NAME = os.environ.get("IMAGE_BUCKET_NAME", "systemicshiftv2.firebasestorage.app")
IMAGE_FOLDER = os.environ.get("IMAGE_FOLDER", "generated_images")
HF_TOKEN = os.environ.get("HF_API_TOKEN")  # Set this in your environment
PROJECT_ID = "systemicshiftv2"

# Initialize Firebase Admin with service account key
# Check for service account key file or environment variable
# First check environment variable, then check for firebase-key.json in current directory
SERVICE_ACCOUNT_KEY = os.environ.get("GOOGLE_APPLICATION_CREDENTIALS") or os.environ.get("FIREBASE_SERVICE_ACCOUNT_KEY")
if not SERVICE_ACCOUNT_KEY or not os.path.exists(SERVICE_ACCOUNT_KEY):
    # Check for firebase-key.json in current directory
    current_dir = os.path.dirname(os.path.abspath(__file__))
    default_key_path = os.path.join(current_dir, "firebase-key.json")
    if os.path.exists(default_key_path):
        SERVICE_ACCOUNT_KEY = default_key_path

if SERVICE_ACCOUNT_KEY and os.path.exists(SERVICE_ACCOUNT_KEY):
    # Use service account key file
    cred = credentials.Certificate(SERVICE_ACCOUNT_KEY)
    try:
        initialize_app(cred, options={'projectId': PROJECT_ID})
        logger.info("Firebase Admin initialized with service account key")
    except ValueError:
        # Already initialized
        logger.info("Firebase Admin already initialized")
    
    # Use the same credentials for Google Cloud clients
    from google.oauth2 import service_account
    gcp_credentials = service_account.Credentials.from_service_account_file(SERVICE_ACCOUNT_KEY)
    db = firestore.Client(project=PROJECT_ID, credentials=gcp_credentials)
    storage_client = storage.Client(project=PROJECT_ID, credentials=gcp_credentials)
    logger.info("Firestore and Storage clients initialized with service account key")
else:
    # Try to use default credentials (Application Default Credentials)
    try:
        initialize_app(options={'projectId': PROJECT_ID})
        logger.info("Firebase Admin initialized with default credentials")
        
        import google.auth
        default_credentials, project = google.auth.default()
        db = firestore.Client(project=PROJECT_ID, credentials=default_credentials)
        storage_client = storage.Client(project=PROJECT_ID, credentials=default_credentials)
        logger.info("Firestore and Storage clients initialized with default credentials")
    except Exception as e:
        logger.error(f"Failed to initialize Firebase clients: {e}")
        logger.error("")
        logger.error("To fix this:")
        logger.error("")
        logger.error("1. Click 'Generate new private key' on the Firebase Admin SDK page")
        logger.error("2. Save the JSON file (e.g., firebase-key.json)")
        logger.error("3. Set environment variable:")
        logger.error("   $env:GOOGLE_APPLICATION_CREDENTIALS='C:\\path\\to\\firebase-key.json'")
        logger.error("")
        logger.error("OR place the file in the python folder and name it 'firebase-key.json'")
        logger.error("")
        raise

# Global pipeline (loaded once, reused)
_pipeline: Optional[StableDiffusionPipeline] = None
_use_api_fallback = False  # Flag to use API instead of local model

def get_pipeline() -> StableDiffusionPipeline:
    """Get or create the Stable Diffusion pipeline (singleton pattern)"""
    global _pipeline
    if _pipeline is not None:
        return _pipeline
    
    logger.info(f"Loading Stable Diffusion pipeline: {MODEL_ID}")
    
    device = "cuda" if torch.cuda.is_available() else "cpu"
    torch_dtype = torch.float16 if device == "cuda" else torch.float32
    
    logger.info(f"Using device: {device}, dtype: {torch_dtype}")
    
    try:
        # Use memory-efficient loading options
        logger.info("Loading pipeline with memory optimizations...")
        pipe = StableDiffusionPipeline.from_pretrained(
            MODEL_ID,
            torch_dtype=torch_dtype,
            token=HF_TOKEN if HF_TOKEN else None,
            low_cpu_mem_usage=True,  # Memory-efficient loading
            use_safetensors=True  # Use safetensors format (more memory efficient)
        )
        pipe.scheduler = DPMSolverMultistepScheduler.from_config(pipe.scheduler.config)
        
        # Enable memory optimizations
        pipe.enable_attention_slicing()
        
        # For CPU, try sequential CPU offload to save memory
        if device == "cpu":
            try:
                pipe.enable_sequential_cpu_offload()
                logger.info("Sequential CPU offload enabled for memory efficiency")
            except Exception as offload_error:
                logger.warning(f"Could not enable sequential CPU offload: {offload_error}")
                # Fallback: just move to device normally
                pipe = pipe.to(device)
        else:
            pipe = pipe.to(device)
        
        logger.info("Pipeline loaded successfully")
        _pipeline = pipe
        return _pipeline
    except MemoryError as e:
        logger.error(f"MemoryError: Not enough RAM to load the model locally.")
        logger.warning(f"Falling back to Hugging Face Inference API (no local model needed)")
        global _use_api_fallback
        _use_api_fallback = True
        # Return None - we'll use API instead
        return None
    except Exception as e:
        logger.error(f"Failed to load pipeline: {e}")
        logger.error(f"Error type: {type(e).__name__}")
        raise

def generate_image_via_api(prompt: str, width: int = 512, height: int = 512,
                           num_steps: int = 30, guidance_scale: float = 7.5) -> Image.Image:
    """Generate image using Hugging Face Inference API (fallback when local model fails)"""
    if not HF_TOKEN:
        raise ValueError("HF_API_TOKEN is required for API fallback")
    
    api_url = f"https://api-inference.huggingface.co/models/{MODEL_ID}"
    logger.info(f"Generating image via HF API: {len(prompt)} chars, {width}x{height}, {num_steps} steps")
    
    try:
        response = requests.post(
            api_url,
            headers={"Authorization": f"Bearer {HF_TOKEN}"},
            json={
                "inputs": prompt,
                "parameters": {
                    "num_inference_steps": num_steps,
                    "guidance_scale": guidance_scale,
                    "width": width,
                    "height": height
                },
                "options": {
                    "wait_for_model": True
                }
            },
            timeout=300  # 5 minute timeout
        )
        
        response.raise_for_status()
        
        # Parse image from response
        from io import BytesIO
        try:
            return Image.open(BytesIO(response.content))
        except Exception as img_error:
            # If not an image, might be JSON error
            try:
                error_data = response.json()
                error_msg = error_data.get("error", str(error_data))
                raise RuntimeError(f"Hugging Face API error: {error_msg}")
            except json.JSONDecodeError:
                raise RuntimeError(f"Unexpected response from HF API: {response.text[:500]}")
                
    except requests.exceptions.Timeout:
        raise RuntimeError("Hugging Face API request timed out after 5 minutes")
    except Exception as e:
        logger.error(f"HF API request failed: {e}")
        raise RuntimeError(f"HF API request failed: {e}")

def generate_image(prompt: str, width: int = 512, height: int = 512, 
                   num_steps: int = 50, guidance_scale: float = 7.5) -> Image.Image:
    """Generate image from prompt - uses local model or API fallback"""
    global _use_api_fallback
    
    # If we're using API fallback, use that instead
    if _use_api_fallback:
        return generate_image_via_api(prompt, width, height, num_steps, guidance_scale)
    
    # Try to get local pipeline
    pipe = get_pipeline()
    
    # If pipeline is None (memory error), use API
    if pipe is None:
        return generate_image_via_api(prompt, width, height, num_steps, guidance_scale)
    
    logger.info(f"Generating image locally: {len(prompt)} chars, {width}x{height}, {num_steps} steps")
    
    with torch.no_grad():
        result = pipe(
            prompt,
            num_inference_steps=num_steps,
            guidance_scale=guidance_scale,
            width=width,
            height=height
        )
    
    return result.images[0]

def upload_to_storage(image: Image.Image, filename: str) -> str:
    """Upload image to Firebase Storage and return public URL"""
    bucket = storage_client.bucket(BUCKET_NAME)
    blob = bucket.blob(filename)
    
    # Convert PIL Image to bytes
    from io import BytesIO
    buf = BytesIO()
    image.save(buf, format="PNG")
    buf.seek(0)
    
    blob.upload_from_file(buf, content_type="image/png")
    blob.make_public()
    
    return f"https://storage.googleapis.com/{BUCKET_NAME}/{filename}"

def convert_firestore_timestamp(timestamp_obj) -> Optional[datetime]:
    """Convert Firestore timestamp (DatetimeWithNanoseconds, Timestamp, or datetime) to Python datetime with UTC timezone"""
    if timestamp_obj is None:
        return None
    
    # If it's already a datetime object
    if isinstance(timestamp_obj, datetime):
        if timestamp_obj.tzinfo is None:
            return timestamp_obj.replace(tzinfo=timezone.utc)
        return timestamp_obj
    
    # Try DatetimeWithNanoseconds (newer Firestore SDK)
    if hasattr(timestamp_obj, 'timestamp'):
        try:
            # Convert Unix timestamp to datetime
            return datetime.fromtimestamp(timestamp_obj.timestamp(), tz=timezone.utc)
        except (AttributeError, TypeError):
            pass
    
    # Try legacy Timestamp.to_datetime()
    if hasattr(timestamp_obj, 'to_datetime'):
        try:
            dt = timestamp_obj.to_datetime()
            if dt.tzinfo is None:
                return dt.replace(tzinfo=timezone.utc)
            return dt
        except (AttributeError, TypeError):
            pass
    
    # Fallback: try to use it directly (might work for some types)
    return timestamp_obj


def process_story(doc_id: str, story_data: dict):
    """Process a single story: generate image and update Firestore"""
    try:
        logger.info(f"Processing story: {doc_id}")
        
        # Get infographic concept - handle both dict and string formats
        concept_raw = story_data.get("aiInfographicConcept", {})
        
        # If concept is a string, try to parse it as JSON, otherwise treat as empty
        if isinstance(concept_raw, str):
            try:
                import json
                concept = json.loads(concept_raw) if concept_raw else {}
            except (json.JSONDecodeError, TypeError):
                concept = {}
        else:
            concept = concept_raw if isinstance(concept_raw, dict) else {}
        
        # Get title from concept or fallback to story title
        title = (concept.get("title") if isinstance(concept, dict) else None) or \
                story_data.get("nonShiftTitle") or \
                story_data.get("storyTitle") or \
                "Systemic Shift Story"
        
        # Build key metrics text
        if isinstance(concept, dict):
            key_metrics = concept.get("keyMetrics", [])
            if isinstance(key_metrics, list):
                key_metrics_text = "; ".join([f"{m.get('label', '')}: {m.get('value', '')}" for m in key_metrics if isinstance(m, dict)])
            else:
                key_metrics_text = "Key metrics and achievements"
        else:
            key_metrics_text = "Key metrics and achievements"
        
        # Build prompt (keep it under 77 tokens to avoid truncation)
        # Shorten the prompt to fit CLIP's 77 token limit
        title_short = title[:50] if len(title) > 50 else title
        metrics_short = key_metrics_text[:100] if len(key_metrics_text) > 100 else key_metrics_text
        
        prompt = f"Corporate infographic for PETRONAS Upstream. Vertical layout. TEAL and GREEN colors. Title: {title_short}. Metrics: {metrics_short}. Flat design, minimal icons, professional."
        
        logger.info(f"Generating image for: {title}")
        
        # Generate image
        image = generate_image(
            prompt=prompt,
            width=512,
            height=512,
            num_steps=30,  # Faster for local generation
            guidance_scale=7.5
        )
        
        # Upload to storage
        filename = f"{IMAGE_FOLDER}/{doc_id}_{int(time.time())}.png"
        image_url = upload_to_storage(image, filename)
        
        logger.info(f"Image uploaded: {image_url}")
        logger.info(f"Updating Firestore document {doc_id} with image URL...")
        
        # Update Firestore
        # Set analysisTimestamp so frontend knows generation is complete
        doc_ref = db.collection("stories").document(doc_id)
        update_data = {
            "aiGeneratedImageUrl": image_url,
            "analysisTimestamp": firestore.SERVER_TIMESTAMP,  # Frontend checks this to hide "Generating Content..."
            "imageGeneratedAt": firestore.SERVER_TIMESTAMP,
            "imageGeneratedLocally": True
        }
        doc_ref.update(update_data)
        logger.info(f"✅ Firestore updated successfully for {doc_id}")
        
        logger.info(f"✅ Successfully processed story: {doc_id}")
        return True
        
    except Exception as e:
        logger.error(f"❌ Error processing story {doc_id}: {e}", exc_info=True)
        
        # Update Firestore with error
        try:
            doc_ref = db.collection("stories").document(doc_id)
            doc_ref.update({
                "aiGeneratedImageUrl": f"Error: {str(e)}",
                "imageGeneratedAt": firestore.SERVER_TIMESTAMP
            })
        except:
            pass
        
        return False

def monitor_firestore():
    """Monitor Firestore for stories that need image generation"""
    logger.info("Starting Firestore monitor...")
    
    # Record script start time - only process stories submitted AFTER this time
    # Use UTC to match Firestore timestamps (Firestore stores all timestamps in UTC)
    script_start_time = datetime.now(timezone.utc)
    logger.info(f"Script started at: {script_start_time.strftime('%Y-%m-%d %H:%M:%S UTC')}")
    logger.info(f"Will only process stories submitted AFTER script start time")
    
    # Try to load pipeline once at startup
    logger.info("Loading pipeline (this may take a few minutes on first run)...")
    try:
        pipeline = get_pipeline()
        if pipeline is None:
            logger.warning("⚠️  Local model loading failed - using Hugging Face Inference API instead")
            logger.info("✅ API fallback ready! Ready to process stories.")
        else:
            logger.info("✅ Pipeline loaded! Ready to process stories.")
    except Exception as e:
        logger.error(f"Failed to initialize: {e}")
        logger.info("Will attempt to use API fallback when processing stories...")
    
    while True:
        try:
            stories_ref = db.collection("stories")
            
            logger.info("=" * 60)
            logger.info(f"[Monitor Cycle] Checking for stories needing image generation at {datetime.now(timezone.utc).strftime('%Y-%m-%d %H:%M:%S UTC')}")
            logger.info(f"[Monitor Cycle] Script started at: {script_start_time.strftime('%Y-%m-%d %H:%M:%S UTC')}")
            
            # Query for stories needing image generation in two ways:
            # 1. Stories submitted AFTER script start (new submissions)
            # 2. Recent stories with concepts that need images (regardless of submission time)
            logger.info(f"[Monitor Cycle] Querying for stories needing image generation...")
            
            try:
                all_docs_dict = {}  # Use dict to deduplicate by document ID
                
                # Query 1: Stories submitted after script start (for new submissions)
                try:
                    query_new = stories_ref.where("submittedAt", ">=", script_start_time)\
                                          .order_by("submittedAt")\
                                          .limit(20)
                    docs_new = list(query_new.stream())
                    logger.info(f"[Monitor Cycle] Found {len(docs_new)} document(s) submitted after script start")
                    for doc in docs_new:
                        all_docs_dict[doc.id] = doc
                except Exception as e:
                    logger.warning(f"Error querying new submissions: {e}")
                
                # Query 2: Recent documents (last 50) - we'll filter for those with concepts needing images
                # This catches documents submitted before script start that have concepts
                try:
                    query_recent = stories_ref.order_by("submittedAt", direction=firestore.Query.DESCENDING).limit(50)
                    docs_recent = list(query_recent.stream())
                    logger.info(f"[Monitor Cycle] Checking {len(docs_recent)} most recent documents for concepts needing images")
                    
                    for doc in docs_recent:
                        doc_data = doc.to_dict()
                        has_concept = bool(doc_data.get("aiInfographicConcept"))
                        image_url = doc_data.get("aiGeneratedImageUrl", "NOT SET")
                        
                        # Check if this document needs image generation
                        # (has concept but no valid image URL)
                        is_valid_url = isinstance(image_url, str) and (image_url.startswith("http://") or image_url.startswith("https://"))
                        has_error = isinstance(image_url, str) and ("Error:" in image_url or "failed" in image_url.lower())
                        
                        if has_concept and not is_valid_url and not has_error:
                            # This document has a concept and needs an image
                            if doc.id not in all_docs_dict:
                                all_docs_dict[doc.id] = doc
                                logger.info(f"[Monitor Cycle] Found document with concept needing image (submitted before script start): {doc.id}")
                except Exception as e:
                    logger.warning(f"Error querying recent documents: {e}")
                
                # Convert dict values to list
                docs = list(all_docs_dict.values())
                logger.info(f"[Monitor Cycle] Total documents to check: {len(docs)} (after deduplication)")
                
                # Diagnostic logging for first few documents
                if len(docs) > 0:
                    logger.info(f"[Monitor Cycle] Sample of documents to process:")
                    for doc in docs[:3]:  # Show first 3
                        doc_data = doc.to_dict()
                        doc_id = doc.id
                        title = doc_data.get("nonShiftTitle") or doc_data.get("storyTitle", "N/A")
                        has_concept = bool(doc_data.get("aiInfographicConcept"))
                        image_url = doc_data.get("aiGeneratedImageUrl", "NOT SET")
                        logger.info(f"[Monitor Cycle]   - {doc_id}: '{title[:40]}', hasConcept={has_concept}, imageUrl='{str(image_url)[:50]}'")
                
            except Exception as e:
                logger.warning(f"Query timeout or error, retrying: {e}")
                time.sleep(5)
                continue
            
            processed_count = 0
            for doc in docs:
                doc_data = doc.to_dict()
                doc_id = doc.id
                
                # Log document details for debugging
                image_url = doc_data.get("aiGeneratedImageUrl", "NOT SET")
                has_concept = bool(doc_data.get("aiInfographicConcept"))
                submitted_at = doc_data.get("submittedAt")
                
                # Convert Firestore timestamp to string for logging
                if submitted_at:
                    submitted_dt = convert_firestore_timestamp(submitted_at)
                    if submitted_dt:
                        submitted_str = submitted_dt.strftime("%Y-%m-%d %H:%M:%S UTC")
                    else:
                        submitted_str = "unknown (conversion failed)"
                else:
                    submitted_str = "unknown"
                
                title = doc_data.get("nonShiftTitle") or doc_data.get("storyTitle", "N/A")
                
                logger.info(f"[Monitor Cycle] Doc {doc_id}: title='{title[:40]}', submitted={submitted_str}, imageUrl='{str(image_url)[:60]}', hasConcept={has_concept}")
                
                # Skip documents that already have error messages (they've been tried before)
                if isinstance(image_url, str) and ("Error:" in image_url or "failed" in image_url.lower()):
                    logger.debug(f"[Monitor Cycle] Skipping doc {doc_id} - already has error: {image_url[:50]}")
                    continue
                
                # Skip documents that already have a valid image URL
                is_valid_url = isinstance(image_url, str) and (image_url.startswith("http://") or image_url.startswith("https://"))
                if is_valid_url:
                    logger.debug(f"[Monitor Cycle] Skipping doc {doc_id} - already has valid image URL")
                    continue
                
                # Check if concept exists
                if not has_concept:
                    logger.debug(f"Story {doc_id} has no concept yet, skipping (waiting for analyzeStorySubmission)")
                    continue
                
                # Process this story (has concept, no valid image yet)
                logger.info(f"Found story needing image generation: {doc_id}")
                process_story(doc_id, doc_data)
                processed_count += 1
            
            if processed_count > 0:
                logger.info(f"Processed {processed_count} stories in this cycle")
            else:
                logger.info("[Monitor Cycle] No stories to process in this cycle")
            
            logger.info("=" * 60)
            
            # Wait before next check
            time.sleep(30)  # Check every 30 seconds
            
        except KeyboardInterrupt:
            logger.info("Stopping monitor...")
            break
        except Exception as e:
            logger.error(f"Error in monitor loop: {e}", exc_info=True)
            time.sleep(60)  # Wait longer on error

if __name__ == "__main__":
    logger.info("=" * 60)
    logger.info("Local Image Generator Service")
    logger.info("=" * 60)
    logger.info(f"Model: {MODEL_ID}")
    logger.info(f"Device: {'CUDA' if torch.cuda.is_available() else 'CPU'}")
    logger.info(f"Bucket: {BUCKET_NAME}")
    logger.info("=" * 60)
    
    monitor_firestore()

