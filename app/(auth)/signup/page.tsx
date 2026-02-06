'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { supabase } from '@/lib/supabase/client';
import { validatePassword } from '@/lib/supabase/validation';
import { useAuth } from '@/app/context/AuthContext';
import '../../components/styles.css';

// Sign up page with username, email, and password form
export default function SignupPage() {
    const t = useTranslations('Auth');
    const router = useRouter();
    const { user, loading: authLoading } = useAuth();
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
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

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        // Validate passwords match
        if (password !== confirmPassword) {
            setError(t('passwordMismatch'));
            setLoading(false);
            return;
        }

        // Validate password strength
        const { valid, errors } = validatePassword(password);
        if (!valid) {
            const errorMessages = errors.map(err => t(`passwordError.${err}`)).join('. ');
            setError(errorMessages);
            setLoading(false);
            return;
        }

        try {
            const { data, error: signUpError } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        username: username,
                    },
                },
            });

            if (signUpError) {
                if (signUpError.message.includes('already registered')) {
                    setError(t('emailExists'));
                } else {
                    setError(signUpError.message);
                }
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
                <h1 className="auth-title">{t('signupTitle')}</h1>

                <form onSubmit={handleSignup} className="auth-form">
                    <div className="form-group">
                        <label htmlFor="username">{t('username')}</label>
                        <input
                            id="username"
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                            className="auth-input"
                        />
                    </div>

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

                    <div className="form-group">
                        <label htmlFor="confirmPassword">{t('confirmPassword')}</label>
                        <input
                            id="confirmPassword"
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                            className="auth-input"
                        />
                    </div>

                    {error && <p className="auth-error">{error}</p>}

                    <button type="submit" className="auth-button" disabled={loading}>
                        {loading ? t('loading') : t('signup')}
                    </button>
                </form>

                <p className="auth-link-text">
                    {t('haveAccount')} <Link href="/login" className="auth-link">{t('loginHere')}</Link>
                </p>
            </div>
        </div>
    );
}
