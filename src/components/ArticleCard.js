// src/components/ArticleCard.js
'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { FaArrowRight, FaCalendar, FaHeart, FaComment } from 'react-icons/fa';
import { trackArticleView, toggleArticleLike, checkArticleLike, getArticleEngagement } from '../lib/analytics';

/**
 * Article Card Component
 * 
 * Reusable component for displaying article cards
 * Used in the articles hub page
 */
export default function ArticleCard({ article, index = 0 }) {
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [commentsCount, setCommentsCount] = useState(0);
  const [viewsCount, setViewsCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const categoryColors = {
    'systemic-shifts': 'bg-teal-500',
    'jukris-lens': 'bg-cyan-500',
    'upstreambuzz': 'bg-blue-500',
    'petronas-2.0': 'bg-indigo-500',
    'trending': 'bg-pink-500'
  };

  // Load engagement data on mount
  useEffect(() => {
    async function loadEngagement() {
      try {
        const engagement = await getArticleEngagement(article.id);
        setLikesCount(engagement.likes || 0);
        setCommentsCount(engagement.comments || 0);
        setViewsCount(engagement.views || 0);
        
        // Check if user has liked
        const liked = await checkArticleLike(article.id);
        setIsLiked(liked);
      } catch (error) {
        console.error('Error loading engagement:', error);
      } finally {
        setLoading(false);
      }
    }
    loadEngagement();
  }, [article.id]);

  // Track view when card is clicked
  const handleCardClick = () => {
    trackArticleView(article.id, article.title, article.category);
  };

  // Handle like toggle
  const handleLikeClick = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    try {
      const result = await toggleArticleLike(article.id);
      setIsLiked(result.liked);
      setLikesCount(result.totalLikes);
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      whileHover={{ y: -5 }}
      className="group"
    >
      <Link href={`/articles/${article.id}`} onClick={handleCardClick}>
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
            <div className="flex items-center gap-2 text-sm text-gray-700 mb-3">
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
            
            {/* Engagement Stats */}
            <div className="flex items-center gap-4 mb-4 text-sm text-gray-600">
              <button
                onClick={handleLikeClick}
                className={`flex items-center gap-1 transition-colors ${
                  isLiked ? 'text-red-500' : 'text-gray-700 hover:text-red-500'
                }`}
                title="Like this article"
              >
                <FaHeart className={isLiked ? 'fill-current' : ''} />
                <span>{likesCount}</span>
              </button>
              <div className="flex items-center gap-1 text-gray-700">
                <FaComment />
                <span>{commentsCount}</span>
              </div>
              {viewsCount > 0 && (
                <div className="text-gray-600 text-xs">
                  {viewsCount} {viewsCount === 1 ? 'view' : 'views'}
                </div>
              )}
            </div>

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

