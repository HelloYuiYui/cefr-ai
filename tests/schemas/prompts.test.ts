import { describe, it, expect } from 'vitest';
import {
    writingPrompt,
    readingPrompt,
    frenchA1,
    frenchA2,
    frenchB1,
    frenchB2,
    germanB1,
    baseline
} from '@/lib/schemas/prompts';

describe('writingPrompt()', () => {
    it('includes the language name in output', () => {
        const result = writingPrompt('B1', 'German', 'Technology');
        expect(result).toContain('German');
    });

    it('includes the CEFR level in output', () => {
        const result = writingPrompt('A1', 'French', 'Education');
        expect(result).toContain('A1');
    });

    it('includes the topic in output', () => {
        const result = writingPrompt('B2', 'English', 'Public health');
        expect(result).toContain('Public health');
    });

    it('includes level-appropriate constraints for A1-A2', () => {
        const result = writingPrompt('A1', 'French', 'Food');
        expect(result).toContain('A1–A2');
        expect(result).toContain('concrete');
    });

    it('includes level-appropriate constraints for B2+', () => {
        const result = writingPrompt('B2', 'German', 'Society');
        expect(result).toContain('B2+');
        expect(result).toContain('abstract');
    });

    it('returns a non-empty string', () => {
        const result = writingPrompt('B1', 'English', 'Culture');
        expect(result.length).toBeGreaterThan(0);
    });

    it('mentions word count range', () => {
        const result = writingPrompt('B1', 'French', 'Education');
        expect(result).toContain('word count');
    });
});

describe('readingPrompt()', () => {
    it('includes the language name in output', () => {
        const result = readingPrompt('B1', 'German', 'Technology');
        expect(result).toContain('German');
    });

    it('includes the CEFR level in output', () => {
        const result = readingPrompt('A2', 'French', 'Food');
        expect(result).toContain('A2');
    });

    it('includes the topic in output', () => {
        const result = readingPrompt('B1', 'German', 'Tourism and travelling');
        expect(result).toContain('Tourism and travelling');
    });

    it('mentions FOUR multiple-choice questions', () => {
        const result = readingPrompt('B1', 'German', 'Culture');
        expect(result).toContain('FOUR');
        expect(result).toContain('multiple-choice');
    });

    it('mentions EXACTLY FOUR options per question', () => {
        const result = readingPrompt('A1', 'English', 'Food');
        expect(result).toContain('EXACTLY FOUR options');
    });

    it('mentions correctAnswer index 0-3', () => {
        const result = readingPrompt('B2', 'French', 'Media');
        expect(result).toContain('0-3');
    });

    it('specifies level-appropriate text lengths', () => {
        const result = readingPrompt('A1', 'English', 'Food');
        expect(result).toContain('A1: 30-80');
    });
});

describe('frenchA1()', () => {
    const prompt = 'Write about your daily routine.';
    const userInput = 'Je me lève à sept heures.';

    it('includes the prompt text', () => {
        const result = frenchA1(prompt, userInput);
        expect(result).toContain(prompt);
    });

    it('includes the user input text', () => {
        const result = frenchA1(prompt, userInput);
        expect(result).toContain(userInput);
    });

    it('mentions scoring out of 15', () => {
        const result = frenchA1(prompt, userInput);
        expect(result).toContain('15');
    });

    it('is in French language', () => {
        const result = frenchA1(prompt, userInput);
        expect(result).toContain('Vous êtes');
    });

    it('includes Respect de la consigne criterion', () => {
        const result = frenchA1(prompt, userInput);
        expect(result).toContain('Respect de la consigne');
    });

    it('includes Correction sociolinguistique criterion', () => {
        const result = frenchA1(prompt, userInput);
        expect(result).toContain('Correction sociolinguistique');
    });

    it('includes Capacité à informer criterion', () => {
        const result = frenchA1(prompt, userInput);
        expect(result).toContain('informer');
    });

    it('includes Lexique criterion', () => {
        const result = frenchA1(prompt, userInput);
        expect(result).toContain('Lexique');
    });

    it('includes Morphosyntaxe criterion', () => {
        const result = frenchA1(prompt, userInput);
        expect(result).toContain('Morphosyntaxe');
    });

    it('includes Cohérence et cohésion criterion', () => {
        const result = frenchA1(prompt, userInput);
        expect(result).toContain('Cohérence');
    });
});

describe('frenchA2()', () => {
    const prompt = 'Describe your last holiday.';
    const userInput = 'Je suis allé en vacances.';

    it('includes scoring out of 13', () => {
        const result = frenchA2(prompt, userInput);
        expect(result).toContain('13');
    });

    it('includes Respect de la consigne criterion', () => {
        const result = frenchA2(prompt, userInput);
        expect(result).toContain('Respect de la consigne');
    });

    it('includes Capacité à raconter et à décrire criterion', () => {
        const result = frenchA2(prompt, userInput);
        expect(result).toContain('raconter');
    });

    it('includes Capacité à donner ses impressions criterion', () => {
        const result = frenchA2(prompt, userInput);
        expect(result).toContain('impressions');
    });

    it('includes Lexique criterion', () => {
        const result = frenchA2(prompt, userInput);
        expect(result).toContain('Lexique');
    });

    it('includes Morphosyntaxe criterion', () => {
        const result = frenchA2(prompt, userInput);
        expect(result).toContain('Morphosyntaxe');
    });

    it('includes Cohérence et cohésion criterion', () => {
        const result = frenchA2(prompt, userInput);
        expect(result).toContain('Cohérence');
    });
});

describe('frenchB1()', () => {
    const prompt = 'Give your opinion on social media.';
    const userInput = 'Les réseaux sociaux sont importants.';

    it('includes scoring out of 25', () => {
        const result = frenchB1(prompt, userInput);
        expect(result).toContain('25');
    });

    it('includes word count rules with 144 words threshold', () => {
        const result = frenchB1(prompt, userInput);
        expect(result).toContain('144');
    });

    it('includes Respect de la consigne criterion', () => {
        const result = frenchB1(prompt, userInput);
        expect(result).toContain('Respect de la consigne');
    });

    it('includes Capacité à présenter des faits criterion', () => {
        const result = frenchB1(prompt, userInput);
        expect(result).toContain('présenter des faits');
    });

    it('includes Capacité à exprimer sa pensée criterion', () => {
        const result = frenchB1(prompt, userInput);
        expect(result).toContain('exprimer sa pensée');
    });

    it('includes vocabulary criteria', () => {
        const result = frenchB1(prompt, userInput);
        expect(result).toContain('Étendue du vocabulaire');
        expect(result).toContain('Maîtrise du vocabulaire');
    });

    it('includes grammar criteria', () => {
        const result = frenchB1(prompt, userInput);
        expect(result).toContain('Degré d\'élaboration des phrases');
        expect(result).toContain('Choix des temps et des modes');
    });

    it('includes all 10 B1 criteria names', () => {
        const result = frenchB1(prompt, userInput);
        expect(result).toContain('Respect de la consigne');
        expect(result).toContain('présenter des faits');
        expect(result).toContain('exprimer sa pensée');
        expect(result).toContain('Cohérence et cohésion');
        expect(result).toContain('Étendue du vocabulaire');
        expect(result).toContain('Maîtrise du vocabulaire');
        expect(result).toContain('orthographe lexicale');
        expect(result).toContain('élaboration des phrases');
        expect(result).toContain('temps et des modes');
        expect(result).toContain('Morphosyntaxe');
    });
});

describe('frenchB2()', () => {
    const prompt = 'Argue for or against remote work.';
    const userInput = 'Le télétravail est devenu incontournable.';

    it('includes scoring out of 25', () => {
        const result = frenchB2(prompt, userInput);
        expect(result).toContain('25');
    });

    it('includes word count rules with 225 words threshold', () => {
        const result = frenchB2(prompt, userInput);
        expect(result).toContain('225');
    });

    it('includes Capacité à argumenter criterion', () => {
        const result = frenchB2(prompt, userInput);
        expect(result).toContain('argumenter');
    });

    it('includes Correction sociolinguistique criterion', () => {
        const result = frenchB2(prompt, userInput);
        expect(result).toContain('Correction sociolinguistique');
    });

    it('includes Choix des formes criterion', () => {
        const result = frenchB2(prompt, userInput);
        expect(result).toContain('Choix des formes');
    });

    it('includes all 10 B2 criteria names', () => {
        const result = frenchB2(prompt, userInput);
        expect(result).toContain('Respect de la consigne');
        expect(result).toContain('Correction sociolinguistique');
        expect(result).toContain('présenter des faits');
        expect(result).toContain('argumenter');
        expect(result).toContain('Cohérence et cohésion');
        expect(result).toContain('Étendue du vocabulaire');
        expect(result).toContain('Maîtrise du vocabulaire');
        expect(result).toContain('orthographe');
        expect(result).toContain('Choix des formes');
        expect(result).toContain('élaboration des phrases');
    });
});

describe('germanB1()', () => {
    const prompt = 'Schreiben Sie eine E-Mail an einen Freund.';
    const userInput = 'Lieber Hans, ich schreibe dir heute.';

    it('includes the prompt text', () => {
        const result = germanB1(prompt, userInput);
        expect(result).toContain(prompt);
    });

    it('includes the user input text', () => {
        const result = germanB1(prompt, userInput);
        expect(result).toContain(userInput);
    });

    it('is in German language', () => {
        const result = germanB1(prompt, userInput);
        expect(result).toContain('Du bist eine erfahrene');
    });

    it('mentions Erfüllung criterion', () => {
        const result = germanB1(prompt, userInput);
        expect(result).toContain('Erfüllung');
    });

    it('mentions Kohärenz criterion', () => {
        const result = germanB1(prompt, userInput);
        expect(result).toContain('Kohärenz');
    });

    it('mentions Wortschatz criterion', () => {
        const result = germanB1(prompt, userInput);
        expect(result).toContain('Wortschatz');
    });

    it('mentions Strukturen criterion', () => {
        const result = germanB1(prompt, userInput);
        expect(result).toContain('Strukturen');
    });

    it('includes the A-E grading scale', () => {
        const result = germanB1(prompt, userInput);
        expect(result).toContain('A:');
        expect(result).toContain('B:');
        expect(result).toContain('C:');
        expect(result).toContain('D:');
        expect(result).toContain('E:');
    });

    it('includes point values for grading scale', () => {
        const result = germanB1(prompt, userInput);
        expect(result).toContain('A = 10');
        expect(result).toContain('B = 7,5');
        expect(result).toContain('C = 5');
        expect(result).toContain('D = 2,5');
        expect(result).toContain('E = 0');
    });
});

describe('baseline()', () => {
    const prompt = 'Write about your favorite book.';
    const userInput = 'My favorite book is Harry Potter.';

    it('includes the prompt text', () => {
        const result = baseline(prompt, userInput);
        expect(result).toContain(prompt);
    });

    it('includes the user input text', () => {
        const result = baseline(prompt, userInput);
        expect(result).toContain(userInput);
    });

    it('includes language when provided', () => {
        const result = baseline(prompt, userInput, 'English', 'B1');
        expect(result).toContain('English');
    });

    it('includes level when provided', () => {
        const result = baseline(prompt, userInput, 'English', 'B1');
        expect(result).toContain('B1');
    });

    it('handles undefined language gracefully', () => {
        const result = baseline(prompt, userInput, undefined, 'B1');
        expect(result).not.toContain('undefined');
    });

    it('handles undefined level gracefully', () => {
        const result = baseline(prompt, userInput, 'English', undefined);
        expect(result).not.toContain('undefined');
    });

    it('mentions scoring 0-100', () => {
        const result = baseline(prompt, userInput);
        expect(result).toContain('0 to 100');
    });

    it('mentions 60 as minimum passing score', () => {
        const result = baseline(prompt, userInput);
        expect(result).toContain('60');
        expect(result).toContain('minimum passing');
    });
});
