// src/components/ArticleFilters.js
'use client';

import { motion } from 'framer-motion';

/**
 * Article Filters Component
 * 
 * Filter buttons for article categories
 * Used in the articles hub page
 */
export default function ArticleFilters({ activeFilter, onFilterChange }) {
  const filters = [
    { id: 'all', label: 'All' },
    { id: 'systemic-shifts', label: 'Systemic Shifts' },
    { id: 'jukris-lens', label: 'Jukris Lens' },
    { id: 'upstreambuzz', label: 'UpstreamBuzz' },
    { id: 'petronas-2.0', label: 'PETRONAS 2.0' },
    { id: 'trending', label: 'Trending' }
  ];

  return (
    <div className="flex flex-wrap justify-center gap-3 md:gap-4 mb-8 md:mb-12">
      {filters.map((filter) => (
        <motion.button
          key={filter.id}
          onClick={() => onFilterChange(filter.id)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className={`
            px-4 md:px-6 py-2 md:py-3 rounded-full font-semibold text-sm md:text-base transition-all duration-200
            ${
              activeFilter === filter.id
                ? 'bg-teal-600 text-white shadow-lg'
                : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
            }
          `}
        >
          {filter.label}
        </motion.button>
      ))}
    </div>
  );
}

