// src/components/WebsiteCapabilities.js
'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { 
  FaChartLine, 
  FaEdit, 
  FaGraduationCap, 
  FaNetworkWired, 
  FaRobot, 
  FaTasks 
} from 'react-icons/fa';

/**
 * Website Capabilities Component
 * 
 * Displays key features and capabilities of the website
 * Inspired by osmo.supply design patterns
 */
export default function WebsiteCapabilities() {
  const capabilities = [
    {
      id: 'systemic-shifts',
      title: 'Systemic Shifts Tracking',
      description: 'Monitor and track progress on key strategic shifts across upstream operations',
      icon: FaChartLine,
      href: '/systemic-shifts/upstream-target',
      gradient: 'from-teal-500 to-cyan-500'
    },
    {
      id: 'story-submissions',
      title: 'Story Submissions',
      description: 'Share your upstream stories and insights with the community',
      icon: FaEdit,
      href: '/submit-story',
      gradient: 'from-cyan-500 to-blue-500'
    },
    {
      id: 'ulearn',
      title: 'Educational Resources',
      description: 'Access videos, quizzes, and AI-powered learning content',
      icon: FaGraduationCap,
      href: '/ulearn',
      gradient: 'from-blue-500 to-indigo-500'
    },
    {
      id: 'nexushub',
      title: 'NexusHub Collaboration',
      description: 'Central hub for digital items, collaterals, and team collaboration',
      icon: FaNetworkWired,
      href: '/nexushub',
      gradient: 'from-indigo-500 to-purple-500'
    },
    {
      id: 'nexusgpt',
      title: 'NexusGPT AI Assistant',
      description: 'Get instant answers and insights powered by AI technology',
      icon: FaRobot,
      href: '/nexusgpt',
      gradient: 'from-purple-500 to-pink-500'
    },
    {
      id: 'progress',
      title: 'Progress Monitoring',
      description: 'Track quarterly progress and milestones across all initiatives',
      icon: FaTasks,
      href: '/systemic-shifts/our-progress',
      gradient: 'from-pink-500 to-rose-500'
    }
  ];

  return (
    <section className="py-16 md:py-24 bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="container mx-auto px-4 max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            Platform <span className="text-teal-600">Capabilities</span>
          </h2>
          <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto">
            Discover the powerful tools and features that help you stay connected, informed, and engaged
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {capabilities.map((capability, index) => (
            <motion.div
              key={capability.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              whileHover={{ y: -5, scale: 1.02 }}
              className="group"
            >
              <Link href={capability.href}>
                <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 h-full border border-gray-200 hover:border-teal-300">
                  <div className={`w-16 h-16 rounded-lg bg-gradient-to-br ${capability.gradient} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                    <capability.icon className="text-white text-2xl" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-teal-600 transition-colors">
                    {capability.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {capability.description}
                  </p>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

