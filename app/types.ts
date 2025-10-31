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
  Object.entries(Language).map(([key, value]) => [value, key.toLowerCase().charAt(0).toUpperCase() + key.slice(1).toLowerCase()])
)

export const Levels = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'] as const;
export type Level = typeof Levels[number];

export const MODEL = 'mistral-small-latest';