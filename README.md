# CEFR-AI Writing Assistant

The main purpose of this tool is to provide a language learner an assistant in improving their writing skills in a target language. Currently it has three language options, English, German, and French. A central point was the CEFR scale based approach into generating prompts to accommodate learners at different levels, and also provide detailed reviews and feedback for each level with a sound CEFR-based scale in marking the response and suggesting improvements or points of weaknesses in user's texts. Currently this CEFR examination based marking is only implemented for French A1 level and the others are kept as more of a prototype. This is hopefully to be expanded in time. The web page is currently designed to be used on Google Chrome for laptop or desktop screens. 

This project uses Next.js, React, and TypeScript.

## Testing the tool

The application is currently hosted on Vercel, and can be accessed through the following link: 

https://cefr-ai-nc59.vercel.app/


## Deploying it locally

Ensure that your Mistral API key is located at `./.env.local` and is as below:

```
MISTRAL_API_KEY=[Your Mistral API key here]
```

To run the development server, run

```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the application.

## Current features

The app presents three language options and six level options to the user: English, German, or French; at A1, A2, B1, B2, C1, and C2 levels. There is localisation in the interface language depending on the selected language, and once the user proceeds they are presented with a writing prompt and a text box. Once the user inputs their answer and press analyse, the answer, prompt, and other relevant information (language and level) is sent to Mistral API to produce a review of the answer, a marking and feedback on the text's grammar, vocabulary, and fluidity. Currently the appropriate marking criteria is only available for French A1 level. 


## Future work

Current format of the page is limited, and there are more possible enhancements, below are some I have thought about and hope to implement in future. 

- For higher CEFR levels, the standardised examinations contain multiple writing questions, each handling a different context and use case of the language and are assessed differently. This could be integrated into the question and answer formatting.
- Although this application was built to improve writing skills at a relaxed and self-paced manner, an optional timer could be introduced to enhance the preparation experience. 
- Other languages supported by Mistral could be added. But I have chosen to focus on German and French for now to improve the response formatting and feedback for them. 