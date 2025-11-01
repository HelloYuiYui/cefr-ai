import { Language, LanguageNames, Level, MODEL } from "@/app/types";
import mistral from "../mistral";


export const promptSchema = async (language: Language, level: Level) => {
    const languageName = LanguageNames[language];
    const prompt = await mistral.chat.complete({
        model: MODEL,
        messages: [
            {
                role: 'system',
                content: `Provide a writing prompt in ${languageName} for CEFR level ${level}. The prompt should be engaging and suitable for learners at this proficiency level. Only give the prompt as a short description without any additional explanations.`
            }
        ],
        randomSeed: 42,
        responseFormat: { 
            type: 'json_schema', 
            jsonSchema: {
                name: 'prompt',
                description: 'A writing prompt for language learners.',
                schemaDefinition: {
                    type: 'object',
                    properties: {
                        prompt: { type: 'string' },
                        language: { type: 'string' },
                        level: { type: 'string' }
                    },
                    required: ['prompt', 'language', 'level'],
                    additionalProperties: false
                }
            }
        }
    })
    let reply
    try {
        const content = prompt.choices?.[0]?.message?.content
        
        if (typeof content === 'string') {
            // content is already a string, safe to parse
            reply = JSON.parse(content) // eslint-disable-line no-undef 
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

export default promptSchema;
// [
//     {
//         role: 'system',
//         content: `Treat this as a language level at ${language} CEFR level writing exercise at ${level}. The prompt was: ${prompt}. Here is the user's response: ${input}. Provide constructive feedback on grammar, vocabulary, and coherence, and give the user a score out of 10.`
//     }
// ]