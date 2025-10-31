'use client';
import { useEffect, useState } from "react";
import { Form, Starter } from "./components";
import Selection from "./components/Selection";
import { Step, Language, Level } from "./types";
import Prompt from "./components/Prompt";
import { getPrompt, languageChange, submitHandle } from "./api/route";
import Review from "./components/Review";
import { set } from "zod/v4";


export default function Home() {
    const [state, setState] = useState<Step>(Step.SELECTION);
    const [language, setLanguage] = useState<Language>(Language.DEFAULT);
    const [level, setLevel] = useState<Level>('B1');
    const [prompt, setPrompt] = useState<string>('');
    const [userInput, setUserInput] = useState<string>('');
    const [result, setResult] = useState<string>('');

    const proceedToPractice =  async () => {
        try {
            console.log('Fetching prompt for', language, level);
            const response = await getPrompt(language, level);
            setPrompt(response as string);
        } catch (error) {
            console.error('Error fetching prompt:', error);
            setPrompt('');
        } finally {
            setState(Step.PRACTICE);
        }
    };

    const proceedToReview = async (userInput: string) => {
        try {
            setUserInput(userInput);
            const response = await submitHandle(language, level, prompt, userInput);
            setResult(response as string);
        } catch (error) {
            console.error('Error submitting user input:', error);
        } finally {
            setState(Step.REVIEW);
        }
    };

    useEffect(() => {
        console.log('Language changed to:', language);
        languageChange(language);
    }, [language]);

    if (true) {
        return (
            <div className="min-h-screen overflow-hidden">
                {/* Change to passing only the language */}
                {<Starter />}

                <div className="contents p-8 w-full h-full">
                    {
                        state === Step.SELECTION && 
                        <div>
                            <Selection language={language} changeLanguage={setLanguage} level={level} changeLevel={setLevel} proceedToPractice={proceedToPractice} />
                        </div>
                    }
                    {
                        state === Step.PRACTICE && 
                        <div className="flex gap-4 h-full">
                            <div className="w-1/2"><Prompt prompt={prompt} /></div>
                            <div className="w-1/2"><Form proceedToReview={proceedToReview} /></div>
                        </div>
                    }
                    {
                        state === Step.REVIEW && 
                        <Review input={userInput} analysis={result} />
                    }
                </div>
            </div>
        )
    }
}