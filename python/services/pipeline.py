# Lightweight pipeline factory inspired by Enfugue patterns (original reimplementation).
import os
import logging
from typing import Optional

import torch
from diffusers import StableDiffusionPipeline

logger = logging.getLogger("image_pipeline")
logger.setLevel(logging.INFO)

MODEL_ID = os.environ.get("SD_MODEL_ID", "runwayml/stable-diffusion-v1-5")
FORCE_FP32 = os.environ.get("PIPELINE_FORCE_FP32", "false").lower() in ("1", "true", "yes")
USE_XFORMERS = os.environ.get("PIPELINE_USE_XFORMERS", "true").lower() not in ("0", "false", "no")

_pipeline: Optional[StableDiffusionPipeline] = None

def get_pipeline() -> StableDiffusionPipeline:
    global _pipeline
    if _pipeline is not None:
        return _pipeline

    device = "cuda" if torch.cuda.is_available() else "cpu"
    torch_dtype = torch.float16 if device == "cuda" and not FORCE_FP32 else torch.float32

    logger.info("Loading StableDiffusion pipeline '%s' on %s (dtype=%s)", MODEL_ID, device, torch_dtype)

    _pipeline = StableDiffusionPipeline.from_pretrained(
        MODEL_ID,
        torch_dtype=torch_dtype,
    )

    _pipeline = _pipeline.to(device)

    if USE_XFORMERS:
        try:
            _pipeline.enable_xformers_memory_efficient_attention()
            logger.info("xformers enabled")
        except Exception:
            logger.info("xformers not available; continuing without it")

    return _pipeline