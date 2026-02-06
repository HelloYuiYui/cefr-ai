'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useAuth } from '../context/AuthContext';
import '../components/styles.css';

// Account page showing username and under construction message
export default function AccountPage() {
    const t = useTranslations('Account');
    const router = useRouter();
    const { user, loading, signOut } = useAuth();

    useEffect(() => {
        if (!loading && !user) {
            router.push('/login');
        }
    }, [user, loading, router]);

    const handleSignOut = async () => {
        await signOut();
        router.push('/');
    };

    if (loading) {
        return (
            <div className="loading-container">
                <p className="loading-text">{t('loading')}</p>
            </div>
        );
    }

    if (!user) {
        return null;
    }

    const username = user.user_metadata?.username || t('user');

    return (
        <div className="account-page">
            <div className="account-container">
                <h1 className="account-title">{username}</h1>

                <div className="under-construction">
                    <h2 className="construction-title">{t('underConstruction')}</h2>
                    <p className="construction-text">{t('comingSoon')}</p>
                </div>

                <button onClick={handleSignOut} className="signout-button">
                    {t('signout')}
                </button>
            </div>
        </div>
    );
}
