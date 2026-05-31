'use client';

import { motion } from 'framer-motion';
import { Question, Answer } from '@/lib/types';
import { formatLabels } from '@/lib/questions';

interface QuestionCardProps {
  question: Question;
  currentAnswer?: Answer;
  onAnswer: (answer: Answer) => void;
  questionNumber: number;
  totalQuestions: number;
}

const formatStyles: Record<string, { badge: string; icon: string }> = {
  'word-snap': { badge: 'bg-terra-light text-terra-dark', icon: '⚡' },
  'behavioral': { badge: 'bg-sage-light text-sage-dark', icon: '🔍' },
  'impossible': { badge: 'bg-mist text-charcoal', icon: '⚖️' },
  'fill-blank': { badge: 'bg-terra-light text-terra-dark', icon: '✏️' },
  'honest-mirror': { badge: 'bg-sage-light text-sage-dark', icon: '🪞' },
};

export default function QuestionCard({
  question,
  currentAnswer,
  onAnswer,
  questionNumber,
  totalQuestions,
}: QuestionCardProps) {
  const style = formatStyles[question.format] || formatStyles['word-snap'];
  const isImpossible = question.format === 'impossible';

  const handleSelect = (index: number) => {
    const option = question.options[index];
    onAnswer({
      questionId: question.id,
      optionIndex: index,
      optionText: option.text,
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -40 }}
      transition={{ duration: 0.35, ease: 'easeInOut' }}
      className="w-full"
    >
      <div className="rounded-2xl border border-sand bg-canvas p-6 sm:p-8">
        {/* Badges */}
        <div className="mb-5 flex items-center gap-3">
          <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${style.badge}`}>
            <span>{style.icon}</span>
            {formatLabels[question.format]}
          </span>
          <span className="text-xs text-soft-slate">
            {questionNumber} of {totalQuestions}
          </span>
        </div>

        {/* Question */}
        <h2
          className="mb-2 text-xl font-bold leading-snug text-ink sm:text-2xl"
          style={{ letterSpacing: '-0.01em' }}
        >
          {question.question}
        </h2>

        {/* Context */}
        {question.description && (
          <p className="mb-6 text-sm leading-relaxed text-soft-slate">
            {question.description}
          </p>
        )}

        {/* Options */}
        <div className={`mt-6 ${isImpossible ? 'space-y-3' : 'space-y-2.5'}`}>
          {question.options.map((option, index) => {
            const isSelected = currentAnswer?.optionIndex === index;
            return (
              <motion.button
                key={index}
                whileHover={{ scale: 1.005 }}
                whileTap={{ scale: 0.995 }}
                onClick={() => handleSelect(index)}
                className={`w-full rounded-xl border px-4 py-3.5 text-left text-sm transition-all ${
                  isImpossible
                    ? isSelected
                      ? 'border-terra bg-terra-light text-ink'
                      : 'border-sand bg-canvas text-charcoal hover:border-sand-dark hover:bg-cream'
                    : isSelected
                      ? 'border-terra bg-terra-light text-ink'
                      : 'border-sand bg-canvas text-charcoal hover:border-sand-dark hover:bg-cream'
                }`}
              >
                <div className="flex items-start gap-3">
                  {/* Radio circle */}
                  <div
                    className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-all ${
                      isSelected ? 'border-terra bg-terra' : 'border-sand-dark bg-canvas'
                    }`}
                  >
                    {isSelected && <div className="h-2 w-2 rounded-full bg-white" />}
                  </div>
                  <span className={isSelected ? 'font-medium' : ''}>{option.text}</span>
                </div>
              </motion.button>
            );
          })}
        </div>

        {/* Format hint for impossible choices */}
        {isImpossible && (
          <p className="mt-4 text-center text-xs text-soft-slate italic">
            There&apos;s no wrong answer — just pick the one that feels truer.
          </p>
        )}
      </div>
    </motion.div>
  );
}
