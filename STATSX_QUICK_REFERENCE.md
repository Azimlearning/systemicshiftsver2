# StatsX Quick Reference Guide

## Component Walkthrough

### AnomalyDetector Component

**Location**: `src/components/StatsX/AnomalyDetector.js`

**What It Does**:
The AnomalyDetector is an AI-powered widget that automatically detects unusual patterns in your data using statistical analysis.

**How It Works**:
1. **Takes Time Series Data**: Analyzes stories and meetings data over time
2. **Calculates Statistics**: For each data point, calculates:
   - Mean (average value)
   - Standard deviation (how spread out the data is)
   - Upper/lower bounds (3 standard deviations from mean)
3. **Detects Anomalies**: Flags any values that are:
   - **Spikes**: Significantly higher than normal (3σ above mean)
   - **Dips**: Significantly lower than normal (3σ below mean)
4. **Uses Rolling Window**: Instead of comparing to all historical data, it uses a 14-day rolling window, making it more sensitive to recent changes

**Visual Output**:
- **Green Status**: No anomalies detected (all normal)
- **Red Status**: Anomalies found (needs attention)
- Shows total count, spikes count, dips count
- Lists recent anomalies with dates and deviation amounts

**Example**:
If you normally get 10 stories per day, but suddenly get 50 in one day, the AnomalyDetector will:
- Calculate that 50 is 3.2 standard deviations above the mean
- Flag it as a "spike" anomaly
- Display it in red with the message "Unusual spike detected (3.2σ deviation)"

**Why It's Useful**:
- Automatically catches unusual activity
- Helps identify potential issues or opportunities
- Provides statistical context (not just "this looks high")

---

### generateFakeData.js Library

**Location**: `src/lib/generateFakeData.js`

**What It Does**:
A utility library that generates realistic fake data for testing the dashboard when you don't have real data yet.

**Key Functions**:

#### 1. `generateFakeStories(count, startDate, endDate)`
Creates fake story submissions that look realistic:
- Random titles like "Story 1: Portfolio High-Grading Initiative"
- Random combinations of key shifts (1-3 per story)
- Random focus areas (1-3 per story)
- Random submission dates spread across the date range
- Realistic metadata (mindset types, alignment flags)

**Example Output**:
```javascript
{
  title: "Story 5: Deliver Advantaged Barrels Initiative",
  keyShifts: ["Portfolio High-Grading", "Operational Excellence"],
  focusAreas: ["Exploration", "Development"],
  submittedAt: Timestamp(2025-01-15),
  // ... more fields
}
```

#### 2. `generateFakeMeetings(count, startDate, endDate)`
Creates fake meeting records:
- Random meeting titles
- 70% have AI insights (realistic adoption rate)
- Random action items (1-5 per meeting)
- Random creation dates
- Some meetings are public, some private

**Example Output**:
```javascript
{
  title: "Meeting 3: Production Review",
  createdAt: Timestamp(2025-01-20),
  aiInsights: {
    actionItems: [
      {item: "Action item 1", assignee: "Team Member 1", dueDate: "2025-02-15"}
    ]
  }
}
```

#### 3. `generateFakeAnalytics(count, startDate, endDate)`
Creates fake page view and interaction events:
- Random page paths (/, /statsx, /meetx, etc.)
- Random user IDs
- Random timestamps
- Mix of page views and click events

#### 4. `generateAllFakeData(options)` - Main Function
Generates all three types at once:
```javascript
await generateAllFakeData({
  storiesCount: 50,      // How many stories
  meetingsCount: 30,    // How many meetings
  analyticsCount: 200,  // How many analytics events
  daysBack: 30          // How far back to generate data
});
```

**How It Works**:
1. Creates arrays of data objects with realistic values
2. Spreads dates randomly across the specified range
3. Uses actual key shifts and focus areas from your site (not random strings)
4. Adds each item to Firestore using `addDoc()`
5. Returns count of successfully added items

**Why It's Useful**:
- Test dashboard visuals without real data
- Populate empty database for demos
- Generate data for specific date ranges
- Safe to run multiple times (only adds, never deletes)

**Safety Features**:
- Only adds data, never deletes existing data
- Can be run multiple times safely
- Each run adds more data (doesn't replace)
- Uses realistic values that match your site structure

---

## Other Key Components

### TrendChart Component
- **What**: Main chart showing trends over time
- **Features**: 
  - Historical data (solid line)
  - 30-day forecast (dotted line)
  - Anomaly markers (red/blue dots)
  - Toggle between linear/log scales
- **Data**: Stories, meetings, or combined activity

### PulseWidget Component
- **What**: 4 health metric cards at the top
- **Shows**: Stories count, Meetings count, Engagement rate, Knowledge Base count
- **Features**: Animated numbers, week-over-week growth indicators

### AIInsightsTicker Component
- **What**: Rotating banner with AI-generated insights
- **Shows**: Week-over-week comparisons, adoption rates, key findings
- **Features**: Auto-rotates every 5 seconds, smooth transitions

### DataGenerator Component
- **What**: Admin UI for generating fake data
- **Features**: 
  - Configurable counts for each data type
  - Date range selector
  - Progress indicator
  - Auto-refresh after generation

---

## Common Tasks

### Generate Test Data
1. Go to `/statsx`
2. Scroll to bottom
3. Set counts (e.g., 50 stories, 30 meetings)
4. Click "Generate Fake Data"
5. Wait for completion
6. Page refreshes automatically

### View Anomalies
1. AnomalyDetector widget shows status
2. Green = normal, Red = anomalies detected
3. Click to see recent anomalies list
4. Anomalies also marked on TrendChart

### Change Metric View
1. Find dropdown above TrendChart
2. Select: Combined, Stories, or Meetings
3. Chart updates immediately

### Clear Filters
1. Active filters shown at top when applied
2. Click × on individual filter
3. Or click "Clear all" button

---

## Troubleshooting

**"Module not found: date-fns"**
→ Run: `npm install date-fns recharts`

**No data showing**
→ Generate fake data using DataGenerator component

**Charts not rendering**
→ Check browser console for errors
→ Ensure Firebase is configured correctly

**Anomalies not detected**
→ Need at least 14 days of data
→ More data = better detection

---

## File Locations Quick Reference

```
Components:
  src/components/StatsX/
    ├── MetricCard.js          # Reusable metric card
    ├── PulseWidget.js         # 4 health metrics
    ├── TrendChart.js          # Main trend chart
    ├── AnomalyDetector.js    # Anomaly detection widget
    ├── AIInsightsTicker.js    # AI insights banner
    ├── StoryAnalytics.js      # Story analytics
    ├── MeetingAnalytics.js    # Meeting analytics
    ├── EngagementAnalytics.js # Engagement metrics
    ├── KnowledgeBaseAnalytics.js # KB analytics
    ├── ArticleEngagement.js   # Article analytics (coming soon)
    ├── CohortHeatmap.js       # Activity heatmap
    └── DataGenerator.js       # Fake data generator UI

Libraries:
  src/lib/
    ├── analytics.js           # Tracking system
    ├── statsData.js           # Data aggregation
    ├── forecasting.js         # Predictive forecasting
    ├── anomalyDetection.js    # Anomaly detection
    └── generateFakeData.js   # Fake data generation

Main Page:
  src/app/statsx/page.js       # Dashboard entry point
```

---

For detailed documentation, see `STATSX_IMPLEMENTATION.md`

