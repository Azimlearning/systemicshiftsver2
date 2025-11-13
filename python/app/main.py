# python/app/main.py (small test server)
from fastapi import FastAPI, HTTPException, Response
from pydantic import BaseModel
from python.services.generate import generate_image_bytes

app = FastAPI()

class Req(BaseModel):
    prompt: str
    seed: int | None = None

@app.post("/generate")
async def gen(r: Req):
    try:
        png = generate_image_bytes(r.prompt, r.seed, num_inference_steps=20)
        return Response(content=png, media_type="image/png")
    except Exception as e:
        raise HTTPException(status_code=502, detail=str(e))
