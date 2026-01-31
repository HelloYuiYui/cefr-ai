'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import '../styles.css';

export default function Header() {
    const pathname = usePathname();
    const t = useTranslations('Navigation');

    const isActive = (path: string) => pathname === path;

    return (
        <header className="header">
            <div className="header-content">
                <Link href="/" className="logo">
                    CEFR AI
                </Link>
                <nav className="nav">
                    <Link
                        href="/writing"
                        className={`nav-link ${isActive('/writing') ? 'active' : ''}`}
                    >
                        {t('writing')}
                    </Link>
                    <Link
                        href="/reading"
                        className="nav-link nav-link-disabled"
                    >
                        {t('reading')}
                        <span className="coming-soon-badge">{t('comingSoon')}</span>
                    </Link>
                </nav>
            </div>
        </header>
    );
}
