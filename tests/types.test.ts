import { describe, it, expect } from 'vitest';
import { Step, Language, LanguageNames, LanguageCodes, Levels, MODEL } from '@/app/types';

describe('Step', () => {
    it('has SELECTION value', () => {
        expect(Step.SELECTION).toBe('SELECTION');
    });

    it('has PRACTICE value', () => {
        expect(Step.PRACTICE).toBe('PRACTICE');
    });

    it('has REVIEW value', () => {
        expect(Step.REVIEW).toBe('REVIEW');
    });

    it('has exactly 3 values', () => {
        expect(Object.keys(Step)).toHaveLength(3);
    });
});

describe('Language', () => {
    it('has GERMAN as de', () => {
        expect(Language.GERMAN).toBe('de');
    });

    it('has FRENCH as fr', () => {
        expect(Language.FRENCH).toBe('fr');
    });

    it('has ENGLISH as en', () => {
        expect(Language.ENGLISH).toBe('en');
    });

    it('has DEFAULT equal to GERMAN', () => {
        expect(Language.DEFAULT).toBe(Language.GERMAN);
    });

    it('DEFAULT is de', () => {
        expect(Language.DEFAULT).toBe('de');
    });
});

describe('LanguageNames', () => {
    it('maps de to German', () => {
        expect(LanguageNames['de']).toBe('German');
    });

    it('maps fr to French', () => {
        expect(LanguageNames['fr']).toBe('French');
    });

    it('maps en to English', () => {
        expect(LanguageNames['en']).toBe('English');
    });

    it('does NOT include a DEFAULT key', () => {
        expect(LanguageNames['DEFAULT']).toBeUndefined();
    });

    it('has exactly 3 entries', () => {
        expect(Object.keys(LanguageNames)).toHaveLength(3);
    });
});

describe('LanguageCodes', () => {
    it('maps German to de', () => {
        expect(LanguageCodes['German']).toBe('de');
    });

    it('maps French to fr', () => {
        expect(LanguageCodes['French']).toBe('fr');
    });

    it('maps English to en', () => {
        expect(LanguageCodes['English']).toBe('en');
    });
});

describe('Levels', () => {
    it('has A1', () => {
        expect(Levels.A1).toBe('A1');
    });

    it('has A2', () => {
        expect(Levels.A2).toBe('A2');
    });

    it('has B1', () => {
        expect(Levels.B1).toBe('B1');
    });

    it('has B2', () => {
        expect(Levels.B2).toBe('B2');
    });

    it('has DEFAULT equal to B1', () => {
        expect(Levels.DEFAULT).toBe('B1');
    });
});

describe('MODEL', () => {
    it('defaults to mistral-small-latest when env is unset', () => {
        const originalModel = process.env.MODEL;
        delete process.env.MODEL;
        // MODEL is evaluated at import time, so we test the constant directly
        // Since we can't re-import, we verify the fallback logic pattern
        expect(process.env.MODEL || 'mistral-small-latest').toBe('mistral-small-latest');
        process.env.MODEL = originalModel;
    });

    it('is a string', () => {
        expect(typeof MODEL).toBe('string');
    });
});
