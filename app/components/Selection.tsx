import { Dispatch } from "react";
import { Language, Level } from "../types"; 
import { useTranslations } from "next-intl";

export default function Selection({ language, changeLanguage, level, changeLevel, proceedToPractice }: { language: Language; changeLanguage: Dispatch<React.SetStateAction<Language>>; level: Level; changeLevel: Dispatch<React.SetStateAction<Level>>; proceedToPractice: () => void; }) {
    const t = useTranslations('LanguageSelection');

    return (
        <div className="selectionContainer">
            <form onSubmit={(e) => {
                e.preventDefault();
                const form = e.currentTarget as HTMLFormElement;
                const lang = (form.elements.namedItem('language') as HTMLSelectElement).value;
                const lvl = (form.elements.namedItem('level') as HTMLSelectElement).value;
                changeLanguage(lang as Language);
                changeLevel(lvl as Level);
                proceedToPractice();
            }}>
                <div className="dropdownContainer">
                    <label htmlFor="languageSelect">{t('language')}: </label>
                    <select id="languageSelect" name="language" defaultValue={Language.DEFAULT} className="dropdown" onChange={(e) => changeLanguage(e.target.value as Language)}>
                        <option value={Language.ENGLISH}>{t('english')}</option>
                        <option value={Language.GERMAN}>{t('german')}</option>
                        <option value={Language.FRENCH}>{t('french')}</option>
                    </select>
                </div>
                <div className="dropdownContainer">
                    <label htmlFor="levelSelect">{t('level')}: </label>
                    <select id="levelSelect" name="level" defaultValue="B1" className="dropdown">
                        <option value="A1">A1</option>
                        <option value="A2">A2</option>
                        <option value="B1">B1</option>
                        <option value="B2">B2</option>
                        <option value="C1">C1</option>
                        <option value="C2">C2</option>
                    </select>
                </div>
                <button className="proceedButton" type="submit">{t('proceed')}</button>
            </form>
        </div>
    );
}

// flex items-center justify-center gap-2