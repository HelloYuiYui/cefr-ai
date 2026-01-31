import { useTranslations } from "next-intl";

export default function Review({ input, analysis }: { input: string, analysis: string }) {
    const t = useTranslations('ReviewPage');

    return (
        <div className="reviewContainer p-4 md:p-6 max-w-full">
            <h2 className="mb-2 text-xl md:text-2xl font-bold leading-tight text-gray-900">{t('reviewYourInput')}</h2>
            <blockquote className="blockquote text-gray-900 text-sm md:text-base p-3 md:p-4 bg-gray-50 rounded border-l-4 border-blue-500 my-4"><p>{input}</p></blockquote>
            <h3 className="mb-2 text-lg md:text-xl font-bold leading-tight text-gray-900">{t('analysis')}</h3>
            {analysis.split('\n').map((line, index) => {
               var key = line.trim().split(':')[0];
               var value = line.trim().split(':').slice(1).join(':');
               return key ? <p key={index} className="analysisLine text-gray-900 text-sm md:text-base mb-2 leading-relaxed"><strong>{t(key)}:</strong> {value}</p> : null;
            })}
        </div>
    );
}
