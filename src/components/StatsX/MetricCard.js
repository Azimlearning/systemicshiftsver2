// src/components/StatsX/MetricCard.js
'use client';

import { motion, useSpring, useTransform, useMotionValue } from 'framer-motion';
import { useEffect } from 'react';
import { FaArrowUp, FaArrowDown, FaMinus } from 'react-icons/fa';

/**
 * Reusable metric display card
 */
export default function MetricCard({ 
  title, 
  value, 
  change, 
  changeLabel = 'vs last week',
  icon: Icon,
  color = 'teal',
  loading = false 
}) {
  const isPositive = change > 0;
  const isNegative = change < 0;
  const isNeutral = change === 0;

  const colorClasses = {
    teal: {
      bg: 'bg-teal-50',
      text: 'text-teal-700',
      border: 'border-teal-200',
      accent: 'text-teal-600',
    },
    purple: {
      bg: 'bg-purple-50',
      text: 'text-purple-700',
      border: 'border-purple-200',
      accent: 'text-purple-600',
    },
    blue: {
      bg: 'bg-blue-50',
      text: 'text-blue-700',
      border: 'border-blue-200',
      accent: 'text-blue-600',
    },
    amber: {
      bg: 'bg-amber-50',
      text: 'text-amber-700',
      border: 'border-amber-200',
      accent: 'text-amber-600',
    },
  };

  const colors = colorClasses[color] || colorClasses.teal;

  if (loading) {
    return (
      <div className={`bg-white rounded-3xl border ${colors.border} p-5 shadow-sm`}>
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-24 mb-3"></div>
          <div className="h-8 bg-gray-200 rounded w-32 mb-2"></div>
          <div className="h-3 bg-gray-200 rounded w-20"></div>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`bg-white rounded-3xl border ${colors.border} p-6 shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 cursor-pointer`}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2.5">
          {Icon && (
            <div className={`p-2 rounded-xl ${colors.bg}`}>
              <Icon className={`${colors.accent} text-lg`} />
            </div>
          )}
          <h3 className={`text-sm font-semibold ${colors.text}`}>{title}</h3>
        </div>
      </div>

      <div className="mb-2">
        <AnimatedNumber value={value} />
      </div>

      <div className="flex items-center gap-1 text-xs">
        {isPositive && (
          <>
            <FaArrowUp className="text-green-600" />
            <span className="text-green-600 font-medium">+{Math.abs(change).toFixed(1)}%</span>
          </>
        )}
        {isNegative && (
          <>
            <FaArrowDown className="text-red-600" />
            <span className="text-red-600 font-medium">-{Math.abs(change).toFixed(1)}%</span>
          </>
        )}
        {isNeutral && (
          <>
            <FaMinus className="text-gray-400" />
            <span className="text-gray-500">0%</span>
          </>
        )}
        <span className="text-gray-500 ml-1">{changeLabel}</span>
      </div>
    </motion.div>
  );
}

/**
 * Animated number component with counting effect
 */
function AnimatedNumber({ value }) {
  const motionValue = useMotionValue(0);
  const spring = useSpring(motionValue, { stiffness: 50, damping: 30 });
  const display = useTransform(spring, (current) =>
    Math.round(current).toLocaleString()
  );

  useEffect(() => {
    motionValue.set(typeof value === 'number' ? value : 0);
  }, [value, motionValue]);

  return (
    <motion.div
      initial={{ scale: 0.9 }}
      animate={{ scale: 1 }}
      transition={{ duration: 0.2 }}
      className="text-3xl font-bold text-gray-900 mb-1"
    >
      {typeof value === 'number' ? (
        <motion.span>{display}</motion.span>
      ) : (
        value
      )}
    </motion.div>
  );
}

