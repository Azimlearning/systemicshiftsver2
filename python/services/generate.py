# Minimal generate wrapper: returns PNG bytes.
import io
import logging
from typing import Optional

import torch
from PIL import Image

from .pipeline import get_pipeline

logger = logging.getLogger("image_generate")
logger.setLevel(logging.INFO)

def generate_image_bytes(
    prompt: str,
    seed: Optional[int] = None,
    guidance_scale: float = 7.5,
    num_inference_steps: int = 25,
    width: int = 512,
    height: int = 512,
) -> bytes:
    if not prompt:
        raise ValueError("prompt must be a non-empty string")

    pipe = get_pipeline()

    # Determine device/dtype
    device = next(pipe.unet.parameters()).device if hasattr(pipe, "unet") else ("cuda" if torch.cuda.is_available() else "cpu")
    is_cuda = str(device).startswith("cuda")
    use_fp16 = getattr(pipe, "dtype", None) == torch.float16

    generator = None
    if seed is not None:
        gen_device = device if isinstance(device, torch.device) else torch.device(device)
        generator = torch.Generator(device=gen_device).manual_seed(int(seed))

    try:
        with torch.no_grad():
            if is_cuda and use_fp16:
                with torch.cuda.amp.autocast():
                    result = pipe(
                        prompt,
                        height=height,
                        width=width,
                        num_inference_steps=int(num_inference_steps),
                        guidance_scale=float(guidance_scale),
                        generator=generator,
                    )
            else:
                result = pipe(
                    prompt,
                    height=height,
                    width=width,
                    num_inference_steps=int(num_inference_steps),
                    guidance_scale=float(guidance_scale),
                    generator=generator,
                )
    except Exception as exc:
        logger.exception("Pipeline inference failed")
        raise RuntimeError(f"Image generation failed: {exc}") from exc

    if not hasattr(result, "images") or not result.images:
        raise RuntimeError("Pipeline returned no images")

    image: Image.Image = result.images[0]
    buf = io.BytesIO()
    image.save(buf, format="PNG")
    return buf.getvalue()