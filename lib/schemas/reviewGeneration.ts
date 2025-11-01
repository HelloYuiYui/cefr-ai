import { Language, Level, Levels, MODEL } from "@/app/types";
import mistral from "../mistral";
import { frenchA1 } from "./prompts";
import { minSize } from "zod/v4";

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
                case Levels.A2:
                    response = "Comment ça va?";
                    break;
                case Levels.B1:
                    response = "Je voudrais réserver une table pour deux personnes.";
                    break;
                case Levels.B2:
                    response = "Pouvez-vous me recommander un bon restaurant dans les environs?";
                    break;
                case Levels.C1:
                    response = "La littérature française du XXe siècle offre une richesse inégalée en termes de styles et de thèmes.";
                    break;
                case Levels.C2:
                    response = "L'analyse approfondie des œuvres de Marcel Proust révèle une complexité narrative et une exploration psychologique remarquables.";
                    break;
                default:
                    response = "Bonjour";
                    break;
                }
            break;
        case (Language.GERMAN):
            switch (level) {
                case Levels.A1:
                    response = "Apple";
                    break;
                case Levels.A2:
                    response = "Banana";
                    break;
                case Levels.B1:
                    response = "Cherry";
                    break;
                case Levels.B2:
                    response = "Date";
                    break;
                case Levels.C1:
                    response = "Elderberry";
                    break;
                case Levels.C2:
                    response = "Fig";
                    break;
                default:
                    response = "Hallo";
                    break; 
            }
        default:
            response = {choices: [{message: {content: "Invalid language"}}]};
            break;
    }
    
    let reply;
    try {
        const content = response.choices?.[0]?.message?.content
        
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