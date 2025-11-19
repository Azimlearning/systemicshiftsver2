// src/components/RotatingBanner.js
'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import Image from 'next/image';

/**
 * Rotating Banner Component
 * 
 * Auto-rotating carousel for news, promotions, and articles
 * Features smooth transitions and navigation controls
 */
export default function RotatingBanner() {
  const [currentIndex, setCurrentIndex] = useState(0);

  const bannerItems = [
    {
      id: 1,
      title: 'New Strategic Initiatives Launched',
      description: 'Discover the latest updates on our upstream transformation journey and key milestones achieved this quarter.',
      image: '/images/highlight-placeholder.jpg',
      category: 'News',
      link: '/articles'
    },
    {
      id: 2,
      title: 'Special Promotion: Submit Your Story',
      description: 'Share your upstream success stories and get featured on our platform. Limited time opportunity!',
      image: '/images/highlight-placeholder.jpg',
      category: 'Promotion',
      link: '/submit-story'
    },
    {
      id: 3,
      title: 'Featured Article: Innovation in Action',
      description: 'Read about how our teams are leveraging cutting-edge technology for real-time optimization across operations.',
      image: '/images/highlight-placeholder.jpg',
      category: 'Article',
      link: '/articles'
    }
  ];

  // Auto-rotate every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % bannerItems.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [bannerItems.length]);

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + bannerItems.length) % bannerItems.length);
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % bannerItems.length);
  };

  const goToSlide = (index) => {
    setCurrentIndex(index);
  };

  return (
    <section className="py-12 md:py-16 bg-white">
      <div className="container mx-auto px-4 max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8"
        >
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
            Latest <span className="text-teal-600">Updates</span>
          </h2>
          <p className="text-gray-600">Stay informed with our latest news, promotions, and featured articles</p>
        </motion.div>

        <div className="relative">
          <div className="relative h-64 md:h-80 lg:h-96 rounded-2xl overflow-hidden shadow-xl">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentIndex}
                initial={{ opacity: 0, x: 100 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -100 }}
                transition={{ duration: 0.5 }}
                className="absolute inset-0"
              >
                <div className="relative w-full h-full">
                  <Image
                    src={bannerItems[currentIndex].image}
                    alt={bannerItems[currentIndex].title}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-teal-900/80 to-teal-800/60"></div>
                  <div className="absolute inset-0 flex items-center">
                    <div className="container mx-auto px-6 md:px-12 text-white">
                      <div className="max-w-2xl">
                        <span className="inline-block px-3 py-1 bg-teal-500 rounded-full text-sm font-semibold mb-4">
                          {bannerItems[currentIndex].category}
                        </span>
                        <h3 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-4">
                          {bannerItems[currentIndex].title}
                        </h3>
                        <p className="text-lg md:text-xl text-teal-100 mb-6">
                          {bannerItems[currentIndex].description}
                        </p>
                        <a
                          href={bannerItems[currentIndex].link}
                          className="inline-block bg-white text-teal-700 font-semibold py-3 px-8 rounded-lg hover:bg-teal-50 transition-colors shadow-lg"
                        >
                          Learn More
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Navigation Arrows */}
            <button
              onClick={goToPrevious}
              className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-teal-700 p-3 rounded-full shadow-lg transition-all z-10"
              aria-label="Previous slide"
            >
              <FaChevronLeft />
            </button>
            <button
              onClick={goToNext}
              className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-teal-700 p-3 rounded-full shadow-lg transition-all z-10"
              aria-label="Next slide"
            >
              <FaChevronRight />
            </button>
          </div>

          {/* Dots Indicator */}
          <div className="flex justify-center gap-2 mt-6">
            {bannerItems.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`h-2 rounded-full transition-all ${
                  index === currentIndex
                    ? 'w-8 bg-teal-600'
                    : 'w-2 bg-gray-300 hover:bg-gray-400'
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

