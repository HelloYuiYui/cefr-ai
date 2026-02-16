import { describe, it, expect } from 'vitest';

// We need to mock the server-action dependencies before importing
vi.mock('next/headers', () => ({
    cookies: vi.fn(() => Promise.resolve({ set: vi.fn(), get: vi.fn() })),
    headers: vi.fn()
}));

vi.mock('@/lib', () => ({
    promptSchema: vi.fn(),
    readingSchema: vi.fn(),
    reviewGeneration: vi.fn(),
    checkRateLimit: vi.fn()
}));

vi.mock('@/lib/logger', () => ({
    default: { debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() }
}));

vi.mock('@/app/context/AuthContext', () => ({
    useAuth: vi.fn()
}));

import { stringifyReview } from '@/app/api/route';

describe('stringifyReview()', () => {
    it('formats each key:value on its own line', () => {
        const review = {
            grammarFeedback: 'Good grammar',
            vocabularyFeedback: 'Nice vocabulary',
            outOf: 100
        } as unknown as JSON;

        const result = stringifyReview(review);
        expect(result).toContain('grammarFeedback:Good grammar\n');
        expect(result).toContain('vocabularyFeedback:Nice vocabulary\n');
    });

    it('sums numeric scoring fields correctly', () => {
        const review = {
            score1: 5,
            score2: 10,
            outOf: 20
        } as unknown as JSON;

        const result = stringifyReview(review);
        expect(result).toContain('totalScore: 15/20');
    });

    it('excludes outOf from the output lines', () => {
        const review = {
            score1: 5,
            outOf: 10
        } as unknown as JSON;

        const result = stringifyReview(review);
        const lines = result.split('\n').filter(l => l.trim());
        const outOfLine = lines.find(l => l.startsWith('outOf:'));
        expect(outOfLine).toBeUndefined();
    });

    it('excludes language, level, name from numeric sum', () => {
        const review = {
            name: 'Student',
            score1: 5,
            language: 'fr',
            level: 'A1',
            outOf: 15
        } as unknown as JSON;

        const result = stringifyReview(review);
        // Only score1 (5) should be summed, not language/level/name
        expect(result).toContain('totalScore: 5/15');
    });

    it('shows percentage when outOf != 100', () => {
        const review = {
            score1: 12,
            outOf: 15
        } as unknown as JSON;

        const result = stringifyReview(review);
        expect(result).toContain('totalScore: 12/15 (80%)');
    });

    it('omits percentage when outOf == 100', () => {
        const review = {
            grammarFeedback: 'Good',
            score: 75,
            outOf: 100
        } as unknown as JSON;

        const result = stringifyReview(review);
        // stringifyReview sums numeric fields (score=75), excludeFromSum has 'outOf','language','level','name'
        expect(result).toContain('totalScore: 75/100');
        expect(result).not.toContain('%');
    });

    it('handles review with only string values (achieved = 0)', () => {
        const review = {
            grammarFeedback: 'Good',
            vocabularyFeedback: 'Nice',
            outOf: 15
        } as unknown as JSON;

        const result = stringifyReview(review);
        expect(result).toContain('totalScore: 0/15 (0%)');
    });

    it('handles French A1 review format (15 points)', () => {
        const review = {
            name: 'Student',
            grammarFeedback: 'Good grammar usage.',
            vocabularyFeedback: 'Appropriate vocabulary.',
            textFluencyFeedback: 'Clear writing.',
            respectDeLaConsigne: 2,
            correctionSociolinguistique: 1.5,
            capaciteAInformerEtOuDecrire: 3,
            lexiqueOrthographeLexicale: 2,
            morphosyntaxeOrthographeGrammaticale: 2.5,
            coherenceEtCohesion: 1,
            language: 'fr',
            level: 'A1',
            outOf: 15
        } as unknown as JSON;

        const result = stringifyReview(review);
        const total = 2 + 1.5 + 3 + 2 + 2.5 + 1;
        expect(result).toContain(`totalScore: ${total}/15`);
    });

    it('handles French B1 review format (25 points)', () => {
        const review = {
            name: 'Student',
            grammarFeedback: 'Feedback',
            vocabularyFeedback: 'Feedback',
            textFluencyFeedback: 'Feedback',
            respectDeLaConsigne: 2,
            capaciteAPresenterDesFaits: 4,
            capaciteAExprimerSaPensee: 3,
            coherenceEtCohesion: 2.5,
            etendueDuVocabulaire: 1.5,
            maitriseDuVocabulaire: 2,
            maitriseOrthographeLexicale: 1.5,
            degreElaborationPhrases: 1.5,
            choixTempsEtModes: 2,
            morphosyntaxeOrthographeGrammaticale: 1.5,
            language: 'fr',
            level: 'B1',
            outOf: 25
        } as unknown as JSON;

        const result = stringifyReview(review);
        const total = 2 + 4 + 3 + 2.5 + 1.5 + 2 + 1.5 + 1.5 + 2 + 1.5;
        expect(result).toContain(`totalScore: ${total}/25`);
    });

    it('handles default/baseline review format (100 points)', () => {
        const review = {
            grammarFeedback: 'Feedback',
            vocabularyFeedback: 'Feedback',
            textFluencyFeedback: 'Feedback',
            totalScore: 72,
            outOf: 100,
            language: 'en',
            level: 'B1'
        } as unknown as JSON;

        const result = stringifyReview(review);
        // totalScore is in EXCLUDE_FROM_SUM in stringifyReview's own logic - but wait,
        // stringifyReview has its own excludeFromSum list: ['outOf', 'language', 'level', 'name']
        // totalScore is NOT excluded from sum in stringifyReview (it IS excluded in calculateTotalScore)
        // So totalScore (72) will be summed
        expect(result).toContain('totalScore: 72/100');
        expect(result).not.toContain('%');
    });

    it('handles German B1 review format (40 points)', () => {
        // German B1 has string criteria (erfuellung etc.) - they won't be summed
        const review = {
            name: 'Student',
            grammarFeedback: 'Feedback',
            vocabularyFeedback: 'Feedback',
            textFluencyFeedback: 'Feedback',
            erfuellung: 'Detailed evaluation text',
            kohaerenz: 'Coherence evaluation text',
            wortschatz: 'Vocabulary evaluation text',
            strukturen: 'Structure evaluation text',
            einzelbewertung: 'Individual assessment',
            punktetabelle: 'Points table',
            kurzerPruefkommentar: 'Brief examiner comment',
            outOf: 40
        } as unknown as JSON;

        const result = stringifyReview(review);
        // No numeric scoring fields in German B1 (all strings), so achieved = 0
        expect(result).toContain('totalScore: 0/40 (0%)');
    });
});
