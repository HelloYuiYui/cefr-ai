export const Step = {
    SELECTION: 'SELECTION',
    PRACTICE: 'PRACTICE',
    REVIEW: 'REVIEW'
} as const;
export type Step = typeof Step[keyof typeof Step];

export const Language = {
    GERMAN: 'de',
    FRENCH: 'fr',
    ENGLISH: 'en',
    DEFAULT: 'de'
} as const;
export type Language = typeof Language[keyof typeof Language];
export const LanguageNames = Object.fromEntries(
  Object.entries(Language)
    .filter(([key]) => key !== 'DEFAULT') // exclude DEFAULT
    .map(([key, value]) => [
      value,
      key.charAt(0).toUpperCase() + key.slice(1).toLowerCase()
    ])
);
export const LanguageCodes = {
    'German': 'de',
    'French': 'fr',
    'English': 'en'
}

export const Levels = {
    A1: 'A1',
    A2: 'A2',
    B1: 'B1',
    B2: 'B2',
    // C1: 'C1',
    // C2: 'C2',
    DEFAULT: 'B1'
} as const;
export type Level = typeof Levels[keyof typeof Levels];

export const MODEL = process.env.MODEL || 'mistral-small-latest';

// Database related types
export interface Prompt {
  id: string;
  prompt: string;
  language: Language;
  level: Level;
  topic?: string;
}

// TODO Convert to camelCase for consistency in the frontend
export interface Response {
  id: string;
  prompt_id: string;
  response_text: string;
  metadata?: any;
}

export interface Question {
  question: string;
  options: string[];
  correctAnswer: number;
}

export interface Reading {
  id?: number;
  text: string;
  language: string;
  topic: string;
  level: string;
  questions: Question[];
}

export interface UserAnswer {
  questionIndex: number;
  selectedAnswer: number;
}
