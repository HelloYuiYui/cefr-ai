import { useEffect, useState } from "react";
import { getPrompt } from "../api/route";
import './styles.css';
import { Language, Level } from "../types";
import { useTranslations } from "next-intl";

export default function Prompt({ language, level }: { language: Language; level: Level }) {
    const t = useTranslations('PromptPage');
    
    const [prompt, setPrompt] = useState('');

    useEffect(() => {
        const fetchPrompt = async () => {
            const response = await getPrompt(language, level);
            setPrompt(response as string);
        };
        fetchPrompt();
    }, [language, level]);

    return (
        <div className="promptContainer">
            <h2 className="promptTitle">{t('title')}</h2>
            <p className="promptText">{prompt}</p>
        </div>
    );
}
