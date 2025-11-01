import { useTranslations } from 'next-intl';
import './styles.css';

export default function Starter() {
    const t = useTranslations('Home');

    return (
        <div className="starterContainer">
            <h1 className="text-2xl font-bold">{t('title')}</h1>
            <p className="text-gray-700">{t('subtitle')}</p>    
        </div>
    );
}
