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
    DEFAULT: 'en'
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

export const Levels = {
    A1: 'A1',
    A2: 'A2',
    B1: 'B1',
    B2: 'B2',
    C1: 'C1',
    C2: 'C2',
    DEFAULT: 'B1'
} as const;
export type Level = typeof Levels[keyof typeof Levels];

export const MODEL = 'mistral-small-latest';

// Database related types
export interface Prompt {
  language: string;
  level: string;
  topic?: string;
  prompt_text: string;
}

export interface Response {
  id: string;
  prompt_id: string;
  response_text: string;
  created_at: string;
  metadata?: any;
}
