'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

interface ResolutionChartProps {
    data: { name: string; value: number }[];
}

const COLORS: Record<string, string> = {
    'REPAIRED': '#10b981', // Emerald 500
    'REPLACED': '#6366f1', // Indigo 500
    'REJECTED': '#ef4444', // Red 500
    'PENDING': '#f59e0b',  // Amber 500
    'Unknown': '#94a3b8',  // Slate 400
};

const DEFAULT_COLORS = ['#6366f1', '#10b981', '#ef4444', '#f59e0b', '#8b5cf6'];

export default function ResolutionChart({ data }: ResolutionChartProps) {
    if (!data || data.length === 0) {
        return <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--secondary-foreground)' }}>No data available</div>;
    }

    return (
        <div style={{ width: '100%', height: '100%' }}>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '1rem' }}>Resolution Breakdown</h3>
            <div style={{ width: '100%', height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={data}
                            id="resolution-pie"
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={80}
                            paddingAngle={5}
                            dataKey="value"
                        >
                            {data.map((entry, index) => {
                                const color = COLORS[entry.name] || DEFAULT_COLORS[index % DEFAULT_COLORS.length];
                                return <Cell key={`cell-${index}`} fill={color} strokeWidth={0} />;
                            })}
                        </Pie>
                        <Tooltip
                            contentStyle={{
                                backgroundColor: 'hsl(var(--card))',
                                border: '1px solid hsl(var(--border))',
                                borderRadius: 'var(--radius)',
                                boxShadow: 'var(--shadow-lg)',
                                color: 'hsl(var(--foreground))'
                            }}
                            itemStyle={{ color: 'hsl(var(--foreground))' }}
                        />
                        <Legend verticalAlign="bottom" height={36} iconType="circle" />
                    </PieChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
