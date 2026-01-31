'use client';
import { useEffect, useState, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { Form, Starter } from "../components";
import Selection from "../components/Selection";
import { Step, Language, Level, Levels } from "../types";
import Prompt from "../components/Prompt";
import { getPrompt, languageChange, reviewAnswer } from "../api/route";
import Review from "../components/Review";
import logger from "@/lib/logger";

const validLanguages = [Language.ENGLISH, Language.GERMAN, Language.FRENCH];
const validLevels = [Levels.A1, Levels.A2, Levels.B1, Levels.B2, Levels.C1, Levels.C2];

export default function WritingPage() {
    const searchParams = useSearchParams();
    const [state, setState] = useState<Step>(Step.SELECTION);
    const [language, setLanguage] = useState<Language>(Language.DEFAULT);
    const [level, setLevel] = useState<Level>(Levels.DEFAULT);
    const [prompt, setPrompt] = useState<string>('');
    const [userInput, setUserInput] = useState<string>('');
    const [result, setResult] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const initializedRef = useRef(false);

    const fetchPromptAndProceed = async (lang: Language, lvl: Level) => {
        setIsLoading(true);
        try {
            logger.debug('Fetching prompt for', lang, lvl);
            const response = await getPrompt(lang, lvl);
            setPrompt(response.prompt as string);
            setState(Step.PRACTICE);
        } catch (error) {
            logger.error('Error fetching prompt:', error);
            setPrompt('');
            setState(Step.PRACTICE);
        } finally {
            setIsLoading(false);
        }
    };

    const proceedToPractice = async () => {
        await fetchPromptAndProceed(language, level);
    };

    const proceedToReview = async (userInput: string) => {
        try {
            setUserInput(userInput);
            const response = await reviewAnswer(language, level, prompt, userInput);
            logger.debug('Received analysis:', response);
            setResult(response as string);
        } catch (error) {
            logger.error('Error submitting user input:', error);
        } finally {
            setState(Step.REVIEW);
        }
    };

    // Handle URL params on mount - skip selection if valid params provided
    useEffect(() => {
        if (initializedRef.current) return;
        initializedRef.current = true;

        const langParam = searchParams.get('lang');
        const levelParam = searchParams.get('level');

        if (langParam && levelParam) {
            const isValidLang = validLanguages.includes(langParam as Language);
            const isValidLevel = validLevels.includes(levelParam as Level);

            if (isValidLang && isValidLevel) {
                const selectedLang = langParam as Language;
                const selectedLevel = levelParam as Level;

                setLanguage(selectedLang);
                setLevel(selectedLevel);
                languageChange(selectedLang);
                fetchPromptAndProceed(selectedLang, selectedLevel);
            }
        }
    }, [searchParams]);

    useEffect(() => {
        logger.debug('Language changed to:', language);
        languageChange(language);
    }, [language]);

    if (isLoading) {
        return (
            <div className="min-h-screen overflow-hidden">
                <Starter />
                <div className="contents p-8 w-full h-full">
                    <div className="loading-container">
                        <p className="loading-text">Loading your writing prompt...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen overflow-hidden">
            <Starter />

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
    );
}
