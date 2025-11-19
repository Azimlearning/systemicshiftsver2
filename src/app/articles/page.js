// src/app/articles/page.js
'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import ArticleFilters from '../../components/ArticleFilters';
import ArticleCard from '../../components/ArticleCard';

/**
 * Articles Hub Page
 * 
 * Centralized page for all articles with filtering capabilities
 */

// Mock articles data - replace with actual data source later
const mockArticles = [
  // Systemic Shifts Articles
  {
    id: 1,
    title: 'Accelerating Portfolio High-Grading: A Strategic Overview',
    excerpt: 'Discover how we are actively reshaping our portfolio to focus on assets that create the most value through disciplined divestment strategies.',
    category: 'systemic-shifts',
    categoryLabel: 'Systemic Shifts',
    date: '2025-01-20',
    image: '/images/highlight-placeholder.jpg'
  },
  {
    id: 2,
    title: 'Delivering Advantaged Barrels: Efficiency in Action',
    excerpt: 'Learn about our focus on safe, low cost, low carbon and high-margin barrels through innovative operational approaches.',
    category: 'systemic-shifts',
    categoryLabel: 'Systemic Shifts',
    date: '2025-01-15',
    image: '/images/highlight-placeholder.jpg'
  },
  {
    id: 3,
    title: 'Q1 Progress: Key Milestones Achieved',
    excerpt: 'Review our first quarter achievements and progress across various strategic initiatives in upstream operations.',
    category: 'systemic-shifts',
    categoryLabel: 'Systemic Shifts',
    date: '2025-01-10',
    image: '/images/highlight-placeholder.jpg'
  },
  // Jukris Lens Articles
  {
    id: 4,
    title: 'Leadership Insights: Building a Culture of Innovation',
    excerpt: 'Encik Jukris shares his perspective on fostering innovation and driving transformation across upstream operations.',
    category: 'jukris-lens',
    categoryLabel: 'Jukris Lens',
    date: '2025-01-18',
    image: '/images/highlight-placeholder.jpg'
  },
  {
    id: 5,
    title: 'Strategic Vision: The Path Forward',
    excerpt: 'An exclusive interview with Encik Jukris on the strategic direction and future outlook for PETRONAS Upstream.',
    category: 'jukris-lens',
    categoryLabel: 'Jukris Lens',
    date: '2025-01-12',
    image: '/images/highlight-placeholder.jpg'
  },
  // UpstreamBuzz Articles
  {
    id: 6,
    title: 'Innovation Spotlight: Real-Time Optimization Success',
    excerpt: 'How our teams are leveraging cutting-edge technology for real-time optimization, driving efficiency and sustainability.',
    category: 'upstreambuzz',
    categoryLabel: 'UpstreamBuzz',
    date: '2025-01-22',
    image: '/images/highlight-placeholder.jpg'
  },
  {
    id: 7,
    title: 'Community Stories: Celebrating Upstream Achievements',
    excerpt: 'Read inspiring stories from our upstream community members who are making a difference in their operations.',
    category: 'upstreambuzz',
    categoryLabel: 'UpstreamBuzz',
    date: '2025-01-16',
    image: '/images/highlight-placeholder.jpg'
  },
  {
    id: 8,
    title: 'Technology Update: AI-Driven Solutions',
    excerpt: 'Exploring the latest AI and machine learning applications transforming our upstream operations and decision-making.',
    category: 'upstreambuzz',
    categoryLabel: 'UpstreamBuzz',
    date: '2025-01-08',
    image: '/images/highlight-placeholder.jpg'
  },
  // PETRONAS 2.0 Articles
  {
    id: 9,
    title: 'The Path to Integrated Energy Company',
    excerpt: 'Exploring how PETRONAS is transforming into an integrated energy company by 2035, focusing on competitive upstream, reliable LNG supply, and energy solutions.',
    category: 'petronas-2.0',
    categoryLabel: 'PETRONAS 2.0',
    date: '2025-01-19',
    image: '/images/highlight-placeholder.jpg'
  },
  {
    id: 10,
    title: 'Sustainable Energy Solutions for Tomorrow',
    excerpt: 'Discover our commitment to providing safe, reliable, and sustainable energy solutions that meet the world\'s evolving needs.',
    category: 'petronas-2.0',
    categoryLabel: 'PETRONAS 2.0',
    date: '2025-01-14',
    image: '/images/highlight-placeholder.jpg'
  },
  {
    id: 11,
    title: 'Global LNG Leadership and Expansion',
    excerpt: 'Understanding our role as a reliable global LNG supplier and how we\'re expanding our reach to serve customers worldwide.',
    category: 'petronas-2.0',
    categoryLabel: 'PETRONAS 2.0',
    date: '2025-01-07',
    image: '/images/highlight-placeholder.jpg'
  },
  // Trending Articles
  {
    id: 12,
    title: 'Breaking: New Strategic Partnership Announced',
    excerpt: 'PETRONAS Upstream announces a major strategic partnership to accelerate digital transformation and innovation initiatives.',
    category: 'trending',
    categoryLabel: 'Trending',
    date: '2025-01-23',
    image: '/images/highlight-placeholder.jpg'
  },
  {
    id: 13,
    title: 'Record-Breaking Quarter: Operational Excellence',
    excerpt: 'Our upstream operations achieve record-breaking performance metrics, demonstrating excellence in safety, efficiency, and sustainability.',
    category: 'trending',
    categoryLabel: 'Trending',
    date: '2025-01-21',
    image: '/images/highlight-placeholder.jpg'
  }
];

export default function ArticlesPage() {
  const [activeFilter, setActiveFilter] = useState('all');

  // Filter articles based on active filter
  const filteredArticles = useMemo(() => {
    if (activeFilter === 'all') {
      return mockArticles;
    }
    return mockArticles.filter(article => article.category === activeFilter);
  }, [activeFilter]);

  return (
    <div className="min-h-screen bg-gray-50 font-sans flex flex-col">
      <Header />
      <main className="flex-grow relative z-10">
        <section className="py-16 md:py-24">
          <div className="container mx-auto px-4 max-w-7xl">
            {/* Page Header */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center mb-12"
            >
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-4">
                Articles <span className="text-teal-600">Hub</span>
              </h1>
              <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto">
                Explore insights, updates, and stories from across PETRONAS Upstream
              </p>
            </motion.div>

            {/* Filter Buttons */}
            <ArticleFilters 
              activeFilter={activeFilter} 
              onFilterChange={setActiveFilter} 
            />

            {/* Articles Grid */}
            {filteredArticles.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                {filteredArticles.map((article, index) => (
                  <ArticleCard key={article.id} article={article} index={index} />
                ))}
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-16"
              >
                <p className="text-xl text-gray-600">No articles found in this category.</p>
              </motion.div>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}

