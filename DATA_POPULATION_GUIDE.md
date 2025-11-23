# Data Population Guide

This guide outlines what needs to be populated for the remaining data population tasks.

## Completed Tasks

✅ **StatsX Data Scenarios** - Created multiple data scenarios with scripts for presentation/testing

## Tasks Requiring User-Provided Content

### 1. Article Page Population

**Status:** ⚠️ Requires user-provided content  
**Location:** `src/app/articles/page.js`

**What's needed:**
- Replace `mockArticles` array with real article data
- Add actual article images to `/public/images/articles/` directory
- Minimum 20+ articles across all categories:
  - Systemic Shifts articles
  - Jukris Lens articles
  - UpstreamBuzz articles
  - PETRONAS 2.0 articles
  - Trending articles

**Current structure:**
The articles page uses a `mockArticles` array. To populate:
1. Create articles in Firestore `articles` collection, OR
2. Replace `mockArticles` with real data from an API/Firestore

**Recommended approach:**
- Create articles in Firestore with structure:
  ```javascript
  {
    id: "article-id",
    title: "Article Title",
    excerpt: "Article excerpt...",
    category: "systemic-shifts",
    categoryLabel: "Systemic Shifts",
    date: "2025-01-20",
    image: "/images/articles/article-image.jpg",
    content: "Full article content...",
    author: "Author Name"
  }
  ```
- Update `articles/page.js` to fetch from Firestore instead of using mockArticles

### 2. Mindset and Behavior - Replace Placeholders

**Status:** ⚠️ Requires user-provided images  
**Location:** `src/components/MindsetBehaviour.js`

**What's needed:**
- Replace placeholder image paths with actual images
- Images needed for:
  - Line 39: `/mindset-risk-tolerant-content.png` (placeholder)
  - Line 45: `/mindset-risk-tolerant-content.png` (placeholder)
  - Similar placeholders in other mindset sections

**Current placeholders:**
- Some images use placeholder paths like `/mindset-risk-tolerant-content.png`
- Actual images should be in `/public/SystemicShiftsDiagrams_pages/` or appropriate directory

**Action required:**
1. Create/provide the actual images
2. Update image paths in `MindsetBehaviour.js`
3. Ensure all three mindset tabs have proper images:
   - More Risk Tolerant
   - Commercial Savvy
   - Growth Mindset

### 3. Collaterals - Replace Placeholders

**Status:** ⚠️ Requires user-provided images and files  
**Location:** `src/components/Collaterals.js`

**What's needed:**
- Replace `PlaceholderBox` components with actual images
- Add download links for:
  - AI format files
  - PNG format files
  - PDF format files
  - Microsite preview images (laptop and tablet views)

**Current placeholders:**
- Lines 79-81: Microsite Preview on Laptop (PlaceholderBox)
- Lines 88-90: Microsite Preview on Tablet (PlaceholderBox)
- Other placeholder boxes for collateral images

**Action required:**
1. Create/provide collateral images
2. Update `downloadLinks` object with actual file URLs
3. Replace PlaceholderBox components with Image components
4. Add actual download functionality

### 4. Upstream Gallery/MeetX - Add More Pictures

**Status:** ⚠️ Requires user-provided images  
**Location:** `src/components/UpstreamGallery.js`

**What's needed:**
- Upload additional images to populate the gallery
- Images should be uploaded via:
  - Firebase Storage (preferred), OR
  - Public directory if static images

**Current status:**
- Gallery component is fully functional
- Just needs more images uploaded

**Action required:**
1. Use the gallery upload functionality (if logged in)
2. Or manually add images to Firebase Storage `gallery` collection
3. Ensure proper categorization
4. Add metadata (titles, descriptions, tags)

**Firestore structure for gallery images:**
```javascript
{
  title: "Image Title",
  description: "Image description",
  imageUrl: "https://storage.googleapis.com/...",
  category: "Events",
  uploadedAt: Timestamp,
  uploadedBy: "user-id"
}
```

## Implementation Notes

### For Articles
The article tracking system is already implemented and will automatically track views, likes, and comments once articles are populated.

### For Images
All image paths should be:
- Relative to `/public` directory for static images
- Full URLs for Firebase Storage images
- Properly optimized for web (compressed, appropriate sizes)

### For Collaterals
Download links can point to:
- Firebase Storage URLs
- Public directory files
- External URLs if hosted elsewhere

## Quick Start

1. **Articles:** Add articles to Firestore or update mockArticles array
2. **Mindset Images:** Add images to `/public/SystemicShiftsDiagrams_pages/` and update paths
3. **Collaterals:** Add images and update downloadLinks in Collaterals.js
4. **Gallery:** Use the upload feature in UpstreamGallery or add via Firebase Console

## Testing

After populating data:
1. Test article page displays correctly
2. Verify mindset images load
3. Check collaterals download links work
4. Confirm gallery displays new images
5. Verify article tracking works with real articles

