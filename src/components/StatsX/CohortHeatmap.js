// src/components/StatsX/CohortHeatmap.js
'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  format, 
  startOfWeek, 
  endOfWeek,
  eachDayOfInterval, 
  subMonths,
  getDay,
  parseISO
} from 'date-fns';

/**
 * Activity Heatmap - GitHub-style calendar heatmap
 * Shows daily activity patterns in a calendar grid format
 */
export default function CohortHeatmap({ data, loading, filters = {}, onFilter }) {
  const [pageOffset, setPageOffset] = useState(0); // 0 = most recent 3 months, 1 = previous 3 months, etc.
  const [hoveredDay, setHoveredDay] = useState(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });

  // Calculate date range: always 3 months, offset by page number
  const dateRange = useMemo(() => {
    const now = new Date();
    // Calculate end date: subtract (pageOffset * 3) months from now
    const endDate = pageOffset === 0 ? now : subMonths(now, pageOffset * 3);
    // Start date is always 3 months before end date
    const startDate = subMonths(endDate, 3);

    return { start: startDate, end: endDate };
  }, [pageOffset]);

  // Process daily activity data
  const dailyActivity = useMemo(() => {
    if (!data || loading) return {};

    const activityMap = {};
    let storiesMap = {};
    let meetingsMap = {};

    // Process stories time series
    (data.stories?.timeSeries || []).forEach(point => {
      try {
        const date = point.date instanceof Date 
          ? point.date 
          : typeof point.date === 'string' 
            ? parseISO(point.date) 
            : new Date(point.date);
        
        if (!isNaN(date.getTime())) {
          const dateKey = format(date, 'yyyy-MM-dd');
          storiesMap[dateKey] = (storiesMap[dateKey] || 0) + (point.value || 0);
        }
      } catch (e) {
        // Skip invalid dates
      }
    });

    // Process meetings time series
    (data.meetings?.timeSeries || []).forEach(point => {
      try {
        const date = point.date instanceof Date 
          ? point.date 
          : typeof point.date === 'string' 
            ? parseISO(point.date) 
            : new Date(point.date);
        
        if (!isNaN(date.getTime())) {
          const dateKey = format(date, 'yyyy-MM-dd');
          meetingsMap[dateKey] = (meetingsMap[dateKey] || 0) + (point.value || 0);
        }
      } catch (e) {
        // Skip invalid dates
      }
    });

    // Combine and create daily activity map
    const allDates = new Set([...Object.keys(storiesMap), ...Object.keys(meetingsMap)]);
    allDates.forEach(dateKey => {
      activityMap[dateKey] = {
        total: (storiesMap[dateKey] || 0) + (meetingsMap[dateKey] || 0),
        stories: storiesMap[dateKey] || 0,
        meetings: meetingsMap[dateKey] || 0,
      };
    });

    return activityMap;
  }, [data, loading]);

  // Generate calendar grid structure
  const calendarGrid = useMemo(() => {
    const { start, end } = dateRange;
    const allDays = eachDayOfInterval({ start, end });
    
    // Find the first day of the first week (Sunday = 0)
    const firstDay = startOfWeek(start, { weekStartsOn: 0 });
    const lastDay = endOfWeek(end, { weekStartsOn: 0 });
    const gridDays = eachDayOfInterval({ start: firstDay, end: lastDay });

    // Calculate max activity for intensity scaling
    const maxActivity = Math.max(
      ...Object.values(dailyActivity).map(d => d.total),
      1
    );

    // Build calendar structure
    const weeks = [];
    let currentWeek = [];

    gridDays.forEach((day, index) => {
      const dateKey = format(day, 'yyyy-MM-dd');
      const activity = dailyActivity[dateKey] || { total: 0, stories: 0, meetings: 0 };
      const intensity = Math.min(5, Math.floor((activity.total / maxActivity) * 5));

      currentWeek.push({
        date: day,
        dateKey,
        activity: activity.total,
        stories: activity.stories,
        meetings: activity.meetings,
        intensity,
        isInRange: day >= start && day <= end,
      });

      // Start new week on Sunday (day 0)
      if (getDay(day) === 6 || index === gridDays.length - 1) {
        weeks.push(currentWeek);
        currentWeek = [];
      }
    });

    return { weeks, maxActivity };
  }, [dateRange, dailyActivity]);

  // Get month labels for weeks
  const monthLabels = useMemo(() => {
    return calendarGrid.weeks.map(week => {
      const firstDay = week.find(d => d.isInRange)?.date || week[0].date;
      return format(firstDay, 'MMM');
    });
  }, [calendarGrid.weeks]);

  // Color intensity mapping
  const getIntensityColor = (intensity) => {
    const colors = [
      'bg-gray-100',      // 0 - no activity
      'bg-teal-100',     // 1 - low
      'bg-teal-200',     // 2
      'bg-teal-300',     // 3
      'bg-teal-400',     // 4
      'bg-teal-500',     // 5 - high
    ];
    return colors[intensity] || colors[0];
  };

  // Handle day click for filtering
  const handleDayClick = (dayData) => {
    if (onFilter && dayData.activity > 0) {
      const dateStr = format(dayData.date, 'yyyy-MM-dd');
      onFilter('date', dateStr);
    }
  };

  // Handle mouse move for tooltip positioning
  const handleMouseMove = (e, dayData) => {
    setHoveredDay(dayData);
    setTooltipPosition({ x: e.clientX, y: e.clientY });
  };

  if (loading) {
    return (
      <div className="bg-white rounded-3xl border border-gray-200 p-4 shadow-sm h-full">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-32 mb-2"></div>
          <div className="h-40 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-3xl border border-gray-200 p-4 shadow-sm h-full hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 flex flex-col"
    >
      {/* Header with title */}
      <div className="mb-4 text-center">
        <h3 className="text-lg font-bold text-gray-900 mb-1">Activity Heatmap</h3>
        <p className="text-xs text-gray-500">
          {format(dateRange.start, 'MMM dd, yyyy')} - {format(dateRange.end, 'MMM dd, yyyy')}
        </p>
      </div>

      {/* Calendar Grid */}
      <div className="flex-1 flex items-center justify-center min-h-0">
        <div className="flex gap-1.5 w-full max-w-full">
          {/* Day labels column */}
          <div className="flex flex-col gap-1 pt-6 pr-1 flex-shrink-0">
            {dayNames.map((day, idx) => (
              <div
                key={idx}
                className="h-3 w-8 flex items-center justify-end text-[10px] text-gray-400"
              >
                {idx % 2 === 0 ? day : ''}
              </div>
            ))}
          </div>

          {/* Calendar weeks - centered and aligned */}
          <div className="flex-1 flex justify-center overflow-x-auto" style={{ scrollbarWidth: 'thin' }}>
            <div className="flex gap-1">
              {calendarGrid.weeks.map((week, weekIndex) => (
                <div key={weekIndex} className="flex flex-col gap-1 flex-shrink-0">
                  {/* Month label */}
                  {weekIndex === 0 || (weekIndex > 0 && monthLabels[weekIndex] !== monthLabels[weekIndex - 1]) ? (
                    <div className="text-[10px] text-gray-500 font-medium mb-1 h-4 flex items-center justify-center">
                      {monthLabels[weekIndex]}
                    </div>
                  ) : (
                    <div className="h-4"></div>
                  )}

                  {/* Week days - aligned grid */}
                  <div className="flex flex-col gap-1">
                    {week.map((dayData, dayIndex) => (
                      <div
                        key={dayData.dateKey}
                        className={`w-3 h-3 rounded-sm ${getIntensityColor(dayData.intensity)} ${
                          dayData.isInRange 
                            ? 'border border-gray-200 hover:border-teal-400 hover:scale-110 cursor-pointer' 
                            : 'opacity-30 cursor-default'
                        } transition-all relative`}
                        style={{ 
                          minWidth: '12px', 
                          minHeight: '12px',
                          flexShrink: 0
                        }}
                        onMouseEnter={(e) => {
                          if (dayData.isInRange) {
                            handleMouseMove(e, dayData);
                          }
                        }}
                        onMouseLeave={() => setHoveredDay(null)}
                        onClick={() => handleDayClick(dayData)}
                        title={dayData.isInRange ? `${format(dayData.date, 'MMM dd, yyyy')}: ${dayData.activity} activities` : ''}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Legend and Navigation */}
      <div className="mt-3 pt-3 border-t border-gray-200 space-y-3">
        {/* Legend */}
        <div className="flex items-center justify-center gap-3">
          <span className="text-[10px] text-gray-500">Less</span>
          <div className="flex gap-1">
            {[0, 1, 2, 3, 4, 5].map(intensity => (
              <div
                key={intensity}
                className={`w-2.5 h-2.5 rounded ${getIntensityColor(intensity)} border border-gray-200`}
              />
            ))}
          </div>
          <span className="text-[10px] text-gray-500">More</span>
        </div>

        {/* Navigation Bar */}
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={() => setPageOffset(prev => prev + 1)}
            className="px-4 py-2 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
            disabled={false} // Allow going back indefinitely
          >
            ← Previous
          </button>
          <span className="text-xs text-gray-600 font-medium px-3 py-1 bg-gray-50 rounded-lg">
            Page {pageOffset + 1}
          </span>
          <button
            onClick={() => setPageOffset(prev => Math.max(0, prev - 1))}
            className="px-4 py-2 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
            disabled={pageOffset === 0} // Disable if already at most recent
          >
            Next →
          </button>
        </div>
      </div>

      {/* Tooltip */}
      <AnimatePresence>
        {hoveredDay && hoveredDay.isInRange && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="fixed z-50 bg-gray-900 text-white text-xs rounded-lg px-3 py-2 shadow-lg pointer-events-none"
            style={{
              left: `${tooltipPosition.x + 10}px`,
              top: `${tooltipPosition.y - 10}px`,
              transform: 'translateY(-100%)',
            }}
          >
            <div className="font-semibold mb-1">
              {format(hoveredDay.date, 'MMM dd, yyyy')}
            </div>
            <div className="text-gray-300">
              <div>Total: {hoveredDay.activity} activities</div>
              <div className="text-[10px] mt-0.5">
                Stories: {hoveredDay.stories} • Meetings: {hoveredDay.meetings}
              </div>
            </div>
            <div className="absolute bottom-0 left-4 transform translate-y-full w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
