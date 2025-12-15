import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { AlertCircle } from 'lucide-react';
import { logout } from '@/app/actions/auth';

export default function SubscriptionExpiredPage() {
    return (
        <div style={{
            height: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'var(--background)'
        }}>
            <Card style={{ maxWidth: '500px', textAlign: 'center', padding: '3rem' }}>
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}>
                    <div style={{ padding: '1rem', borderRadius: '50%', background: 'rgba(239, 68, 68, 0.1)', color: 'var(--destructive)' }}>
                        <AlertCircle size={48} />
                    </div>
                </div>

                <h1 style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: '0.75rem' }}>Subscription Expired</h1>

                <p style={{ color: 'var(--secondary-foreground)', marginBottom: '2rem', lineHeight: 1.6 }}>
                    Your free trial or subscription plan has expired. To continue using ReturnFlow Pro, please contact your administrator or the sales team to renew your plan.
                </p>

                <div style={{ background: 'var(--secondary)', padding: '1rem', borderRadius: 'var(--radius)', marginBottom: '2rem', fontSize: '0.875rem' }}>
                    <strong>Admin Contact:</strong> admin@example.com
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    <form action={logout}>
                        <Button type="submit" variant="ghost" style={{ width: '100%' }}>Logout</Button>
                    </form>
                </div>
            </Card>
        </div>
    );
}
