// src/components/animations/FadeInWhenVisible.js
'use client';

import { motion, useAnimation } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';

export default function FadeInWhenVisible({ children }) {
  const controls = useAnimation();
  const ref = useRef(null);
  const [hasAnimated, setHasAnimated] = useState(false);

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

  // Check if element is in viewport on mount and immediately after
  useEffect(() => {
    const checkVisibility = () => {
      if (hasAnimated || !ref.current) return;

      const element = ref.current;
      const rect = element.getBoundingClientRect();
      const windowHeight = window.innerHeight || document.documentElement.clientHeight;
      
      // Check if element is visible in viewport (more lenient check)
      // Element is visible if any part of it is in the viewport
      const isVisible = rect.top < windowHeight && rect.bottom > 0;
      
      if (isVisible) {
        controls.start('visible');
        setHasAnimated(true);
      }
    };

    // Use requestAnimationFrame to ensure DOM is ready
    requestAnimationFrame(() => {
      checkVisibility();
      
      // Also check after a short delay to catch any layout shifts
      setTimeout(checkVisibility, 100);
    });

    // Fallback: show content after 300ms even if viewport check fails (reduced from 500ms)
    const fallbackTimeout = setTimeout(() => {
      if (!hasAnimated && ref.current) {
        controls.start('visible');
        setHasAnimated(true);
      }
    }, 300);

    return () => {
      clearTimeout(fallbackTimeout);
    };
  }, [controls, hasAnimated]);

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={controls}
      whileInView="visible" // Still use whileInView as backup
      viewport={{ once: true, amount: 0.1 }} // Reduced from 0.3 to 0.1 for faster triggering
      variants={variants}
    >
      {children}
    </motion.div>
  );
}
