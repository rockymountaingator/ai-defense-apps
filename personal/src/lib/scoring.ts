import { Answer, AssessmentResults, HiddenScores, ResourceRecommendation } from './types';
import { questions } from './questions';
import { profiles, getProfile } from './pathways';

function clamp(v: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, v));
}

function weightedAverage(
  answers: Answer[],
  dimension: 'routine' | 'human' | 'adapt' | 'selfPerception' | 'depth',
): number {
  let totalWeighted = 0;
  let totalWeight = 0;

  for (const answer of answers) {
    const q = questions.find((q) => q.id === answer.questionId);
    if (!q) continue;
    const opt = q.options[answer.optionIndex];
    if (!opt) continue;

    totalWeighted += opt[dimension] * q.weight;
    totalWeight += q.weight;
  }

  return totalWeight > 0 ? totalWeighted / totalWeight : 50;
}

// Cross-validation: compare self-perception answers vs behavioral answers
function detectPerceptionGap(answers: Answer[]): number {
  // Behavioral questions (format 'behavioral') show actual behavior
  const behavioralIds = questions.filter(q => q.format === 'behavioral').map(q => q.id);
  // Questions where selfPerception scores high = tendency to over-rate
  const claimIds = questions.filter(q => q.format === 'word-snap' || q.format === 'impossible').map(q => q.id);

  let behavioralRoutine = 0;
  let behavioralCount = 0;
  let claimAdapt = 0;
  let claimCount = 0;

  for (const answer of answers) {
    const q = questions.find(q => q.id === answer.questionId);
    if (!q) continue;
    const opt = q.options[answer.optionIndex];
    if (!opt) continue;

    if (behavioralIds.includes(answer.questionId)) {
      behavioralRoutine += opt.routine;
      behavioralCount++;
    }
    if (claimIds.includes(answer.questionId)) {
      claimAdapt += opt.adapt;
      claimCount++;
    }
  }

  if (behavioralCount === 0 || claimCount === 0) return 50;

  const avgBehavioralRoutine = behavioralRoutine / behavioralCount;
  const avgClaimAdapt = claimAdapt / claimCount;

  // Gap: high self-rated adaptability + high behavioral routine = big gap
  // Scale: 0 (no gap) to 100 (huge gap)
  const gap = ((avgClaimAdapt / 100) * (avgBehavioralRoutine / 100)) * 200;
  return clamp(gap, 0, 100);
}

export function calculateResults(answers: Answer[]): AssessmentResults {
  // ── Hidden Scores ──
  const routineIndex = weightedAverage(answers, 'routine');
  const humanAdvantage = weightedAverage(answers, 'human');
  const adaptQuotient = weightedAverage(answers, 'adapt');
  const selfPerceptionRaw = weightedAverage(answers, 'selfPerception');
  const depthIndex = weightedAverage(answers, 'depth');
  const perceptionGap = detectPerceptionGap(answers);

  const hiddenScores: HiddenScores = {
    routineIndex,
    humanAdvantage,
    adaptQuotient,
    selfPerceptionGap: perceptionGap,
    depthIndex,
  };

  // ── Public Scores (mapped from hidden, inverted where needed) ──
  // Exposure: high routine = high exposure
  const exposure = clamp(Math.round(routineIndex * 0.6 + (100 - humanAdvantage) * 0.3 + (100 - adaptQuotient) * 0.1), 0, 100);
  // Resilience: high human advantage + low routine
  const resilience = clamp(Math.round(humanAdvantage * 0.6 + (100 - routineIndex) * 0.25 + depthIndex * 0.15), 0, 100);
  // Readiness: high adapt + low perception gap + depth
  const readiness = clamp(Math.round(adaptQuotient * 0.5 + depthIndex * 0.25 + (100 - perceptionGap) * 0.25), 0, 100);

  // ── Profile ──
  const profile = getProfile(exposure, resilience, readiness, perceptionGap, depthIndex);

  // ── Insights ──
  const surprisingInsight = generateSurprisingInsight(answers, hiddenScores);
  const uncomfortableTruth = generateUncomfortableTruth(answers, hiddenScores);
  const realMoat = generateRealMoat(answers, hiddenScores);
  const blindSpot = generateBlindSpot(answers, hiddenScores);

  // ── Recommendations ──
  const nextSteps = generateNextSteps(profile.id, hiddenScores);
  const resources = generateResources(profile.id, hiddenScores);

  return {
    exposure,
    resilience,
    readiness,
    profile: profile.title,
    profileTagline: profile.tagline,
    profileDescription: profile.description,
    surprisingInsight,
    uncomfortableTruth,
    realMoat,
    blindSpot,
    nextSteps,
    resources,
    hiddenScores,
    answers,
  };
}

// ── Insight Generators ──

function getTopAnswer(answers: Answer[], questionIds: number[]): { qId: number; optIndex: number } | null {
  for (const qId of questionIds) {
    const a = answers.find(a => a.questionId === qId);
    if (a) return { qId, optIndex: a.optionIndex };
  }
  return null;
}

function generateSurprisingInsight(answers: Answer[], scores: HiddenScores): string {
  // Cross-reference behavioral vs stated orientation
  const q3 = answers.find(a => a.questionId === 3);
  const q14 = answers.find(a => a.questionId === 14);
  const q17 = answers.find(a => a.questionId === 17);

  // If they say AI can't touch their work but their behavioral answers show routine
  if (q17 && q17.optionIndex === 2 && scores.routineIndex > 60) {
    return 'You said AI "can\'t do what matters in your work" — but your answers describe a work life built around execution, organization, and throughput. Those are exactly the things AI is getting good at fastest. The disconnect isn\'t about whether AI is real — it\'s about how you\'re defining "what matters."';
  }

  if (q14 && q14.optionIndex === 0 && q3 && q3.optionIndex === 0) {
    return 'You picked "nail it perfectly" over curiosity, and your free hour went to catching up on emails. You value reliability — and that\'s genuinely admirable. But reliability on repeatable tasks is exactly what machines are built for. Your edge isn\'t in doing the same thing well — it\'s in your judgment about when the same thing isn\'t working anymore.';
  }

  if (scores.selfPerceptionGap > 60) {
    return 'There\'s a meaningful gap between how you see yourself and what your actual work behavior shows. You\'re drawn to words like "momentum" and "craft" but your daily rhythm tells a different story — one that\'s more structured and repeatable than you might realize. This isn\'t a flaw; it\'s a signal that your self-image hasn\'t caught up to your reality.';
  }

  if (scores.humanAdvantage > 70) {
    return 'You genuinely operate in the human layer — conversations, coordination, reading situations. That\'s real and it\'s your biggest asset. But here\'s what most people miss: AI is getting better at augmenting even the human layer. Your moat isn\'t just "I work with people" — it\'s the quality of your judgment in those interactions. That\'s the part worth investing in.';
  }

  return 'Your answers paint a picture of someone who\'s built their career on being dependable and thorough. Those are real strengths. But the landscape is shifting — and the question isn\'t whether you\'re good at what you do. It\'s whether what you\'re good at is going to be the thing that matters most in five years.';
}

function generateUncomfortableTruth(answers: Answer[], scores: HiddenScores): string {
  const q5 = answers.find(a => a.questionId === 5);
  const q15 = answers.find(a => a.questionId === 15);

  if (scores.selfPerceptionGap > 55) {
    if (q5 && q5.optionIndex === 0) {
      return 'You said the most satisfying part of work is "executing something I\'m really good at." That\'s honest — and it\'s also a warning sign. Mastery of a repeatable process feels amazing. But the better you get at something repeatable, the more efficiently a machine can learn to do it. Satisfaction and security aren\'t the same thing.';
    }
    return 'You see yourself as more adaptive and creative than your behavioral answers suggest. That\'s not unusual — most of us have a "story" about who we are at work. But the gap between your story and your daily reality is where AI will show up first. Not because AI is coming for creative people — but because the creative parts of your job might be smaller than you think.';
  }

  if (scores.routineIndex > 65) {
    return 'Your work has a lot of rhythm — emails, organization, execution, lists. You might not think of it as "routine" because you do it well and it feels important. But routine isn\'t about importance — it\'s about predictability. And predictable work is the first to be augmented.';
  }

  return 'You have decent awareness of where you stand. That\'s actually rare — most people either panic or dismiss. Your blind spot is smaller than most, which means the biggest risk for you isn\'t being caught off guard — it\'s being comfortable enough that you don\'t act on what you already know.';
}

function generateRealMoat(answers: Answer[], scores: HiddenScores): string {
  if (scores.humanAdvantage > 70) {
    return 'Your genuine advantage is relational intelligence — reading situations, bridging gaps between people, knowing when to push and when to listen. AI can generate text, but it can\'t read a room that hasn\'t been defined yet. Invest in this. Deepen it. It\'s not just "soft skills" — it\'s the hardest thing to automate.';
  }

  if (scores.depthIndex > 65) {
    return 'Your self-awareness is unusually high. You don\'t just answer questions — you think about why you\'re answering them that way. That meta-cognition is your superpower. It means you\'ll adapt faster than most, because you\'re already calibrated to your own blind spots. Keep leaning into that.';
  }

  if (scores.adaptQuotient > 65) {
    return 'You\'re genuinely adaptable — not in the "I\'m flexible!" way everyone claims, but in the behavioral evidence sense. You choose curiosity over comfort, you seek out the unfamiliar, and you\'re not threatened by not knowing something yet. That\'s rarer than you think, and it\'s the single best predictor of thriving through disruption.';
  }

  return 'Your honest engagement with these questions — especially the uncomfortable ones — shows a level of self-reflection that many people never reach. That\'s not nothing. It means you\'re already ahead of people who are pretending this isn\'t happening. Now the question is what you\'ll do with that awareness.';
}

function generateBlindSpot(answers: Answer[], scores: HiddenScores): string {
  if (scores.routineIndex > 60 && scores.selfPerceptionGap < 40) {
    return 'You may be underestimating how much of your work follows patterns. Not because you\'re not smart — but because you\'re so good at the pattern that it doesn\'t feel like one anymore. When you can do something without thinking about it, that\'s precisely when a machine can learn to do it.';
  }

  if (scores.humanAdvantage > 65 && scores.adaptQuotient < 40) {
    return 'You\'re strong in the human layer, but you may be using that as a shield. "AI can\'t do empathy" is true today — but it\'s a dangerous comfort zone. The people who thrive won\'t be the ones who are the most human. They\'ll be the ones who combine human insight with AI capability.';
  }

  if (scores.adaptQuotient > 60 && scores.depthIndex < 40) {
    return 'You\'re quick to embrace new things — but you might be drawn to novelty over depth. Being first to try something isn\'t the same as being thoughtful about what it means. Speed of adoption matters less than depth of understanding.';
  }

  return 'Watch for the moment when you catch yourself saying "that won\'t affect me" about something AI-related. That sentence is doing a lot of work in your psyche. Every time it comes up, ask: "Is that based on evidence, or based on how much I don\'t want it to be true?"';
}

// ── Next Steps ──

function generateNextSteps(profileId: string, scores: HiddenScores): string[] {
  const steps: string[] = [];

  if (scores.routineIndex > 60) {
    steps.push('Audit one week of work: mark every task as "requires my judgment" or "follows a pattern." The ratio will tell you more than any assessment.');
  }
  if (scores.humanAdvantage > 60) {
    steps.push('Your human advantage is real — make it bigger. Pick one relationship at work that could become a strategic asset and invest in it this month.');
  }
  if (scores.adaptQuotient < 40) {
    steps.push('Spend 15 minutes a day with an AI tool — not to master it, just to demystify it. The fear of the unknown is doing more damage than the technology itself.');
  }
  if (scores.selfPerceptionGap > 50) {
    steps.push('Ask a trusted colleague: "What do you think I actually spend most of my time doing?" Compare their answer to yours. The gap is gold.');
  }
  if (scores.depthIndex > 60) {
    steps.push('Your self-awareness is an asset — don\'t waste it on navel-gazing. Pick one specific action from this report and do it this week. Reflection without action is just rumination.');
  }

  if (steps.length === 0) {
    steps.push('Pick one AI tool this week and use it for a real work task. Not a tutorial — a real task. Experience beats theory every time.');
  }

  return steps.slice(0, 5);
}

// ── Resources ──

function generateResources(profileId: string, scores: HiddenScores): ResourceRecommendation[] {
  const resources: ResourceRecommendation[] = [];

  if (scores.routineIndex > 55) {
    resources.push({
      title: 'The Automation Audit Workbook',
      description: 'A step-by-step guide to identifying which parts of your work are most exposed to automation — and what to do about each one.',
      type: 'guide',
    });
  }

  if (scores.adaptQuotient < 50) {
    resources.push({
      title: 'AI Demystified: A No-Hype Introduction',
      description: 'A plain-language guide to what AI can actually do right now (not what Twitter says it can do). Built for skeptics and the cautiously curious.',
      type: 'guide',
    });
  }

  if (scores.humanAdvantage > 60) {
    resources.push({
      title: 'The Human Advantage Playbook',
      description: 'How to invest in the skills AI can\'t replicate — relational intelligence, situational judgment, and creative synthesis.',
      type: 'guide',
    });
  }

  resources.push({
    title: 'Personalized AI Readiness Roadmap',
    description: 'A 90-day plan tailored to your profile — specific tools to try, skills to build, and milestones to hit.',
    type: 'service',
  });

  return resources;
}
