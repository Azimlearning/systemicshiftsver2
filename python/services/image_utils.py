import base64
from typing import Tuple

def bytes_to_data_uri_png(png_bytes: bytes) -> str:
    b64 = base64.b64encode(png_bytes).decode("ascii")
    return f"data:image/png;base64,{b64}"

def split_data_uri(data_uri: str) -> Tuple[str, str]:
    if not data_uri.startswith("data:"):
        raise ValueError("Not a data URI")
    header, _, payload = data_uri.partition(",")
    mime = header[5:].split(";")[0]
    return mime, payload