import { useTranslations } from "next-intl";

export default function Review({ input, analysis }: { input: string, analysis: string }) {
    const t = useTranslations('ReviewPage');

    return (
        <div className="reviewContainer">
            <h2 className="mb-2 text-2xl font-bold leading-tight text-gray-900">{t('reviewYourInput')}</h2>
            <blockquote className="blockquote text-gray-900"><p>{input}</p></blockquote>
            <h3 className="mb-2 text-2xl font-bold leading-tight text-gray-900">{t('analysis')}</h3>
            {analysis.split('\n').map((line, index) => {
               var key = line.trim().split(':')[0];
               var value = line.trim().split(':').slice(1).join(':');
               return key ? <p key={index} className="analysisLine text-gray-900"><strong>{t(key)}:</strong> {value}</p> : null;
            })}
        </div>
    );
}
