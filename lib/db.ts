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
    const values = [prompt.language, prompt.topic, prompt.level, prompt.prompt];
    return pool.query(query, values);
};

/**
 * Saves a user response to the database. TODO check if user_id connection works authomatically on supabase. 
 * @param promptId - UUID of the associated prompt
 * @param responseText - The user's response text
 * @param userId - UUID of the user (from Supabase Auth)
 * @param grade - Grade achieved as percentage (0-100)
 * @param metadata - Optional JSON metadata
 */
export const responseToDatabase = (
    userId: string,
    promptId: string,
    responseText: string,
    grade?: number,
    gradePercentage?: number,
    metadata?: Record<string, unknown>
) => {
    const insertQuery =
    `INSERT INTO responses (user_id, prompt_id, response_text, grade, grade_percentage, metadata)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING id`;
    const values = [
        userId,
        promptId,
        responseText,
        grade ?? null,
        gradePercentage ?? null,
        metadata ? JSON.stringify(metadata) : null
    ];
    return pool.query(insertQuery, values);
};

/**
//  * Retrieves all responses for a specific user.
//  * @param userId - UUID of the user
//  */
// export const getResponsesByUserId = (userId: string) => {
//     const selectQuery =
//     `SELECT r.*, p.prompt_text, p.language, p.level, p.topic
//      FROM responses r
//      LEFT JOIN prompts p ON r.prompt_id = p.id
//      WHERE r.user_id = $1
//      ORDER BY r.created_at DESC`;
//     return pool.query(selectQuery, [userId]);
// };

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