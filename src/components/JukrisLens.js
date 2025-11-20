// src/components/JukrisLens.js
'use client';

import { motion } from 'framer-motion';
import { FaEye, FaQuoteLeft } from 'react-icons/fa';

/**
 * Jukris Lens Component
 * 
 * Container for updates on leader Encik Jukris
 * Currently displays "Coming Soon" message
 */
export default function JukrisLens() {
  return (
    <section className="py-16 md:py-24 bg-gradient-to-br from-teal-800 via-teal-900 to-cyan-900 text-white">
      <div className="container mx-auto px-4 max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <FaEye className="text-4xl md:text-5xl text-cyan-300" />
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold">
              Jukris <span className="text-cyan-300">Lens</span>
            </h2>
          </div>
          <p className="text-lg md:text-xl text-teal-100 max-w-2xl mx-auto">
            Insights, updates, and perspectives from our leader Encik Jukris
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="bg-white/10 backdrop-blur-md rounded-2xl p-8 md:p-12 shadow-2xl border border-white/20"
        >
          <div className="text-center">
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="mb-6"
            >
              <FaQuoteLeft className="text-6xl md:text-8xl text-cyan-300/30 mx-auto mb-4" />
            </motion.div>
            <h3 className="text-2xl md:text-3xl font-bold mb-4 text-cyan-200">
              Coming Soon
            </h3>
            <p className="text-lg md:text-xl text-teal-100 max-w-xl mx-auto leading-relaxed">
              This section will feature updates, quotes, achievements, and activities from Encik Jukris. 
              Stay tuned for inspiring insights and leadership perspectives.
            </p>
            <div className="mt-8 flex justify-center">
              <div className="inline-flex items-center gap-2 px-6 py-3 bg-cyan-500/20 rounded-full border border-cyan-400/30">
                <span className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></span>
                <span className="text-sm font-semibold">In Development</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

