'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { AssessmentResults } from '@/lib/types';
import ScoreGauge from './ScoreGauge';

interface ResultsDashboardProps {
  results: AssessmentResults;
}

export default function ResultsDashboard({ results }: ResultsDashboardProps) {
  const [linkCopied, setLinkCopied] = useState(false);
  const [quoteCopied, setQuoteCopied] = useState(false);

  const shareUrl = 'https://personal.aidefenseproject.com';
  const shareQuote = `I just found out I'm ${results.profile} — my AI readiness score is ${results.readiness}/100. Take the free 10-minute assessment:\n${shareUrl}`;
  const emailSubject = encodeURIComponent('I took an AI readiness assessment — you should too');
  const emailBody = encodeURIComponent(
    `Hey,\n\nI just took a free AI readiness assessment and found out I'm "${results.profile}" with a readiness score of ${results.readiness}/100.\n\nIt takes about 10 minutes and the results are surprisingly insightful.\n\nTake it here: ${shareUrl}\n\n– Sent from the AI Defense Project`
  );

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2000);
    } catch {
      // Fallback: do nothing
    }
  };

  const handleCopyQuote = async () => {
    try {
      await navigator.clipboard.writeText(shareQuote);
      setQuoteCopied(true);
      setTimeout(() => setQuoteCopied(false), 2000);
    } catch {
      // Fallback: do nothing
    }
  };

  return (
    <div className="min-h-screen bg-cream">
      {/* ── Hero ── */}
      <div className="bg-navy px-4 pb-16 pt-10 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <span className="mb-4 inline-block rounded-full bg-white/10 px-4 py-1.5 text-sm font-medium text-white/70">
              Your Assessment Results
            </span>
            <h1
              className="mb-2 text-3xl font-bold text-white sm:text-4xl"
              style={{ letterSpacing: '-0.02em' }}
            >
              Here&apos;s what we found
            </h1>
            <p className="text-base text-white/50">
              Based on your answers — this is where you stand right now.
            </p>
          </motion.div>
        </div>
      </div>

      {/* ── Score Gauges ── */}
      <div className="mx-auto -mt-8 max-w-2xl px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="grid grid-cols-3 gap-3"
        >
          <div className="flex flex-col items-center rounded-2xl border border-sand bg-canvas p-4 shadow-sm">
            <ScoreGauge
              score={results.exposure}
              label="Exposure"
              color={results.exposure > 60 ? '#c45d3e' : results.exposure > 35 ? '#b8862d' : '#5a7a64'}
              size={120}
              delay={300}
            />
            <span className={`mt-2 text-xs font-medium ${
              results.exposure > 60 ? 'text-terra' : results.exposure > 35 ? 'text-amber-warm' : 'text-sage'
            }`}>
              {results.exposure > 60 ? 'High' : results.exposure > 35 ? 'Moderate' : 'Low'}
            </span>
          </div>
          <div className="flex flex-col items-center rounded-2xl border border-sand bg-canvas p-4 shadow-sm">
            <ScoreGauge
              score={results.resilience}
              label="Resilience"
              color={results.resilience >= 65 ? '#5a7a64' : results.resilience >= 40 ? '#b8862d' : '#8a8580'}
              size={120}
              delay={500}
            />
            <span className={`mt-2 text-xs font-medium ${
              results.resilience >= 65 ? 'text-sage' : results.resilience >= 40 ? 'text-amber-warm' : 'text-soft-slate'
            }`}>
              {results.resilience >= 65 ? 'Strong' : results.resilience >= 40 ? 'Moderate' : 'Developing'}
            </span>
          </div>
          <div className="flex flex-col items-center rounded-2xl border border-sand bg-canvas p-4 shadow-sm">
            <ScoreGauge
              score={results.readiness}
              label="Readiness"
              color={results.readiness >= 65 ? '#5a7a64' : results.readiness >= 40 ? '#b8862d' : '#8a8580'}
              size={120}
              delay={700}
            />
            <span className={`mt-2 text-xs font-medium ${
              results.readiness >= 65 ? 'text-sage' : results.readiness >= 40 ? 'text-amber-warm' : 'text-soft-slate'
            }`}>
              {results.readiness >= 65 ? 'Ready' : results.readiness >= 40 ? 'Building' : 'Starting'}
            </span>
          </div>
        </motion.div>
      </div>

      {/* ── Profile Card ── */}
      <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-5 rounded-2xl border border-sand bg-canvas p-6 sm:p-8"
        >
          <div className="mb-4 flex items-center gap-3">
            <span className="text-3xl">
              {results.profile === 'The Hidden Expert' ? '🌊' :
               results.profile === 'The Unaware Automator' ? '⚙️' :
               results.profile === 'The Calculated Adapter' ? '🧭' :
               results.profile === 'The Sleeping Giant' ? '🌋' :
               results.profile === 'The Bridge Builder' ? '🌉' :
               results.profile === 'The Steady Hand' ? '⚓' :
               results.profile === 'The Reluctant Skeptic' ? '🔥' : '🐴'}
            </span>
            <div>
              <h2 className="text-2xl font-bold text-ink">{results.profile}</h2>
              <p className="text-sm font-medium text-terra">{results.profileTagline}</p>
            </div>
          </div>
          <p className="text-sm leading-relaxed text-charcoal">
            {results.profileDescription}
          </p>
        </motion.div>

        {/* ── Insights Section ── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-5 space-y-4"
        >
          <h3 className="px-1 text-xs font-semibold uppercase tracking-wider text-soft-slate">
            What your answers actually say
          </h3>

          {/* Surprising Insight */}
          <div className="rounded-2xl border border-sand bg-canvas p-5 sm:p-6">
            <div className="mb-2 flex items-center gap-2">
              <span className="text-lg">💡</span>
              <h4 className="text-sm font-bold text-ink">The thing nobody&apos;s telling you</h4>
            </div>
            <p className="text-sm leading-relaxed text-charcoal">
              {results.surprisingInsight}
            </p>
          </div>

          {/* Real Moat */}
          <div className="rounded-2xl border-l-4 border-l-sage border-t-0 border-r-0 border-b-0 border-sand bg-canvas p-5 sm:p-6">
            <div className="mb-2 flex items-center gap-2">
              <span className="text-lg">🛡️</span>
              <h4 className="text-sm font-bold text-ink">Your real advantage</h4>
            </div>
            <p className="text-sm leading-relaxed text-charcoal">
              {results.realMoat}
            </p>
          </div>

          {/* Uncomfortable Truth */}
          <div className="rounded-2xl border-l-4 border-l-amber-warm border-t-0 border-r-0 border-b-0 border-sand bg-canvas p-5 sm:p-6">
            <div className="mb-2 flex items-center gap-2">
              <span className="text-lg">⚠️</span>
              <h4 className="text-sm font-bold text-ink">The uncomfortable truth</h4>
            </div>
            <p className="text-sm leading-relaxed text-charcoal">
              {results.uncomfortableTruth}
            </p>
          </div>

          {/* Blind Spot */}
          <div className="rounded-2xl border-l-4 border-l-terra border-t-0 border-r-0 border-b-0 border-sand bg-canvas p-5 sm:p-6">
            <div className="mb-2 flex items-center gap-2">
              <span className="text-lg">🎯</span>
              <h4 className="text-sm font-bold text-ink">Your blind spot</h4>
            </div>
            <p className="text-sm leading-relaxed text-charcoal">
              {results.blindSpot}
            </p>
          </div>
        </motion.div>

        {/* ── Next Steps ── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-5 rounded-2xl border border-sand bg-canvas p-5 sm:p-6"
        >
          <h3 className="mb-4 text-sm font-bold text-ink">
            What to do this week
          </h3>
          <div className="space-y-3">
            {results.nextSteps.map((step, i) => (
              <div key={i} className="flex items-start gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-terra-light text-xs font-bold text-terra">
                  {i + 1}
                </span>
                <p className="text-sm leading-relaxed text-charcoal">{step}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* ── Resources ── */}
        {results.resources.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-5 rounded-2xl border border-sand bg-canvas p-5 sm:p-6"
          >
            <h3 className="mb-4 text-sm font-bold text-ink">
              Recommended resources
            </h3>
            <div className="space-y-3">
              {results.resources.map((resource, i) => (
                <div
                  key={i}
                  className="rounded-xl bg-cream p-4"
                >
                  <div className="mb-1 flex items-center gap-2">
                    <span className="text-xs font-medium uppercase tracking-wider text-soft-slate">
                      {resource.type}
                    </span>
                  </div>
                  <h4 className="text-sm font-semibold text-ink">{resource.title}</h4>
                  <p className="mt-1 text-xs leading-relaxed text-charcoal">{resource.description}</p>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* ── Download Report ── */}
        <div className="mb-6 text-center">
          <DownloadReportButton results={results} />
        </div>

        {/* ── Share Your Results ── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-6 rounded-2xl border border-sand bg-canvas p-5 sm:p-6"
        >
          <div className="mb-4 text-center">
            <h3 className="text-lg font-bold text-ink">Share your results</h3>
            <p className="mt-1 text-sm text-soft-slate">
              Send this to someone who needs to hear it. They get a free assessment, you get the satisfaction of being right.
            </p>
          </div>

          {/* Copy Link Button */}
          <div className="mb-4 flex justify-center">
            <button
              onClick={handleCopyLink}
              className="inline-flex items-center gap-2 rounded-xl border-2 border-terra px-6 py-2.5 text-sm font-semibold text-terra transition-all hover:bg-terra/5 active:scale-[0.98]"
            >
              {linkCopied ? (
                <>
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Copied!
                </>
              ) : (
                <>
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                  </svg>
                  Copy Assessment Link
                </>
              )}
            </button>
          </div>

          {/* Shareable Quote Box */}
          <div className="mb-4 rounded-xl border-2 border-dashed border-sand bg-cream p-4 sm:p-5">
            <p className="whitespace-pre-line text-sm leading-relaxed text-charcoal">
              "I just found out I'm <span className="font-bold text-ink">{results.profile}</span> — my AI readiness score is{' '}
              <span className="font-bold text-terra">{results.readiness}/100</span>. Take the free 10-minute assessment:"
            </p>
            <p className="mt-2 text-xs font-medium text-soft-slate">{shareUrl}</p>
            <div className="mt-3 flex justify-end">
              <button
                onClick={handleCopyQuote}
                className="inline-flex items-center gap-1.5 rounded-lg bg-canvas px-3 py-1.5 text-xs font-medium text-charcoal shadow-sm transition-all hover:bg-white active:scale-[0.98]"
              >
                {quoteCopied ? (
                  <>
                    <svg className="h-3.5 w-3.5 text-sage" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-sage">Copied!</span>
                  </>
                ) : (
                  <>
                    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    Copy
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Email Share Button */}
          <div className="flex justify-center">
            <a
              href={`mailto:?subject=${emailSubject}&body=${emailBody}`}
              className="inline-flex items-center gap-2 rounded-xl border border-sand bg-canvas px-6 py-2.5 text-sm font-medium text-charcoal shadow-sm transition-all hover:bg-white hover:shadow active:scale-[0.98]"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              Share via Email
            </a>
          </div>
        </motion.div>

        {/* ── A Note from Benny ── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-5 rounded-2xl border border-sand bg-navy p-6 sm:p-8"
        >
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-terra/20">
              <span className="text-lg">✏️</span>
            </div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-white/90">
              A note from Benny
            </h3>
          </div>
          <div className="space-y-3 text-sm leading-relaxed text-white/70">
            <p>
              Hey — thanks for taking this seriously. Most people skim an assessment like this, see a score, and move on. You're still reading, which already puts you ahead.
            </p>
            <p>
              Here's the honest truth: this isn't a scientific diagnosis. It's a mirror. The questions are designed to surface patterns in how you actually work — not how you think you work. The frameworks behind it (OECD, McKinsey, Stanford) are real, but your results are directional, not definitive.
            </p>
            <p>
              Here's what I'd do with this report:
            </p>
            <ul className="ml-4 space-y-1.5 text-white/60">
              <li>• Pick the one insight that stings a little. That's the real one.</li>
              <li>• Ignore the urge to fix everything at once. Pick one thing for this week.</li>
              <li>• Come back in 30 days and retake it. See what shifted.</li>
            </ul>
            <p>
              If you want to talk through your results — whether for your own career or your team — reach out. I read every message.
            </p>
            <p className="pt-1 font-medium text-white/90">
              — Benny Carreon<br />
              <span className="text-xs font-normal text-white/40">Founder, AI Defense Project</span>
            </p>
          </div>
        </motion.div>

        {/* ── Restart ── */}
        <div className="text-center">
          <button
            onClick={() => {
              localStorage.removeItem('ai-defense-assessment-state');
              window.location.href = '/';
            }}
            className="text-sm text-soft-slate underline-offset-4 hover:text-charcoal hover:underline"
          >
            Retake Assessment
          </button>
        </div>

        {/* ── Disclaimer Footer ── */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="border-t border-sand pt-6 text-center"
        >
          <p className="text-xs leading-relaxed text-soft-slate">
            This assessment is for informational purposes and personal reflection. It's not a guarantee of career outcomes, a scientific study, or a replacement for professional career advice. It's a practical tool to help you think about where you stand with AI — and what to do next.
          </p>
          <p className="mt-2 text-xs text-sand-dark">
            © {new Date().getFullYear()} AI Defense Project · Velocity Technology Group
          </p>
        </motion.div>
      </div>
    </div>
  );
}

function DownloadReportButton({ results }: { results: AssessmentResults }) {
  const [downloading, setDownloading] = useState(false);

  const handleDownload = async () => {
    setDownloading(true);
    try {
      const res = await fetch('/api/generate-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ results }),
      });

      if (!res.ok) throw new Error('Failed to generate PDF');

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `ai-defense-${results.profile.toLowerCase().replace(/\s+/g, '-')}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Download failed:', err);
      alert('Something went wrong generating your report. Please try again.');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <button
      onClick={handleDownload}
      disabled={downloading}
      className="inline-flex items-center gap-2 rounded-xl bg-terra px-8 py-3 font-semibold text-white shadow-sm transition-all hover:bg-terra-dark hover:shadow-md active:scale-[0.98] disabled:opacity-60"
    >
      {downloading ? (
        <>
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
          Generating Report...
        </>
      ) : (
        <>
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Download Your Report
        </>
      )}
    </button>
  );
}