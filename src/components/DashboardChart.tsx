'use client';

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function DashboardChart({ data }: { data: { name: string; count: number }[] }) {
    return (
        <div style={{ width: '100%', height: '100%' }}>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '1rem' }}>Ticket Volume (Last 7 Days)</h3>
            <div style={{ width: '100%', height: 300, minWidth: 0 }}>
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                        data={data}
                        margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                    >
                        <defs>
                            <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#2563eb" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                        <XAxis
                            dataKey="name"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: 'hsl(var(--secondary-foreground))', fontSize: 12 }}
                            dy={10}
                        />
                        <YAxis
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: 'hsl(var(--secondary-foreground))', fontSize: 12 }}
                        />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: 'hsl(var(--card))',
                                border: '1px solid hsl(var(--border))',
                                borderRadius: 'var(--radius)',
                                boxShadow: 'var(--shadow-lg)',
                                color: 'hsl(var(--foreground))'
                            }}
                            itemStyle={{
                                color: 'hsl(var(--foreground))'
                            }}
                        />
                        <Area
                            type="monotone"
                            dataKey="count"
                            stroke="hsl(var(--primary))"
                            strokeWidth={2}
                            fillOpacity={1}
                            fill="url(#colorCount)"
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
