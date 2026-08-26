'use client';

import { motion } from 'framer-motion';
import { Leaf } from 'lucide-react';

const leaves = [
  { left: '4%', size: 22, duration: 14, delay: 0, opacity: 0.5 },
  { left: '16%', size: 15, duration: 19, delay: 2.5, opacity: 0.35 },
  { left: '30%', size: 26, duration: 16, delay: 5, opacity: 0.4 },
  { left: '45%', size: 18, duration: 21, delay: 1, opacity: 0.5 },
  { left: '60%', size: 24, duration: 15, delay: 4, opacity: 0.4 },
  { left: '74%', size: 16, duration: 18, delay: 3.5, opacity: 0.45 },
  { left: '87%', size: 20, duration: 17, delay: 6.5, opacity: 0.4 },
  { left: '95%', size: 14, duration: 20, delay: 0.5, opacity: 0.3 },
];

export default function FallingLeaves() {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0" aria-hidden="true">
      {leaves.map((leaf, i) => (
        <motion.div
          key={i}
          className="absolute text-emerald-600"
          style={{ left: leaf.left, top: '-10%', opacity: leaf.opacity }}
          animate={{
            y: ['0vh', '115vh'],
            x: [0, 30, -22, 18, 0],
            rotate: [0, 100, 200, 300, 360],
          }}
          transition={{
            duration: leaf.duration,
            delay: leaf.delay,
            repeat: Infinity,
            ease: 'linear',
          }}
        >
          <Leaf size={leaf.size} fill="currentColor" strokeWidth={1} />
        </motion.div>
      ))}
    </div>
  );
}
