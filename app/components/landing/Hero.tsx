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

                <div className="selection-section">
                    <div className="selection-group">
                        <span className="selection-label">{t('selectLanguage')}:</span>
                        <div className="language-buttons">
                            {languages.map((lang) => (
                                <button
                                    key={lang.code}
                                    className={`language-button ${selectedLanguage === lang.code ? 'selected' : ''}`}
                                    onClick={() => {setSelectedLanguage(lang.code as Language) ; languageChange(lang.code as Language)}}
                                    type="button"
                                >
                                    <span className="language-flag">{lang.flag}</span>
                                    <span className="language-name">{lang.name}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="selection-group">
                        <span className="selection-label">{t('selectLevel')}:</span>
                        <div className="level-buttons">
                            {levels.map((level) => (
                                <button
                                    key={level}
                                    className={`level-button ${selectedLevel === level ? 'selected' : ''}`}
                                    onClick={() => setSelectedLevel(level)}
                                    type="button"
                                >
                                    {level}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="hero-cta">
                    <Link href={writingUrl} className="cta-button cta-primary">
                        {t('startWriting')}
                    </Link>
                    {isReadingEnabled ? (
                        <Link href={readingUrl} className="cta-button cta-secondary">
                            {t('readingPractice')}
                        </Link>
                    ) : (
                        <button className="cta-button cta-secondary" disabled style={{ opacity: 0.5, cursor: 'not-allowed' }}>
                            {t('readingPractice')}
                            <span className="coming-soon-badge">German B1 only</span>
                        </button>
                    )}
                </div>
            </div>
        </section>
    );
}
