# CPU-friendly diffusers example (slow). Use small sizes and few steps.
# Save as python/diffusers_cpu.py, create a venv, pip install -r requirements, then run.
import os
import torch
from diffusers import StableDiffusionPipeline, DPMSolverMultistepScheduler

# --- Configuration ---
MODEL_ID = "stabilityai/stable-diffusion-2-1"
OUTPUT_FILENAME = "output_diffusers_cpu.png"
IMAGE_SIZE = 256  # Small size for CPU
INFERENCE_STEPS = 15  # Fewer steps for faster generation

# --- Main Execution ---
if __name__ == "__main__":
    print("Initializing CPU-based Stable Diffusion pipeline...")
    print(f"Model: {MODEL_ID}")
    print(f"Image Size: {IMAGE_SIZE}x{IMAGE_SIZE}")
    print(f"Inference Steps: {INFERENCE_STEPS}")

    # Check if a Hugging Face token is available (some models require it)
    use_auth_token = os.environ.get("HF_API_TOKEN")
    if not use_auth_token:
        print("\nWarning: HF_API_TOKEN not set. Public models should work, but private/gated ones will fail.")

    try:
        # --- 1. Set up the pipeline ---
        # Use DPMSolver for improved quality at low step counts
        scheduler = DPMSolverMultistepScheduler.from_pretrained(MODEL_ID, subfolder="scheduler")

        # Load the pipeline. This will download the model if not cached (~5GB)
        pipe = StableDiffusionPipeline.from_pretrained(
            MODEL_ID,
            scheduler=scheduler,
            torch_dtype=torch.float32,  # Use float32 for CPU
            use_auth_token=use_auth_token
        )
        pipe = pipe.to("cpu")

        # --- 2. Get user prompt ---
        prompt = input(f"\nEnter a prompt for the image: ")
        if not prompt:
            prompt = "A photo of an astronaut riding a horse on Mars"
            print(f"Using default prompt: {prompt}")

        # --- 3. Generate the image ---
        print(f"\nGenerating image from prompt... (this can be slow on CPU)")
        with torch.no_grad():
            image = pipe(prompt, num_inference_steps=INFERENCE_STEPS).images[0]

        # --- 4. Save the image ---
        image.save(OUTPUT_FILENAME)
        print(f"\nImage saved to: {os.path.abspath(OUTPUT_FILENAME)}")

    except Exception as e:
        print(f"\nAn error occurred: {e}")
        print("Please ensure you have accepted the model's license on the Hugging Face website.")
