// src/components/ArticleCard.js
'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { FaArrowRight, FaCalendar } from 'react-icons/fa';

/**
 * Article Card Component
 * 
 * Reusable component for displaying article cards
 * Used in the articles hub page
 */
export default function ArticleCard({ article, index = 0 }) {
  const categoryColors = {
    'systemic-shifts': 'bg-teal-500',
    'jukris-lens': 'bg-cyan-500',
    'upstreambuzz': 'bg-blue-500',
    'petronas-2.0': 'bg-indigo-500',
    'trending': 'bg-pink-500'
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      whileHover={{ y: -5 }}
      className="group"
    >
      <Link href={`/articles/${article.id}`}>
        <div className="bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 h-full flex flex-col border border-gray-200 hover:border-teal-300">
          <div className="relative h-48 overflow-hidden">
            <Image
              src={article.image || '/images/highlight-placeholder.jpg'}
              alt={article.title}
              fill
              className="object-cover group-hover:scale-110 transition-transform duration-300"
            />
            <div className="absolute top-4 left-4">
              <span className={`px-3 py-1 rounded-full text-white text-xs font-semibold ${categoryColors[article.category] || 'bg-gray-500'}`}>
                {article.categoryLabel || article.category}
              </span>
            </div>
          </div>
          <div className="p-6 flex-grow flex flex-col">
            <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
              <FaCalendar className="text-xs" />
              <span>
                {new Date(article.date).toLocaleDateString('en-US', { 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </span>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-teal-600 transition-colors line-clamp-2">
              {article.title}
            </h3>
            <p className="text-gray-600 text-sm leading-relaxed mb-4 flex-grow line-clamp-3">
              {article.excerpt}
            </p>
            <div className="flex items-center text-teal-600 font-semibold text-sm group-hover:gap-2 transition-all">
              <span>Read Article</span>
              <FaArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

