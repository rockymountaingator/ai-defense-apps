// ── Question Types ──

export type QuestionFormat =
  | 'word-snap'      // Quick word/phrase choice — gut reaction
  | 'behavioral'     // "What did you actually do" — memory-based
  | 'impossible'     // Forced trade-off — pick between two desirable things
  | 'fill-blank'     // Sentence completion — brain fills before PR filter kicks in
  | 'honest-mirror'; // Self-reflection — all answers have dignity + hidden trap

export interface QuestionOption {
  text: string;
  label?: string;        // Short label for internal reference
  // Hidden scoring vectors — NOT exposed to UI
  routine: number;       // 0-100: how much this signals routine/repeatable work
  human: number;         // 0-100: how much this signals human-dependent value
  adapt: number;         // 0-100: how much this signals adaptability/readiness
    // Sub-signals for cross-validation
  selfPerception: number; // 0-100: how much this person rates themselves (vs behavioral evidence)
  depth: number;          // 0-100: depth of self-awareness in the answer
}

export interface Question {
  id: number;
  format: QuestionFormat;
  section: number;        // 1-4 section number
  sectionTitle: string;
  question: string;
  description?: string;   // Optional context/instruction
  options: QuestionOption[];
  // Cross-validation group IDs — questions that triangulate the same dimension
  crossValidate?: string[];
  // Weight for how much this question influences the final score
  weight: number;
}

// ── Answer Types ──

export interface Answer {
  questionId: number;
  optionIndex: number;
  optionText: string;     // Store the actual text chosen
}

// ── Scoring Types (hidden dimensions) ──

export interface HiddenScores {
  routineIndex: number;      // 0-100: behavioral evidence of routine work
  humanAdvantage: number;    // 0-100: genuine human-dependent value
  adaptQuotient: number;     // 0-100: adaptability based on behavior, not aspiration
  selfPerceptionGap: number; // 0-100: how much they overestimate vs behavioral data
  depthIndex: number;        // 0-100: self-awareness depth
}

// ── Result Types ──

export interface AssessmentResults {
  // Public scores (what the user sees, mapped from hidden scores)
  exposure: number;          // 0-100: how exposed their work is to AI
  resilience: number;        // 0-100: their genuine human advantage
  readiness: number;         // 0-100: behavioral readiness for change

  // Profile
  profile: string;           // e.g. "The Hidden Expert", "The Unaware Automator"
  profileTagline: string;
  profileDescription: string;

  // Insights (the surprising parts)
  surprisingInsight: string;       // "Here's the thing no one's telling you"
  uncomfortableTruth: string;      // Where self-perception diverges from evidence
  realMoat: string;                // Their genuine human advantage
  blindSpot: string;               // What they're not seeing

  // Recommendations
  nextSteps: string[];
  resources: ResourceRecommendation[];

  // Raw data
  hiddenScores: HiddenScores;
  answers: Answer[];
}

export interface ResourceRecommendation {
  title: string;
  description: string;
  type: 'guide' | 'tool' | 'course' | 'service' | 'affiliate';
  url?: string;
}

export interface AssessmentState {
  currentQuestion: number;
  answers: Answer[];
  started: boolean;
  completed: boolean;
  emailCollected: boolean; // User has entered email
  email?: string;          // User's email address
  results?: AssessmentResults;
}