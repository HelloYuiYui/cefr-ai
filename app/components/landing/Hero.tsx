'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Language, Levels, Level } from '../../types';
import '../styles.css';
import { languageChange } from '@/app/api/route';

const languages = [
    { code: Language.ENGLISH, flag: '🇬🇧', name: 'English' },
    { code: Language.GERMAN, flag: '🇩🇪', name: 'Deutsch' },
    { code: Language.FRENCH, flag: '🇫🇷', name: 'Français' },
];

const levels: Level[] = [Levels.A1, Levels.A2, Levels.B1, Levels.B2];

export default function Hero() {
    const t = useTranslations('Landing');
    const [selectedLanguage, setSelectedLanguage] = useState<Language>(Language.DEFAULT);
    const [selectedLevel, setSelectedLevel] = useState<Level>(Levels.DEFAULT);

    const writingUrl = `/writing?lang=${selectedLanguage}&level=${selectedLevel}`;
    const readingUrl = `/reading?lang=${selectedLanguage}&level=${selectedLevel}`;
    const isReadingEnabled = true; // selectedLanguage === Language.GERMAN && selectedLevel === Levels.B1;

    return (
        <section className="hero">
            <div className="hero-content">
                <h1 className="hero-title">{t('heroTitle')}</h1>
                <p className="hero-subtitle">{t('heroSubtitle')}</p>

                <div className="selection-section w-full max-w-full md:max-w-[600px] px-4 md:px-0">
                    <div className="selection-group">
                        <span className="selection-label text-sm md:text-base">{t('selectLanguage')}:</span>
                        <div className="language-buttons">
                            {languages.map((lang) => (
                                <button
                                    key={lang.code}
                                    className={`language-button text-sm md:text-base ${selectedLanguage === lang.code ? 'selected' : ''}`}
                                    onClick={() => {setSelectedLanguage(lang.code as Language) ; languageChange(lang.code as Language)}}
                                    type="button"
                                >
                                    <span className="language-flag text-xl md:text-2xl">{lang.flag}</span>
                                    <span className="language-name">{lang.name}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="selection-group">
                        <span className="selection-label text-sm md:text-base">{t('selectLevel')}:</span>
                        <div className="level-buttons">
                            {levels.map((level) => (
                                <button
                                    key={level}
                                    className={`level-button text-sm md:text-base ${selectedLevel === level ? 'selected' : ''}`}
                                    onClick={() => setSelectedLevel(level)}
                                    type="button"
                                >
                                    {level}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="hero-cta w-full md:w-auto px-4 md:px-0">
                    <Link href={writingUrl} className="cta-button cta-primary w-full md:w-auto">
                        {t('startWriting')}
                    </Link>
                    {isReadingEnabled ? (
                        <Link href={readingUrl} className="cta-button cta-secondary w-full md:w-auto">
                            {t('readingPractice')}
                        </Link>
                    ) : (
                        <button className="cta-button cta-secondary w-full md:w-auto" disabled style={{ opacity: 0.5, cursor: 'not-allowed' }}>
                            {t('readingPractice')}
                            <span className="coming-soon-badge hidden sm:inline">German B1 only</span>
                        </button>
                    )}
                </div>
            </div>
        </section>
    );
}
