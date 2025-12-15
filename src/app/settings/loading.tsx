import { Card } from "@/components/ui/Card";

export default function Loading() {
    return (
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <div style={{ height: '2rem', width: '200px', background: 'hsl(var(--secondary))', borderRadius: '4px', marginBottom: '2rem', animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite' }} />

            <div style={{ display: 'grid', gap: '2rem' }}>
                <Card>
                    <div style={{ height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <div style={{
                            width: '2rem',
                            height: '2rem',
                            border: '2px solid hsl(var(--border))',
                            borderTopColor: 'hsl(var(--primary))',
                            borderRadius: '50%',
                            animation: 'spin 1s linear infinite'
                        }} />
                    </div>
                </Card>
            </div>
            <style>{`
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
                @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: .5; } }
            `}</style>
        </div>
    );
}
