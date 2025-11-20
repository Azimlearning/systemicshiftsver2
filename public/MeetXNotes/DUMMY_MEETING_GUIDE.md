# Dummy Meeting Notes for Testing

## Files Created

1. **`dummy-meeting-notes.txt`** - Plain text version (ready to upload)
2. **`create-dummy-pdf.html`** - HTML version (convert to PDF)

## How to Use

### Option 1: Upload TXT File (Easiest)
1. Go to MeetX → Create Meeting
2. Click "Upload Meeting Notes"
3. Select `dummy-meeting-notes.txt` from the `public` folder
4. The text will be extracted automatically
5. Add a title like "Q4 Strategic Planning Session"
6. Save the meeting
7. Wait a few seconds for AI processing
8. View the meeting to see all AI insights populate!

### Option 2: Create PDF from HTML
1. Open `create-dummy-pdf.html` in your browser
2. Press `Ctrl+P` (or `Cmd+P` on Mac)
3. Select "Save as PDF" as the destination
4. Save it as `dummy-meeting.pdf`
5. Upload this PDF to MeetX

## What This Dummy Meeting Contains

This meeting is designed to trigger **all AI features**:

### ✅ Feature A: Summary
- Contains clear meeting structure with decisions and outcomes
- Will generate a comprehensive summary

### ✅ Feature B: Cascading Summary
- Contains strategic decisions and organizational context
- Will analyze how this relates to broader goals

### ✅ Feature C: Alignment Warnings
- **Intentionally includes a conflict**: "This contradicts our previous directive from the Finance Division meeting"
- Will detect this alignment issue

### ✅ Feature D: Action Items & Zombie Tasks
- Contains **12 action items** total
- **5 action items are "zombie tasks"** (missing owner or due date):
  - "[MISSING OWNER] Review vendor contracts..."
  - "[MISSING DUE DATE] Implement new expense approval process"
  - "[MISSING OWNER] Prepare training materials..."
  - "[MISSING DUE DATE] Prepare regulatory compliance checklist"
  - "[MISSING OWNER AND DUE DATE] Contact local partners..."

### Expected Analytics Dashboard Numbers

After uploading and processing, you should see:
- **Meetings Analyzed**: 1
- **Action Items**: 12
- **Alignment Warnings**: 1 (the budget conflict)
- **Zombie Tasks**: 5

## Testing Checklist

- [ ] Upload the dummy meeting file
- [ ] Verify text extraction works
- [ ] Check AI Insights panel shows:
  - [ ] Summary generated
  - [ ] Cascading summary/contextual analysis
  - [ ] Alignment warning detected (budget conflict)
  - [ ] All 12 action items extracted
  - [ ] 5 zombie tasks identified
- [ ] Check AI Insights Dashboard shows correct numbers
- [ ] Verify action items have proper formatting
- [ ] Check zombie tasks are highlighted in red

## Tips

- The AI processing happens automatically after saving
- It may take 30-60 seconds for all insights to generate
- Refresh the page if insights don't appear immediately
- Check the browser console for any errors

