import { Language, Level, Levels, MODEL } from "@/app/types";
import mistral from "../mistral";
import { baseline, frenchA1 } from "./prompts";

/**
 * Generate a review for the user's writing based on the given prompt and user input.
 * @param language - The language of the writing (e.g., French, German).
 * @param level - The CEFR level of the writing (e.g., A1, A2, B1, B2).
 * @param prompt - The writing prompt provided to the user.
 * @param userInput - The user's written response to the prompt.
 * @returns A structured review of the user's writing, including feedback on various aspects.
 */
export const reviewGeneration = async (language: Language, level: Level, prompt: string, userInput: string) => {
    console.log('Generating review for', language, level);
    let response;
    switch (language) {
        case (Language.FRENCH):
            switch (level) {
                case Levels.A1:
                    response = await mistral.chat.complete({
                        model: MODEL,
                        messages: [
                            {
                                role: 'system',
                                content: frenchA1(prompt, userInput)
                            }
                        ],
                        randomSeed: 42,
                        responseFormat: {
                            type: 'json_schema',
                            jsonSchema: {
                                name: 'frenchA1',
                                description: 'Feedback for A1 level French learner.',
                                schemaDefinition: {
                                    type: 'object',
                                    // TODO: Turn this into a zod schema?
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
                            }
                        }
                    });
                    console.log('Generated review for French A1 level:', response.choices[0].message);
                    break;
            }
            if (level === Levels.A1) {
                break;
            }
        case (Language.GERMAN):
        default:
            response = await mistral.chat.complete({
                model: MODEL,
                messages: [
                    {
                        role: 'system',
                        content: baseline(prompt, userInput, language, level)
                    }
                ],
                randomSeed: 42,
                responseFormat: {
                    type: 'json_schema',
                    jsonSchema: {
                        name: 'default',
                        description: 'Feedback for an unschematised language or level learner.',
                        schemaDefinition: {
                            type: 'object',
                            properties: {
                                grammarFeedback: { type: 'string', description: 'Feedback on grammatical accuracy and range.' },
                                vocabularyFeedback: { type: 'string', description: 'Feedback on vocabulary use and appropriateness.' },
                                textFluencyFeedback: { type: 'string', description: 'Feedback on the fluency and coherence of the text.' },
                                totalScore: { type: 'number', minSize: 0, maxSize: 100, step: 1 },
                                outOf: { type: 'number', default: 100 },
                                language: { type: 'string' },
                                level: { type: 'string', description: 'Estimated CEFR level of the user based on their written production. Only use [A1, A2, B1, B2, C1, C2]' }
                            },
                            required: ['grammarFeedback', 'vocabularyFeedback', 'textFluencyFeedback', 'totalScore', 'language', 'level'],
                            additionalProperties: false
                        }
                    }
                }
            });
            break;
    }
    
    let reply;
    try {
        const content = response!.choices?.[0]?.message?.content // eslint-disable
        
        if (typeof content === 'string') {
            reply = JSON.parse(content)
            console.log('Parsed prompt reply:', reply.prompt)
        } else {
            reply = 'No valid response.';
            console.error('Unexpected content format:', content)
        }
    } catch (error) {
        console.error('Error parsing prompt reply:', error)
    }


    return reply;
}

export default reviewGeneration;