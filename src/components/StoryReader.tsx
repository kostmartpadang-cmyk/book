'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Settings2 } from 'lucide-react';

interface StoryReaderProps {
  text: string;
  onBack: () => void;
}

type Effect = 'none' | 'fade' | 'typewriter';

export default function StoryReader({ text, onBack }: StoryReaderProps) {
  const [effect, setEffect] = useState<Effect>('fade');
  const [showSettings, setShowSettings] = useState(false);

  // Split text into paragraphs
  const paragraphs = text.split(/\n+/).filter((p) => p.trim().length > 0);

  const renderEffect = () => {
    switch (effect) {
      case 'fade':
        return paragraphs.map((p, idx) => (
          <motion.p
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, delay: idx * 0.1 }}
            className="mb-6 leading-relaxed text-lg"
          >
            {p}
          </motion.p>
        ));
      
      case 'typewriter':
        return (
          <motion.div
            initial={{ opacity: 1 }}
            className="mb-6 leading-relaxed text-lg whitespace-pre-wrap"
          >
            {text.split('').map((char, index) => (
              <motion.span
                key={index}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{
                  duration: 0.1,
                  delay: index * 0.02,
                }}
              >
                {char}
              </motion.span>
            ))}
          </motion.div>
        );

      case 'none':
      default:
        return paragraphs.map((p, idx) => (
          <p key={idx} className="mb-6 leading-relaxed text-lg">
            {p}
          </p>
        ));
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto relative bg-zinc-900 min-h-screen text-zinc-100 p-8 md:p-12 shadow-2xl rounded-xl">
      {/* Header Controls */}
      <div className="flex justify-between items-center mb-12 sticky top-0 bg-zinc-900/90 backdrop-blur py-4 z-10 border-b border-white/10">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors"
        >
          <ArrowLeft size={20} /> Kembali
        </button>

        <div className="relative">
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors p-2 rounded-lg hover:bg-white/5"
          >
            <Settings2 size={20} /> Efek Visual
          </button>

          {showSettings && (
            <div className="absolute right-0 top-full mt-2 w-48 bg-zinc-800 border border-white/10 rounded-xl shadow-xl overflow-hidden z-20">
              <div className="p-2 space-y-1">
                <button
                  onClick={() => { setEffect('none'); setShowSettings(false); }}
                  className={`w-full text-left px-4 py-2 rounded-lg text-sm transition-colors ${effect === 'none' ? 'bg-indigo-500/20 text-indigo-400' : 'text-zinc-300 hover:bg-white/5'}`}
                >
                  Tanpa Efek
                </button>
                <button
                  onClick={() => { setEffect('fade'); setShowSettings(false); }}
                  className={`w-full text-left px-4 py-2 rounded-lg text-sm transition-colors ${effect === 'fade' ? 'bg-indigo-500/20 text-indigo-400' : 'text-zinc-300 hover:bg-white/5'}`}
                >
                  Fade In (Scroll)
                </button>
                <button
                  onClick={() => { setEffect('typewriter'); setShowSettings(false); }}
                  className={`w-full text-left px-4 py-2 rounded-lg text-sm transition-colors ${effect === 'typewriter' ? 'bg-indigo-500/20 text-indigo-400' : 'text-zinc-300 hover:bg-white/5'}`}
                >
                  Typewriter
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Story Content */}
      <div className="prose prose-invert prose-lg max-w-none font-serif">
        {renderEffect()}
      </div>
    </div>
  );
}
