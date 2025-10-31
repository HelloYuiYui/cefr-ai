'use strict';
import { useEffect, useState } from "react";
import { getPrompt } from "../api/route";
import './styles.css';
import { Language, Level } from "../types";
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
