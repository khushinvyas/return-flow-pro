'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface BrandChartProps {
    data: { name: string; count: number }[];
}

export default function BrandChart({ data }: BrandChartProps) {
    if (!data || data.length === 0) {
        return <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--secondary-foreground)' }}>No data available</div>;
    }

    return (
        <div style={{ width: '100%', height: '100%' }}>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '1rem' }}>Top Defective Brands</h3>
            <div style={{ width: '100%', height: 300, minWidth: 0 }}>
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                        data={data}
                        layout="vertical"
                        margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
                    >
                        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="hsl(var(--border))" />
                        <XAxis type="number" hide />
                        <YAxis
                            dataKey="name"
                            type="category"
                            width={100}
                            tick={{ fill: 'hsl(var(--secondary-foreground))', fontSize: 12 }}
                            axisLine={false}
                            tickLine={false}
                        />
                        <Tooltip
                            cursor={{ fill: 'hsl(var(--secondary) / 0.5)' }}
                            contentStyle={{
                                backgroundColor: 'hsl(var(--card))',
                                border: '1px solid hsl(var(--border))',
                                borderRadius: 'var(--radius)',
                                boxShadow: 'var(--shadow-lg)',
                                color: 'hsl(var(--foreground))'
                            }}
                            itemStyle={{ color: 'hsl(var(--foreground))' }}
                        />
                        <Bar dataKey="count" radius={[0, 4, 4, 0]} barSize={32}>
                            {data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={`hsl(var(--primary) / ${1 - (index * 0.15)})`} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
