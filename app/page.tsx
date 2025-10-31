'use client';
import { useEffect, useState } from "react";
import { Form, Starter } from "./components";
import Selection from "./components/Selection";
import { Step, Language, Level } from "./types";
import Prompt from "./components/Prompt";
import { languageChange, submitHandle } from "./api/route";


export default function Home() {
    const [state, setState] = useState<Step>(Step.SELECTION);
    const [language, setLanguage] = useState<Language>(Language.DEFAULT);
    const [level, setLevel] = useState<Level>('A1');

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
                            <Selection language={language} changeLanguage={setLanguage} level={level} changeLevel={setLevel} proceedToPractice={() => setState(Step.PRACTICE)} />
                        </div>
                    }
                    {
                        state === Step.PRACTICE && 
                        <div className="flex gap-4 h-full">
                            <div className="w-1/2"><Prompt language={language} level={level} /></div>
                            <div className="w-1/2"><Form proceedToReview={() => setState(Step.REVIEW)} /></div>
                        </div>
                    }
                    {
                        state === Step.REVIEW && 
                        <div>
                            
                        </div>
                    }
                </div>
            </div>
        )
    }
}