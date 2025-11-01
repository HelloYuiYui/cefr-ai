'use strict';
import './styles.css';
import { useTranslations } from "next-intl";

export default function Prompt({ prompt }: { prompt: string }) {
    const t = useTranslations('PromptPage');

    return (
        <div className="promptContainer">
            <h2 className="promptTitle">{t('title')}</h2>
            <p className="promptText">{prompt}</p>
        </div>
    );
}
