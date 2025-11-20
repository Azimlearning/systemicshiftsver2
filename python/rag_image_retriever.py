"""
RAG Image Retriever
Retrieves relevant visual style references from example images based on story content
"""
import json
import os
import logging
from typing import List, Dict, Optional
from pathlib import Path

logger = logging.getLogger(__name__)

class ImageStyleRetriever:
    """Retrieves relevant image styles based on story content"""
    
    def __init__(self, styles_file: str = None):
        """Initialize with styles knowledge base"""
        if styles_file is None:
            # Default to same directory as this file
            current_dir = os.path.dirname(os.path.abspath(__file__))
            styles_file = os.path.join(current_dir, "rag_image_styles.json")
        
        self.styles_file = styles_file
        self.styles_data = self._load_styles()
    
    def _load_styles(self) -> Dict:
        """Load styles from JSON file"""
        try:
            with open(self.styles_file, 'r', encoding='utf-8') as f:
                data = json.load(f)
            logger.info(f"Loaded {len(data.get('styles', []))} style references from {self.styles_file}")
            return data
        except FileNotFoundError:
            logger.warning(f"Styles file not found: {self.styles_file}. Using default style.")
            return {"styles": [], "defaultStyle": {}}
        except json.JSONDecodeError as e:
            logger.error(f"Error parsing styles JSON: {e}. Using default style.")
            return {"styles": [], "defaultStyle": {}}
    
    def _extract_keywords(self, title: str, metrics_text: str) -> List[str]:
        """Extract keywords from title and metrics for matching"""
        # Combine title and metrics
        text = f"{title} {metrics_text}".lower()
        
        # Common keywords to look for
        keyword_patterns = [
            "metric", "metrics", "number", "numbers", "data", "chart", "charts",
            "process", "step", "steps", "timeline", "journey", "flow",
            "circular", "radial", "pie", "progress", "achievement", "kpi",
            "multiple", "comparison", "grid", "sections", "organized",
            "minimal", "clean", "simple", "focused",
            "dashboard", "analytics", "graphs", "visualization",
            "storytelling", "icon", "icons", "illustration", "narrative",
            "balanced", "equal", "harmonious", "symmetrical"
        ]
        
        found_keywords = []
        for keyword in keyword_patterns:
            if keyword in text:
                found_keywords.append(keyword)
        
        return found_keywords
    
    def _calculate_similarity(self, story_keywords: List[str], style: Dict) -> float:
        """Calculate similarity score between story and style"""
        style_keywords = [kw.lower() for kw in style.get("keywords", [])]
        style_description = style.get("description", "").lower()
        style_usecase = style.get("useCase", "").lower()
        
        # Combine all style text
        style_text = " ".join(style_keywords + [style_description, style_usecase])
        
        # Count keyword matches
        matches = sum(1 for kw in story_keywords if kw in style_text)
        
        # Normalize by number of story keywords (avoid division by zero)
        if len(story_keywords) == 0:
            return 0.0
        
        similarity = matches / len(story_keywords)
        
        # Boost score if keywords match exactly
        exact_matches = sum(1 for kw in story_keywords if kw in style_keywords)
        if exact_matches > 0:
            similarity += 0.2 * (exact_matches / len(story_keywords))
        
        return min(similarity, 1.0)  # Cap at 1.0
    
    def retrieve_styles(self, title: str, metrics_text: str, top_k: int = 2) -> List[Dict]:
        """
        Retrieve top K most relevant styles for the given story
        
        Args:
            title: Story title
            metrics_text: Key metrics text
            top_k: Number of styles to retrieve (default: 2)
        
        Returns:
            List of style dictionaries sorted by relevance
        """
        if not self.styles_data.get("styles"):
            logger.warning("No styles available, returning default style")
            default = self.styles_data.get("defaultStyle", {})
            return [default] if default else []
        
        # Extract keywords from story
        story_keywords = self._extract_keywords(title, metrics_text)
        logger.debug(f"Extracted keywords from story: {story_keywords}")
        
        # Calculate similarity for each style
        styles_with_scores = []
        for style in self.styles_data.get("styles", []):
            similarity = self._calculate_similarity(story_keywords, style)
            styles_with_scores.append((similarity, style))
        
        # Sort by similarity (descending)
        styles_with_scores.sort(key=lambda x: x[0], reverse=True)
        
        # Return top K styles
        top_styles = [style for score, style in styles_with_scores[:top_k]]
        
        if top_styles:
            logger.info(f"Retrieved {len(top_styles)} style(s). Top match: {top_styles[0].get('id', 'unknown')} (similarity: {styles_with_scores[0][0]:.2f})")
        else:
            logger.warning("No styles matched, using default")
            default = self.styles_data.get("defaultStyle", {})
            top_styles = [default] if default else []
        
        return top_styles
    
    def enhance_prompt(self, base_prompt: str, styles: List[Dict]) -> str:
        """
        Enhance prompt with style information from retrieved styles
        
        Args:
            base_prompt: Original prompt
            styles: List of retrieved style dictionaries
        
        Returns:
            Enhanced prompt (still within token limits)
        """
        if not styles:
            return base_prompt
        
        # Use the top style (most relevant)
        top_style = styles[0]
        
        # Extract key style elements
        layout = top_style.get("layout", "vertical")
        layout_details = top_style.get("layoutDetails", "")
        visual_elements = top_style.get("visualElements", [])
        composition = top_style.get("composition", "balanced")
        
        # Build style enhancement (keep it concise for token limit)
        style_cues = []
        
        # Add layout info if different from default
        if layout != "vertical":
            style_cues.append(f"{layout} layout")
        
        # Add key visual elements (limit to 2-3 most important)
        if visual_elements:
            key_elements = visual_elements[:2]  # Take top 2
            style_cues.append(", ".join(key_elements))
        
        # Add composition style
        if composition and composition != "balanced":
            style_cues.append(f"{composition} composition")
        
        # Build enhanced prompt
        if style_cues:
            style_text = ". ".join(style_cues)
            enhanced = f"{base_prompt}. Style: {style_text}."
        else:
            enhanced = base_prompt
        
        # Ensure we don't exceed reasonable length (approximate token limit)
        # Rough estimate: 1 token ≈ 4 characters
        max_chars = 77 * 4  # 77 tokens * 4 chars/token
        if len(enhanced) > max_chars:
            # Truncate while preserving base prompt
            base_len = len(base_prompt)
            available = max_chars - base_len - 20  # Reserve space for "Style: ..."
            if available > 0:
                style_text = style_text[:available]
                enhanced = f"{base_prompt}. Style: {style_text}."
            else:
                enhanced = base_prompt  # Fallback to base if no room
        
        logger.debug(f"Enhanced prompt length: {len(enhanced)} chars (base: {len(base_prompt)} chars)")
        return enhanced

