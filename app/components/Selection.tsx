import { Dispatch } from "react";
import { Language, Level, Levels } from "../types"; 
import { useTranslations } from "next-intl";

export default function Selection({ language, changeLanguage, level, changeLevel, proceedToPractice }: { language: Language; changeLanguage: Dispatch<React.SetStateAction<Language>>; level: Level; changeLevel: Dispatch<React.SetStateAction<Level>>; proceedToPractice: () => void; }) {
    const t = useTranslations('LanguageSelection');

    return (
        <div className="selectionContainer p-4 md:p-6 w-full max-w-full md:max-w-md">
            <form onSubmit={(e) => {
                e.preventDefault();
                const form = e.currentTarget as HTMLFormElement;
                const lang = (form.elements.namedItem('language') as HTMLSelectElement).value;
                const lvl = (form.elements.namedItem('level') as HTMLSelectElement).value;
                changeLanguage(lang as Language);
                changeLevel(lvl as Level);
                proceedToPractice();
            }}>
                <div className="dropdownContainer w-full max-w-full">
                    <label htmlFor="languageSelect" className="block md:inline text-sm md:text-base mb-2 md:mb-0">{t('language')}: </label>
                    <select id="languageSelect" name="language" defaultValue={Language.DEFAULT} className="dropdown w-full md:w-auto text-sm md:text-base p-2 md:p-3" onChange={(e) => changeLanguage(e.target.value as Language)}>
                        <option value={Language.ENGLISH}>{t('english')}</option>
                        <option value={Language.GERMAN}>{t('german')}</option>
                        <option value={Language.FRENCH}>{t('french')}</option>
                    </select>
                </div>
                <div className="dropdownContainer w-full max-w-full">
                    <label htmlFor="levelSelect" className="block md:inline text-sm md:text-base mb-2 md:mb-0">{t('level')}: </label>
                    <select id="levelSelect" name="level" defaultValue={Levels.DEFAULT} className="dropdown w-full md:w-auto text-sm md:text-base p-2 md:p-3" onChange={(e) => changeLevel(e.target.value as Level)}>
                        <option value={Levels.A1}>{Levels.A1}</option>
                        <option value={Levels.A2}>{Levels.A2}</option>
                        <option value={Levels.B1}>{Levels.B1}</option>
                        <option value={Levels.B2}>{Levels.B2}</option>
                        <option value={Levels.C1}>{Levels.C1}</option>
                        <option value={Levels.C2}>{Levels.C2}</option>
                    </select>
                </div>
                <button className="proceedButton w-full md:w-auto text-sm md:text-base min-h-[44px] mt-4" type="submit">{t('proceed')}</button>
            </form>
        </div>
    );
}

// flex items-center justify-center gap-2