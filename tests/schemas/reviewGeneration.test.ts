import { describe, it, expect, vi, beforeEach } from 'vitest';
import { calculateTotalScore, reviewGeneration } from '@/lib/schemas/reviewGeneration';

// Mock external dependencies
vi.mock('@/lib/mistral', () => ({
    default: {
        chat: {
            complete: vi.fn()
        }
    }
}));

vi.mock('@/lib/db', () => ({
    responseToDatabase: vi.fn()
}));

vi.mock('@/lib/logger', () => ({
    default: { debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() }
}));

vi.mock('@/lib/schemas/prompts', () => ({
    frenchA1: vi.fn(() => 'french a1 prompt'),
    frenchA2: vi.fn(() => 'french a2 prompt'),
    frenchB1: vi.fn(() => 'french b1 prompt'),
    frenchB2: vi.fn(() => 'french b2 prompt'),
    germanB1: vi.fn(() => 'german b1 prompt'),
    baseline: vi.fn(() => 'baseline prompt')
}));

vi.mock('@/lib/schemas/reviews', () => ({
    frenchA1Schema: { safeParse: vi.fn() },
    frenchA1SchemaJson: {},
    frenchA2Schema: { safeParse: vi.fn() },
    frenchA2SchemaJson: {},
    frenchB1Schema: { safeParse: vi.fn() },
    frenchB1SchemaJson: {},
    frenchB2Schema: { safeParse: vi.fn() },
    frenchB2SchemaJson: {},
    germanB1Schema: { safeParse: vi.fn() },
    germanB1SchemaJson: {}
}));

import mistral from '@/lib/mistral';
import { responseToDatabase } from '@/lib/db';

describe('calculateTotalScore()', () => {
    it('sums all numeric fields in a French A1 review (total 15)', () => {
        const review = {
            name: 'Student',
            grammarFeedback: 'Good',
            vocabularyFeedback: 'Nice',
            textFluencyFeedback: 'Clear',
            respectDeLaConsigne: 2,
            correctionSociolinguistique: 2,
            capaciteAInformerEtOuDecrire: 4,
            lexiqueOrthographeLexicale: 3,
            morphosyntaxeOrthographeGrammaticale: 3,
            coherenceEtCohesion: 1,
            language: 'fr',
            level: 'A1',
            outOf: 15
        };
        const { achieved, outOf } = calculateTotalScore(review);
        expect(achieved).toBe(2 + 2 + 4 + 3 + 3 + 1);
        expect(outOf).toBe(15);
    });

    it('sums all numeric fields in a French A2 review (total 13)', () => {
        const review = {
            name: 'Student',
            grammarFeedback: 'Good',
            vocabularyFeedback: 'Nice',
            textFluencyFeedback: 'Clear',
            respectDeLaConsigne: 1,
            capaciteARaconterEtADecrire: 4,
            capaciteADonnerSesImpressions: 2,
            lexiqueOrthographeLexicale: 2,
            morphosyntaxeOrthographeGrammaticale: 2.5,
            coherenceEtCohesion: 1.5,
            language: 'fr',
            level: 'A2',
            outOf: 13
        };
        const { achieved, outOf } = calculateTotalScore(review);
        expect(achieved).toBe(1 + 4 + 2 + 2 + 2.5 + 1.5);
        expect(outOf).toBe(13);
    });

    it('sums all numeric fields in a French B1 review (total 25)', () => {
        const review = {
            name: 'Student',
            grammarFeedback: 'Good',
            vocabularyFeedback: 'Nice',
            textFluencyFeedback: 'Clear',
            respectDeLaConsigne: 2,
            capaciteAPresenterDesFaits: 4,
            capaciteAExprimerSaPensee: 4,
            coherenceEtCohesion: 3,
            etendueDuVocabulaire: 2,
            maitriseDuVocabulaire: 2,
            maitriseOrthographeLexicale: 2,
            degreElaborationPhrases: 2,
            choixTempsEtModes: 2,
            morphosyntaxeOrthographeGrammaticale: 2,
            language: 'fr',
            level: 'B1',
            outOf: 25
        };
        const { achieved, outOf } = calculateTotalScore(review);
        expect(achieved).toBe(2 + 4 + 4 + 3 + 2 + 2 + 2 + 2 + 2 + 2);
        expect(outOf).toBe(25);
    });

    it('sums all numeric fields in a French B2 review (total 25)', () => {
        const review = {
            name: 'Student',
            grammarFeedback: 'Good',
            vocabularyFeedback: 'Nice',
            textFluencyFeedback: 'Clear',
            respectDeLaConsigne: 2,
            correctionSociolinguistique: 2,
            capaciteAPresenterDesFaits: 3,
            capaciteAArgumenter: 3,
            coherenceEtCohesion: 4,
            etendueDuVocabulaire: 2,
            maitriseDuVocabulaire: 2,
            maitriseOrthographe: 1,
            choixDesFormes: 4,
            degreElaborationPhrases: 2,
            language: 'fr',
            level: 'B2',
            outOf: 25
        };
        const { achieved, outOf } = calculateTotalScore(review);
        expect(achieved).toBe(2 + 2 + 3 + 3 + 4 + 2 + 2 + 1 + 4 + 2);
        expect(outOf).toBe(25);
    });

    it('excludes outOf from sum', () => {
        const review = { score: 5, outOf: 100 };
        const { achieved } = calculateTotalScore(review);
        expect(achieved).toBe(5);
    });

    it('excludes totalScore from sum', () => {
        const review = { score: 5, totalScore: 50, outOf: 100 };
        const { achieved } = calculateTotalScore(review);
        expect(achieved).toBe(5);
    });

    it('excludes language from sum', () => {
        const review = { score: 5, language: 'fr', outOf: 10 };
        const { achieved } = calculateTotalScore(review);
        expect(achieved).toBe(5);
    });

    it('excludes level from sum', () => {
        const review = { score: 5, level: 'A1', outOf: 10 };
        const { achieved } = calculateTotalScore(review);
        expect(achieved).toBe(5);
    });

    it('excludes name from sum', () => {
        const review = { score: 5, name: 'Student', outOf: 10 };
        const { achieved } = calculateTotalScore(review);
        expect(achieved).toBe(5);
    });

    it('defaults outOf to 100 when missing', () => {
        const review = { score: 75 };
        const { outOf } = calculateTotalScore(review);
        expect(outOf).toBe(100);
    });

    it('returns outOf from review when present', () => {
        const review = { score: 10, outOf: 15 };
        const { outOf } = calculateTotalScore(review);
        expect(outOf).toBe(15);
    });

    it('handles review with only string fields (achieved = 0)', () => {
        const review = { grammarFeedback: 'Good', vocabularyFeedback: 'Nice', outOf: 15 };
        const { achieved } = calculateTotalScore(review);
        expect(achieved).toBe(0);
    });

    it('handles empty review object (achieved = 0, outOf = 100)', () => {
        const review = {};
        const { achieved, outOf } = calculateTotalScore(review);
        expect(achieved).toBe(0);
        expect(outOf).toBe(100);
    });

    it('handles mixed numeric and string fields correctly', () => {
        const review = {
            score1: 3,
            feedback: 'Good work',
            score2: 7,
            language: 'en',
            outOf: 20
        };
        const { achieved } = calculateTotalScore(review);
        expect(achieved).toBe(10);
    });
});

describe('reviewGeneration()', () => {

    beforeEach(() => {
        vi.clearAllMocks();
    });

    const mockPrompt = (lang: string, lvl: string) => ({
        id: 'prompt-1',
        prompt: 'Write something.',
        language: lang,
        level: lvl,
        topic: 'Technology'
    });

    const createMockResponse = (data: Record<string, unknown>) => ({
        choices: [{
            message: {
                content: JSON.stringify(data)
            }
        }]
    });

    it('routes French A1 to correct Mistral schema', async () => {
        const mockData = {
            name: 'Student',
            grammarFeedback: 'Good grammar',
            vocabularyFeedback: 'Good vocab',
            textFluencyFeedback: 'Good fluency',
            respectDeLaConsigne: 1.5,
            correctionSociolinguistique: 1,
            capaciteAInformerEtOuDecrire: 3,
            lexiqueOrthographeLexicale: 2,
            morphosyntaxeOrthographeGrammaticale: 2,
            coherenceEtCohesion: 0.5,
            language: 'fr',
            level: 'A1',
            outOf: 15
        };
        vi.mocked(mistral.chat.complete).mockResolvedValue(createMockResponse(mockData) as any);
        vi.mocked(responseToDatabase).mockResolvedValue({ rows: [{ id: 1 }] } as any);

        await reviewGeneration('user-1', mockPrompt('fr', 'A1'), 'Mon texte');

        const callArgs = vi.mocked(mistral.chat.complete).mock.calls[0][0];
        expect(callArgs.responseFormat.jsonSchema.name).toBe('frenchA1');
    });

    it('routes French A2 to correct Mistral schema', async () => {
        const mockData = {
            name: 'Student',
            grammarFeedback: 'Good grammar',
            vocabularyFeedback: 'Good vocab',
            textFluencyFeedback: 'Good fluency',
            respectDeLaConsigne: 1,
            capaciteARaconterEtADecrire: 3,
            capaciteADonnerSesImpressions: 1.5,
            lexiqueOrthographeLexicale: 1.5,
            morphosyntaxeOrthographeGrammaticale: 2,
            coherenceEtCohesion: 1,
            language: 'fr',
            level: 'A2',
            outOf: 13
        };
        vi.mocked(mistral.chat.complete).mockResolvedValue(createMockResponse(mockData) as any);
        vi.mocked(responseToDatabase).mockResolvedValue({ rows: [{ id: 1 }] } as any);

        await reviewGeneration('user-1', mockPrompt('fr', 'A2'), 'Mon texte');

        const callArgs = vi.mocked(mistral.chat.complete).mock.calls[0][0];
        expect(callArgs.responseFormat.jsonSchema.name).toBe('frenchA2');
    });

    it('routes French B1 to correct Mistral schema', async () => {
        const mockData = {
            grammarFeedback: 'Feedback',
            vocabularyFeedback: 'Feedback',
            textFluencyFeedback: 'Feedback',
            respectDeLaConsigne: 1,
            capaciteAPresenterDesFaits: 2,
            capaciteAExprimerSaPensee: 2,
            coherenceEtCohesion: 1,
            etendueDuVocabulaire: 1,
            maitriseDuVocabulaire: 1,
            maitriseOrthographeLexicale: 1,
            degreElaborationPhrases: 1,
            choixTempsEtModes: 1,
            morphosyntaxeOrthographeGrammaticale: 1,
            language: 'fr',
            level: 'B1',
            outOf: 25
        };
        vi.mocked(mistral.chat.complete).mockResolvedValue(createMockResponse(mockData) as any);
        vi.mocked(responseToDatabase).mockResolvedValue({ rows: [{ id: 1 }] } as any);

        await reviewGeneration('user-1', mockPrompt('fr', 'B1'), 'Mon texte');

        const callArgs = vi.mocked(mistral.chat.complete).mock.calls[0][0];
        expect(callArgs.responseFormat.jsonSchema.name).toBe('frenchB1');
    });

    it('routes French B2 to correct Mistral schema', async () => {
        const mockData = {
            grammarFeedback: 'Feedback',
            vocabularyFeedback: 'Feedback',
            textFluencyFeedback: 'Feedback',
            respectDeLaConsigne: 1,
            correctionSociolinguistique: 1,
            capaciteAPresenterDesFaits: 1,
            capaciteAArgumenter: 1,
            coherenceEtCohesion: 2,
            etendueDuVocabulaire: 1,
            maitriseDuVocabulaire: 1,
            maitriseOrthographe: 0.5,
            choixDesFormes: 2,
            degreElaborationPhrases: 1,
            language: 'fr',
            level: 'B2',
            outOf: 25
        };
        vi.mocked(mistral.chat.complete).mockResolvedValue(createMockResponse(mockData) as any);
        vi.mocked(responseToDatabase).mockResolvedValue({ rows: [{ id: 1 }] } as any);

        await reviewGeneration('user-1', mockPrompt('fr', 'B2'), 'Mon texte');

        const callArgs = vi.mocked(mistral.chat.complete).mock.calls[0][0];
        expect(callArgs.responseFormat.jsonSchema.name).toBe('frenchB2');
    });

    it('routes German B1 to correct Mistral schema', async () => {
        const mockData = {
            grammarFeedback: 'Feedback',
            vocabularyFeedback: 'Feedback',
            textFluencyFeedback: 'Feedback',
            erfuellung: 7.5,
            kohaerenz: 5,
            wortschatz: 7.5,
            strukturen: 5,
            outOf: 40
        };
        vi.mocked(mistral.chat.complete).mockResolvedValue(createMockResponse(mockData) as any);
        vi.mocked(responseToDatabase).mockResolvedValue({ rows: [{ id: 1 }] } as any);

        await reviewGeneration('user-1', mockPrompt('de', 'B1'), 'Mein Text');

        const callArgs = vi.mocked(mistral.chat.complete).mock.calls[0][0];
        expect(callArgs.responseFormat.jsonSchema.name).toBe('germanB1');
    });

    it('routes unsupported language/level to default schema', async () => {
        const mockData = {
            grammarFeedback: 'Feedback',
            vocabularyFeedback: 'Feedback',
            textFluencyFeedback: 'Feedback',
            totalScore: 65,
            outOf: 100,
            language: 'en',
            level: 'B2'
        };
        vi.mocked(mistral.chat.complete).mockResolvedValue(createMockResponse(mockData) as any);
        vi.mocked(responseToDatabase).mockResolvedValue({ rows: [{ id: 1 }] } as any);

        await reviewGeneration('user-1', mockPrompt('en', 'B2'), 'My text');

        const callArgs = vi.mocked(mistral.chat.complete).mock.calls[0][0];
        expect(callArgs.responseFormat.jsonSchema.name).toBe('default');
    });

    it('routes English B1 to default schema', async () => {
        const mockData = {
            grammarFeedback: 'Feedback',
            vocabularyFeedback: 'Feedback',
            textFluencyFeedback: 'Feedback',
            totalScore: 70,
            outOf: 100,
            language: 'en',
            level: 'B1'
        };
        vi.mocked(mistral.chat.complete).mockResolvedValue(createMockResponse(mockData) as any);
        vi.mocked(responseToDatabase).mockResolvedValue({ rows: [{ id: 1 }] } as any);

        await reviewGeneration('user-1', mockPrompt('en', 'B1'), 'My text');

        const callArgs = vi.mocked(mistral.chat.complete).mock.calls[0][0];
        expect(callArgs.responseFormat.jsonSchema.name).toBe('default');
    });

    it('saves response to database when userId is provided', async () => {
        const mockData = {
            score1: 5,
            outOf: 10,
            language: 'en',
            level: 'A1'
        };
        vi.mocked(mistral.chat.complete).mockResolvedValue(createMockResponse(mockData) as any);
        vi.mocked(responseToDatabase).mockResolvedValue({ rows: [{ id: 1 }] } as any);

        await reviewGeneration('user-123', mockPrompt('en', 'A1'), 'My text');

        expect(responseToDatabase).toHaveBeenCalledOnce();
        expect(responseToDatabase).toHaveBeenCalledWith(
            'user-123',
            'prompt-1',
            'My text',
            5,
            50
        );
    });

    it('does NOT save to database when userId is null', async () => {
        const mockData = {
            score1: 5,
            outOf: 10,
            language: 'en',
            level: 'A1'
        };
        vi.mocked(mistral.chat.complete).mockResolvedValue(createMockResponse(mockData) as any);

        await reviewGeneration(null, mockPrompt('en', 'A1'), 'My text');

        expect(responseToDatabase).not.toHaveBeenCalled();
    });

    it('calculates grade percentage correctly', async () => {
        const mockData = {
            score1: 12,
            outOf: 15,
            language: 'fr',
            level: 'A1'
        };
        vi.mocked(mistral.chat.complete).mockResolvedValue(createMockResponse(mockData) as any);
        vi.mocked(responseToDatabase).mockResolvedValue({ rows: [{ id: 1 }] } as any);

        await reviewGeneration('user-1', mockPrompt('fr', 'A1'), 'Mon texte');

        // 12/15 = 80%
        expect(responseToDatabase).toHaveBeenCalledWith(
            'user-1',
            'prompt-1',
            'Mon texte',
            12,
            80
        );
    });

    it('handles 0 outOf without division error', async () => {
        const mockData = {
            score1: 5,
            outOf: 0,
            language: 'en',
            level: 'A1'
        };
        vi.mocked(mistral.chat.complete).mockResolvedValue(createMockResponse(mockData) as any);
        vi.mocked(responseToDatabase).mockResolvedValue({ rows: [{ id: 1 }] } as any);

        await reviewGeneration('user-1', mockPrompt('en', 'A1'), 'Text');

        // outOf is 0, so percentage should be 0 (not NaN/Infinity)
        expect(responseToDatabase).toHaveBeenCalledWith(
            'user-1',
            'prompt-1',
            'Text',
            5,
            0
        );
    });

    it('throws on non-string model response', async () => {
        vi.mocked(mistral.chat.complete).mockResolvedValue({
            choices: [{ message: { content: null } }]
        } as any);

        await expect(
            reviewGeneration('user-1', mockPrompt('en', 'A1'), 'Text')
        ).rejects.toThrow('Unexpected model response format');
    });

    it('throws on invalid JSON from model', async () => {
        vi.mocked(mistral.chat.complete).mockResolvedValue({
            choices: [{ message: { content: 'not json' } }]
        } as any);

        await expect(
            reviewGeneration('user-1', mockPrompt('en', 'A1'), 'Text')
        ).rejects.toThrow('Failed to parse model JSON response');
    });
});
