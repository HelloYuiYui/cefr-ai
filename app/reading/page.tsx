'use client';

import { useEffect, useState, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { Starter } from "../components";
import { Language, Level, Levels, Reading, UserAnswer } from "../types";
import { getReading, languageChange } from "../api/route";
import logger from "@/lib/logger";

const validLanguages = [Language.GERMAN, Language.FRENCH, Language.ENGLISH];
const validLevels = [Levels.A1, Levels.A2, Levels.B1, Levels.B2];

export default function ReadingPage() {
    const searchParams = useSearchParams();
    const [language, setLanguage] = useState<Language>(Language.GERMAN);
    const [level, setLevel] = useState<Level>(Levels.B1);
    const [reading, setReading] = useState<Reading | null>(null);
    const [userAnswers, setUserAnswers] = useState<UserAnswer[]>([]);
    const [submitted, setSubmitted] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const initializedRef = useRef(false);

    const fetchReadingText = async (lang: Language, lvl: Level) => {
        setIsLoading(true);
        try {
            logger.debug('Fetching reading text for', lang, lvl);
            const response = await getReading(lang, lvl);
            setReading(response as Reading);
        } catch (error) {
            logger.error('Error fetching reading text:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (initializedRef.current) return;
        initializedRef.current = true;

        const langParam = searchParams.get('lang');
        const levelParam = searchParams.get('level');

        if (langParam && levelParam) {
            const isValidLang = validLanguages.includes(langParam as Language);
            const isValidLevel = validLevels.includes(levelParam as any);

            if (isValidLang && isValidLevel) {
                const selectedLang = langParam as Language;
                const selectedLevel = levelParam as Level;

                setLanguage(selectedLang);
                setLevel(selectedLevel);
                languageChange(selectedLang);
                fetchReadingText(selectedLang, selectedLevel);
            } else {
                logger.warn('Invalid language or level for reading. Only German B1 is currently supported.');
            }
        } else {
            fetchReadingText(language, level);
        }
    }, [searchParams]);

    const handleAnswerSelect = (questionIndex: number, answerIndex: number) => {
        if (submitted) return;

        const existingAnswerIndex = userAnswers.findIndex(
            (ua) => ua.questionIndex === questionIndex
        );

        if (existingAnswerIndex >= 0) {
            const updatedAnswers = [...userAnswers];
            updatedAnswers[existingAnswerIndex].selectedAnswer = answerIndex;
            setUserAnswers(updatedAnswers);
        } else {
            setUserAnswers([...userAnswers, { questionIndex, selectedAnswer: answerIndex }]);
        }
    };

    const handleSubmit = () => {
        if (userAnswers.length !== reading?.questions.length) {
            alert('Please answer all questions before submitting.');
            return;
        }
        setSubmitted(true);
    };

    const calculateScore = () => {
        if (!reading) return 0;
        let correct = 0;
        userAnswers.forEach((ua) => {
            if (reading.questions[ua.questionIndex].correctAnswer === ua.selectedAnswer) {
                correct++;
            }
        });
        return correct;
    };

    if (isLoading) {
        return (
            <div className="min-h-screen overflow-hidden bg-gray-50">
                <Starter />
                <div className="contents p-8 w-full h-full">
                    <div className="loading-container">
                        <p className="loading-text text-gray-700">Loading your reading text...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (!reading) {
        return (
            <div className="min-h-screen overflow-hidden bg-gray-50">
                <Starter />
                <div className="contents p-8 w-full h-full">
                    <div className="loading-container">
                        <p className="loading-text text-gray-700">Unable to load reading text. Please try again.</p>
                    </div>
                </div>
            </div>
        );
    }

    const score = submitted ? calculateScore() : 0;

    return (
        <div className="min-h-screen overflow-hidden bg-gray-50">
            <Starter />
            <div className="contents p-8 w-full h-full">
                <div className="flex gap-6 h-full">
                    <div className="w-1/2 flex flex-col gap-4">
                        <div className="bg-white rounded-lg shadow-md p-6">
                            <h2 className="text-2xl font-bold mb-4 text-gray-900">Reading Text</h2>
                            <div className="prose max-w-none">
                                <p className="whitespace-pre-wrap text-lg leading-relaxed text-gray-800">{reading.text}</p>
                            </div>
                            <div className="mt-4 text-sm text-gray-600">
                                <span className="font-semibold">Topic:</span> {reading.topic} |
                                <span className="font-semibold ml-2">Level:</span> {reading.level}
                            </div>
                        </div>
                    </div>

                    <div className="w-1/2 flex flex-col gap-4">
                        <div className="bg-white rounded-lg shadow-md p-6">
                            <h2 className="text-2xl font-bold mb-4 text-gray-900">Questions</h2>
                            {reading.questions.map((question, qIndex) => {
                                const userAnswer = userAnswers.find((ua) => ua.questionIndex === qIndex);
                                const isCorrect = submitted && userAnswer && userAnswer.selectedAnswer === question.correctAnswer;

                                return (
                                    <div key={qIndex} className="mb-6 pb-6 border-b border-gray-200 last:border-b-0">
                                        <p className="font-semibold mb-3 text-lg text-gray-900">
                                            {qIndex + 1}. {question.question}
                                        </p>
                                        <div className="space-y-2">
                                            {question.options.map((option, oIndex) => {
                                                const isSelected = userAnswer?.selectedAnswer === oIndex;
                                                const isCorrectOption = question.correctAnswer === oIndex;
                                                const showCorrect = submitted && isCorrectOption;
                                                const showIncorrect = submitted && isSelected && !isCorrectOption;

                                                return (
                                                    <button
                                                        key={oIndex}
                                                        onClick={() => handleAnswerSelect(qIndex, oIndex)}
                                                        disabled={submitted}
                                                        className={`w-full text-left p-3 rounded border-2 transition-colors ${
                                                            showCorrect
                                                                ? 'bg-green-100/30 border-green-500 text-gray-900'
                                                                : showIncorrect
                                                                ? 'bg-red-100/30 border-red-500 text-gray-900'
                                                                : isSelected
                                                                ? 'bg-blue-100/30 border-blue-500 text-gray-900'
                                                                : 'bg-white border-gray-300 hover:border-blue-300-500 text-gray-900'
                                                        } ${submitted ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                                                    >
                                                        <span className="font-medium">{String.fromCharCode(65 + oIndex)}.</span> {option}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                        {submitted && (
                                            <div className={`mt-2 text-sm font-semibold ${isCorrect ? 'text-green-600' : 'text-red-600'}`}>
                                                {isCorrect ? '✓ Correct!' : '✗ Incorrect'}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}

                            {!submitted ? (
                                <button
                                    onClick={handleSubmit}
                                    className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700-600 transition-colors mt-4"
                                >
                                    Submit Answers
                                </button>
                            ) : (
                                <div className="mt-6 p-4 bg-gray-100 rounded-lg">
                                    <h3 className="text-xl font-bold mb-2 text-gray-900">Results</h3>
                                    <p className="text-lg text-gray-800">
                                        You got <span className="font-bold text-blue-600">{score}</span> out of{' '}
                                        <span className="font-bold text-gray-900">{reading.questions.length}</span> correct!
                                    </p>
                                    <p className="mt-2 text-gray-700">
                                        Score: {Math.round((score / reading.questions.length) * 100)}%
                                    </p>
                                    <button
                                        onClick={() => window.location.reload()}
                                        className="mt-4 bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700-600 transition-colors"
                                    >
                                        Try Another Text
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
