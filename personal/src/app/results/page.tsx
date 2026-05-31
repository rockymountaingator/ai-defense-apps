'use client';

import { useEffect, useState } from 'react';
import { AssessmentResults, AssessmentState } from '@/lib/types';
import ResultsDashboard from '@/components/ResultsDashboard';

const STORAGE_KEY = 'ai-defense-assessment-state';

async function saveToDatabase(results: AssessmentResults) {
  try {
    const affiliateCode = localStorage.getItem('ai-defense-affiliate-code');
    const promoData = localStorage.getItem('ai-defense-promo-code');

    await fetch('/api/save-assessment', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        pathwayTitle: results.profile,
        results: {
          exposure: results.exposure,
          resilience: results.resilience,
          readiness: results.readiness,
          profile: results.profile,
          profileTagline: results.profileTagline,
        },
        affiliate_code: affiliateCode || null,
        promo_code: promoData ? JSON.parse(promoData).code : null,
      }),
    });
  } catch {
    // Silent fail — results are still in localStorage
  }
}

export default function ResultsPage() {
  const [results, setResults] = useState<AssessmentResults | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const state: AssessmentState = JSON.parse(saved);
        if (state.results) {
          setResults(state.results);
          // Save to database in the background
          saveToDatabase(state.results);
        }
      }
    } catch {
      // ignore
    }
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-terra border-t-transparent" />
      </div>
    );
  }

  if (!results) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-6 text-center">
        <div className="mb-6 text-5xl">🔍</div>
        <h2 className="mb-3 text-2xl font-bold text-ink">No results yet</h2>
        <p className="mb-6 max-w-md text-charcoal">
          It looks like you haven&apos;t completed the assessment yet. Let&apos;s fix that.
        </p>
        <a
          href="/"
          className="inline-flex items-center gap-2 rounded-xl bg-terra px-8 py-3 font-semibold text-white transition-all hover:bg-terra-dark hover:shadow-md"
        >
          Take the Assessment
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
        </a>
      </div>
    );
  }

  return <ResultsDashboard results={results} />;
}
