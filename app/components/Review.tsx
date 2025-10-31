import { useTranslations } from "next-intl";

export default function Review({ input, analysis }: { input: string, analysis: string }) {
    const t = useTranslations('ReviewPage');

    return (
        <div className="reviewContainer">
            <h2 className="mb-2 text-2xl font-bold leading-tight text-gray-900 lg:text-6xl dark:text-white">{t('reviewYourInput')}</h2>
            <blockquote className="blockquote"><p>{input}</p></blockquote>
            <h3 className="mb-2 text-2xl font-bold leading-tight text-gray-900 dark:text-white">{t('analysis')}</h3>
            <blockquote><p>{analysis}</p></blockquote>
        </div>
    );
}
