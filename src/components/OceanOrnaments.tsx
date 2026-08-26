'use client';

import { motion } from 'framer-motion';

const ornaments = [
  { src: '/lautan/ornament-starfish.png', size: 70, top: '10%', left: '6%', duration: 7, delay: 0, rotateRange: 12 },
  { src: '/lautan/ornament-pearl.png', size: 50, top: '22%', left: '90%', duration: 8, delay: 1.2, rotateRange: 8 },
  { src: '/lautan/ornament-flower.png', size: 80, top: '68%', left: '4%', duration: 9, delay: 0.6, rotateRange: 10 },
  { src: '/lautan/ornament-starfish.png', size: 48, top: '80%', left: '88%', duration: 7.5, delay: 2, rotateRange: 14 },
  { src: '/lautan/ornament-pearl.png', size: 36, top: '48%', left: '95%', duration: 6.5, delay: 1.8, rotateRange: 10 },
];

export default function OceanOrnaments() {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0" aria-hidden="true">
      {ornaments.map((o, i) => (
        <motion.img
          key={i}
          src={o.src}
          alt=""
          style={{ width: o.size, height: o.size, top: o.top, left: o.left, position: 'absolute' }}
          className="object-contain opacity-40 drop-shadow-lg"
          animate={{
            y: [0, -18, 0, 14, 0],
            rotate: [0, o.rotateRange, 0, -o.rotateRange, 0],
          }}
          transition={{
            duration: o.duration,
            delay: o.delay,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  );
}
