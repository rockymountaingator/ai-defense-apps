// ── Profile System ──
// Profiles are determined by the intersection of exposure, resilience, readiness,
// and the self-perception gap. They're designed to feel insightful, not flattering.

export interface Profile {
  id: string;
  title: string;
  tagline: string;
  description: string;
  color: string;       // Tailwind color class for accents
  icon: string;        // Emoji or icon reference
}

export const profiles: Profile[] = [
  {
    id: 'hidden-expert',
    title: 'The Hidden Expert',
    tagline: 'Your real value is invisible — even to you.',
    description: 'You operate in the human layer — relationships, judgment, reading situations that haven\'t been defined yet. You might not think of this as your "skill" because it feels natural. But natural is exactly what machines can\'t fake. Your risk isn\'t AI replacing you — it\'s you not recognizing what makes you irreplaceable.',
    color: 'blue',
    icon: '🌊',
  },
  {
    id: 'unaware-automator',
    title: 'The Unaware Automator',
    tagline: 'You\'re better than your tasks — but your tasks are what AI sees.',
    description: 'Your daily work is more pattern-driven than you realize. Not because you\'re not smart — because you\'re so efficient that the pattern doesn\'t feel like one. The skills you take for granted (organization, throughput, reliability) are exactly what AI trains on first. The good news: you have the discipline to adapt. The question is whether you\'ll start before you have to.',
    color: 'amber',
    icon: '⚙️',
  },
  {
    id: 'calculated-adaptor',
    title: 'The Calculated Adapter',
    tagline: 'You see it coming. But seeing isn\'t the same as moving.',
    description: 'You have above-average awareness of what\'s changing and decent self-knowledge about where you stand. That puts you ahead of most. But awareness without action is just anxiety with better branding. Your risk isn\'t ignorance — it\'s comfort. You know enough to be concerned but not enough to be motivated. Yet.',
    color: 'green',
    icon: '🧭',
  },
  {
    id: 'sleeping-giant',
    title: 'The Sleeping Giant',
    tagline: 'More capable than you think. Less prepared than you hope.',
    description: 'Your behavioral answers show genuine depth — real adaptability, real human insight, real self-awareness. But something is holding you back from acting on what you know. Maybe it\'s inertia, maybe it\'s skepticism, maybe it\'s just bandwidth. Whatever it is, the gap between what you could do and what you\'re doing is the biggest risk on your radar.',
    color: 'purple',
    icon: '🌋',
  },
  {
    id: 'bridge-builder',
    title: 'The Bridge Builder',
    tagline: 'You connect what others can\'t. That\'s rare — and about to get rarer.',
    description: 'You operate at the intersection of people, ideas, and execution. You translate between departments, spot misalignment before it becomes conflict, and make things happen through influence rather than authority. AI can draft emails and summarize meetings, but it can\'t read the subtext of why a project is stalled. That\'s you. Protect that.',
    color: 'cyan',
    icon: '🌉',
  },
  {
    id: 'steady-hand',
    title: 'The Steady Hand',
    tagline: 'Reliable, trusted, and more exposed than anyone is telling you.',
    description: 'You\'re the person people count on. You deliver consistently, you catch what others miss, and you don\'t drop the ball. That\'s earned you trust and stability. But reliability on predictable tasks is a depreciating asset. Not because you\'re not valuable — because the market is redefining what "valuable" means. The good news: your discipline is transferable. You just need to point it somewhere new.',
    color: 'slate',
    icon: '⚓',
  },
  {
    id: 'reluctant-skeptic',
    title: 'The Reluctant Skeptic',
    tagline: 'Your instincts are sharp. Your timing might not be.',
    description: 'You\'re not buying the AI hype — and honestly, some of your skepticism is warranted. A lot of what\'s being sold as "revolutionary" is just good marketing. But dismissing the whole thing because the messaging is annoying is like ignoring a hurricane because the weatherman is obnoxious. The signal is real even if the noise is loud. The question isn\'t whether AI is overhyped — it\'s whether you\'re using the hype as an excuse to stand still.',
    color: 'red',
    icon: '🔥',
  },
  {
    id: 'dark-horse',
    title: 'The Dark Horse',
    tagline: 'Nobody sees you coming. Including, maybe, you.',
    description: 'Your answers don\'t fit the usual patterns. You\'re a mix of self-aware and surprising, structured and adaptive. That makes you hard to categorize — and hard to replace. Your challenge isn\'t exposure to AI; it\'s that you might not be leveraging your unconventional strengths deliberately enough. You\'re operating on instinct. Time to make it strategy.',
    color: 'violet',
    icon: '🐴',
  },
];

export function getProfile(
  exposure: number,
  resilience: number,
  readiness: number,
  perceptionGap: number,
  depth: number,
): Profile {
  // Score-based profile matching
  // Each profile has a "natural habitat" in the score space

  const scores = {
    'hidden-expert': resilience * 0.5 + (100 - exposure) * 0.2 + depth * 0.2 + (100 - perceptionGap) * 0.1,
    'unaware-automator': exposure * 0.5 + (100 - resilience) * 0.25 + perceptionGap * 0.15 + (100 - readiness) * 0.1,
    'calculated-adaptor': readiness * 0.4 + depth * 0.2 + (100 - perceptionGap) * 0.2 + resilience * 0.1 + (100 - exposure) * 0.1,
    'sleeping-giant': depth * 0.35 + resilience * 0.2 + (100 - readiness) * 0.2 + (100 - perceptionGap) * 0.15 + (100 - exposure) * 0.1,
    'bridge-builder': resilience * 0.4 + (100 - exposure) * 0.25 + depth * 0.15 + readiness * 0.1 + (100 - perceptionGap) * 0.1,
    'steady-hand': exposure * 0.35 + (100 - readiness) * 0.25 + (100 - perceptionGap) * 0.15 + (100 - resilience) * 0.15 + depth * 0.1,
    'reluctant-skeptic': perceptionGap * 0.3 + (100 - readiness) * 0.25 + exposure * 0.2 + (100 - depth) * 0.15 + resilience * 0.1,
    'dark-horse': Math.abs(exposure - 50) < 20 ? 60 : 20 // Rewards balanced/ambiguous scores
      + Math.abs(resilience - 50) < 20 ? 20 : 0
      + depth * 0.2,
  };

  let bestProfile = 'calculated-adaptor';
  let bestScore = -1;

  for (const [id, score] of Object.entries(scores)) {
    if (score > bestScore) {
      bestScore = score;
      bestProfile = id;
    }
  }

  return profiles.find(p => p.id === bestProfile) || profiles[2]; // fallback to calculated adaptor
}
