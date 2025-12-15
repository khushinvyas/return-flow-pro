'use client';

import Image from 'next/image';
import { useActionState } from 'react';
import Link from 'next/link';
import { register } from '../actions/auth';
import styles from '../login/page.module.css'; // Reusing login styles

const initialState = {
    message: '',
};

export default function RegisterPage() {
    const [state, formAction, isPending] = useActionState(register, initialState);

    return (
        <div className={styles.container}>
            <div className={`${styles.card} card`}>
                <div className={styles.header}>
                    <div className={styles.logo}>
                        <Image src="/logo.png" alt="ReturnFlow Pro" width={180} height={60} style={{ objectFit: 'contain' }} />
                    </div>
                    <h1>Create Account</h1>
                    <p className="text-secondary">Start your free trial today</p>
                </div>

                <form action={formAction} className={styles.form}>
                    <div className={styles.inputGroup}>
                        <label className={styles.label} htmlFor="name">Full Name</label>
                        <input
                            type="text"
                            id="name"
                            name="name"
                            required
                            className={styles.input}
                            placeholder="John Doe"
                        />
                    </div>

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
                        {isPending ? 'Creating account...' : 'Create Account'}
                    </button>
                </form>

                <div className={styles.footer}>
                    Already have an account? <Link href="/login">Sign in</Link>
                </div>
            </div>
        </div>
    );
}
