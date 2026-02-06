import { Prompt, Reading } from '@/app/types';
import pkg from 'pg'; // eslint-disable-line

const { Pool } = pkg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export const query = (text: string, params?: any[]) => {
  return pool.query(text, params);
};

export const promptToDatabase = (prompt: Prompt) => {
    const query = 
    `INSERT INTO prompts (language, topic, level, prompt_text)
     VALUES ($1, $2, $3, $4)
     RETURNING id`;
    const values = [prompt.language, prompt.topic, prompt.level, prompt.prompt_text];
    return pool.query(query, values);
};

// Not functional yet. Must connect with user account system to associate responses with users, and implement a way to link responses to specific prompts.
export const responseToDatabase = (promptId: string, responseText: string, metadata?: any) => {
    const query = 
    `INSERT INTO responses (prompt_id, response_text, metadata)
     VALUES ($1, $2, $3)
     RETURNING id`;
    const values = [promptId, responseText, metadata ? JSON.stringify(metadata) : null];
    return pool.query(query, values);
};

/**
 * Saves a reading text with its questions to the database.
 * @param reading - Reading object containing text, metadata, and questions
 */
export const readingTextToDatabase = (reading: Reading) => {
    const query =
    `INSERT INTO reading_texts (language, topic, level, prompt_text, questions)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id`;
    const values = [reading.language, reading.topic, reading.level, reading.text, JSON.stringify(reading.questions)];
    return pool.query(query, values);
};

// TODO: Ignore for now. Not functional yet. May be worth investigating if it is necessary to save each response separately or if we can squeeze them into a tighter format such as rightAnswers and userAnswers since the. questions are already stored in the database and can be linked via promptId. Also must connect with user account system to associate responses with users, and implement a way to link responses to specific reading texts.
export const readingResponseToDatabase = (promptId: string, responseText: string, metadata?: any) => {
    const query = 
    `INSERT INTO reading_responses (prompt_id, response_text, metadata)
     VALUES ($1, $2, $3)
     RETURNING id`;
    const values = [promptId, responseText, metadata ? JSON.stringify(metadata) : null];
    return pool.query(query, values);
};