```markdown
IMPLEMENTATION.md

Goal
- Replace the slow/timeout-prone image worker with a Hugging Face Inference API based function.
- Upload generated images to Cloud Storage and update Firestore.
- Keep tokens secure using Secret Manager.

Files added
- functions/generate_image_hf.js
- functions/package.json

High-level steps (owner or person with project IAM permissions)
1) Rotate any HF token you exposed publicly. Create a new token at https://huggingface.co/settings/tokens

2) Create a Secret in Secret Manager for the new token:
   Replace PROJECT_ID below.

   PROJECT=your-project-id
   echo -n "hf_YOUR_NEW_TOKEN" | gcloud secrets create HF_API_TOKEN --data-file=- --project=$PROJECT

3) Grant the function's runtime service account access to the secret:
   - For Gen2 Cloud Functions the runtime SA is typically: service-<PROJECT_NUMBER>@gcf-admin-robot.iam.gserviceaccount.com
   - Or grant access to the Functions service account the deployment will use.

   Example (owner runs):
   PROJECT=your-project-id
   SA_EMAIL="service-<PROJECT_NUMBER>@gcf-admin-robot.iam.gserviceaccount.com"
   gcloud secrets add-iam-policy-binding HF_API_TOKEN \
     --project=$PROJECT \
     --member="serviceAccount:${SA_EMAIL}" \
     --role="roles/secretmanager.secretAccessor"

4) Create a Cloud Storage bucket to hold generated images:
   BUCKET_NAME=your-image-bucket
   gsutil mb -p $PROJECT -l us-central1 gs://$BUCKET_NAME
   # (Optional) set lifecycle / retention rules per policy.

5) Deploy the function (Gen2 Cloud Functions) using Secret Manager integration:
   # Using secret mapping (recommended):
   gcloud functions deploy generateImageHf \
     --gen2 \
     --region=us-central1 \
     --source=functions \
     --runtime=nodejs18 \
     --entry-point=generateImageHf \
     --trigger-http \
     --allow-unauthenticated \
     --set-secrets="HF_SECRET_NAME=HF_API_TOKEN:latest" \
     --set-env-vars="IMAGE_BUCKET_NAME=$BUCKET_NAME,HF_MODEL=runwayml/stable-diffusion-v1-5" \
     --project=$PROJECT

   Notes:
   - The code expects either process.env.HF_API_TOKEN (local dev) or env var HF_SECRET_NAME pointing to the Secret Manager resource (the deploy above sets HF_SECRET_NAME).
   - In the function code we allow reading from process.env.HF_API_TOKEN for local dev.

6) IAM needed for deployer (project owner can grant):
   - roles/cloudfunctions.developer (or cloudfunctions.admin)
   - roles/iam.serviceAccountUser
   - roles/secretmanager.secretAccessor (for the function service account; owner grants to the service account)
   - roles/storage.objectAdmin (or adequate access for function service account to write to bucket)
   - roles/firestore.user (or Firestore access needed for updates)

Local development & testing
1) Install deps:
   cd functions
   npm install

2) Set local HF token for testing:
   export HF_API_TOKEN="hf_XXXX"   # use new token

3) Start the Functions Framework:
   npx @google-cloud/functions-framework --target=generateImageHf --signature-type=http --port=8080

4) Test via curl:
   curl -s -X POST "http://127.0.0.1:8080/" -H "Content-Type: application/json" \
     -d '{"prompt":"A clean teal and white corporate infographic, flat design, minimal icons"}' | jq

5) If testing upload step locally, set IMAGE_BUCKET_NAME env var to a bucket your service account can access:
   export IMAGE_BUCKET_NAME="your-bucket"

Security notes
- If you exposed a token earlier, rotate it immediately.
- Use Secret Manager in production and do not set HF token as project-level env var in plaintext.
- Prefer signed URLs for downloads rather than making images public in production.

Cost & limits
- Hugging Face hosted inference is billed per request and subject to rate limits. Monitor usage & cache results for repeated prompts.
- If you need heavy throughput or lower costs, migrate later to your own GPU-hosted service.

Support / debugging tips
- If HF returns 429/503, implement retries with exponential backoff.
- If HF returns 403, ensure you accepted model license or the account has access to that model.
- If the function cannot access the secret, check the Secret IAM policy and the deployed function's service account.

```
