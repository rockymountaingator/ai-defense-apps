'use client';

import { useEffect } from 'react';
import { motion } from 'framer-motion';

interface LoadingResultsProps {
  onReady: () => void;
}

const messages = [
  'Looking at your answers...',
  'Mapping your skills against AI capabilities...',
  'Finding your unique strengths...',
  'Almost there...',
];

export default function LoadingResults({ onReady }: LoadingResultsProps) {
  useEffect(() => {
    const timer = setTimeout(onReady, 3200);
    return () => clearTimeout(timer);
  }, [onReady]);

  return (
    <div className="flex min-h-screen items-center justify-center p-6">
      <div className="text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="mb-6"
        >
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-terra-light">
            <svg className="h-7 w-7 text-terra" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          <h2 className="mb-2 text-xl font-bold text-ink">Putting it all together</h2>
          <p className="mb-6 text-sm text-soft-slate">
            {messages[Math.floor(Math.random() * messages.length)]}
          </p>

          {/* Loading dots */}
          <div className="flex justify-center gap-2">
            <div className="h-2 w-2 rounded-full bg-terra dot-1" />
            <div className="h-2 w-2 rounded-full bg-terra dot-2" />
            <div className="h-2 w-2 rounded-full bg-terra dot-3" />
          </div>
        </motion.div>
      </div>
    </div>
  );
}
