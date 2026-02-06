'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { supabase } from '@/lib/supabase/client';
import { useAuth } from '@/app/context/AuthContext';
import '../../components/styles.css';

// Login page with email and password form
export default function LoginPage() {
    const t = useTranslations('Auth');
    const router = useRouter();
    const { user, loading: authLoading } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    // Redirect to account if already logged in
    useEffect(() => {
        if (!authLoading && user) {
            router.push('/account');
        }
    }, [user, authLoading, router]);

    // Show loading while checking auth state
    if (authLoading || user) {
        return (
            <div className="loading-container">
                <p className="loading-text">{t('loading')}</p>
            </div>
        );
    }

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            const { data, error: signInError } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (signInError) {
                setError(t('invalidCredentials'));
                return;
            }

            if (data.user) {
                router.push('/account');
            }
        } catch {
            setError(t('genericError'));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-container">
                <h1 className="auth-title">{t('loginTitle')}</h1>

                <form onSubmit={handleLogin} className="auth-form">
                    <div className="form-group">
                        <label htmlFor="email">{t('email')}</label>
                        <input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="auth-input"
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="password">{t('password')}</label>
                        <input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="auth-input"
                        />
                    </div>

                    {error && <p className="auth-error">{error}</p>}

                    <button type="submit" className="auth-button" disabled={loading}>
                        {loading ? t('loading') : t('login')}
                    </button>
                </form>

                <p className="auth-link-text">
                    {t('noAccount')} <Link href="/signup" className="auth-link">{t('signupHere')}</Link>
                </p>
            </div>
        </div>
    );
}
