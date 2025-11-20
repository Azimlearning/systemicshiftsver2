// src/components/UpstreamTarget.js
/**
 * Upstream Target Diagram Component
 * 
 * Interactive diagram displaying the "Increase NPV by 30%" target with 6 strategic objectives.
 * Features:
 * - Dynamic SVG curved connecting lines with Framer Motion animations
 * - Gradient-colored boxes matching the design specifications
 * - Responsive layout with mobile/desktop views
 * - Interactive hover effects on boxes and connecting lines
 * 
 * Built with: React + Tailwind CSS + Framer Motion + SVG
 */
'use client';

import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image'; // For optimized image handling in Next.js

/**
 * Value Trajectory Chart Component - Isometric 3D Version
 * 
 * Displays the "Desired Upstream Value Trajectory" with isometric 3D stacked bar chart
 * showing NPV progression from 2025 to 2035 with +30% target.
 * 
 * Built with: React + Tailwind CSS + Framer Motion + CSS Transforms (Isometric 3D)
 */

// Color definitions with 3D faces (top, side, front)
const COLORS = {
  PCSB: { top: '#14b8a6', side: '#0d9488', front: '#2dd4bf' }, // Teal
  Vestigo: { top: '#8b5cf6', side: '#7c3aed', front: '#a78bfa' }, // Purple
  PCIV: { top: '#fbbf24', side: '#d97706', front: '#fcd34d' }, // Yellow/Amber
  CCS: { top: '#1e3a8a', side: '#172554', front: '#1e40af' }, // Dark Blue
  Satellite: { top: '#a3e635', side: '#65a30d', front: '#bef264' }, // Lime Green
};

// Legend items
const LEGEND_ITEMS = [
  { label: 'PCSB', color: COLORS.PCSB.front },
  { label: 'Vestigo', color: COLORS.Vestigo.front },
  { label: 'PCIV', color: COLORS.PCIV.front },
  { label: 'CCS', color: COLORS.CCS.front },
  { label: 'Satellite Model', color: COLORS.Satellite.front },
];

// Bar data with segments (bottom to top)
const BAR_DATA = [
  {
    year: '2025',
    stack: [
      { id: 'Vestigo', value: 5, color: COLORS.Vestigo },
      { id: 'PCSB', value: 25, color: COLORS.PCSB },
      { id: 'PCIV', value: 45, color: COLORS.PCIV },
    ],
    total: 75,
  },
  {
    year: '2030',
    label: 'Post Portfolio High-Grading',
    stack: [
      { id: 'Vestigo', value: 8, color: COLORS.Vestigo },
      { id: 'PCSB', value: 30, color: COLORS.PCSB },
      { id: 'Satellite', value: 12, color: COLORS.Satellite },
      { id: 'PCIV', value: 20, color: COLORS.PCIV },
    ],
    total: 70,
  },
  {
    year: '2035',
    label: 'To Be',
    stack: [
      { id: 'Vestigo', value: 10, color: COLORS.Vestigo },
      { id: 'PCSB', value: 35, color: COLORS.PCSB },
      { id: 'Satellite', value: 15, color: COLORS.Satellite },
      { id: 'PCIV', value: 30, color: COLORS.PCIV },
      { id: 'CCS', value: 20, color: COLORS.CCS },
    ],
    total: 110, // +30% from 2025
  },
];

// Simple 2D Stacked Bar Segment Component
const StackedBarSegment = ({ 
  color, 
  height, 
  index, 
  barWidth = 120, 
  onHover, 
  onLeave,
  segmentLabel,
  segmentValue 
}) => {
  return (
    <motion.div
      initial={{ scaleY: 0, opacity: 0 }}
      animate={{ scaleY: 1, opacity: 1 }}
      transition={{ 
        duration: 0.6, 
        delay: index * 0.08, 
        ease: "easeOut" 
      }}
      whileHover={{ 
        opacity: 0.9,
        transition: { duration: 0.2 }
      }}
      style={{ 
        height: `${height}px`, 
        transformOrigin: 'bottom',
        width: `${barWidth}px`,
      }}
      className="relative cursor-pointer"
      onMouseEnter={onHover}
      onMouseLeave={onLeave}
    >
      <div
        className="absolute w-full h-full border border-gray-300"
        style={{ 
          backgroundColor: color.front,
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        }}
      />
    </motion.div>
  );
};

// Tooltip Component for segment information
const Tooltip = ({ segment, value, total, position, visible }) => {
  if (!visible) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      className="absolute bg-gray-900 text-white px-4 py-2 rounded-lg shadow-2xl z-50 pointer-events-none"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        transform: 'translateX(-50%)',
      }}
    >
      <div className="text-sm font-semibold mb-1">{segment}</div>
      <div className="text-xs text-gray-300">Value: {value} RM Bil</div>
      <div className="text-xs text-gray-300">Total: {total} RM Bil</div>
      <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-full w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
    </motion.div>
  );
};

function ValueTrajectoryChart() {
  const [hoveredSegment, setHoveredSegment] = useState(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const [barPositions, setBarPositions] = useState({ bar2025: null, bar2035: null });
  const bar2025Ref = useRef(null);
  const bar2035Ref = useRef(null);
  const barWidth = 120; // Width of each bar
  const maxHeight = 400; // Maximum height for the tallest bar (2035 = 110)
  const baseValue = 110; // The maximum value (2035 total)

  // Calculate heights based on actual values, maintaining correct ratios
  const calculateHeights = (data) => {
    return data.map(col => ({
      ...col,
      stack: col.stack.map(block => ({
        ...block,
        height: (block.value / baseValue) * maxHeight, // Proportional height
      })),
      totalHeight: (col.total / baseValue) * maxHeight,
    }));
  };

  const chartData = calculateHeights(BAR_DATA);

  // Get bar positions for trajectory line
  useEffect(() => {
    const updateBarPositions = () => {
      if (bar2025Ref.current && bar2035Ref.current) {
        const container = bar2025Ref.current.closest('.chart-container');
        if (container) {
          const containerRect = container.getBoundingClientRect();
          const chartContainer = bar2025Ref.current.closest('[style*="minHeight"]');
          if (chartContainer) {
            const chartRect = chartContainer.getBoundingClientRect();
            const bar2025Rect = bar2025Ref.current.getBoundingClientRect();
            const bar2035Rect = bar2035Ref.current.getBoundingClientRect();
            
            // Get the actual bar top (the stacked segments container)
            const bar2025Stack = bar2025Ref.current.querySelector('[style*="height"]');
            const bar2035Stack = bar2035Ref.current.querySelector('[style*="height"]');
            
            if (bar2025Stack && bar2035Stack) {
              const bar2025StackRect = bar2025Stack.getBoundingClientRect();
              const bar2035StackRect = bar2035Stack.getBoundingClientRect();
              
              setBarPositions({
                bar2025: {
                  x: bar2025Rect.left - chartRect.left + barWidth / 2,
                  y: bar2025StackRect.top - chartRect.top,
                },
                bar2035: {
                  x: bar2035Rect.left - chartRect.left + barWidth / 2,
                  y: bar2035StackRect.top - chartRect.top,
                },
              });
            }
          }
        }
      }
    };

    updateBarPositions();
    window.addEventListener('resize', updateBarPositions);
    // Small delay to ensure layout is complete
    setTimeout(updateBarPositions, 100);
    setTimeout(updateBarPositions, 500);

    return () => window.removeEventListener('resize', updateBarPositions);
  }, []); // Empty dependency array - we only want to run this on mount and resize

  const handleSegmentHover = (event, segment, value, total) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const container = event.currentTarget.closest('.chart-container');
    if (container) {
      const containerRect = container.getBoundingClientRect();
      setTooltipPosition({
        x: rect.left - containerRect.left + rect.width / 2,
        y: rect.top - containerRect.top - 80,
      });
    }
    setHoveredSegment({ segment, value, total });
  };

  const handleSegmentLeave = () => {
    setHoveredSegment(null);
  };

  return (
    <div className="w-full max-w-6xl mx-auto mb-16 bg-gradient-to-br from-blue-50 via-teal-50 to-indigo-50 rounded-2xl p-6 md:p-8 shadow-xl relative overflow-hidden chart-container">
      {/* Enhanced background pattern - abstract data stream effect */}
      <div 
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `
            radial-gradient(circle at 20% 30%, rgba(14, 184, 166, 0.3) 0%, transparent 50%),
            radial-gradient(circle at 80% 70%, rgba(37, 99, 235, 0.3) 0%, transparent 50%),
            radial-gradient(circle at 2px 2px, rgba(0,0,0,0.1) 1px, transparent 0)
          `,
          backgroundSize: '100% 100%, 100% 100%, 40px 40px',
        }}
      />
      
      {/* Subtle grid lines */}
      <svg 
        className="absolute inset-0 w-full h-full pointer-events-none opacity-10"
        style={{ zIndex: 1 }}
      >
        <defs>
          <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#0d9488" strokeWidth="0.5"/>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />
      </svg>
      {/* Title Section */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="mb-8"
      >
        <h4 className="text-xl md:text-2xl font-bold text-gray-800 mb-2">
          Desired Upstream Value Trajectory
        </h4>
        <div className="text-4xl md:text-5xl font-extrabold text-gray-900">
          +30%
        </div>
      </motion.div>

      {/* Chart Container */}
      <div className="relative w-full overflow-x-auto">
        {/* SVG for Trajectory Arrow and Y-axis */}
        <svg 
          className="absolute top-0 left-0 w-full h-full z-0 pointer-events-none overflow-visible"
          style={{ height: `${maxHeight + 100}px` }}
          viewBox={`0 0 800 ${maxHeight + 100}`}
          preserveAspectRatio="xMidYMid meet"
        >
          <defs>
            <marker 
              id="arrowhead" 
              markerWidth="10" 
              markerHeight="7" 
              refX="0" 
              refY="3.5" 
              orient="auto"
            >
              <polygon points="0 0, 10 3.5, 0 7" fill="#374151" />
            </marker>
          </defs>
          
          {/* Y-axis Label */}
          <text
            x="30"
            y={maxHeight / 2}
            className="text-sm font-semibold fill-gray-700"
            transform={`rotate(-90 30 ${maxHeight / 2})`}
          >
            NPV (RM Bil)
          </text>
        </svg>

        {/* Tooltip */}
        {hoveredSegment && (
          <Tooltip
            segment={hoveredSegment.segment}
            value={hoveredSegment.value}
            total={hoveredSegment.total}
            position={tooltipPosition}
            visible={true}
          />
        )}

        {/* Chart Bars Container */}
        <div className="relative flex items-end justify-around pb-20 px-10" style={{ minHeight: `${maxHeight + 100}px` }}>
          {chartData.map((col, colIndex) => {
            let segmentIndex = 0;
            const is2025 = col.year === '2025';
            const is2035 = col.year === '2035';

            return (
              <div 
                key={col.year} 
                ref={is2025 ? bar2025Ref : is2035 ? bar2035Ref : null}
                className="flex flex-col items-center relative group"
                style={{ width: `${barWidth}px` }}
                data-bar-index={colIndex}
              >
                {/* The Stack - rendered bottom to top */}
                <div className="relative flex flex-col-reverse items-center" style={{ height: `${col.totalHeight}px` }}>
                  {col.stack.map((block) => {
                    const currentIndex = segmentIndex++;
                    const segmentLabel = LEGEND_ITEMS.find(item => 
                      item.label === block.id || 
                      item.label === 'Satellite Model' && block.id === 'Satellite'
                    )?.label || block.id;
                    
                    return (
                      <StackedBarSegment
                        key={block.id}
                        color={block.color}
                        height={block.height}
                        index={colIndex * 10 + currentIndex}
                        barWidth={barWidth}
                        segmentLabel={segmentLabel}
                        segmentValue={block.value}
                        onHover={(e) => handleSegmentHover(e, segmentLabel, block.value, col.total)}
                        onLeave={handleSegmentLeave}
                      />
                    );
                  })}
                </div>

                {/* X-axis Label */}
                <div className="mt-4 text-center text-gray-800 font-medium z-10">
                  <p className="text-lg font-semibold">{col.year}</p>
                  {col.label && (
                    <p className="text-sm text-gray-600 mt-1">{col.label}</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Trajectory Arrow - L-shaped: starts above 2025, goes up, horizontal across, vertical down to 2035 top */}
        {barPositions.bar2025 && barPositions.bar2035 && (
          <svg 
            className="absolute top-0 left-0 w-full h-full z-5 pointer-events-none"
            style={{ height: `${maxHeight + 100}px` }}
          >
            <motion.path
              d={`M ${barPositions.bar2025.x} ${barPositions.bar2025.y - 30} 
                  L ${barPositions.bar2025.x} ${barPositions.bar2035.y - 30} 
                  L ${barPositions.bar2035.x} ${barPositions.bar2035.y - 30} 
                  L ${barPositions.bar2035.x} ${barPositions.bar2035.y}`}
              fill="none"
              stroke="#374151"
              strokeWidth="3"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{ duration: 1.5, delay: 1.0, ease: "easeInOut" }}
              markerEnd="url(#arrowhead)"
            />
          </svg>
        )}
      </div>

      {/* Legend - Simple colored squares */}
      <div className="flex flex-wrap justify-center gap-6 mt-8">
        {LEGEND_ITEMS.map((item, index) => {
          const colorObj = Object.values(COLORS).find(c => c.front === item.color) || { front: item.color };
          
          return (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ 
                delay: 1.2 + index * 0.1, 
                duration: 0.4
              }}
              className="flex items-center gap-2"
            >
              {/* Simple colored square */}
              <div
                className="w-5 h-5 border border-gray-300"
                style={{
                  backgroundColor: colorObj.front,
                }}
              />
              <span className="text-sm font-semibold text-gray-800">{item.label}</span>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

export default function UpstreamTarget() {
  // Track which target box is currently being hovered for interactive effects
  const [hoveredTarget, setHoveredTarget] = useState(null);

  // Circle configuration for SVG coordinate calculations
  // Circle center: (500, 300) in 1000x600 viewBox, radius: 80px (160px diameter)
  const CIRCLE_CENTER = { x: 500, y: 300 };
  const CIRCLE_RADIUS = 80;
  
  /**
   * Target Objectives Data Structure
   * 
   * Defines the 6 strategic objectives surrounding the central "Increase NPV by 30%" circle.
   * Each objective includes:
   * - Gradient colors (matching Tailwind color palette)
   * - Line color for SVG connector
   * - Box positioning (converted to percentages for responsiveness)
   * - SVG path coordinates for curved connecting lines
   * - Angle for calculating circle connection point
   */
  const targetObjectives = [
    {
      id: 'carbon',
      text: 'Carbon intensity at 17kgCO',
      subtext: '(at portfolio level)',
      gradient: 'linear-gradient(to right, #fbbf24, #f97316)', // amber-400 to orange-500
      lineColor: '#f97316', // orange-500
      boxPosition: { top: '120px', left: '100px' },
      // Curved path: from box right edge to circle (angle ~225deg from center)
      pathStart: { x: 360, y: 160 }, // Box right edge connection point
      angle: 225, // degrees from center (top-left quadrant)
      pathControl: { x: 430, y: 180 }, // Control point for smooth bezier curve
    },
    {
      id: 'upc',
      text: 'UPC at <$6/boe',
      subtext: '(at portfolio level)',
      gradient: 'linear-gradient(to right, #2dd4bf, #0d9488)', // teal-400 to teal-600
      lineColor: '#14b8a6', // teal-500
      boxPosition: { top: '260px', left: '60px' },
      pathStart: { x: 340, y: 300 }, // Box right edge
      angle: 180, // degrees from center (straight left)
      pathControl: { x: 420, y: 300 }, // Control point for curve
    },
    {
      id: 'workforce',
      text: 'Lean workforce and',
      subtext: 'AI-enabled operations',
      gradient: 'linear-gradient(to right, #a78bfa, #4f46e5)', // purple-400 to indigo-600
      lineColor: '#8b5cf6', // purple-500
      boxPosition: { top: '400px', left: '100px' },
      pathStart: { x: 360, y: 440 }, // Box right edge
      angle: 135, // degrees from center
      pathControl: { x: 430, y: 420 }, // Control point for curve
    },
    {
      id: 'delivery',
      text: 'Robust Project Delivery with Positive NPV@WACC at Low KPBI Prices',
      subtext: '',
      gradient: 'linear-gradient(to left, #38bdf8, #2563eb)', // sky-400 to blue-600
      lineColor: '#0ea5e9', // sky-500
      boxPosition: { top: '120px', right: '100px' },
      pathStart: { x: 640, y: 160 }, // Box left edge
      angle: 315, // degrees from center
      pathControl: { x: 570, y: 180 }, // Control point for curve
    },
    {
      id: 'breakeven',
      text: 'Asset Breakeven Price < $50/Barrel',
      subtext: '',
      gradient: 'linear-gradient(to left, #34d399, #0d9488)', // emerald-400 to teal-600
      lineColor: '#10b981', // emerald-500
      boxPosition: { top: '260px', right: '60px' },
      pathStart: { x: 660, y: 300 }, // Box left edge
      angle: 0, // degrees from center (straight right)
      pathControl: { x: 580, y: 300 }, // Control point for curve
    },
    {
      id: 'international',
      text: '60% Value Contribution from International',
      subtext: '',
      gradient: 'linear-gradient(to left, #d946ef, #14b8a6)', // fuchsia-500 to teal-500
      lineColor: '#d946ef', // fuchsia-500
      boxPosition: { top: '400px', right: '100px' },
      pathStart: { x: 640, y: 440 }, // Box left edge
      angle: 45, // degrees from center
      pathControl: { x: 570, y: 420 }, // Control point for curve
    },
  ].map(target => {
    /**
     * Calculate circle connection point based on angle
     * Converts angle in degrees to radians, then calculates the point on the circle's edge
     * where the connecting line attaches to the central circle
     */
    const angleRad = (target.angle * Math.PI) / 180;
    const pathEnd = {
      x: CIRCLE_CENTER.x + CIRCLE_RADIUS * Math.cos(angleRad),
      y: CIRCLE_CENTER.y + CIRCLE_RADIUS * Math.sin(angleRad),
    };
    return {
      ...target,
      pathEnd, // End point of the curved line (on circle edge)
      dotPosition: pathEnd, // White dot marker on circle connection point
    };
  });

  const upstreamEntities = [
    {
      title: 'PCSB',
      description: 'Focus on High Value, High Upside assets in Malaysia',
      color: 'bg-indigo-600', // Example color
    },
    {
      title: 'PCIV',
      description: 'Grow International value via disciplined portfolio high-grading',
      color: 'bg-purple-600', // Example color
    },
    {
      title: 'PCCSV',
      description: 'Value driven through diversified CCS portfolio in Malaysia and International',
      color: 'bg-pink-600', // Example color
    },
    {
      title: 'Vestigo',
      description: 'Value-grow marginal assets in Malaysia and International',
      color: 'bg-red-600', // Example color
    },
    {
      title: 'Satellite Model',
      description: 'Partnership to unlock opportunities',
      color: 'bg-orange-600', // Example color
    },
  ];

  return (
    <section className="bg-white py-12 md:py-16">
      <div className="container mx-auto px-4">
        {/* Upstream Target Heading */}
        <motion.h2 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
          style={{ fontSize: '36px', color: '#004d4d' }}
        >
          <span style={{ fontWeight: 800, color: '#004646' }}>Upstream</span>{' '}
          <span style={{ fontWeight: 300, color: '#00897b' }}>Target</span>
        </motion.h2>

        {/* Increase NPV by 30% Diagram */}
        <div className="flex justify-center mb-16 px-4">
          <div 
            className="relative w-full max-w-5xl rounded-2xl overflow-hidden" 
            style={{ 
              minHeight: '600px', 
              aspectRatio: '5/3',
              background: 'radial-gradient(circle at center, #cceeee 0%, #a8d8d8 100%)'
            }}
          >

            {/* Central Circle with Framer Motion */}
            <motion.div 
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', duration: 0.8, delay: 0.2 }}
              className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10"
            >
              <div 
                className="bg-white rounded-full shadow-2xl flex flex-col items-center justify-center" 
                style={{ 
                  width: '160px',
                  height: '160px',
                  boxShadow: '0 10px 25px rgba(0,0,0,0.15)',
                  lineHeight: '1.1'
                }}
              >
                <div className="text-black" style={{ fontSize: '14px', fontWeight: 600 }}>Increase</div>
                <div className="text-black my-1" style={{ fontSize: '38px', fontWeight: 900 }}>NPV</div>
                <div className="text-black" style={{ fontSize: '14px', fontWeight: 600 }}>by 30%</div>
              </div>
            </motion.div>

            {/* SVG Layer for Curved Lines and Dots */}
            {/* 
              SVG container for animated connecting lines between boxes and central circle.
              Uses viewBox="0 0 1000 600" to maintain aspect ratio and coordinate system.
              Lines are drawn using cubic bezier curves for smooth S-shaped connections.
            */}
            <svg 
              className="absolute inset-0 w-full h-full pointer-events-none hidden md:block" 
              style={{ zIndex: 3 }}
              viewBox="0 0 1000 600"
              preserveAspectRatio="xMidYMid meet"
            >
              {/* Gradient definitions for line colors (currently using solid colors) */}
              <defs>
                {targetObjectives.map((target) => (
                  <linearGradient key={`lineGradient-${target.id}`} id={`lineGradient-${target.id}`} x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor={target.lineColor} stopOpacity="0.6" />
                    <stop offset="100%" stopColor={target.lineColor} stopOpacity="1" />
                  </linearGradient>
                ))}
              </defs>
              {targetObjectives.map((target, index) => {
                const isHovered = hoveredTarget === target.id;
                
                /**
                 * Create smooth S-curve using cubic bezier (C command)
                 * Control points create a smooth arch from box to circle
                 * Formula: M startX startY C cp1x cp1y, cp2x cp2y, endX endY
                 */
                const dx = target.pathEnd.x - target.pathStart.x;
                const dy = target.pathEnd.y - target.pathStart.y;
                
                // Control points positioned at 30% and 70% along the path for smooth curve
                const cp1x = target.pathStart.x + dx * 0.3;
                const cp1y = target.pathStart.y;
                const cp2x = target.pathStart.x + dx * 0.7;
                const cp2y = target.pathEnd.y;
                
                const pathData = `M ${target.pathStart.x} ${target.pathStart.y} C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${target.pathEnd.x} ${target.pathEnd.y}`;
                
                return (
                  <g key={target.id}>
                    {/* Curved Connecting Line with gradient */}
                    <motion.path
                      initial={{ pathLength: 0, opacity: 0 }}
                      animate={{ 
                        pathLength: 1, 
                        opacity: isHovered ? 1 : 0.7 
                      }}
                      transition={{ duration: 1, delay: 0.5 + index * 0.1, ease: "easeInOut" }}
                      d={pathData}
                      fill="none"
                      stroke={target.lineColor}
                      strokeWidth={isHovered ? "2.5" : "2"}
                      strokeLinecap="round"
                      vectorEffect="non-scaling-stroke"
                    />
                    
                    {/* Connection Dot on Circle */}
                    <motion.circle
                      initial={{ r: 0, opacity: 0 }}
                      animate={{ r: isHovered ? 6 : 5, opacity: 1 }}
                      transition={{ delay: 0.8 + index * 0.1, duration: 0.3 }}
                      cx={target.dotPosition.x}
                      cy={target.dotPosition.y}
                      r={isHovered ? 6 : 5}
                      fill="white"
                      stroke={target.lineColor}
                      strokeWidth="2.5"
                      style={{ filter: 'drop-shadow(0 0 8px rgba(0,0,0,0.2))' }}
                    />
                    
                    {/* Connection Dot on Box */}
                    <motion.circle
                      initial={{ r: 0, opacity: 0 }}
                      animate={{ r: isHovered ? 6 : 5, opacity: 1 }}
                      transition={{ delay: 0.8 + index * 0.1, duration: 0.3 }}
                      cx={target.pathStart.x}
                      cy={target.pathStart.y}
                      r={isHovered ? 6 : 5}
                      fill="white"
                      stroke={target.lineColor}
                      strokeWidth="2.5"
                      style={{ filter: 'drop-shadow(0 0 8px rgba(0,0,0,0.2))' }}
                    />
                  </g>
                );
              })}
            </svg>

            {/* Target Boxes - Desktop Layout with Framer Motion */}
            <div className="absolute inset-0 w-full h-full hidden md:block" style={{ width: '100%', height: '100%' }}>
              {targetObjectives.map((target, index) => {
                const isHovered = hoveredTarget === target.id;
                
                // Convert fixed pixel positions to percentages (based on 1000px width, 600px height reference)
                const boxStyle = {
                  ...Object.fromEntries(
                    Object.entries(target.boxPosition).map(([key, value]) => {
                      if (key === 'top') {
                        const numValue = parseFloat(value);
                        return [key, `${(numValue / 600) * 100}%`];
                      }
                      if (key === 'left' || key === 'right') {
                        const numValue = parseFloat(value);
                        return [key, `${(numValue / 1000) * 100}%`];
                      }
                      return [key, value];
                    })
                  ),
                  background: target.gradient,
                  width: 'clamp(240px, 26%, 260px)',
                  minHeight: '80px',
                  padding: '12px',
                  fontSize: '13px',
                  textAlign: 'center',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  alignItems: 'center',
                  boxShadow: isHovered ? '0 8px 20px rgba(0,0,0,0.2)' : '0 5px 15px rgba(0,0,0,0.1)',
                  zIndex: 20,
                };
                
                return (
                  <motion.div
                    key={target.id}
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ 
                      opacity: 1, 
                      scale: isHovered ? 1.05 : 1,
                      y: 0
                    }}
                    transition={{ 
                      delay: 1 + index * 0.1, 
                      duration: 0.6,
                      type: 'spring',
                      stiffness: 100
                    }}
                    whileHover={{ 
                      scale: 1.05, 
                      transition: { duration: 0.2 } 
                    }}
                    className="absolute text-white shadow-lg cursor-pointer"
                    style={{
                      ...boxStyle,
                      borderRadius: '12px',
                    }}
                    onMouseEnter={() => setHoveredTarget(target.id)}
                    onMouseLeave={() => setHoveredTarget(null)}
                  >
                    <div className="font-medium leading-tight" style={{ fontWeight: 500 }}>
                      {target.id === 'carbon' ? (
                        <>
                          Carbon intensity at 17kgCO<sub>2</sub>/boe
                          {target.subtext && <div className="text-xs opacity-90 font-normal mt-1">{target.subtext}</div>}
                        </>
                      ) : (
                        <>
                          {target.text}
                          {target.subtext && <div className="text-xs opacity-90 font-normal mt-1">{target.subtext}</div>}
                        </>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Target Boxes - Mobile Layout (Stacked) */}
            <div className="md:hidden flex flex-col gap-4 p-6 pt-24">
              {targetObjectives.map((target, index) => {
                const isHovered = hoveredTarget === target.id;
                
                return (
                  <motion.div
                    key={target.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + index * 0.1, duration: 0.5 }}
                    whileHover={{ scale: 1.02 }}
                    className="text-white p-4 shadow-lg cursor-pointer"
                    style={{
                      background: target.gradient,
                      borderRadius: '12px',
                      boxShadow: isHovered ? '0 8px 20px rgba(0,0,0,0.2)' : '0 5px 15px rgba(0,0,0,0.1)',
                    }}
                    onMouseEnter={() => setHoveredTarget(target.id)}
                    onMouseLeave={() => setHoveredTarget(null)}
                  >
                    <div className="text-sm font-medium text-center leading-tight" style={{ fontWeight: 500 }}>
                      {target.id === 'carbon' ? (
                        <>
                          Carbon intensity at 17kgCO<sub>2</sub>/boe
                          {target.subtext && <div className="text-xs opacity-90 font-normal mt-1">{target.subtext}</div>}
                        </>
                      ) : (
                        <>
                          {target.text}
                          {target.subtext && <div className="text-xs opacity-90 font-normal mt-1">{target.subtext}</div>}
                        </>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Upstream Entities Look & Feel */}
        <h3 className="text-2xl md:text-3xl font-semibold text-gray-800 text-center mb-8">
          Upstream Entities Look & Feel by 2035
        </h3>
        <div className="flex flex-wrap justify-center gap-4 mb-16">
          {upstreamEntities.map((entity) => (
            <div
              key={entity.title}
              className={`flex-1 min-w-[180px] max-w-[220px] p-4 text-center text-white rounded-2xl shadow-lg transform transition-transform duration-300 hover:scale-105 ${entity.color}`}
            >
              <h4 className="font-bold text-xl mb-2">{entity.title}</h4>
              <p className="text-sm">{entity.description}</p>
            </div>
          ))}
        </div>

        {/* Upstream has set a clear end state heading */}
        <motion.h3 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-2xl md:text-3xl font-semibold text-gray-800 text-center mb-8"
        >
          Upstream has set a <span className="text-teal-600">clear end state</span> <br /> to be achieved by 2035
        </motion.h3>

        {/* Desired Upstream Value Trajectory Chart - Code-based */}
        <ValueTrajectoryChart />
      </div>
    </section>
  );
}
