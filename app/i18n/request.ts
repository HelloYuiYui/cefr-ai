import { cookies } from 'next/headers';
import { getRequestConfig } from 'next-intl/server';
import { isLanguage, Language } from '../types';

export default getRequestConfig(async () => {
    const store = await cookies();
    const cookieLocale = store.get('locale')?.value;
    const locale = isLanguage(cookieLocale) ? cookieLocale : Language.DEFAULT;

    return {
        locale,
        messages: (await import(`./../messages/${locale}.json`)).default
    };
});