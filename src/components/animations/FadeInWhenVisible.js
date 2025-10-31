// src/components/animations/FadeInWhenVisible.js
'use client';

import { motion } from 'framer-motion';

export default function FadeInWhenVisible({ children }) {
  const variants = {
    hidden: { 
      opacity: 0, 
      y: 20 // Start 20px down
    },
    visible: { 
      opacity: 1, 
      y: 0,  // End at original position
      transition: { 
        duration: 0.5, 
        ease: "easeOut" 
      }
    },
  };

  return (
    <motion.div
      initial="hidden"
      whileInView="visible" // This is the magic prop!
      viewport={{ once: true, amount: 0.3 }} // Trigger once, when 30% is visible
      variants={variants}
    >
      {children}
    </motion.div>
  );
}
