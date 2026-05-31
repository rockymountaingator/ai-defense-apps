'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { storePromoCode } from '@/lib/affiliate';

interface WelcomeScreenProps {
  onStart: () => void;
}

export default function WelcomeScreen({ onStart }: WelcomeScreenProps) {
  const [showPromoInput, setShowPromoInput] = useState(false);
  const [promoCode, setPromoCode] = useState('');
  const [promoStatus, setPromoStatus] = useState<'idle' | 'loading' | 'valid' | 'invalid'>('idle');
  const [promoDiscount, setPromoDiscount] = useState('');

  const handleValidatePromo = async () => {
    const code = promoCode.trim();
    if (!code) return;

    setPromoStatus('loading');

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api.aidefenseproject.com';
      const res = await fetch(`${apiUrl}/api/promo/validate?code=${encodeURIComponent(code)}`);
      const data = await res.json();

      if (res.ok && data.valid) {
        setPromoStatus('valid');
        setPromoDiscount(data.discount_text || 'Discount applied!');
        storePromoCode(code, data.discount_text || 'Discount applied!');
      } else {
        setPromoStatus('invalid');
      }
    } catch {
      // Network error — try local fallback check
      setPromoStatus('invalid');
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: 'easeOut' }}
        className="mx-auto max-w-lg text-center"
      >
        {/* Tag */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="mb-8"
        >
          <span className="inline-block rounded-full bg-terra-light px-4 py-1.5 text-sm font-medium text-terra-dark">
            AI Defense Project
          </span>
        </motion.div>

        {/* Heading */}
        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="mb-4 text-4xl font-bold leading-tight tracking-tight text-ink sm:text-5xl"
          style={{ letterSpacing: '-0.02em' }}
        >
          Let&apos;s figure out where you stand
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.6 }}
          className="mb-10 text-lg leading-relaxed text-soft-slate"
        >
          Not a test — more like an honest conversation about your work and where AI fits into it. Takes about 5 minutes. No scare tactics, just clarity.
        </motion.p>

        {/* What you'll get */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.6 }}
          className="mb-10 grid grid-cols-1 gap-3 text-left sm:grid-cols-3"
        >
          <div className="rounded-2xl border border-sand bg-canvas p-4">
            <div className="mb-2 text-2xl">📊</div>
            <div className="text-sm font-semibold text-ink">Exposure Score</div>
            <div className="text-xs text-soft-slate">How much of your work AI can touch</div>
          </div>
          <div className="rounded-2xl border border-sand bg-canvas p-4">
            <div className="mb-2 text-2xl">🛡️</div>
            <div className="text-sm font-semibold text-ink">Resilience Score</div>
            <div className="text-xs text-soft-slate">Your genuine human advantage</div>
          </div>
          <div className="rounded-2xl border border-sand bg-canvas p-4">
            <div className="mb-2 text-2xl">🧭</div>
            <div className="text-sm font-semibold text-ink">Your Profile</div>
            <div className="text-xs text-soft-slate">Where you really stand — and what to do about it</div>
          </div>
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9, duration: 0.6 }}
        >
          <button
            onClick={onStart}
            className="inline-flex items-center gap-2 rounded-xl bg-terra px-9 py-3.5 text-base font-semibold text-white shadow-sm transition-all hover:bg-terra-dark hover:shadow-md active:scale-[0.98]"
          >
            Let&apos;s do this
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </button>

          <p className="mt-4 text-xs text-soft-slate">
            20 questions · ~5 minutes · Everything stays on your device
          </p>

          {/* Promo code section */}
          <div className="mt-3">
            {!showPromoInput ? (
              <button
                onClick={() => setShowPromoInput(true)}
                className="text-xs text-soft-slate underline-offset-4 transition-colors hover:text-ink hover:underline"
              >
                Have a promo code?
              </button>
            ) : (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-2"
              >
                <div className="inline-flex items-center gap-2">
                  <input
                    type="text"
                    value={promoCode}
                    onChange={(e) => {
                      setPromoCode(e.target.value);
                      if (promoStatus !== 'idle') setPromoStatus('idle');
                    }}
                    placeholder="Enter promo code"
                    className="rounded-lg border border-sand bg-canvas px-3 py-1.5 text-sm text-ink placeholder:text-soft-slate/60 focus:border-terra focus:outline-none focus:ring-1 focus:ring-terra"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleValidatePromo();
                    }}
                  />
                  <button
                    onClick={handleValidatePromo}
                    disabled={promoStatus === 'loading' || !promoCode.trim()}
                    className="rounded-lg bg-ink px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-charcoal disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {promoStatus === 'loading' ? (
                      <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    ) : (
                      'Apply'
                    )}
                  </button>
                </div>

                <AnimatePresence>
                  {promoStatus === 'valid' && (
                    <motion.div
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-2 inline-flex items-center gap-1.5 text-sm font-medium text-green-600"
                    >
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      {promoDiscount}
                    </motion.div>
                  )}
                  {promoStatus === 'invalid' && (
                    <motion.div
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-2 text-sm text-rose"
                    >
                      Invalid promo code. Please check and try again.
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )}
          </div>
        </motion.div>

        {/* Admin button — red, top-right corner */}
        <a
          href="//admin"
          className="fixed top-4 right-4 z-50 inline-flex items-center gap-1.5 rounded-lg bg-rose px-3.5 py-2 text-xs font-semibold text-white shadow-sm transition-all hover:brightness-110 hover:shadow-md active:scale-[0.97]"
        >
          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
          </svg>
          Upload Data
        </a>
      </motion.div>
    </div>
  );
}
