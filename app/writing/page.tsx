'use client';
import { useEffect, useState, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { Form, Starter } from "../components";
import Selection from "../components/Selection";
import { Step, Language, Level, Levels, Prompt } from "../types";
import { getPrompt, languageChange, reviewAnswer } from "../api/route";
import Review from "../components/Review";
import logger from "@/lib/logger";
import PromptComponent from "../components/Prompt";
import { useAuth } from "../context/AuthContext";

const validLanguages = [Language.ENGLISH, Language.GERMAN, Language.FRENCH];
const validLevels = [Levels.A1, Levels.A2, Levels.B1, Levels.B2];

export default function WritingPage() {
    const searchParams = useSearchParams();
    const [state, setState] = useState<Step>(Step.SELECTION);
    const [language, setLanguage] = useState<Language>(Language.DEFAULT);
    const [level, setLevel] = useState<Level>(Levels.DEFAULT);
    const [prompt, setPrompt] = useState<Prompt>(); // Change this to Prompt type if you want to include more info like prompt ID, topic, etc.
    const [userInput, setUserInput] = useState<string>('');
    const [result, setResult] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [hasError, setHasError] = useState<boolean>(false);
    const initializedRef = useRef(false);
    const { user, loading: authLoading } = useAuth();

    const fetchPromptAndProceed = async (lang: Language, lvl: Level) => {
        setIsLoading(true);
        setHasError(false);
        try {
            logger.debug('Fetching prompt for', lang, lvl);
            const response = await getPrompt(lang, lvl);
            if ('error' in response) {
                logger.warn('Rate limit or error:', response.error);
                setHasError(true);
            } else {
                setPrompt(response as Prompt);
            }
            setState(Step.PRACTICE);
        } catch (error) {
            logger.error('Error fetching prompt:', error);
            setHasError(true);
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
            logger.debug(user);
            const response = await reviewAnswer(user?.id || "anonymous", prompt!, userInput); // TODO: Handle case where prompt is undefined, though it shouldn't be if flow is followed correctly.
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
                <div className="contents p-4 md:p-8 w-full h-full">
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

            <div className="contents p-4 md:p-8 w-full h-full">
                {
                    state === Step.SELECTION &&
                    <div>
                        <Selection language={language} changeLanguage={setLanguage} level={level} changeLevel={setLevel} proceedToPractice={proceedToPractice} />
                    </div>
                }
                { // Error message alone if there's an error, no prompt or form shown.
                    state === Step.PRACTICE && hasError &&
                    <div className="flex justify-center items-center h-full w-full">
                        <div className="w-full md:w-1/2">
                            <PromptComponent prompt="An error occured, you might be submitting too frequently. Please try again later." />
                        </div>
                    </div>
                }
                { // Normal prompt and form if no error. Still show the practice step even if there's an error, to display the message in the prompt component.
                    state === Step.PRACTICE && !hasError &&
                    <div className="flex flex-col md:flex-row gap-4 md:gap-6 h-full w-full">
                        <div className="w-full md:w-1/2">
                            <PromptComponent prompt={prompt!.prompt} />
                        </div>
                        <div className="w-full md:w-1/2">
                            <Form proceedToReview={proceedToReview} />
                        </div>
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
