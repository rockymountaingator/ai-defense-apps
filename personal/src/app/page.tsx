'use client';

import { useState, useEffect, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { questions } from '@/lib/questions';
import { calculateResults } from '@/lib/scoring';
import { AssessmentState, Answer, AssessmentResults } from '@/lib/types';
import { initAffiliateTracking } from '@/lib/affiliate';
import WelcomeScreen from '@/components/WelcomeScreen';
import QuestionCard from '@/components/QuestionCard';
import ProgressBar from '@/components/ProgressBar';
import LoadingResults from '@/components/LoadingResults';

const STORAGE_KEY = 'ai-defense-assessment-state';

function loadState(): AssessmentState {
  if (typeof window === 'undefined') {
    return { currentQuestion: 0, answers: [], started: false, completed: false, emailCollected: false };
  }
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch {
    // ignore
  }
  return { currentQuestion: 0, answers: [], started: false, completed: false, emailCollected: false };
}

function saveState(state: AssessmentState) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // ignore
  }
}

export default function AssessmentPage() {
  const [state, setState] = useState<AssessmentState>({
    currentQuestion: 0,
    answers: [],
    started: false,
    completed: false,
    emailCollected: false,
  });
  const [results, setResults] = useState<AssessmentResults | null>(null);
  const [mounted, setMounted] = useState(false);
  const [emailInput, setEmailInput] = useState('');

  useEffect(() => {
    const loaded = loadState();
    setState(loaded);
    if (loaded.completed && loaded.results) {
      setResults(loaded.results);
    }
    // Initialize affiliate tracking from ?ref= URL param
    initAffiliateTracking();
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) {
      saveState(state);
    }
  }, [state, mounted]);

  const handleStart = useCallback(() => {
    setState((prev) => ({ ...prev, started: true, currentQuestion: 0 }));
  }, []);

  const handleAnswer = useCallback((answer: Answer) => {
    setState((prev) => {
      const newAnswers = prev.answers.filter((a) => a.questionId !== answer.questionId);
      newAnswers.push(answer);
      const nextQuestion = prev.currentQuestion + 1;
      const isComplete = nextQuestion >= questions.length;

      return {
        ...prev,
        answers: newAnswers,
        currentQuestion: nextQuestion,
        completed: isComplete,
      };
    });
  }, []);

  const handleGoBack = useCallback(() => {
    setState((prev) => ({
      ...prev,
      currentQuestion: Math.max(0, prev.currentQuestion - 1),
    }));
  }, []);

  const handleResultsReady = useCallback(() => {
    const calculated = calculateResults(state.answers);
    setResults(calculated);
    setState((prev) => ({ ...prev, results: calculated }));
  }, [state.answers]);

  const handleRestart = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setState({ currentQuestion: 0, answers: [], started: false, completed: false, emailCollected: false });
    setResults(null);
  }, []);

  if (!mounted) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-terra border-t-transparent" />
      </div>
    );
  }

  // Email gate after questions complete
  if (state.completed && !state.emailCollected) {
    const handleSubmitEmail = async (e: React.FormEvent) => {
      e.preventDefault();
      const email = emailInput.trim();
      if (!email) return;

      setState(prev => ({ ...prev, email, emailCollected: true }));

      // Calculate and save results
      const calculated = calculateResults(state.answers);
      setResults(calculated);
      setState(prev => ({ ...prev, results: calculated }));

      // Save to database
      try {
        const affiliateCode = localStorage.getItem('ai-defense-affiliate-code');
        const promoData = localStorage.getItem('ai-defense-promo-code');

        await fetch('/api/save-assessment', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email,
            pathwayTitle: calculated.profile,
            results: {
              exposure: calculated.exposure,
              resilience: calculated.resilience,
              readiness: calculated.readiness,
              profile: calculated.profile,
              profileTagline: calculated.profileTagline,
            },
            affiliate_code: affiliateCode || null,
            promo_code: promoData ? JSON.parse(promoData).code : null,
          }),
        });
      } catch {
        // Silent fail — results are saved in state
      }
    };

    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex min-h-screen items-center justify-center p-6"
      >
        <div className="w-full max-w-md">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="rounded-2xl border border-sand bg-canvas p-8 shadow-sm"
          >
            <div className="mb-6 text-center">
              <div className="mb-4 text-4xl">📧</div>
              <h2 className="mb-2 text-2xl font-bold text-ink">One more thing</h2>
              <p className="text-charcoal">
                Where should we send your personalized report?
              </p>
            </div>

            <form onSubmit={handleSubmitEmail} className="space-y-4">
              <div>
                <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-ink">
                  Email address
                </label>
                <input
                  id="email"
                  type="email"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  placeholder="you@example.com"
                  required
                  className="w-full rounded-lg border border-sand bg-white px-4 py-3 text-ink placeholder:text-soft-slate/60 focus:border-terra focus:outline-none focus:ring-1 focus:ring-terra"
                />
              </div>

              <button
                type="submit"
                disabled={!emailInput.trim()}
                className="w-full rounded-xl bg-terra px-6 py-3 font-semibold text-white transition-all hover:bg-terra-dark hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50"
              >
                Get My Results
              </button>

              <p className="text-center text-xs text-soft-slate">
                We&apos;ll never spam you. Unsubscribe anytime.
              </p>
            </form>
          </motion.div>
        </div>
      </motion.div>
    );
  }

  // Loading results
  if (state.completed && !results) {
    return <LoadingResults onReady={handleResultsReady} />;
  }

  // Results ready — show link
  if (results) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex min-h-screen items-center justify-center p-6"
      >
        <div className="text-center">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="mb-6 text-6xl"
          >
            ✨
          </motion.div>
          <h2 className="mb-3 text-2xl font-bold text-ink">All done</h2>
          <p className="mb-6 text-charcoal">
            Your personalized results are ready to view.
          </p>
          <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <a
              href="/results"
              className="inline-flex items-center gap-2 rounded-xl bg-terra px-8 py-3 font-semibold text-white transition-all hover:bg-terra-dark hover:shadow-md"
            >
              View Your Results
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </a>
            <button
              onClick={handleRestart}
              className="text-sm text-soft-slate underline-offset-4 hover:text-ink hover:underline"
            >
              Start Over
            </button>
          </div>
        </div>
      </motion.div>
    );
  }

  // Welcome screen
  if (!state.started) {
    return <WelcomeScreen onStart={handleStart} />;
  }

  // Questions
  const currentQ = questions[state.currentQuestion];
  if (!currentQ) return null;

  const currentAnswer = state.answers.find((a) => a.questionId === currentQ.id);

  return (
    <div className="flex min-h-screen flex-col">
      <ProgressBar current={state.currentQuestion} total={questions.length} />

      <div className="flex flex-1 items-center justify-center p-4 sm:p-6">
        <div className="w-full max-w-2xl">
          {/* Back button */}
          {state.currentQuestion > 0 && (
            <button
              onClick={handleGoBack}
              className="mb-4 flex items-center gap-1 text-sm text-soft-slate transition-colors hover:text-ink"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back
            </button>
          )}

          <AnimatePresence mode="wait">
            <QuestionCard
              key={currentQ.id}
              question={currentQ}
              currentAnswer={currentAnswer}
              onAnswer={handleAnswer}
              questionNumber={state.currentQuestion + 1}
              totalQuestions={questions.length}
            />
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}