# Testing Guide & Pre-Deployment Checklist

Comprehensive testing procedures and deployment checklist for the Systemic Shifts Microsite.

## Pre-Deployment Checklist

### Code Quality
- [ ] All linting errors resolved (`npm run lint`)
- [ ] Code builds successfully (`npm run build`)
- [ ] No console errors or warnings in browser
- [ ] All TypeScript/JavaScript errors resolved
- [ ] Unused imports and variables removed

### Environment Configuration
- [ ] All environment variables set in `.env.local`
- [ ] Firebase secrets configured for Cloud Functions
- [ ] API keys valid and accessible
- [ ] Firebase project linked correctly
- [ ] Firestore rules configured appropriately
- [ ] Local image generator service account key configured (`python/firebase-key.json`)
- [ ] Hugging Face API token set (`HF_API_TOKEN` environment variable)
- [ ] Local image generator dependencies installed

### Functionality Testing

#### Core Features
- [ ] Homepage loads correctly
- [ ] Navigation works on all pages
- [ ] Header and footer display properly
- [ ] Responsive design works on mobile/tablet/desktop

#### NexusGPT
- [ ] Chatbot loads and responds
- [ ] RAG retrieval works (answers from knowledge base)
- [ ] Citations display correctly
- [ ] Error handling works for failed requests

#### StatsX Dashboard
- [ ] Dashboard loads with data
- [ ] All metric cards display correctly
- [ ] Charts render properly
- [ ] Article engagement tracking works
- [ ] Filters and cross-filtering function

#### Article System
- [ ] Articles page displays articles
- [ ] Article cards show engagement metrics
- [ ] Like/unlike functionality works
- [ ] View tracking works
- [ ] Comments can be added
- [ ] ArticleEngagement component shows analytics

#### Systemic Shifts Dropbox
- [ ] Form submission works (local API route)
- [ ] AI writeup generates correctly
- [ ] Image generation triggers automatically (local generator)
- [ ] Local image generator service is running
- [ ] Image displays when complete
- [ ] Real-time updates work (Firestore listeners)
- [ ] Verify `aiGeneratedImageUrl` updates in Firestore

#### ULearn
- [ ] Podcast generation works
- [ ] RAG retrieval for podcasts functions
- [ ] Audio playback works

#### MeetX
- [ ] Meeting list displays
- [ ] Meeting creation works
- [ ] AI insights generate

#### Upstream Gallery
- [ ] Gallery displays images
- [ ] Upload functionality works
- [ ] Categories filter correctly

### Browser Compatibility
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)
- [ ] Mobile browsers (iOS Safari, Chrome Mobile)

### Performance Testing
- [ ] Page load times acceptable (< 3 seconds)
- [ ] Images optimized and load efficiently
- [ ] No memory leaks in browser
- [ ] Cloud Functions respond within timeout limits
- [ ] Firestore queries optimized

### Security
- [ ] Firestore security rules tested
- [ ] Authentication required where needed
- [ ] API keys not exposed in client code
- [ ] CORS configured correctly
- [ ] Input validation on forms

## Testing Procedures

### Manual Testing

#### 1. Article Tracking Test
1. Navigate to Articles page
2. Click on an article
3. Verify view is tracked in Firestore
4. Like an article
5. Verify like count updates
6. Add a comment
7. Verify comment appears
8. Check StatsX ArticleEngagement component shows data

#### 2. Image Generation Test
1. Ensure local image generator is running (`python/local_image_generator.py`)
2. Submit a new story via Dropbox
3. Verify writeup appears immediately
4. Verify `aiGeneratedImageUrl` is set to "Pending local generation" in Firestore
5. Wait for local generator to process (checks every 30 seconds)
6. Verify image is generated and uploaded to Storage
7. Verify `aiGeneratedImageUrl` updates with actual URL
8. Verify image displays in frontend when complete
9. Check `imageGeneratedLocally: true` flag in Firestore

#### 3. RAG Function Test
1. Upload a document to knowledge base
2. Ask NexusGPT a question related to the document
3. Verify answer comes from the document
4. Check citations appear
5. Verify similarity threshold works (low similarity queries don't match)

#### 4. StatsX Dashboard Test
1. Navigate to StatsX page
2. Verify all widgets load
3. Check data displays correctly
4. Test filters
5. Verify charts render
6. Check ArticleEngagement shows real data

### Automated Testing (Future)

#### Unit Tests
```bash
npm run test
```

#### Integration Tests
```bash
npm run test:integration
```

#### E2E Tests
```bash
npm run test:e2e
```

## Deployment Testing

### Staging Deployment
1. Deploy to staging environment
2. Run full test suite
3. Verify all features work
4. Check analytics tracking
5. Test error scenarios

### Production Deployment
1. Final code review
2. Backup current production
3. Deploy functions first
4. Deploy frontend
5. Monitor for errors
6. Verify critical paths

## Post-Deployment Verification

### Immediate Checks (Within 5 minutes)
- [ ] Site loads correctly
- [ ] No console errors
- [ ] Critical features work
- [ ] Firebase Functions respond
- [ ] Database connections work

### Extended Monitoring (24 hours)
- [ ] Monitor error logs
- [ ] Check analytics
- [ ] Verify user feedback
- [ ] Monitor performance metrics
- [ ] Check Cloud Function execution times

## Error Scenarios to Test

### Network Failures
- [ ] Offline behavior
- [ ] Slow connection handling
- [ ] Request timeout handling

### API Failures
- [ ] Gemini API failure
- [ ] OpenRouter API failure
- [ ] Hugging Face API failure
- [ ] Firestore connection issues
- [ ] Local image generator service stops
- [ ] GPU/CUDA errors in local generator

### Data Validation
- [ ] Invalid form submissions
- [ ] Missing required fields
- [ ] File upload errors
- [ ] Large file handling

## Performance Benchmarks

### Target Metrics
- **First Contentful Paint**: < 1.5s
- **Time to Interactive**: < 3.5s
- **Largest Contentful Paint**: < 2.5s
- **Cumulative Layout Shift**: < 0.1

### Cloud Functions
- **Response Time**: < 5s for most functions
- **Image Generation**: < 60s
- **Chatbot Response**: < 10s

## Browser Testing Checklist

### Desktop
- [ ] Chrome (Windows/Mac)
- [ ] Firefox (Windows/Mac)
- [ ] Safari (Mac)
- [ ] Edge (Windows)

### Mobile
- [ ] iOS Safari
- [ ] Chrome Mobile (Android)
- [ ] Samsung Internet

### Screen Sizes
- [ ] Mobile (375px)
- [ ] Tablet (768px)
- [ ] Desktop (1024px)
- [ ] Large Desktop (1920px)

## Accessibility Testing

- [ ] Keyboard navigation works
- [ ] Screen reader compatibility
- [ ] Color contrast meets WCAG AA
- [ ] Alt text on images
- [ ] Form labels associated correctly

## Security Testing

- [ ] XSS prevention
- [ ] CSRF protection
- [ ] SQL injection prevention (N/A for Firestore)
- [ ] Authentication required for sensitive operations
- [ ] API rate limiting

## Rollback Plan

If issues are detected:
1. Revert to previous deployment
2. Investigate issue
3. Fix in development
4. Test thoroughly
5. Redeploy

## Contact

For testing issues or questions, contact the development team.

