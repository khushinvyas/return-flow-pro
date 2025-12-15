'use client';

import Image from 'next/image';
import { useActionState } from 'react';
import Link from 'next/link';
import { login } from '../actions/auth';
import styles from './page.module.css';

const initialState = {
    message: '',
};

export default function LoginPage() {
    const [state, formAction, isPending] = useActionState(login, initialState);

    return (
        <div className={styles.container}>
            <div className={`${styles.card} card`}>
                <div className={styles.header}>
                    <div className={styles.logo}>
                        <Image src="/logo.png" alt="ReturnFlow Pro" width={180} height={60} style={{ objectFit: 'contain' }} />
                    </div>
                    <h1>Welcome Back</h1>
                    <p className="text-secondary">Sign in to your account</p>
                </div>

                <form action={formAction} className={styles.form}>
                    <div className={styles.inputGroup}>
                        <label className={styles.label} htmlFor="email">Email</label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            required
                            className={styles.input}
                            placeholder="name@example.com"
                        />
                    </div>

                    <div className={styles.inputGroup}>
                        <label className={styles.label} htmlFor="password">Password</label>
                        <input
                            type="password"
                            id="password"
                            name="password"
                            required
                            className={styles.input}
                            placeholder="••••••••"
                        />
                    </div>

                    {state?.message && (
                        <div className={styles.error}>{state.message}</div>
                    )}

                    <button type="submit" disabled={isPending} className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }}>
                        {isPending ? 'Signing in...' : 'Sign In'}
                    </button>
                </form>

                <div className={styles.footer}>
                    Don't have an account? <Link href="/register">Sign up</Link>
                </div>
            </div>
        </div>
    );
}
