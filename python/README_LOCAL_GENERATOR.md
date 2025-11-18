# Local Image Generator Service

This service runs locally on your machine and generates images using your GPU, then uploads them to Firebase Storage.

## Setup

1. **Install dependencies:**
   ```powershell
   cd python
   .\.venv\Scripts\activate  # Activate your venv
   pip install -r requirements.txt
   ```

2. **Install PyTorch with CUDA (if you have NVIDIA GPU):**
   - Go to: https://pytorch.org/get-started/locally/
   - Select your CUDA version
   - Example: `pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu121`

3. **Set up Firebase credentials:**
   - Download service account key from Firebase Console
   - Set environment variable: `GOOGLE_APPLICATION_CREDENTIALS=path/to/key.json`
   - OR use `firebase login` and it will use your credentials

4. **Set Hugging Face token:**
   ```powershell
   $env:HF_API_TOKEN="your_token_here"
   ```

## Running the Service

```powershell
.\run_local_generator.ps1
```

Or manually:
```powershell
cd python
.\.venv\Scripts\activate
$env:HF_API_TOKEN="your_token"
python local_image_generator.py
```

## How It Works

1. **Monitors Firestore** - Checks every 30 seconds for stories with `aiInfographicConcept` but no `aiGeneratedImageUrl`
2. **Generates images locally** - Uses your GPU (much faster than Cloud Functions!)
3. **Uploads to Firebase Storage** - Saves the generated image
4. **Updates Firestore** - Sets `aiGeneratedImageUrl` so the frontend can display it

## Benefits

- ✅ Uses your local GPU (fast!)
- ✅ No 5GB model download in Cloud Functions
- ✅ No Cloud Functions deployment issues
- ✅ Works offline (once model is downloaded)
- ✅ Full control over generation parameters

## Notes

- The service runs continuously - keep it running in a terminal
- First run will download the model (~5GB) - this only happens once
- Images are generated asynchronously after story submission
- The frontend will automatically show images once they're generated

