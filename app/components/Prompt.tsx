'use strict';
import './styles.css';
import { useTranslations } from "next-intl";

export default function Prompt({ prompt }: { prompt: string }) {
    const t = useTranslations('PromptPage');

    return (
        <div className="promptContainer w-full">
            <h2 className="promptTitle text-gray-900 text-lg md:text-xl">{t('title')}</h2>
            <p className="promptText text-gray-900 text-sm md:text-base leading-relaxed">{prompt}</p>
        </div>
    );
}
