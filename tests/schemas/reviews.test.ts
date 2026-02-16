import { describe, it, expect } from 'vitest';
import {
    frenchA1Schema,
    frenchA2Schema,
    frenchB1Schema,
    frenchB2Schema,
    germanB1Schema
} from '@/lib/schemas/reviews';

// Helper to create a valid feedback string of given length
const feedback = (len: number) => 'a'.repeat(len);

// Base valid string fields shared by French schemas
const validFrenchStrings = {
    name: 'Test Student',
    grammarFeedback: feedback(50),
    vocabularyFeedback: feedback(50),
    textFluencyFeedback: feedback(50),
    language: 'fr',
    level: 'A1'
};

describe('frenchA1Schema', () => {
    const validA1 = {
        ...validFrenchStrings,
        level: 'A1',
        respectDeLaConsigne: 1.5,
        correctionSociolinguistique: 1,
        capaciteAInformerEtOuDecrire: 3,
        lexiqueOrthographeLexicale: 2,
        morphosyntaxeOrthographeGrammaticale: 2,
        coherenceEtCohesion: 0.5
    };

    it('accepts valid complete A1 review', () => {
        const result = frenchA1Schema.safeParse(validA1);
        expect(result.success).toBe(true);
    });

    it('accepts half-point values', () => {
        const result = frenchA1Schema.safeParse({
            ...validA1,
            respectDeLaConsigne: 0.5,
            correctionSociolinguistique: 1.5,
            capaciteAInformerEtOuDecrire: 2.5,
            lexiqueOrthographeLexicale: 1.5,
            morphosyntaxeOrthographeGrammaticale: 0.5,
            coherenceEtCohesion: 0.5
        });
        expect(result.success).toBe(true);
    });

    it('accepts boundary min values (all zeros)', () => {
        const result = frenchA1Schema.safeParse({
            ...validA1,
            respectDeLaConsigne: 0,
            correctionSociolinguistique: 0,
            capaciteAInformerEtOuDecrire: 0,
            lexiqueOrthographeLexicale: 0,
            morphosyntaxeOrthographeGrammaticale: 0,
            coherenceEtCohesion: 0
        });
        expect(result.success).toBe(true);
    });

    it('accepts boundary max values', () => {
        const result = frenchA1Schema.safeParse({
            ...validA1,
            respectDeLaConsigne: 2,
            correctionSociolinguistique: 2,
            capaciteAInformerEtOuDecrire: 4,
            lexiqueOrthographeLexicale: 3,
            morphosyntaxeOrthographeGrammaticale: 3,
            coherenceEtCohesion: 1
        });
        expect(result.success).toBe(true);
    });

    it('rejects score above max for respectDeLaConsigne', () => {
        const result = frenchA1Schema.safeParse({
            ...validA1,
            respectDeLaConsigne: 3
        });
        expect(result.success).toBe(false);
    });

    it('rejects negative score', () => {
        const result = frenchA1Schema.safeParse({
            ...validA1,
            correctionSociolinguistique: -1
        });
        expect(result.success).toBe(false);
    });

    it('rejects non-step value (0.3)', () => {
        const result = frenchA1Schema.safeParse({
            ...validA1,
            respectDeLaConsigne: 0.3
        });
        expect(result.success).toBe(false);
    });

    it('rejects missing grammarFeedback', () => {
        const { grammarFeedback, ...withoutGrammar } = validA1;
        const result = frenchA1Schema.safeParse(withoutGrammar);
        expect(result.success).toBe(false);
    });

    it('rejects feedback below min length (< 10 chars)', () => {
        const result = frenchA1Schema.safeParse({
            ...validA1,
            grammarFeedback: 'short'
        });
        expect(result.success).toBe(false);
    });

    it('rejects feedback above max length (> 500 chars)', () => {
        const result = frenchA1Schema.safeParse({
            ...validA1,
            grammarFeedback: feedback(501)
        });
        expect(result.success).toBe(false);
    });

    it('rejects capaciteAInformerEtOuDecrire above 4', () => {
        const result = frenchA1Schema.safeParse({
            ...validA1,
            capaciteAInformerEtOuDecrire: 4.5
        });
        expect(result.success).toBe(false);
    });
});

describe('frenchA2Schema', () => {
    const validA2 = {
        ...validFrenchStrings,
        level: 'A2',
        respectDeLaConsigne: 0.5,
        capaciteARaconterEtADecrire: 3,
        capaciteADonnerSesImpressions: 1.5,
        lexiqueOrthographeLexicale: 1.5,
        morphosyntaxeOrthographeGrammaticale: 2,
        coherenceEtCohesion: 1
    };

    it('accepts valid A2 review', () => {
        const result = frenchA2Schema.safeParse(validA2);
        expect(result.success).toBe(true);
    });

    it('accepts boundary max values', () => {
        const result = frenchA2Schema.safeParse({
            ...validA2,
            respectDeLaConsigne: 1,
            capaciteARaconterEtADecrire: 4,
            capaciteADonnerSesImpressions: 2,
            lexiqueOrthographeLexicale: 2,
            morphosyntaxeOrthographeGrammaticale: 2.5,
            coherenceEtCohesion: 1.5
        });
        expect(result.success).toBe(true);
    });

    it('rejects respectDeLaConsigne above 1', () => {
        const result = frenchA2Schema.safeParse({
            ...validA2,
            respectDeLaConsigne: 1.5
        });
        expect(result.success).toBe(false);
    });

    it('rejects morphosyntaxe above 2.5', () => {
        const result = frenchA2Schema.safeParse({
            ...validA2,
            morphosyntaxeOrthographeGrammaticale: 3
        });
        expect(result.success).toBe(false);
    });

    it('rejects coherenceEtCohesion above 1.5', () => {
        const result = frenchA2Schema.safeParse({
            ...validA2,
            coherenceEtCohesion: 2
        });
        expect(result.success).toBe(false);
    });

    it('accepts all zeros', () => {
        const result = frenchA2Schema.safeParse({
            ...validA2,
            respectDeLaConsigne: 0,
            capaciteARaconterEtADecrire: 0,
            capaciteADonnerSesImpressions: 0,
            lexiqueOrthographeLexicale: 0,
            morphosyntaxeOrthographeGrammaticale: 0,
            coherenceEtCohesion: 0
        });
        expect(result.success).toBe(true);
    });

    it('rejects non-step value (0.7)', () => {
        const result = frenchA2Schema.safeParse({
            ...validA2,
            capaciteARaconterEtADecrire: 0.7
        });
        expect(result.success).toBe(false);
    });
});

describe('frenchB1Schema', () => {
    const validB1 = {
        ...validFrenchStrings,
        level: 'B1',
        respectDeLaConsigne: 1.5,
        capaciteAPresenterDesFaits: 3,
        capaciteAExprimerSaPensee: 3,
        coherenceEtCohesion: 2,
        etendueDuVocabulaire: 1.5,
        maitriseDuVocabulaire: 1.5,
        maitriseOrthographeLexicale: 1,
        degreElaborationPhrases: 1.5,
        choixTempsEtModes: 1,
        morphosyntaxeOrthographeGrammaticale: 1.5
    };

    it('accepts valid B1 review', () => {
        const result = frenchB1Schema.safeParse(validB1);
        expect(result.success).toBe(true);
    });

    it('accepts all 10 scoring criteria at max values', () => {
        const result = frenchB1Schema.safeParse({
            ...validB1,
            respectDeLaConsigne: 2,
            capaciteAPresenterDesFaits: 4,
            capaciteAExprimerSaPensee: 4,
            coherenceEtCohesion: 3,
            etendueDuVocabulaire: 2,
            maitriseDuVocabulaire: 2,
            maitriseOrthographeLexicale: 2,
            degreElaborationPhrases: 2,
            choixTempsEtModes: 2,
            morphosyntaxeOrthographeGrammaticale: 2
        });
        expect(result.success).toBe(true);
    });

    it('rejects capaciteAPresenterDesFaits above 4', () => {
        const result = frenchB1Schema.safeParse({
            ...validB1,
            capaciteAPresenterDesFaits: 4.5
        });
        expect(result.success).toBe(false);
    });

    it('rejects coherenceEtCohesion above 3', () => {
        const result = frenchB1Schema.safeParse({
            ...validB1,
            coherenceEtCohesion: 3.5
        });
        expect(result.success).toBe(false);
    });

    it('rejects missing required field', () => {
        const { choixTempsEtModes, ...withoutField } = validB1;
        const result = frenchB1Schema.safeParse(withoutField);
        expect(result.success).toBe(false);
    });
});

describe('frenchB2Schema', () => {
    const validB2 = {
        ...validFrenchStrings,
        level: 'B2',
        respectDeLaConsigne: 1.5,
        correctionSociolinguistique: 1,
        capaciteAPresenterDesFaits: 2,
        capaciteAArgumenter: 2,
        coherenceEtCohesion: 3,
        etendueDuVocabulaire: 1.5,
        maitriseDuVocabulaire: 1,
        maitriseOrthographe: 0.5,
        choixDesFormes: 3,
        degreElaborationPhrases: 1.5
    };

    it('accepts valid B2 review', () => {
        const result = frenchB2Schema.safeParse(validB2);
        expect(result.success).toBe(true);
    });

    it('accepts maitriseOrthographe at max 1', () => {
        const result = frenchB2Schema.safeParse({
            ...validB2,
            maitriseOrthographe: 1
        });
        expect(result.success).toBe(true);
    });

    it('accepts choixDesFormes at max 4', () => {
        const result = frenchB2Schema.safeParse({
            ...validB2,
            choixDesFormes: 4
        });
        expect(result.success).toBe(true);
    });

    it('rejects maitriseOrthographe above 1', () => {
        const result = frenchB2Schema.safeParse({
            ...validB2,
            maitriseOrthographe: 1.5
        });
        expect(result.success).toBe(false);
    });

    it('rejects choixDesFormes above 4', () => {
        const result = frenchB2Schema.safeParse({
            ...validB2,
            choixDesFormes: 4.5
        });
        expect(result.success).toBe(false);
    });

    it('rejects capaciteAArgumenter above 3', () => {
        const result = frenchB2Schema.safeParse({
            ...validB2,
            capaciteAArgumenter: 3.5
        });
        expect(result.success).toBe(false);
    });

    it('accepts all zeros for scoring criteria', () => {
        const result = frenchB2Schema.safeParse({
            ...validB2,
            respectDeLaConsigne: 0,
            correctionSociolinguistique: 0,
            capaciteAPresenterDesFaits: 0,
            capaciteAArgumenter: 0,
            coherenceEtCohesion: 0,
            etendueDuVocabulaire: 0,
            maitriseDuVocabulaire: 0,
            maitriseOrthographe: 0,
            choixDesFormes: 0,
            degreElaborationPhrases: 0
        });
        expect(result.success).toBe(true);
    });
});

describe('germanB1Schema', () => {
    const longText = feedback(100);
    const validGermanB1 = {
        name: 'Test Student',
        grammarFeedback: feedback(50),
        vocabularyFeedback: feedback(50),
        textFluencyFeedback: feedback(50),
        erfuellung: longText,
        kohaerenz: longText,
        wortschatz: longText,
        strukturen: longText,
        einzelbewertung: longText,
        punktetabelle: feedback(50),
        kurzerPruefkommentar: feedback(50)
    };

    it('accepts valid German B1 review with long text fields', () => {
        const result = germanB1Schema.safeParse(validGermanB1);
        expect(result.success).toBe(true);
    });

    it('rejects erfuellung below min length (< 50 chars)', () => {
        const result = germanB1Schema.safeParse({
            ...validGermanB1,
            erfuellung: feedback(49)
        });
        expect(result.success).toBe(false);
    });

    it('rejects kohaerenz below min length (< 50 chars)', () => {
        const result = germanB1Schema.safeParse({
            ...validGermanB1,
            kohaerenz: feedback(49)
        });
        expect(result.success).toBe(false);
    });

    it('rejects erfuellung above max length (> 2000 chars)', () => {
        const result = germanB1Schema.safeParse({
            ...validGermanB1,
            erfuellung: feedback(2001)
        });
        expect(result.success).toBe(false);
    });

    it('rejects kurzerPruefkommentar below 20 chars', () => {
        const result = germanB1Schema.safeParse({
            ...validGermanB1,
            kurzerPruefkommentar: feedback(19)
        });
        expect(result.success).toBe(false);
    });

    it('rejects punktetabelle below 20 chars', () => {
        const result = germanB1Schema.safeParse({
            ...validGermanB1,
            punktetabelle: feedback(19)
        });
        expect(result.success).toBe(false);
    });

    it('rejects punktetabelle above 1000 chars', () => {
        const result = germanB1Schema.safeParse({
            ...validGermanB1,
            punktetabelle: feedback(1001)
        });
        expect(result.success).toBe(false);
    });

    it('accepts fields at exact min length boundaries', () => {
        const result = germanB1Schema.safeParse({
            ...validGermanB1,
            erfuellung: feedback(50),
            kohaerenz: feedback(50),
            wortschatz: feedback(50),
            strukturen: feedback(50),
            einzelbewertung: feedback(50),
            punktetabelle: feedback(20),
            kurzerPruefkommentar: feedback(20)
        });
        expect(result.success).toBe(true);
    });

    it('rejects missing required field einzelbewertung', () => {
        const { einzelbewertung, ...withoutField } = validGermanB1;
        const result = germanB1Schema.safeParse(withoutField);
        expect(result.success).toBe(false);
    });

    it('uses text descriptions not numeric scores for main criteria', () => {
        // German B1 uses text (z.string) for erfuellung, kohaerenz, wortschatz, strukturen
        const result = germanB1Schema.safeParse({
            ...validGermanB1,
            erfuellung: 10 // Should fail - expects string, not number
        });
        expect(result.success).toBe(false);
    });
});
