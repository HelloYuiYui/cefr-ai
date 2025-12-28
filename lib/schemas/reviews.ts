import z from "zod";

export const frenchA1Schema = z.object({
    name: z.string(),
    grammarFeedback: z.string().min(10).max(500),
    vocabularyFeedback: z.string().min(10).max(500),
    textFluencyFeedback: z.string().min(10).max(500),
    respectDeLaConsigne: z.number().min(0).max(2).step(0.5),
    correctionSociolinguistique: z.number().min(0).max(2).step(0.5),
    capaciteAInformerEtOuDecrire: z.number().min(0).max(4).step(0.5),
    lexiqueOrthographeLexicale: z.number().min(0).max(3).step(0.5),
    morphosyntaxeOrthographeGrammaticale: z.number().min(0).max(3).step(0.5),
    coherenceEtCohesion: z.number().min(0).max(1).step(0.5),
    language: z.string(),
    level: z.string()
});

export const frenchA1SchemaJson = {
    type: 'object',
    properties: {
        grammarFeedback: { type: 'string', description: 'Feedback on grammatical accuracy and range.' },
        vocabularyFeedback: { type: 'string', description: 'Feedback on vocabulary use and appropriateness.' },
        textFluencyFeedback: { type: 'string', description: 'Feedback on the fluency and coherence of the text.' },
        respectDeLaConsigne: { type: 'number', minSize: 0, maxSize: 2, step: 0.5 },
        correctionSociolinguistique: { type: 'number', minSize: 0, maxSize: 2, step: 0.5 },
        capaciteAInformerEtOuDecrire: { type: 'number', minSize: 0, maxSize: 4, step: 0.5 },
        lexiqueOrthographeLexicale: { type: 'number', minSize: 0, maxSize: 3, step: 0.5 },
        morphosyntaxeOrthographeGrammaticale: { type: 'number', minSize: 0, maxSize: 3, step: 0.5 },
        coherenceEtCohesion: { type: 'number', minSize: 0, maxSize: 1, step: 0.5 },
        outOf: { type: 'number', default: 15 },
        language: { type: 'string' },
        level: { type: 'string' }
    },
    required: ['grammarFeedback', 'vocabularyFeedback', 'textFluencyFeedback', 'respectDeLaConsigne', 'correctionSociolinguistique', 'capaciteAInformerEtOuDecrire', 'lexiqueOrthographeLexicale', 'morphosyntaxeOrthographeGrammaticale', 'coherenceEtCohesion', 'language', 'level'],
    additionalProperties: false
}



export const germanB1Schema = z.object({
    name: z.string(),
    grammarFeedback: z.string().min(10).max(500),
    vocabularyFeedback: z.string().min(10).max(500),
    textFluencyFeedback: z.string().min(10).max(500),

    erfuellung: z.string().min(50).max(2000),
    kohaerenz: z.string().min(50).max(2000),
    wortschatz: z.string().min(50).max(2000),
    strukturen: z.string().min(50).max(2000),

    einzelbewertung: z.string().min(50).max(2000),
    punktetabelle: z.string().min(20).max(1000),
    kurzerPruefkommentar: z.string().min(20).max(1000),
})

export const germanB1SchemaJson = {
    type: 'object',
    properties: {
        grammarFeedback: { type: 'string', description: 'Feedback on grammatical accuracy and range.' },
        vocabularyFeedback: { type: 'string', description: 'Feedback on vocabulary use and appropriateness.' },
        textFluencyFeedback: { type: 'string', description: 'Feedback on the fluency and coherence of the text.' },

        erfuellung: { type: 'number', description: 'Evaluation of task achievement.', minSize: 0, maxSize: 10, step: 2.5 },
        kohaerenz: { type: 'number', description: 'Evaluation of coherence.', minSize: 0, maxSize: 10, step: 2.5 },
        wortschatz: { type: 'number', description: 'Evaluation of vocabulary.', minSize: 0, maxSize: 10, step: 2.5 },
        strukturen: { type: 'number', description: 'Evaluation of structures.', minSize: 0, maxSize: 10, step: 2.5 },

        outOf: { type: 'number', default: 40 },
        kurzerPruefkommentar: { type: 'string', description: 'Detailed examiner commentary.' },
    },
    required: ['grammarFeedback', 'vocabularyFeedback', 'textFluencyFeedback', 'erfuellung', 'kohaerenz', 'wortschatz', 'strukturen', 'einzelbewertung', 'punktetabelle', 'kurzerPruefkommentar'],
    additionalProperties: false
}