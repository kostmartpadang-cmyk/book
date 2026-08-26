'use client';

import { motion } from 'framer-motion';
import { Leaf } from 'lucide-react';

const petals = [
  { left: '4%', size: 20, duration: 14, delay: 0, opacity: 0.55, color: '#f4b8c4' },
  { left: '16%', size: 14, duration: 19, delay: 2.5, opacity: 0.4, color: '#a8c97a' },
  { left: '30%', size: 24, duration: 16, delay: 5, opacity: 0.45, color: '#e8a05c' },
  { left: '45%', size: 16, duration: 21, delay: 1, opacity: 0.5, color: '#f4b8c4' },
  { left: '60%', size: 22, duration: 15, delay: 4, opacity: 0.45, color: '#a8c97a' },
  { left: '74%', size: 15, duration: 18, delay: 3.5, opacity: 0.5, color: '#f4b8c4' },
  { left: '87%', size: 19, duration: 17, delay: 6.5, opacity: 0.4, color: '#e8a05c' },
  { left: '95%', size: 13, duration: 20, delay: 0.5, opacity: 0.35, color: '#a8c97a' },
];

export default function SpringPetals() {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0" aria-hidden="true">
      {petals.map((petal, i) => (
        <motion.div
          key={i}
          className="absolute"
          style={{ left: petal.left, top: '-10%', opacity: petal.opacity, color: petal.color }}
          animate={{
            y: ['0vh', '115vh'],
            x: [0, 30, -22, 18, 0],
            rotate: [0, 100, 200, 300, 360],
          }}
          transition={{
            duration: petal.duration,
            delay: petal.delay,
            repeat: Infinity,
            ease: 'linear',
          }}
        >
          <Leaf size={petal.size} fill="currentColor" strokeWidth={1} />
        </motion.div>
      ))}
    </div>
  );
}
