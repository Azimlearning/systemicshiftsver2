# File Usage Audit

This document identifies files that may be unused or candidates for deletion/consolidation.

## Audit Date
Generated during project cleanup phase.

## Unused Files (Candidates for Deletion)

### Components

#### 1. UflixContent.js
**Location:** `src/components/UflixContent.js`  
**Status:** ❌ UNUSED  
**Reason:** Uflix subpage has been removed from the project  
**Action:** DELETE - No imports found in codebase  
**Risk:** Low - Component is not referenced anywhere

### Pages

#### 2. nexushub/uflix/ directory
**Location:** `src/app/nexushub/uflix/`  
**Status:** ❌ DELETED  
**Reason:** Uflix subpage removed per requirements  
**Action:** Already deleted  
**Note:** Directory may still exist but page.js was removed

## Files Requiring Review

### Components That May Be Unused

#### 1. KnowledgeBaseInjector.js
**Location:** `src/components/KnowledgeBaseInjector.js`  
**Status:** ✅ CONFIRMED USED  
**Action:** Used in nexusgpt/page.js for knowledge base management  
**Recommendation:** KEEP - Active component

#### 2. MiniChatWidget.js
**Location:** `src/components/MiniChatWidget.js`  
**Status:** ✅ CONFIRMED USED  
**Action:** Used in layout.js for embedded chat functionality  
**Recommendation:** KEEP - Active component

#### 3. LoadingAnimation.js
**Location:** `src/components/LoadingAnimation.js`  
**Status:** ✅ CONFIRMED USED  
**Action:** Used in page.js (homepage) for initial loading animation  
**Recommendation:** KEEP - Active component

## Files Confirmed as Used

### Core Components (Used)
- ✅ `Header.js` - Used in layouts
- ✅ `Footer.js` - Used in layouts
- ✅ `Hero.js` - Used in petronas-2.0/page.js
- ✅ `HeroSection.js` - Used in page.js (homepage)
- ✅ `RotatingBanner.js` - Used in page.js (homepage)
- ✅ `StaticFAQ.js` - Used in nexusgpt/page.js
- ✅ `AIPoweredFeatures.js` - Used in homepage
- ✅ `ArticleCard.js` - Used in articles/page.js
- ✅ `ArticleFilters.js` - Used in articles/page.js
- ✅ `SystemicShiftsDropbox.js` - Used in nexushub/dropbox/page.js
- ✅ `Collaterals.js` - Used in nexushub/collaterals/page.js
- ✅ `UpstreamGallery.js` - Used in nexushub/upg/page.js
- ✅ `MindsetBehaviour.js` - Used in systemic-shifts/mindset-behaviour/page.js
- ✅ All StatsX components - Used in statsx/page.js
- ✅ All MeetX components - Used in meetx pages
- ✅ ChatInterface.js - Used in nexusgpt/page.js
- ✅ ChatHistorySidebar.js - Used in chat interface
- ✅ SubmitStories.js - Used in submit-story/page.js
- ✅ PodcastGenerator.js - Used in ulearn pages
- ✅ MyPodcasts.js - Used in ulearn pages
- ✅ KnowledgeBaseInjector.js - Used in nexusgpt/page.js
- ✅ MiniChatWidget.js - Used in layout.js
- ✅ LoadingAnimation.js - Used in page.js (homepage)

## Root Scripts Directory

### scripts/ directory
**Location:** Root `scripts/` directory  
**Status:** ❌ DELETED  
**Files:**
- `core.js` - DELETED
- `home.js` - DELETED
- `submit.js` - DELETED

**Action:** ✅ Deleted - Legacy vanilla JS files not used in Next.js app  
**Reason:** These were legacy scripts for an old HTML-based version. The Next.js app uses React components instead.

## Python Files (Already Consolidated)

### ✅ Completed
- `main_hf_api.py` - DELETED (duplicate of main.py)
- `main.py` - KEPT (primary implementation)
- `main_diffusers_backup.py` - KEPT (backup with different implementation)

## Recommendations

### Immediate Actions
1. ✅ **Delete UflixContent.js** - Already deleted (doesn't exist)
2. ✅ **Delete scripts/ directory** - DELETED (legacy vanilla JS files)
3. ✅ **Delete root-level functions/ directory** - DELETED (duplicate/old version)
4. ✅ **Verify KnowledgeBaseInjector usage** - CONFIRMED USED in nexusgpt/page.js
5. ✅ **Verify MiniChatWidget usage** - CONFIRMED USED in layout.js
6. ✅ **Verify LoadingAnimation usage** - CONFIRMED USED in page.js (homepage)

### Future Cleanup
1. ✅ **Remove any empty directories** - COMPLETED: Deleted empty `nexushub/uflix` directory
2. ✅ **Consolidate similar components if duplicates exist** - COMPLETED: No duplicates found, all components serve unique purposes
3. ✅ **Remove commented-out code blocks** - COMPLETED: Removed duplicate comment in `functions/index.js`
4. ✅ **Clean up unused imports in files** - COMPLETED: Removed `useCallback` and `endBefore` from unused imports

## How to Verify Usage

### For Components
```bash
# Search for imports
grep -r "from.*ComponentName" src/
grep -r "import.*ComponentName" src/
```

### For Pages
```bash
# Check if page is linked in navigation
grep -r "href.*/page-path" src/
```

### For Scripts
```bash
# Check HTML files or build configs
grep -r "scripts/" .
```

## Notes

- This audit was performed automatically
- Manual review recommended before deletion
- Some files may be used in ways not detected by import search
- Keep backups before deleting files
- Test application after deletions

## Additional Deletions

### Root-level functions/ directory
**Location:** Root `functions/` directory  
**Status:** ❌ DELETED  
**Files:**
- `index.js` - DELETED (empty file)
- `generate_image_hf.js` - DELETED (duplicate/old version)

**Action:** ✅ Deleted - Duplicate/old version  
**Reason:** Actual functions are in `systemicshiftsver2/functions/`. Root-level directory was not used.

## Additional Cleanup Completed

### Deleted Files
1. ✅ **ulearn/uflix/page.js** - DELETED (unused "Coming Soon" page, not in navigation)
2. ✅ **Empty nexushub/uflix directory** - DELETED (already removed)

### Code Cleanup
1. ✅ **Removed duplicate comment** in `functions/index.js`
2. ✅ **Removed unused imports:**
   - `useCallback` from `SystemicShiftsDropbox.js`
   - `endBefore` from `SystemicShiftsDropbox.js`

### Cloud Functions Documentation
- Created `UNUSED_CLOUD_FUNCTIONS.md` documenting functions with 0 requests that can be deleted:
  - `submitStory` - Replaced by local API route
  - `generateImageHfPython` - Local generation preferred
  - `generateImageHf` - Local generation preferred
  - `generateEmbeddings` - Admin function, optional
  - `populateKnowledgeBase` - Admin function, optional

## Last Updated
Updated after cleanup: Deleted legacy scripts/, root-level functions/, ulearn/uflix page, and cleaned up unused imports.

