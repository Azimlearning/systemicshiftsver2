# StatsX Analytics Dashboard - Implementation Reference

## Table of Contents
1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Dependencies](#dependencies)
4. [File Structure](#file-structure)
5. [Component Documentation](#component-documentation)
6. [Library Functions](#library-functions)
7. [Data Flow](#data-flow)
8. [AI Features](#ai-features)
9. [Usage Guide](#usage-guide)
10. [Troubleshooting](#troubleshooting)

---

## Overview

StatsX is a comprehensive analytics dashboard built for the Systemic Shifts microsite. It provides real-time insights into site activity, user engagement, and content performance with AI-powered features including predictive forecasting and anomaly detection.

### Key Features
- **Real-time Metrics**: Live tracking of stories, meetings, engagement, and knowledge base
- **Predictive Forecasting**: 30-day predictions using linear regression
- **Anomaly Detection**: Statistical detection of unusual patterns (3-sigma rule)
- **AI Insights**: Automated daily summaries and week-over-week comparisons
- **Cross-filtering**: Interactive charts that filter other widgets
- **Fake Data Generator**: Admin tool for populating test data

---

## Architecture

### Tech Stack
- **Framework**: Next.js 16.0.1 (App Router)
- **UI Library**: React 19.2.0
- **Styling**: Tailwind CSS 4
- **Charts**: Recharts 2.12.7
- **Animations**: Framer Motion 12.23.24
- **Date Utilities**: date-fns 3.6.0
- **Database**: Firebase Firestore
- **Icons**: react-icons 5.5.0

### Data Sources
1. **Firestore Collections**:
   - `stories` - Story submissions with metadata
   - `meetings` - Meeting data with AI insights
   - `knowledgeBase` - Knowledge documents
   - `upstreamGallery` - Image gallery
   - `analytics` - Page views and user interactions

2. **Real-time Tracking**:
   - Page view events
   - User interactions
   - Click events

---

## Dependencies

### New Dependencies Added
```json
{
  "recharts": "^2.12.7",    // Chart library for React
  "date-fns": "^3.6.0"      // Date manipulation utilities
}
```

### Installation
```bash
npm install recharts date-fns
```

---

## File Structure

```
systemicshiftsver2/
├── src/
│   ├── app/
│   │   └── statsx/
│   │       └── page.js                    # Main dashboard page
│   ├── components/
│   │   └── StatsX/
│   │       ├── MetricCard.js             # Reusable metric display card
│   │       ├── PulseWidget.js             # Health metrics (4 cards)
│   │       ├── TrendChart.js              # Main trend chart with forecasting
│   │       ├── CohortHeatmap.js           # Activity heatmap
│   │       ├── AnomalyDetector.js         # Anomaly detection widget
│   │       ├── AIInsightsTicker.js        # AI-generated insights
│   │       ├── StoryAnalytics.js          # Story-specific analytics
│   │       ├── MeetingAnalytics.js        # Meeting-specific analytics
│   │       ├── EngagementAnalytics.js     # Engagement metrics
│   │       ├── KnowledgeBaseAnalytics.js  # Knowledge base stats
│   │       ├── ArticleEngagement.js       # Article engagement analytics (coming soon)
│   │       └── DataGenerator.js           # Fake data generator UI
│   └── lib/
│       ├── analytics.js                   # Analytics tracking system
│       ├── statsData.js                   # Data aggregation utilities
│       ├── forecasting.js                 # Predictive forecasting
│       ├── anomalyDetection.js            # Anomaly detection algorithms
│       └── generateFakeData.js           # Fake data generation
```

---

## Component Documentation

### 1. Main Dashboard Page (`src/app/statsx/page.js`)

**Purpose**: Main entry point for the StatsX dashboard. Orchestrates all widgets and manages data fetching.

**Key Features**:
- Fetches aggregated data from all Firestore collections
- Manages loading and error states
- Implements bento box grid layout (3-column responsive)
- Handles cross-filtering between widgets
- Auto-refreshes data every 5 minutes

**State Management**:
- `data`: Aggregated dashboard data
- `loading`: Loading state
- `error`: Error messages
- `selectedMetric`: Current metric view (combined/stories/meetings)
- `filters`: Active filter state for cross-filtering

**Layout Structure** (Modern Bento Box Format):
```
┌─────────────────────────────────────────┐
│  Header Section                          │
├─────────────────────────────────────────┤
│  AI Insights Ticker (full width)         │
├─────────────────────────────────────────┤
│  Pulse Widget (4 compact metric cards)  │
├─────────────────────────────────────────┤
│  ┌──────────────────┬─────────────────┐ │
│  │ Trend Chart (2/3)│ Anomaly Detector │ │
│  │ [Aligned Height] │ [Aligned Height] │ │
│  └──────────────────┴─────────────────┘ │
├─────────────────────────────────────────┤
│  ┌──────────────────┬─────────────────┐ │
│  │ Story Analytics   │ Meeting Analytics│ │
│  │   (Compact)      │    (Compact)    │ │
│  └──────────────────┴─────────────────┘ │
├─────────────────────────────────────────┤
│  ┌──────────┬──────────┬──────────────┐ │
│  │Engagement│Knowledge │Article Engage│ │
│  │(Compact) │Base      │(Coming Soon) │ │
│  └──────────┴──────────┴──────────────┘ │
├─────────────────────────────────────────┤
│  Cohort Heatmap (Compact)               │
├─────────────────────────────────────────┤
│  Data Generator (Admin Tool)             │
└─────────────────────────────────────────┘
```

**Design Principles**:
- **Compact Layout**: Reduced padding (p-4 instead of p-6) and smaller chart heights
- **Aligned Components**: TrendChart and AnomalyDetector have matching heights using flexbox
- **3-Column Grid**: Engagement, Knowledge Base, and Article Engagement in equal columns
- **Reduced Scrolling**: Smaller heatmap and compact widgets minimize vertical space
- **Bento Box Style**: Modern grid layout with proper spacing (gap-4)

---

### 2. MetricCard Component (`src/components/StatsX/MetricCard.js`)

**Purpose**: Reusable card component for displaying metrics with animated numbers and change indicators.

**Props**:
- `title` (string): Metric title
- `value` (number|string): Current value
- `change` (number): Week-over-week change percentage
- `changeLabel` (string): Label for change (default: "vs last week")
- `icon` (React component): Icon component
- `color` (string): Color theme ('teal', 'purple', 'blue', 'amber')
- `loading` (boolean): Loading state

**Features**:
- **Animated Numbers**: Uses Framer Motion's `useSpring` to animate number counting
- **Color Themes**: Supports 4 color schemes matching site design
- **Change Indicators**: Shows up/down arrows with percentage change
- **Loading State**: Skeleton loader animation

**Example Usage**:
```jsx
<MetricCard
  title="Stories"
  value={150}
  change={12.5}
  icon={FaFileAlt}
  color="teal"
/>
```

**AnimatedNumber Sub-component**:
- Uses `useSpring` and `useTransform` for smooth number counting
- Automatically formats numbers with locale string
- Animates from 0 to target value on mount/update

---

### 3. PulseWidget Component (`src/components/StatsX/PulseWidget.js`)

**Purpose**: Displays 4 key health metrics in a grid layout.

**Metrics Displayed**:
1. **Stories**: Total story submissions with week-over-week growth
2. **Meetings**: Total meetings with growth percentage
3. **Engagement**: AI usage rate percentage
4. **Knowledge Base**: Total documents count

**Data Flow**:
- Receives aggregated `data` object from main page
- Extracts metrics from `data.stories`, `data.meetings`, `data.knowledgeBase`
- Calculates growth from `data.comparisons`

**Layout**: Responsive grid (1 col mobile, 2 cols tablet, 4 cols desktop)

---

### 4. TrendChart Component (`src/components/StatsX/TrendChart.js`)

**Purpose**: Main visualization showing trends over time with predictive forecasting and anomaly detection.

**Key Features**:
- **Multi-metric Support**: Can display stories, meetings, or combined activity
- **Predictive Forecasting**: Shows 30-day forecast with dotted lines
- **Anomaly Detection**: Highlights unusual spikes/dips on chart
- **Scale Toggle**: Switch between linear and logarithmic scales
- **Interactive Tooltips**: Detailed information on hover

**Props**:
- `data`: Aggregated dashboard data
- `loading`: Loading state
- `showForecast`: Enable/disable forecasting (default: true)
- `showAnomalies`: Enable/disable anomaly detection (default: true)
- `metric`: 'stories', 'meetings', or 'combined'
- `filters`: Active filters for cross-filtering
- `onFilter`: Callback for filter changes

**Chart Layers**:
1. **Historical Data**: Solid teal area chart
2. **Forecast Data**: Dotted purple area chart (future predictions)
3. **Anomaly Markers**: Red/blue dots for detected anomalies

**Forecasting**:
- Uses `forecast()` function from `forecasting.js`
- Applies smoothing with 7-day moving average
- Extends 30 days into the future

**Anomaly Detection**:
- Uses `highlightAnomalies()` from `anomalyDetection.js`
- Rolling window method (14-day window)
- 3-sigma threshold for detection
- Displays anomaly labels below chart

---

### 5. CohortHeatmap Component (`src/components/StatsX/CohortHeatmap.js`)

**Purpose**: Visualizes weekly activity patterns in a heatmap format (similar to GitHub contributions).

**How It Works**:
1. **Data Aggregation**:
   - Combines stories and meetings time series
   - Groups by week using `startOfWeek()`
   - Calculates total activity per week

2. **Intensity Calculation**:
   - Finds maximum value across all weeks
   - Calculates intensity (0-5 scale) for each week
   - Maps intensity to color gradient

3. **Visualization**:
   - 12-week grid (3 months)
   - Color intensity: gray (0) → teal-500 (5)
   - Hover tooltips show exact values
   - Week labels every 4 weeks

**Color Scale**:
- 0: `bg-gray-100` (no activity)
- 1: `bg-teal-100` (low)
- 2: `bg-teal-200`
- 3: `bg-teal-300`
- 4: `bg-teal-400`
- 5: `bg-teal-500` (high)

---

### 6. AnomalyDetector Component (`src/components/StatsX/AnomalyDetector.js`)

**Purpose**: AI-powered widget that detects and displays statistical anomalies in time series data.

**What It Does**:
1. **Analyzes Time Series**:
   - Processes stories and meetings time series separately
   - Applies rolling window anomaly detection (14-day window)
   - Uses 3-sigma (standard deviation) rule

2. **Detects Anomalies**:
   - **Spikes**: Values significantly above normal (3σ above mean)
   - **Dips**: Values significantly below normal (3σ below mean)

3. **Displays Results**:
   - Total anomaly count
   - Breakdown by type (spikes vs dips)
   - Recent anomalies list (last 5)
   - Visual status indicator (green = normal, red = anomalies)

**Status Indicators**:
- **Green**: No anomalies detected, all metrics normal
- **Red**: Anomalies detected, requires attention

**Anomaly Information Displayed**:
- Date of anomaly
- Type (spike or dip)
- Deviation in standard deviations (σ)

**Example Output**:
```
Total Anomalies: 3
Spikes: 2
Dips: 1

Recent Anomalies:
- 2025-01-15: Unusual spike (3.2σ)
- 2025-01-10: Unusual dip (3.1σ)
```

**Technical Details**:
- Uses `highlightAnomalies()` from `anomalyDetection.js`
- Rolling window method for more sensitive recent detection
- Calculates mean and standard deviation for each window
- Flags values outside 3 standard deviations

---

### 7. AIInsightsTicker Component (`src/components/StatsX/AIInsightsTicker.js`)

**Purpose**: Rotating ticker that displays AI-generated insights about dashboard metrics.

**How It Works**:
1. **Generates Insights**:
   - Analyzes week-over-week growth for stories
   - Checks meeting activity trends
   - Evaluates AI usage rates
   - Identifies top knowledge categories

2. **Insight Types**:
   - **Positive**: Growth, high engagement, strong adoption
   - **Negative**: Declines, low activity
   - **Neutral**: General information

3. **Rotation**:
   - Automatically cycles through insights every 5 seconds
   - Manual navigation with dot indicators
   - Smooth fade transitions between insights

**Example Insights**:
- "Story submissions increased by 12.5% compared to last week"
- "AI insights are being used in 75% of meetings, showing strong adoption"
- "Average daily activity is 8.3 items, indicating strong engagement"

**Visual Design**:
- Gradient background (teal to purple)
- Brain icon indicator
- Smooth animations with Framer Motion

---

### 8. StoryAnalytics Component (`src/components/StatsX/StoryAnalytics.js`)

**Purpose**: Detailed analytics for story submissions.

**Views**:
1. **Trends**: Bar chart showing daily submissions (last 30 days)
2. **Key Shifts**: Horizontal bar chart of most common key shifts
3. **Focus Areas**: Pie chart showing focus area distribution

**Metrics Displayed**:
- Total stories count
- Average per day
- Number of unique key shifts

**Interactive Features**:
- Clickable bars for cross-filtering
- View switcher (trends/key shifts/focus areas)
- Responsive chart sizing

**Data Processing**:
- Aggregates from `data.stories.timeSeries`
- Counts key shifts from `data.stories.keyShiftsCount`
- Counts focus areas from `data.stories.focusAreasCount`

---

### 9. MeetingAnalytics Component (`src/components/StatsX/MeetingAnalytics.js`)

**Purpose**: Analytics for meeting data and AI usage.

**Charts**:
1. **Meeting Trends**: Line chart of meetings over time (last 30 days)
2. **Action Item Completion**: Bar chart showing completed vs pending

**Metrics**:
- Total meetings
- Average per day
- Total action items
- AI usage rate percentage

**Data Sources**:
- `data.meetings.timeSeries` for trends
- `data.meetings.totalActionItems` for action items
- `data.meetings.aiUsageRate` for AI adoption

---

### 10. EngagementAnalytics Component (`src/components/StatsX/EngagementAnalytics.js`)

**Purpose**: Tracks page views and user engagement.

**Features**:
- **Page View Trends**: Area chart showing views over time
- **Top Pages**: List of most visited pages with view counts

**Data Source**:
- Fetches from `analytics` Firestore collection
- Uses `getPageViewStats()` from `analytics.js`
- Currently uses mock time series (can be enhanced with actual daily breakdown)

**Future Enhancements**:
- Real-time page view tracking
- User journey flow visualization
- Session duration metrics

---

### 11. ArticleEngagement Component (`src/components/StatsX/ArticleEngagement.js`)

**Purpose**: Placeholder component for article engagement analytics (coming soon).

**Features**:
- Clean placeholder design with icon
- "Coming Soon" message
- Matches other analytics widget styling
- Compact size to fit 3-column grid

**Props**:
- `loading` (boolean): Loading state

**Status**: Currently displays placeholder. Will be implemented to show article analytics from the articles collection.

---

### 12. KnowledgeBaseAnalytics Component (`src/components/StatsX/KnowledgeBaseAnalytics.js`)

**Purpose**: Analytics for knowledge base documents.

**Visualizations**:
1. **Category Distribution**: Pie chart of top 6 categories
2. **Top Tags**: Horizontal bar chart of most used tags

**Metrics**:
- Total documents
- Number of categories
- Number of tags

**Data Processing**:
- `data.knowledgeBase.topCategories` for pie chart
- `data.knowledgeBase.topTags` for bar chart
- Sorts by count, displays top 10

---

### 12. DataGenerator Component (`src/components/StatsX/DataGenerator.js`)

**Purpose**: Admin UI for generating fake test data.

**Features**:
- Configurable generation options:
  - Stories count (0-500)
  - Meetings count (0-500)
  - Analytics events (0-1000)
  - Days back (7-365)
- Real-time generation progress
- Results display with counts
- Auto-refresh after generation

**Usage**:
1. Set desired counts for each data type
2. Set date range (days back)
3. Click "Generate Fake Data"
4. Wait for completion
5. Page auto-refreshes to show new data

**Safety**:
- Only generates data, doesn't delete existing
- Adds to existing collections
- Can be run multiple times

---

## Library Functions

### 1. Analytics Tracking (`src/lib/analytics.js`)

**Purpose**: Tracks page views and user interactions, stores in Firestore.

**Functions**:

#### `trackPageView(pagePath, pageTitle, metadata)`
- Records a page view event
- Stores: path, title, userId, timestamp, user agent, referrer
- Used automatically on page navigation

#### `trackEvent(eventName, elementId, metadata)`
- Tracks custom events (clicks, interactions)
- Stores: event name, element ID, page path, user ID

#### `trackCustomEvent(eventType, data)`
- Generic event tracking for any custom event type
- Flexible data structure

#### `getAnalyticsEvents(startDate, endDate, eventType)`
- Retrieves analytics events for a date range
- Optional filtering by event type
- Returns array of event objects

#### `getPageViewStats(startDate, endDate)`
- Aggregates page view statistics
- Returns: total views, views per page, unique pages count

#### `initAnalytics()`
- Initializes automatic page view tracking
- Sets up navigation listeners
- Call once in app initialization

---

### 2. Data Aggregation (`src/lib/statsData.js`)

**Purpose**: Aggregates and processes data from all Firestore collections.

**Functions**:

#### `aggregateStories(startDate, endDate)`
- Fetches stories from Firestore
- Groups by day for time series
- Counts key shifts and focus areas
- Returns:
  ```javascript
  {
    total: number,
    timeSeries: [{date, value, timestamp}],
    keyShiftsCount: {[shift]: count},
    focusAreasCount: {[area]: count},
    averagePerDay: number
  }
  ```

#### `aggregateMeetings(startDate, endDate)`
- Fetches meetings from Firestore
- Calculates AI usage statistics
- Counts action items
- Returns:
  ```javascript
  {
    total: number,
    timeSeries: [{date, value, timestamp}],
    totalActionItems: number,
    totalInsights: number,
    meetingsWithAI: number,
    aiUsageRate: number,
    averagePerDay: number
  }
  ```

#### `aggregateKnowledgeBase(startDate, endDate)`
- Fetches all knowledge base documents
- Groups by category and tags
- Returns top categories and tags
- Returns:
  ```javascript
  {
    total: number,
    categoryCount: {[category]: count},
    tagCount: {[tag]: count},
    topCategories: [{name, count}],
    topTags: [{name, count}]
  }
  ```

#### `aggregateGallery(startDate, endDate)`
- Fetches gallery images
- Groups by category
- Creates time series
- Returns:
  ```javascript
  {
    total: number,
    timeSeries: [{date, value, timestamp}],
    categoryCount: {[category]: count},
    averagePerDay: number
  }
  ```

#### `calculateGrowth(currentValue, previousValue)`
- Calculates percentage growth
- Handles division by zero
- Returns growth percentage

#### `getComparisonData(aggregateFunction, startDate, endDate)`
- Compares current period to previous period
- Calculates growth metrics
- Returns:
  ```javascript
  {
    current: aggregatedData,
    previous: aggregatedData,
    growth: number
  }
  ```

#### `getAllDashboardData(startDate, endDate)`
- **Main function** - Fetches all dashboard data
- Aggregates all collections in parallel
- Calculates week-over-week comparisons
- Returns complete dashboard dataset
- Default: last 30 days

---

### 3. Forecasting (`src/lib/forecasting.js`)

**Purpose**: Predictive forecasting using linear regression and time series analysis.

**Functions**:

#### `linearRegression(data)`
- **Internal function** - Calculates linear regression
- Input: Array of {x, y} points
- Returns: {slope, intercept}
- Used for trend line calculation

#### `movingAverage(values, window)`
- **Internal function** - Calculates moving average
- Smooths out noise in time series
- Default window: 7 days

#### `forecastLinear(timeSeries, daysAhead)`
- Simple linear regression forecasting
- Extends trend line into future
- Returns array of forecasted points
- Each point: {date, value, isForecast: true}

#### `forecastSmooth(timeSeries, daysAhead, smoothingWindow)`
- **Recommended method** - Uses moving average smoothing
- Applies smoothing before regression
- More accurate for noisy data
- Default: 7-day smoothing window

#### `forecastSeasonal(timeSeries, daysAhead)`
- Advanced forecasting with weekly pattern detection
- Calculates day-of-week patterns
- Applies seasonal adjustments
- Best for data with weekly cycles

#### `combineHistoricalAndForecast(historical, forecast)`
- Merges historical and forecasted data
- Marks forecast points with `isForecast: true`
- Returns single array for charting

#### `forecast(timeSeries, daysAhead, method)`
- **Main function** - Unified forecasting interface
- Methods: 'linear', 'smooth', 'seasonal'
- Default: 'smooth' (best balance)
- Returns combined historical + forecast data

**How Forecasting Works**:
1. Takes historical time series data
2. Calculates linear regression (trend line)
3. Extends trend into future (30 days)
4. Applies smoothing to reduce noise
5. Returns forecasted values with dates

**Example**:
```javascript
const timeSeries = [
  {date: '2025-01-01', value: 10},
  {date: '2025-01-02', value: 12},
  // ... more data
];

const forecast = forecast(timeSeries, 30, 'smooth');
// Returns: historical data + 30 forecasted days
```

---

### 4. Anomaly Detection (`src/lib/anomalyDetection.js`)

**Purpose**: Detects statistical anomalies in time series data using 3-sigma rule.

**Functions**:

#### `mean(values)`
- **Internal** - Calculates arithmetic mean
- Returns average value

#### `standardDeviation(values)`
- **Internal** - Calculates standard deviation (σ)
- Measures data spread
- Returns σ value

#### `detectAnomalies(timeSeries, sigmaThreshold)`
- **Basic method** - Detects anomalies using global statistics
- Calculates mean and σ for entire dataset
- Flags values outside threshold (default: 3σ)
- Returns data with anomaly flags:
  ```javascript
  {
    date: string,
    value: number,
    isAnomaly: boolean,
    deviation: number,  // in σ units
    type: 'spike' | 'dip' | null
  }
  ```

#### `detectAnomaliesRolling(timeSeries, windowSize, sigmaThreshold)`
- **Recommended method** - Rolling window detection
- More sensitive to recent changes
- Calculates statistics for each window
- Default window: 14 days
- Better for detecting recent anomalies

#### `getAnomalyStats(anomalyData)`
- Summarizes anomaly detection results
- Returns:
  ```javascript
  {
    total: number,
    spikes: number,
    dips: number,
    rate: number,  // percentage
    recentAnomalies: Array  // last 5
  }
  ```

#### `highlightAnomalies(timeSeries, options)`
- **Main function** - Unified anomaly detection
- Options:
  - `method`: 'rolling' or 'global'
  - `windowSize`: days for rolling window (default: 14)
  - `sigmaThreshold`: deviation threshold (default: 3)
- Returns annotated time series data

#### `formatAnomalyLabel(anomaly)`
- Formats anomaly for display
- Returns: "Unusual spike detected (3.2σ deviation)"

**How Anomaly Detection Works**:
1. **Calculate Statistics**:
   - Mean (average value)
   - Standard deviation (σ)
   - Upper bound: mean + (3 × σ)
   - Lower bound: mean - (3 × σ)

2. **Detect Anomalies**:
   - Values > upper bound = **spike**
   - Values < lower bound = **dip**
   - Values within bounds = **normal**

3. **Rolling Window** (recommended):
   - For each point, calculate stats from previous N days
   - More sensitive to recent changes
   - Better for detecting trends

**Example**:
```javascript
const timeSeries = [
  {date: '2025-01-01', value: 10},
  {date: '2025-01-02', value: 12},
  {date: '2025-01-03', value: 50},  // Anomaly!
  // ...
];

const anomalies = highlightAnomalies(timeSeries, {
  method: 'rolling',
  windowSize: 14,
  sigmaThreshold: 3
});

// Result: 2025-01-03 marked as spike anomaly
```

**3-Sigma Rule**:
- 68% of data within 1σ
- 95% of data within 2σ
- 99.7% of data within 3σ
- Values outside 3σ are statistically unusual

---

### 5. Fake Data Generation (`src/lib/generateFakeData.js`)

**Purpose**: Generates realistic fake data for testing dashboard visuals.

**Functions**:

#### `generateFakeStories(count, startDate, endDate)`
- Generates story submissions with realistic data
- **Data Generated**:
  - Random titles referencing key shifts
  - Random key shifts (1-3 per story)
  - Random focus areas (1-3 per story)
  - Random submission dates within range
  - Realistic metadata (mindset, alignment flags)
- **Returns**: Number of stories successfully added

**Example Generated Story**:
```javascript
{
  title: "Story 1: Portfolio High-Grading Initiative",
  description: "This is a generated story about Exploration activities.",
  keyShifts: ["Portfolio High-Grading", "Operational Excellence"],
  focusAreas: ["Exploration", "Development"],
  desiredMindset: "Growth Mindset",
  alignsWithShifts: true,
  submittedAt: Timestamp,
  writeUpURL: "",
  visualURLs: []
}
```

#### `generateFakeMeetings(count, startDate, endDate)`
- Generates meeting records with AI insights
- **Data Generated**:
  - Random meeting titles
  - Random notes content
  - 70% have AI insights (realistic adoption rate)
  - Random action items (1-5 per meeting)
  - Random creation dates
- **Returns**: Number of meetings successfully added

**Example Generated Meeting**:
```javascript
{
  title: "Meeting 1: Exploration Review",
  notes: "Generated meeting notes...",
  createdAt: Timestamp,
  createdBy: "admin",
  summary: "Summary of meeting 1...",
  aiInsights: {
    actionItems: [
      {item: "Action item 1", assignee: "Team Member 1", dueDate: "2025-02-15"}
    ],
    alignmentWarnings: [],
    zombieTasks: []
  }
}
```

#### `generateFakeAnalytics(count, startDate, endDate)`
- Generates page view and event analytics
- **Data Generated**:
  - Random page paths (/, /statsx, /meetx, etc.)
  - Random user IDs (user_0 to user_9)
  - Random timestamps within range
  - Mix of page views and events
- **Returns**: Number of events successfully added

#### `generateAllFakeData(options)`
- **Main function** - Generates all data types
- **Options**:
  ```javascript
  {
    storiesCount: 50,      // Default
    meetingsCount: 30,     // Default
    analyticsCount: 200,   // Default
    daysBack: 30          // Default
  }
  ```
- **Process**:
  1. Generates stories
  2. Generates meetings
  3. Generates analytics events
  4. Returns results with counts and errors

**Usage Example**:
```javascript
const results = await generateAllFakeData({
  storiesCount: 100,
  meetingsCount: 50,
  analyticsCount: 500,
  daysBack: 60
});

// Results:
// {
//   stories: 100,
//   meetings: 50,
//   analytics: 500,
//   errors: []
// }
```

**Data Realism**:
- Uses actual key shifts and focus areas from site
- Realistic date distributions
- Maintains relationships (e.g., AI insights in meetings)
- Random but plausible values

**Safety**:
- Only adds data, never deletes
- Can be run multiple times
- Each run adds more data
- No risk of data loss

---

## Data Flow

### 1. Page Load Flow
```
User visits /statsx
    ↓
page.js mounts
    ↓
useEffect triggers
    ↓
getAllDashboardData() called
    ↓
Parallel Firestore queries:
  - aggregateStories()
  - aggregateMeetings()
  - aggregateKnowledgeBase()
  - aggregateGallery()
    ↓
Data aggregated and formatted
    ↓
State updated with data
    ↓
Components re-render with data
    ↓
Charts and widgets display
```

### 2. Analytics Tracking Flow
```
User interaction occurs
    ↓
trackEvent() or trackPageView() called
    ↓
Event data prepared
    ↓
addDoc() to Firestore 'analytics' collection
    ↓
Event stored with timestamp
    ↓
Available for future queries
```

### 3. Forecasting Flow
```
TrendChart receives time series data
    ↓
forecast() function called
    ↓
Moving average smoothing applied
    ↓
Linear regression calculated
    ↓
Trend extended 30 days
    ↓
Forecast data combined with historical
    ↓
Chart displays both layers
```

### 4. Anomaly Detection Flow
```
Time series data available
    ↓
highlightAnomalies() called
    ↓
Rolling window statistics calculated
    ↓
3-sigma bounds determined
    ↓
Each point checked against bounds
    ↓
Anomalies flagged and typed
    ↓
AnomalyDetector displays results
```

---

## AI Features

### 1. Predictive Forecasting

**What It Does**:
- Analyzes historical trends
- Predicts future values for next 30 days
- Shows forecast as dotted line on chart

**How It Works**:
1. Takes last N days of data
2. Calculates trend line (linear regression)
3. Extends trend into future
4. Applies smoothing to reduce noise

**Visualization**:
- Historical: Solid teal area chart
- Forecast: Dotted purple area chart
- Seamless transition at current date

**Accuracy**:
- Best for data with clear trends
- Less accurate for highly volatile data
- Uses 7-day moving average for smoothing

### 2. Anomaly Detection

**What It Does**:
- Automatically detects unusual patterns
- Highlights spikes and dips
- Provides statistical context

**Detection Method**:
- **3-Sigma Rule**: Values outside 3 standard deviations
- **Rolling Window**: 14-day window for recent sensitivity
- **Statistical Significance**: 99.7% confidence threshold

**Visual Indicators**:
- Red dots: Unusual spikes
- Blue dots: Unusual dips
- Labels: Deviation in σ units

**Use Cases**:
- Identify sudden traffic increases
- Detect system issues
- Find data quality problems
- Monitor for unusual activity

### 3. AI Insights Ticker

**What It Does**:
- Generates natural language insights
- Compares week-over-week metrics
- Highlights key findings

**Insight Types**:
- Growth metrics (positive/negative)
- Adoption rates
- Engagement levels
- Category popularity

**Rotation**:
- Auto-rotates every 5 seconds
- Manual navigation available
- Smooth transitions

---

## Usage Guide

### Setting Up

1. **Install Dependencies**:
   ```bash
   cd systemicshiftsver2
   npm install
   ```

2. **Configure Firebase**:
   - Ensure Firebase config is set in `.env.local`
   - Required collections: stories, meetings, knowledgeBase, upstreamGallery, analytics

3. **Start Development Server**:
   ```bash
   npm run dev
   ```

4. **Navigate to Dashboard**:
   - Visit `http://localhost:3000/statsx`

### Generating Test Data

1. **Open Dashboard**:
   - Navigate to `/statsx`

2. **Scroll to Data Generator**:
   - Located at bottom of dashboard

3. **Configure Options**:
   - Set stories count (e.g., 50)
   - Set meetings count (e.g., 30)
   - Set analytics count (e.g., 200)
   - Set days back (e.g., 30)

4. **Generate**:
   - Click "Generate Fake Data"
   - Wait for completion
   - Page auto-refreshes

### Using Cross-Filtering

1. **Click on Chart Element**:
   - Click a bar in Story Analytics
   - Click a segment in Knowledge Base pie chart

2. **Filter Applied**:
   - Active filters shown at top
   - Other widgets update accordingly

3. **Clear Filters**:
   - Click "Clear all" button
   - Or click × on individual filter

### Customizing Metrics

**Change Metric in Trend Chart**:
- Use dropdown above chart
- Options: Combined, Stories, Meetings

**Toggle Features**:
- Forecast: Built into TrendChart (can be disabled)
- Anomalies: Built into TrendChart (can be disabled)
- Scale: Toggle between linear/log in TrendChart

---

## Troubleshooting

### Build Error: "Module not found: Can't resolve 'date-fns'"

**Solution**:
```bash
cd systemicshiftsver2
npm install date-fns recharts
```

### No Data Showing

**Possible Causes**:
1. **No data in Firestore**:
   - Use Data Generator to create test data
   - Or ensure real data exists in collections

2. **Firebase config missing**:
   - Check `.env.local` for Firebase credentials
   - Ensure all required env vars are set

3. **Date range too narrow**:
   - Default is last 30 days
   - Adjust in `getAllDashboardData()` call

### Charts Not Rendering

**Possible Causes**:
1. **Recharts not installed**:
   ```bash
   npm install recharts
   ```

2. **Client component missing**:
   - Ensure components have `'use client'` directive
   - Check for SSR issues

3. **Data format incorrect**:
   - Ensure time series has `date` and `value` fields
   - Check data aggregation functions

### Anomaly Detection Not Working

**Possible Causes**:
1. **Insufficient data**:
   - Need at least 14 days for rolling window
   - More data = better detection

2. **No actual anomalies**:
   - Normal if data is consistent
   - Try generating more varied fake data

### Forecasting Inaccurate

**Possible Causes**:
1. **Data too volatile**:
   - Forecasting works best with trends
   - Highly random data = less accurate

2. **Insufficient history**:
   - Need at least 7-14 days
   - More history = better predictions

3. **Wrong method**:
   - Try 'smooth' instead of 'linear'
   - Or 'seasonal' for weekly patterns

### Performance Issues

**Optimizations**:
1. **Limit date range**:
   - Reduce `daysBack` in queries
   - Default 30 days is reasonable

2. **Cache data**:
   - Data refreshes every 5 minutes
   - Can increase interval if needed

3. **Reduce chart data points**:
   - Charts show last 30 days
   - Can limit further if needed

---

## Future Enhancements

### Potential Additions

1. **Real-time Updates**:
   - WebSocket connection for live data
   - Auto-refresh on new data

2. **Export Functionality**:
   - Export charts as images
   - Download data as CSV/JSON

3. **Custom Date Ranges**:
   - Date picker for custom ranges
   - Preset ranges (7d, 30d, 90d, 1y)

4. **Advanced Forecasting**:
   - Machine learning models
   - Multiple forecast methods
   - Confidence intervals

5. **More Anomaly Types**:
   - Pattern detection
   - Trend breaks
   - Seasonal anomalies

6. **User Segmentation**:
   - Filter by user type
   - Department analytics
   - Role-based views

7. **Alert System**:
   - Email notifications for anomalies
   - Threshold-based alerts
   - Custom alert rules

---

## Summary

The StatsX Analytics Dashboard is a comprehensive analytics solution that provides:

- **Real-time Insights**: Live metrics from all site collections
- **AI-Powered Features**: Forecasting and anomaly detection
- **Beautiful Visualizations**: Modern charts with smooth animations
- **Interactive Experience**: Cross-filtering and responsive design
- **Easy Testing**: Built-in fake data generator

All components are modular, well-documented, and ready for extension. The architecture supports easy addition of new metrics, charts, and AI features.

