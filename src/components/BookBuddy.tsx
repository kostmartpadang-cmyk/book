'use client';

import { motion } from 'framer-motion';

interface BookBuddyProps {
  size?: number;
  className?: string;
}

export default function BookBuddy({ size = 140, className = '' }: BookBuddyProps) {
  return (
    <motion.div
      className={className}
      style={{ width: size, height: size }}
      animate={{ y: [0, -10, 0], rotate: [0, -2, 0, 2, 0] }}
      transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
    >
      <svg viewBox="0 0 200 200" width="100%" height="100%" fill="none">
        {/* shadow */}
        <ellipse cx="100" cy="186" rx="40" ry="7" fill="var(--text)" opacity="0.08" />

        {/* waving left arm */}
        <motion.g
          style={{ transformOrigin: '58px 100px' }}
          animate={{ rotate: [0, -28, 0, -28, 0] }}
          transition={{ duration: 2.4, repeat: Infinity, repeatDelay: 1.4, ease: 'easeInOut' }}
        >
          <path d="M58 100 Q30 92 24 64" stroke="var(--primary-strong)" strokeWidth="10" strokeLinecap="round" />
          <circle cx="24" cy="62" r="9" fill="var(--primary-strong)" />
        </motion.g>

        {/* right arm */}
        <path d="M142 100 Q170 108 176 130" stroke="var(--primary-strong)" strokeWidth="10" strokeLinecap="round" />
        <circle cx="176" cy="132" r="9" fill="var(--primary-strong)" />

        {/* feet */}
        <rect x="70" y="172" width="24" height="14" rx="7" fill="var(--secondary-strong)" />
        <rect x="106" y="172" width="24" height="14" rx="7" fill="var(--secondary-strong)" />

        {/* book body / cover */}
        <rect x="50" y="40" width="100" height="130" rx="16" fill="var(--primary)" stroke="var(--primary-strong)" strokeWidth="4" />
        {/* spine */}
        <line x1="100" y1="46" x2="100" y2="164" stroke="var(--primary-strong)" strokeWidth="3" opacity="0.5" />
        {/* pages peeking at bottom */}
        <rect x="54" y="158" width="92" height="10" rx="4" fill="#ffffff" opacity="0.85" />

        {/* bookmark */}
        <path d="M88 40 L88 12 L100 22 L112 12 L112 40 Z" fill="var(--accent)" />

        {/* blush */}
        <circle cx="72" cy="99" r="7" fill="var(--accent)" opacity="0.55" />
        <circle cx="128" cy="99" r="7" fill="var(--accent)" opacity="0.55" />

        {/* eyes (blinking) */}
        <motion.g
          style={{ transformOrigin: '100px 88px' }}
          animate={{ scaleY: [1, 1, 0.1, 1, 1] }}
          transition={{ duration: 3, repeat: Infinity, times: [0, 0.88, 0.94, 1, 1] }}
        >
          <circle cx="82" cy="88" r="7" fill="#ffffff" />
          <circle cx="82" cy="88" r="3.5" fill="var(--text)" />
          <circle cx="118" cy="88" r="7" fill="#ffffff" />
          <circle cx="118" cy="88" r="3.5" fill="var(--text)" />
        </motion.g>

        {/* smile */}
        <path d="M86 112 Q100 122 114 112" stroke="var(--primary-strong)" strokeWidth="4" strokeLinecap="round" fill="none" />
      </svg>
    </motion.div>
  );
}
