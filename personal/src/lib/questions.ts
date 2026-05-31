import { Question } from './types';

export const questions: Question[] = [
  // ═══════════════════════════════════════════════
  // SECTION 1: Word Snap + Behavioral Memory (Q1-Q8)
  // ═══════════════════════════════════════════════

  // ── Q1: Word Snap ──
  {
    id: 1,
    format: 'word-snap',
    section: 1,
    sectionTitle: 'Part 1',
    question: 'First word that grabs you.',
    options: [
      { text: 'Structure', label: 'structure', routine: 70, human: 20, adapt: 30, selfPerception: 40, depth: 30 },
      { text: 'Momentum', label: 'momentum', routine: 30, human: 30, adapt: 80, selfPerception: 50, depth: 40 },
      { text: 'Craft', label: 'craft', routine: 40, human: 60, adapt: 40, selfPerception: 70, depth: 50 },
      { text: 'Connection', label: 'connection', routine: 15, human: 85, adapt: 50, selfPerception: 45, depth: 45 },
    ],
    crossValidate: ['orientation', 'adapt-claim'],
    weight: 0.8,
  },

  // ── Q2: Word Snap ──
  {
    id: 2,
    format: 'word-snap',
    section: 1,
    sectionTitle: 'Part 1',
    question: 'Pick the phrase.',
    options: [
      { text: '"I built this"', routine: 45, human: 30, adapt: 50, selfPerception: 65, depth: 35 },
      { text: '"I saw this coming"', routine: 30, human: 25, adapt: 55, selfPerception: 75, depth: 30 },
      { text: '"I brought people together"', routine: 10, human: 90, adapt: 60, selfPerception: 50, depth: 50 },
      { text: '"I figured it out"', routine: 50, human: 35, adapt: 65, selfPerception: 55, depth: 45 },
    ],
    crossValidate: ['orientation'],
    weight: 0.8,
  },

  // ── Q3: Behavioral Memory ──
  {
    id: 3,
    format: 'behavioral',
    section: 1,
    sectionTitle: 'Part 1',
    question: 'Think about the last time you had a free hour at work — no meetings, no deadlines. What did you actually do with it?',
    description: 'Be honest. What really happened.',
    options: [
      { text: 'Caught up on emails and messages I\'d been ignoring', routine: 85, human: 15, adapt: 20, selfPerception: 20, depth: 60 },
      { text: 'Started something new I\'d been thinking about', routine: 20, human: 40, adapt: 85, selfPerception: 70, depth: 55 },
      { text: 'Helped a colleague who was stuck', routine: 10, human: 90, adapt: 55, selfPerception: 65, depth: 50 },
      { text: 'Organized my files, inbox, or project tracker', routine: 75, human: 10, adapt: 25, selfPerception: 45, depth: 35 },
    ],
    crossValidate: ['routine-behavior', 'adapt-behavior'],
    weight: 1.2,
  },

  // ── Q4: Behavioral Memory ──
  {
    id: 4,
    format: 'behavioral',
    section: 1,
    sectionTitle: 'Part 1',
    question: 'Your most productive day last month — what made it productive?',
    options: [
      { text: 'Crossed off a big to-do list', routine: 80, human: 15, adapt: 25, selfPerception: 40, depth: 25 },
      { text: 'Solved a problem nobody else could figure out', routine: 25, human: 70, adapt: 60, selfPerception: 80, depth: 55 },
      { text: 'Had a meeting where everything clicked and we made real progress', routine: 15, human: 85, adapt: 50, selfPerception: 55, depth: 50 },
      { text: 'Finished something I\'d been stuck on for a while', routine: 45, human: 40, adapt: 70, selfPerception: 60, depth: 50 },
    ],
    crossValidate: ['routine-behavior', 'human-behavior'],
    weight: 1.2,
  },

  // ── Q5: Behavioral Memory ──
  {
    id: 5,
    format: 'behavioral',
    section: 1,
    sectionTitle: 'Part 1',
    question: 'Last time work felt genuinely satisfying. What were you doing?',
    options: [
      { text: 'Executing something I\'m really good at', routine: 75, human: 20, adapt: 25, selfPerception: 70, depth: 30 },
      { text: 'Learning something that changed how I think about a problem', routine: 15, human: 45, adapt: 90, selfPerception: 65, depth: 65 },
      { text: 'Helping someone through a tough situation', routine: 10, human: 90, adapt: 45, selfPerception: 55, depth: 55 },
      { text: 'Building or designing something from scratch', routine: 20, human: 65, adapt: 75, selfPerception: 75, depth: 50 },
    ],
    crossValidate: ['routine-behavior', 'adapt-behavior'],
    weight: 1.1,
  },

  // ── Q6: Behavioral Memory ──
  {
    id: 6,
    format: 'behavioral',
    section: 1,
    sectionTitle: 'Part 1',
    question: 'A project you\'re proud of. If someone asked you to explain it, you\'d focus on:',
    options: [
      { text: 'The results — what changed because of it', routine: 55, human: 25, adapt: 40, selfPerception: 50, depth: 30 },
      { text: 'The process — how you approached it and why', routine: 60, human: 30, adapt: 50, selfPerception: 60, depth: 50 },
      { text: 'The people — who was involved and how you worked together', routine: 10, human: 90, adapt: 55, selfPerception: 50, depth: 55 },
      { text: 'The challenge — what was hard and how you got through it', routine: 30, human: 50, adapt: 70, selfPerception: 65, depth: 60 },
    ],
    crossValidate: ['orientation', 'human-behavior'],
    weight: 1.0,
  },

  // ── Q7: Behavioral Memory ──
  {
    id: 7,
    format: 'behavioral',
    section: 1,
    sectionTitle: 'Part 1',
    question: 'Think about the person at work who irritates you most. What\'s actually annoying about them?',
    description: 'Your gut answer is the real one.',
    options: [
      { text: 'They change their mind constantly and nothing sticks', routine: 35, human: 25, adapt: 25, selfPerception: 50, depth: 30 },
      { text: 'They slow everything down by overthinking', routine: 50, human: 20, adapt: 30, selfPerception: 55, depth: 25 },
      { text: 'They don\'t seem to care about the quality of their work', routine: 40, human: 30, adapt: 35, selfPerception: 70, depth: 35 },
      { text: 'They always need to be the smartest person in the room', routine: 25, human: 45, adapt: 40, selfPerception: 60, depth: 50 },
    ],
    crossValidate: ['adapt-behavior'],
    weight: 0.9,
  },

  // ── Q8: Word Snap ──
  {
    id: 8,
    format: 'word-snap',
    section: 1,
    sectionTitle: 'Part 1',
    question: 'Which image makes you nod?',
    options: [
      { text: 'A pair of hands shaping clay', routine: 15, human: 70, adapt: 55, selfPerception: 55, depth: 50 },
      { text: 'A compass on a map', routine: 25, human: 30, adapt: 75, selfPerception: 65, depth: 40 },
      { text: 'Two people mid-conversation', routine: 10, human: 90, adapt: 45, selfPerception: 45, depth: 55 },
      { text: 'A spreadsheet with a formula', routine: 80, human: 10, adapt: 20, selfPerception: 40, depth: 20 },
    ],
    crossValidate: ['orientation', 'routine-behavior'],
    weight: 0.9,
  },

  // ═══════════════════════════════════════════════
  // SECTION 2: The Impossible Choice (Q9-Q14)
  // ═══════════════════════════════════════════════

  // ── Q9 ──
  {
    id: 9,
    format: 'impossible',
    section: 2,
    sectionTitle: 'Part 2',
    question: 'You can only have one.',
    options: [
      { text: 'Being the person everyone comes to for answers', routine: 55, human: 40, adapt: 35, selfPerception: 80, depth: 25 },
      { text: 'Being the person who always spots what\'s coming next', routine: 25, human: 30, adapt: 80, selfPerception: 75, depth: 35 },
    ],
    crossValidate: ['orientation'],
    weight: 1.1,
  },

  // ── Q10 ──
  {
    id: 10,
    format: 'impossible',
    section: 2,
    sectionTitle: 'Part 2',
    question: 'Pick your team.',
    options: [
      { text: 'Five people who execute flawlessly', routine: 75, human: 20, adapt: 30, selfPerception: 45, depth: 20 },
      { text: 'Three people who think differently than you', routine: 15, human: 55, adapt: 85, selfPerception: 70, depth: 55 },
      { text: 'Two people who\'ve been in the trenches longer than anyone', routine: 50, human: 45, adapt: 30, selfPerception: 50, depth: 35 },
      { text: 'One brilliant person and four who can sell the vision', routine: 20, human: 80, adapt: 65, selfPerception: 55, depth: 45 },
    ],
    crossValidate: ['adapt-claim', 'human-behavior'],
    weight: 1.1,
  },

  // ── Q11 ──
  {
    id: 11,
    format: 'impossible',
    section: 2,
    sectionTitle: 'Part 2',
    question: 'You\'re going to be evaluated at work. You\'d rather they measure:',
    options: [
      { text: 'How much you got done', routine: 80, human: 10, adapt: 25, selfPerception: 35, depth: 20 },
      { text: 'How few mistakes you made', routine: 70, human: 15, adapt: 20, selfPerception: 45, depth: 25 },
      { text: 'How many people came to you for help', routine: 10, human: 90, adapt: 45, selfPerception: 60, depth: 45 },
      { text: 'How many of your ideas got implemented', routine: 25, human: 55, adapt: 75, selfPerception: 75, depth: 45 },
    ],
    crossValidate: ['routine-behavior', 'human-behavior'],
    weight: 1.2,
  },

  // ── Q12 ──
  {
    id: 12,
    format: 'impossible',
    section: 2,
    sectionTitle: 'Part 2',
    question: 'You\'re building something important. The thing you absolutely cannot compromise on:',
    options: [
      { text: 'Speed — it needs to ship', routine: 65, human: 15, adapt: 55, selfPerception: 45, depth: 25 },
      { text: 'Quality — it needs to be right', routine: 55, human: 30, adapt: 35, selfPerception: 70, depth: 40 },
      { text: 'Buy-in — people need to believe in it', routine: 10, human: 85, adapt: 55, selfPerception: 55, depth: 50 },
      { text: 'Originality — it needs to be different', routine: 15, human: 65, adapt: 75, selfPerception: 75, depth: 50 },
    ],
    crossValidate: ['orientation'],
    weight: 1.0,
  },

  // ── Q13 ──
  {
    id: 13,
    format: 'impossible',
    section: 2,
    sectionTitle: 'Part 2',
    question: 'Your career gets a movie. What\'s the title?',
    options: [
      { text: '"The Expert"', routine: 55, human: 25, adapt: 25, selfPerception: 80, depth: 20 },
      { text: '"The Fixer"', routine: 50, human: 40, adapt: 60, selfPerception: 55, depth: 35 },
      { text: '"The Bridge"', routine: 10, human: 90, adapt: 55, selfPerception: 50, depth: 50 },
      { text: '"The Architect"', routine: 25, human: 50, adapt: 75, selfPerception: 75, depth: 45 },
    ],
    crossValidate: ['orientation', 'self-perception'],
    weight: 0.9,
  },

  // ── Q14 ──
  {
    id: 14,
    format: 'impossible',
    section: 2,
    sectionTitle: 'Part 2',
    question: 'Same timeline, same pay. Pick one:',
    options: [
      { text: 'Something you\'ve done before and can nail perfectly', routine: 80, human: 10, adapt: 15, selfPerception: 60, depth: 20 },
      { text: 'Something you\'ve never done but you\'re curious about', routine: 15, human: 35, adapt: 90, selfPerception: 65, depth: 55 },
      { text: 'Something that needs five departments to coordinate', routine: 20, human: 80, adapt: 60, selfPerception: 55, depth: 50 },
      { text: 'Something a client is desperate for and no one else can handle', routine: 35, human: 65, adapt: 55, selfPerception: 80, depth: 40 },
    ],
    crossValidate: ['adapt-claim', 'routine-behavior'],
    weight: 1.2,
  },

  // ═══════════════════════════════════════════════
  // SECTION 3: Fill the Blank (Q15-Q17)
  // ═══════════════════════════════════════════════

  // ── Q15 ──
  {
    id: 15,
    format: 'fill-blank',
    section: 3,
    sectionTitle: 'Part 3',
    question: 'Complete the sentence: "If I\'m being honest, the best part of my job is ___________"',
    options: [
      { text: '...the moment I figure out something complicated', routine: 25, human: 50, adapt: 70, selfPerception: 65, depth: 55 },
      { text: '...when someone says I made their day easier', routine: 15, human: 85, adapt: 45, selfPerception: 50, depth: 55 },
      { text: '...crossing things off and knowing I earned my weekend', routine: 80, human: 10, adapt: 20, selfPerception: 30, depth: 40 },
      { text: '...knowing I\'m getting better at something that matters', routine: 20, human: 45, adapt: 85, selfPerception: 70, depth: 60 },
    ],
    crossValidate: ['routine-behavior', 'adapt-behavior', 'depth-check'],
    weight: 1.1,
  },

  // ── Q16 ──
  {
    id: 16,
    format: 'fill-blank',
    section: 3,
    sectionTitle: 'Part 3',
    question: 'The real reason I work the way I do:',
    options: [
      { text: 'I actually enjoy the rhythm of doing things I\'m good at', routine: 75, human: 20, adapt: 20, selfPerception: 50, depth: 55 },
      { text: 'I like being someone people count on', routine: 20, human: 85, adapt: 45, selfPerception: 60, depth: 50 },
      { text: 'I get restless doing the same thing twice', routine: 10, human: 40, adapt: 90, selfPerception: 70, depth: 45 },
      { text: 'I\'ve always been the person who sees what others miss', routine: 20, human: 60, adapt: 65, selfPerception: 80, depth: 40 },
    ],
    crossValidate: ['routine-behavior', 'self-perception'],
    weight: 1.2,
  },

  // ── Q17 ──
  {
    id: 17,
    format: 'fill-blank',
    section: 3,
    sectionTitle: 'Part 3',
    question: 'The thing about AI that nobody talks about:',
    options: [
      { text: 'It\'s going to make the boring parts disappear — and I\'m here for it', routine: 40, human: 30, adapt: 85, selfPerception: 45, depth: 65 },
      { text: 'The people who learn to use it are going to leave everyone else behind', routine: 30, human: 20, adapt: 55, selfPerception: 50, depth: 40 },
      { text: 'It still can\'t do the stuff that actually matters in my work', routine: 35, human: 45, adapt: 20, selfPerception: 80, depth: 15 },
      { text: 'I think we\'re all going to be fine — but I\'d like to understand it better', routine: 30, human: 35, adapt: 50, selfPerception: 55, depth: 45 },
    ],
    crossValidate: ['adapt-claim', 'self-perception', 'depth-check'],
    weight: 1.3,
  },

  // ═══════════════════════════════════════════════
  // SECTION 4: The Honest Mirror (Q18-Q20)
  // ═══════════════════════════════════════════════

  // ── Q18 ──
  {
    id: 18,
    format: 'honest-mirror',
    section: 4,
    sectionTitle: 'Part 4',
    question: 'Something you\'ve noticed about yourself at work that you don\'t love:',
    options: [
      { text: 'I get impatient when things move slowly', routine: 50, human: 20, adapt: 40, selfPerception: 55, depth: 55 },
      { text: 'I have a hard time letting go of how I\'ve always done things', routine: 55, human: 30, adapt: 20, selfPerception: 45, depth: 75 },
      { text: 'I say yes to too much and end up scattered', routine: 45, human: 35, adapt: 35, selfPerception: 40, depth: 65 },
      { text: 'I avoid the parts of my job that feel outdated', routine: 60, human: 20, adapt: 30, selfPerception: 50, depth: 60 },
    ],
    crossValidate: ['adapt-behavior', 'depth-check'],
    weight: 1.3,
  },

  // ── Q19 ──
  {
    id: 19,
    format: 'honest-mirror',
    section: 4,
    sectionTitle: 'Part 4',
    question: 'If your job changed dramatically next month, the hardest part would be:',
    options: [
      { text: 'Letting go of the things I\'ve gotten really good at', routine: 60, human: 25, adapt: 20, selfPerception: 55, depth: 70 },
      { text: 'Figuring out where I fit in the new structure', routine: 40, human: 30, adapt: 35, selfPerception: 40, depth: 55 },
      { text: 'Convincing myself the change is actually an upgrade', routine: 35, human: 35, adapt: 25, selfPerception: 50, depth: 65 },
      { text: 'Not knowing if I\'ll be as valuable', routine: 50, human: 20, adapt: 30, selfPerception: 60, depth: 60 },
    ],
    crossValidate: ['adapt-behavior', 'self-perception', 'depth-check'],
    weight: 1.3,
  },

  // ── Q20 ──
  {
    id: 20,
    format: 'honest-mirror',
    section: 4,
    sectionTitle: 'Part 4',
    question: 'The thing you\'re most afraid of being true about your career:',
    options: [
      { text: 'That I\'ve peaked and the interesting part is behind me', routine: 45, human: 25, adapt: 20, selfPerception: 45, depth: 75 },
      { text: 'That I\'ve been playing it safe and it\'s catching up to me', routine: 35, human: 35, adapt: 30, selfPerception: 50, depth: 70 },
      { text: 'That what I\'m good at is becoming common', routine: 60, human: 20, adapt: 40, selfPerception: 55, depth: 65 },
      { text: 'That I\'ve been so busy doing that I haven\'t been building anything lasting', routine: 50, human: 30, adapt: 45, selfPerception: 50, depth: 70 },
    ],
    crossValidate: ['depth-check', 'self-perception'],
    weight: 1.4,
  },
];

export const sectionTitles: Record<number, string> = {
  1: 'Part 1',
  2: 'Part 2',
  3: 'Part 3',
  4: 'Part 4',
};

export const formatLabels: Record<string, string> = {
  'word-snap': 'Quick pick',
  'behavioral': 'Think back',
  'impossible': 'Tough choice',
  'fill-blank': 'Fill in the blank',
  'honest-mirror': 'Honest moment',
};
