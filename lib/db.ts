import { Prompt } from '@/app/types';
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

export const responseToDatabase = (promptId: string, responseText: string, metadata?: any) => {
    const query = 
    `INSERT INTO responses (prompt_id, response_text, metadata)
     VALUES ($1, $2, $3)
     RETURNING id`;
    const values = [promptId, responseText, metadata ? JSON.stringify(metadata) : null];
    return pool.query(query, values);
};

export const readingTextToDatabase = (prompt: Prompt) => {
    const query = 
    `INSERT INTO reading_texts (language, topic, level, prompt_text)
     VALUES ($1, $2, $3, $4)
     RETURNING id`;
    const values = [prompt.language, prompt.topic, prompt.level, prompt.prompt_text];
    return pool.query(query, values);
};

// Not functional yet.
export const readingResponseToDatabase = (promptId: string, responseText: string, metadata?: any) => {
    const query = 
    `INSERT INTO reading_responses (prompt_id, response_text, metadata)
     VALUES ($1, $2, $3)
     RETURNING id`;
    const values = [promptId, responseText, metadata ? JSON.stringify(metadata) : null];
    return pool.query(query, values);
};