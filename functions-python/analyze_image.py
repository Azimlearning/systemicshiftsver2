"""
Python Cloud Function for Image Analysis using OpenRouter
Analyzes images and returns tags, category, and description
"""
import os
import json
import logging
from typing import Dict, Any, Optional

import requests
from firebase_functions import https_fn
from firebase_functions.options import CorsOptions
from firebase_functions.params import Secret
from firebase_admin import initialize_app

# Initialize Firebase Admin
initialize_app()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# OpenRouter API configuration
OPENROUTER_CHAT_URL = "https://openrouter.ai/api/v1/chat/completions"

# Get API keys from Firebase Secrets
openrouter_api_key = Secret("OPENROUTER_API_KEY")

# Allowed categories
ALLOWED_CATEGORIES = ['Stock Images', 'Events', 'Team Photos', 'Infographics', 'Operations', 'Facilities']

# Models to try in order
MODELS_TO_TRY = [
    'google/gemini-2.5-flash-image-preview',
    'openai/gpt-4o',
    'openai/gpt-4-turbo',
    'anthropic/claude-3.5-sonnet',
    'anthropic/claude-3-opus',
    'google/gemini-2.5-flash',
    'google/gemini-3-pro-preview'
]


def analyze_image_with_openrouter(image_url: str, api_key: str) -> Dict[str, Any]:
    """
    Analyze an image using OpenRouter API with multiple model fallbacks.
    
    Args:
        image_url: Public URL of the image to analyze
        api_key: OpenRouter API key
        
    Returns:
        Dictionary with tags, category, and description
    """
    prompt = """Analyze this image from a PETRONAS Upstream gallery and provide:
1. 5-10 relevant tags (comma-separated keywords that describe the image content, people, activities, equipment, locations, etc.)
2. Best category from this exact list: Stock Images, Events, Team Photos, Infographics, Operations, Facilities
3. A brief description (1-2 sentences)

Return your response in JSON format only:
{
  "tags": ["tag1", "tag2", "tag3"],
  "category": "Events",
  "description": "Brief description here"
}

Focus on identifying:
- What type of image it is (photo, graphic, infographic, etc.)
- Main subjects (people, equipment, facilities, etc.)
- Context (events, operations, team activities, etc.)
- Visual style (corporate, casual, technical, etc.)"""
    
    # Trim API key to remove whitespace/newlines
    api_key = api_key.strip()
    
    headers = {
        'Authorization': f'Bearer {api_key}',
        'Content-Type': 'application/json',
        'HTTP-Referer': f'https://console.firebase.google.com/project/{os.environ.get("GCP_PROJECT", "systemicshiftv2")}',
        'X-Title': 'Systemic Shift AI Image Analysis',
    }
    
    last_error = None
    
    for model in MODELS_TO_TRY:
        try:
            logger.info(f"[analyze_image] Attempting model: {model}")
            logger.info(f"[analyze_image] Image URL: {image_url[:100]}...")
            
            body = {
                'model': model,
                'messages': [
                    {
                        'role': 'user',
                        'content': [
                            {'type': 'text', 'text': prompt},
                            {'type': 'image_url', 'image_url': {'url': image_url}}
                        ]
                    }
                ],
                'response_format': {'type': 'json_object'}
            }
            
            response = requests.post(
                OPENROUTER_CHAT_URL,
                headers=headers,
                json=body,
                timeout=120
            )
            
            logger.info(f"[analyze_image] Response status: {response.status_code}")
            
            if not response.ok:
                error_text = response.text
                logger.error(f"[analyze_image] OpenRouter API error ({response.status_code}): {error_text}")
                raise Exception(f"OpenRouter error ({response.status_code}): {error_text}")
            
            data = response.json()
            
            if not data.get('choices') or not data['choices'][0].get('message'):
                raise Exception('Invalid response format from OpenRouter: missing choices or message')
            
            result_text = data['choices'][0]['message']['content']
            logger.info(f"[analyze_image] Response content length: {len(result_text)} characters")
            
            # Parse JSON from response
            json_text = result_text.strip()
            json_text = json_text.replace('```json\n', '').replace('```\n', '').replace('```', '').strip()
            
            try:
                analysis_result = json.loads(json_text)
            except json.JSONDecodeError as parse_error:
                logger.error(f"[analyze_image] JSON parse error: {parse_error}")
                logger.error(f"[analyze_image] JSON text (first 500 chars): {json_text[:500]}")
                raise Exception(f"Failed to parse JSON response: {parse_error}")
            
            # Validate response
            if not analysis_result.get('tags') or not isinstance(analysis_result['tags'], list):
                raise Exception('Invalid response format: tags missing or not an array')
            
            if not analysis_result.get('category'):
                raise Exception('Invalid response format: category missing')
            
            # Normalize category
            category = analysis_result['category']
            if category not in ALLOWED_CATEGORIES:
                category_lower = category.lower()
                if 'event' in category_lower or 'meeting' in category_lower or 'gathering' in category_lower:
                    category = 'Events'
                elif 'team' in category_lower or 'people' in category_lower or 'staff' in category_lower:
                    category = 'Team Photos'
                elif 'infographic' in category_lower or 'graphic' in category_lower or 'chart' in category_lower:
                    category = 'Infographics'
                elif 'operation' in category_lower or 'field' in category_lower or 'production' in category_lower:
                    category = 'Operations'
                elif 'facility' in category_lower or 'plant' in category_lower or 'infrastructure' in category_lower:
                    category = 'Facilities'
                else:
                    category = 'Stock Images'
                logger.info(f"[analyze_image] Normalized category from '{analysis_result['category']}' to '{category}'")
            
            logger.info(f"[analyze_image] Successfully analyzed with {model}", extra={
                'category': category,
                'tags_count': len(analysis_result['tags']),
                'has_description': bool(analysis_result.get('description'))
            })
            
            return {
                'tags': analysis_result['tags'][:10],  # Limit to 10 tags
                'category': category,
                'description': analysis_result.get('description', '')
            }
            
        except Exception as error:
            logger.error(f"[analyze_image] Error with model {model}: {error}")
            last_error = error
            
            # If this is not the last model, try the next one
            if model != MODELS_TO_TRY[-1]:
                logger.info(f"[analyze_image] Attempting fallback to next model...")
                continue
    
    # If we get here, all models failed
    logger.error(f"[analyze_image] All models failed. Last error: {last_error}")
    raise Exception(f"Failed to analyze image with all models: {last_error}")


@https_fn.on_request(
    cors=CorsOptions(
        cors_origins=["*"],
        cors_methods=["POST", "OPTIONS"],
    ),
    secrets=[openrouter_api_key],
    timeout_sec=120,
    memory=1024,
)
def analyzeImagePython(req: https_fn.Request) -> https_fn.Response:
    """
    Cloud Function entry point for image analysis using OpenRouter
    Deployed as: analyzeImagePython
    """
    # Handle CORS preflight
    if req.method == "OPTIONS":
        return https_fn.Response("", status=204)
    
    if req.method != "POST":
        return https_fn.Response(
            json.dumps({"error": "Method Not Allowed"}),
            status=405,
            headers={"Content-Type": "application/json"}
        )
    
    try:
        # Parse request body
        request_json = req.get_json(silent=True) or {}
        image_url = request_json.get("imageUrl")
        
        if not image_url or not isinstance(image_url, str):
            return https_fn.Response(
                json.dumps({"error": "imageUrl (string) is required."}),
                status=400,
                headers={"Content-Type": "application/json"}
            )
        
        logger.info(f"[analyzeImagePython] Analyzing image: {image_url[:100]}...")
        
        # Get API key
        api_key = openrouter_api_key.value
        
        if not api_key:
            return https_fn.Response(
                json.dumps({"error": "OpenRouter API key is not configured"}),
                status=500,
                headers={"Content-Type": "application/json"}
            )
        
        # Analyze image
        analysis_result = analyze_image_with_openrouter(image_url, api_key)
        
        logger.info(f"[analyzeImagePython] Analysis successful", extra={
            'category': analysis_result['category'],
            'tags_count': len(analysis_result['tags'])
        })
        
        # Return success response
        return https_fn.Response(
            json.dumps({
                'success': True,
                'tags': analysis_result['tags'],
                'category': analysis_result['category'],
                'description': analysis_result['description']
            }),
            status=200,
            headers={"Content-Type": "application/json"}
        )
        
    except Exception as error:
        logger.exception(f"[analyzeImagePython] Error: {error}")
        
        error_message = str(error)
        
        # Check if it's an OpenRouter authentication error
        if '401' in error_message or 'User not found' in error_message:
            return https_fn.Response(
                json.dumps({
                    'error': 'OpenRouter API authentication failed',
                    'message': 'The OpenRouter API key is invalid or expired. Please check your API key configuration.',
                    'details': 'OpenRouter returned: User not found (401)'
                }),
                status=500,
                headers={"Content-Type": "application/json"}
            )
        
        return https_fn.Response(
            json.dumps({
                'error': 'Failed to analyze image',
                'message': error_message
            }),
            status=500,
            headers={"Content-Type": "application/json"}
        )

