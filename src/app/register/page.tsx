'use client';

import Image from 'next/image';
import { useActionState, useState } from 'react';
import Link from 'next/link';
import { register } from '../actions/auth';
import styles from '../login/page.module.css';

const initialState = {
    message: '',
};

export default function RegisterPage() {
    const [state, formAction, isPending] = useActionState(register, initialState);
    const [logoPreview, setLogoPreview] = useState<string | null>(null);
    const [logoFile, setLogoFile] = useState<string>('');

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 500 * 1024) {
                alert("File size must be less than 500KB");
                return;
            }
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64 = reader.result as string;
                setLogoPreview(base64);
                setLogoFile(base64);
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <div className={styles.container}>
            <div className={`${styles.card} card`} style={{ maxWidth: '600px' }}>
                <div className={styles.header}>
                    <div className={styles.logo}>
                        <Image src="/logo-v2.png" alt="ReturnFlow Pro" width={180} height={60} style={{ objectFit: 'contain' }} />
                    </div>
                    <h1>Create Account</h1>
                    <p className="text-secondary">Start your free trial today</p>
                </div>

                <form action={formAction} className={styles.form}>
                    {/* User Details Section */}
                    <div style={{ marginBottom: '1.5rem' }}>
                        <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1rem', color: 'var(--primary)' }}>Personal Details</h3>
                        <div className={styles.inputGroup}>
                            <label className={styles.label} htmlFor="name">Full Name</label>
                            <input type="text" id="name" name="name" required className={styles.input} placeholder="John Doe" />
                        </div>
                        <div className={styles.inputGroup}>
                            <label className={styles.label} htmlFor="email">Email</label>
                            <input type="email" id="email" name="email" required className={styles.input} placeholder="name@example.com" />
                        </div>
                        <div className={styles.inputGroup}>
                            <label className={styles.label} htmlFor="password">Password</label>
                            <input type="password" id="password" name="password" required className={styles.input} placeholder="••••••••" />
                        </div>
                    </div>

                    <div style={{ height: '1px', background: 'var(--border)', margin: '1rem 0 1.5rem 0' }} />

                    {/* Organization Details Section */}
                    <div>
                        <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1rem', color: 'var(--primary)' }}>Business Details</h3>

                        <div className={styles.inputGroup}>
                            <label className={styles.label}>Business Logo (Optional)</label>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                <div style={{
                                    width: '60px', height: '60px',
                                    borderRadius: '8px', border: '1px solid var(--border)',
                                    background: 'var(--secondary)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    overflow: 'hidden'
                                }}>
                                    {logoPreview ? (
                                        <img src={logoPreview} alt="Logo" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                                    ) : (
                                        <span style={{ fontSize: '0.625rem', color: 'var(--secondary-foreground)' }}>No Logo</span>
                                    )}
                                </div>
                                <input type="file" accept="image/*" onChange={handleImageChange} style={{ fontSize: '0.875rem' }} />
                                <input type="hidden" name="logo" value={logoFile} />
                            </div>
                        </div>

                        <div className={styles.inputGroup}>
                            <label className={styles.label} htmlFor="orgName">Organization Name</label>
                            <input type="text" id="orgName" name="orgName" className={styles.input} placeholder="e.g. Acme Corp" />
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            <div className={styles.inputGroup}>
                                <label className={styles.label} htmlFor="gstNumber">GST Number</label>
                                <input type="text" id="gstNumber" name="gstNumber" className={styles.input} placeholder="GSTIN" />
                            </div>
                            <div className={styles.inputGroup}>
                                <label className={styles.label} htmlFor="phone">Phone</label>
                                <input type="text" id="phone" name="phone" className={styles.input} placeholder="+91..." />
                            </div>
                        </div>

                        <div className={styles.inputGroup}>
                            <label className={styles.label} htmlFor="address">Business Address</label>
                            <textarea id="address" name="address" className={styles.input} placeholder="Full address" style={{ height: '80px', resize: 'none' }} />
                        </div>
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
