'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import '../styles.css';

export default function Header() {
    const pathname = usePathname();
    const t = useTranslations('Navigation');

    const isActive = (path: string) => pathname === path;

    // TODO: Include pages for improving writing and reading skills, and update links accordingly.
    return (
        <header className="header">
            <div className="header-content px-4 md:px-0">
                <Link href="/" className="logo text-xl md:text-2xl">
                    CEFR AI
                </Link>
                <nav className="nav gap-2 md:gap-4 lg:gap-8">
                    <Link
                        href="/"
                        className={`nav-link text-sm md:text-base ${isActive('/writing') ? 'active' : ''}`}
                    >
                        {t('writing')}
                    </Link>
                    <Link
                        href="/reading"
                        className={`nav-link text-sm md:text-base ${isActive('/reading') ? 'active' : ''}`}
                    >
                        {t('reading')}
                    </Link>
                </nav>
            </div>
        </header>
    );
}
