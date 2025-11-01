import z from "zod";

export const frenchA1 = z.object({
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

export default frenchA1;