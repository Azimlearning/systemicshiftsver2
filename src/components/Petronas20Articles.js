// src/components/Petronas20Articles.js
'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { FaArrowRight } from 'react-icons/fa';

/**
 * PETRONAS 2.0 Featured Articles Component
 * 
 * Displays featured articles related to PETRONAS 2.0
 * Positioned below the 3 goals section
 */
export default function Petronas20Articles() {
  const featuredArticles = [
    {
      id: 1,
      title: 'The Path to Integrated Energy Company',
      excerpt: 'Exploring how PETRONAS is transforming into an integrated energy company by 2035, focusing on competitive upstream, reliable LNG supply, and energy solutions.',
      image: '/images/highlight-placeholder.jpg',
      date: '2025-01-15',
      link: '/articles'
    },
    {
      id: 2,
      title: 'Sustainable Energy Solutions for Tomorrow',
      excerpt: 'Discover our commitment to providing safe, reliable, and sustainable energy solutions that meet the world\'s evolving needs.',
      image: '/images/highlight-placeholder.jpg',
      date: '2025-01-10',
      link: '/articles'
    },
    {
      id: 3,
      title: 'Innovation in Upstream Operations',
      excerpt: 'Learn about the latest technological advancements and strategic initiatives driving our competitive upstream operations forward.',
      image: '/images/highlight-placeholder.jpg',
      date: '2025-01-05',
      link: '/articles'
    },
    {
      id: 4,
      title: 'Global LNG Leadership',
      excerpt: 'Understanding our role as a reliable global LNG supplier and how we\'re expanding our reach to serve customers worldwide.',
      image: '/images/highlight-placeholder.jpg',
      date: '2024-12-28',
      link: '/articles'
    }
  ];

  return (
    <section className="py-16 md:py-24 bg-gradient-to-br from-gray-50 to-white">
      <div className="container mx-auto px-4 max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Featured <span className="text-teal-600">Articles</span>
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Explore insights and updates on PETRONAS 2.0 vision and strategic initiatives
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
          {featuredArticles.map((article, index) => (
            <motion.div
              key={article.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              whileHover={{ y: -5 }}
              className="group"
            >
              <Link href={article.link}>
                <div className="bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 h-full flex flex-col border border-gray-200 hover:border-teal-300">
                  <div className="relative h-48 overflow-hidden">
                    <Image
                      src={article.image}
                      alt={article.title}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                  </div>
                  <div className="p-6 flex-grow flex flex-col">
                    <span className="text-sm text-teal-600 font-semibold mb-2">
                      {new Date(article.date).toLocaleDateString('en-US', { 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}
                    </span>
                    <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-teal-600 transition-colors line-clamp-2">
                      {article.title}
                    </h3>
                    <p className="text-gray-600 text-sm leading-relaxed mb-4 flex-grow line-clamp-3">
                      {article.excerpt}
                    </p>
                    <div className="flex items-center text-teal-600 font-semibold text-sm group-hover:gap-2 transition-all">
                      <span>Read More</span>
                      <FaArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-center mt-12"
        >
          <Link
            href="/articles?category=petronas-2.0"
            className="inline-block bg-teal-600 hover:bg-teal-700 text-white font-semibold py-3 px-8 rounded-lg transition-colors shadow-lg"
          >
            View All PETRONAS 2.0 Articles
          </Link>
        </motion.div>
      </div>
    </section>
  );
}

