import { Ticket, Users, AlertCircle, CheckCircle2, Activity, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { getDashboardStats } from './actions/dashboard';
import DashboardChart from '@/components/DashboardChart';
import ResolutionChart from '@/components/ResolutionChart';
import BrandChart from '@/components/BrandChart';

export default async function Home() {
  const stats = await getDashboardStats();

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
      <header style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.875rem', fontWeight: 800, letterSpacing: '-0.025em' }}>Dashboard</h1>
        <p style={{ color: 'var(--secondary-foreground)', opacity: 0.8 }}>Welcome back to ReturnFlow Pro</p>
      </header>

      {/* KPI Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        <KPICard title="Open Tickets" value={stats.totalOpenTickets} icon={Ticket} color="blue" href="/tickets?status=OPEN" />
        <KPICard title="At Company" value={stats.pendingCompanyAction} icon={AlertCircle} color="orange" href="/tickets?itemStatus=SENT_TO_COMPANY" />
        <KPICard title="Ready for Delivery" value={stats.readyForDelivery} icon={CheckCircle2} color="green" href="/tickets?itemStatus=RECEIVED_FROM_COMPANY" />
        <KPICard title="Total Customers" value={stats.activeCustomers} icon={Users} color="pink" href="/customers" />
      </div>

      {/* Main Content Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: '1.5rem' }}>

        {/* Chart Section - Takes 8 columns on large screens */}
        <div className="card dashboard-grid-main">
          <style>{`
            .dashboard-grid-main { grid-column: span 12; }
            @media (min-width: 1024px) { .dashboard-grid-main { grid-column: span 8; } }
            .dashboard-grid-side { grid-column: span 12; }
            @media (min-width: 1024px) { .dashboard-grid-side { grid-column: span 4; } }
            .dashboard-grid-half { grid-column: span 12; }
            @media (min-width: 1024px) { .dashboard-grid-half { grid-column: span 6; } }
          `}</style>
          <div className="dashboard-grid-main" style={{ minHeight: '350px' }}>
            <DashboardChart data={stats.chartData} />
          </div>
        </div>

        {/* Recent Activity - Takes 4 columns */}
        <div className="card dashboard-grid-side" style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 600 }}>Recent Activity</h3>
            <Link href="/tickets" style={{ fontSize: '0.875rem', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              View All <ArrowRight size={14} />
            </Link>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
            {stats.recentActivity.length === 0 ? (
              <p style={{ color: 'var(--secondary-foreground)', fontSize: '0.875rem', textAlign: 'center', padding: '2rem' }}>No recent activity</p>
            ) : (
              stats.recentActivity.map((ticket) => (
                <Link key={ticket.id} href={`/tickets/${ticket.id}`}
                  className="hover:bg-accent-light"
                  style={{
                    padding: '1rem 0',
                    borderBottom: '1px solid var(--border)',
                    display: 'flex',
                    gap: '1rem',
                    textDecoration: 'none',
                    color: 'inherit',
                    transition: 'background 0.2s'
                  }}
                >
                  <div style={{
                    width: '32px', height: '32px', borderRadius: '50%',
                    background: 'var(--secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0
                  }}>
                    <Activity size={16} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: '0.875rem', fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      Ticket #{ticket.ticketNumber > 0 ? ticket.ticketNumber : ticket.id}
                    </p>
                    <p style={{ fontSize: '0.75rem', color: 'var(--secondary-foreground)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {ticket.customer.name} • {ticket.status}
                    </p>
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--secondary-foreground)', whiteSpace: 'nowrap' }}>
                    {new Date(ticket.updatedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>

        {/* New Analytics Row */}
        <div className="card dashboard-grid-half" style={{ minHeight: '350px' }}>
          <ResolutionChart data={stats.resolutionData} />
        </div>
        <div className="card dashboard-grid-half" style={{ minHeight: '350px' }}>
          <BrandChart data={stats.brandData} />
        </div>

      </div>
    </div>
  );
}

// Reusable KPI Card Sub-component
function KPICard({ title, value, icon: Icon, color, href }: any) {
  const colorMap: any = {
    blue: { bg: '#eff6ff', text: '#2563eb' },
    orange: { bg: '#fff7ed', text: '#ea580c' },
    green: { bg: '#f0fdf4', text: '#16a34a' },
    pink: { bg: '#fce7f3', text: '#db2777' },
  };
  const c = colorMap[color] || colorMap.blue;

  const Content = (
    <div className="card" style={{ transition: 'transform 0.2s', cursor: href ? 'pointer' : 'default' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <p style={{ color: 'var(--secondary-foreground)', fontSize: '0.875rem', fontWeight: 500 }}>{title}</p>
          <h3 style={{ fontSize: '1.75rem', fontWeight: 700, marginTop: '0.5rem', letterSpacing: '-0.025em' }}>{value}</h3>
        </div>
        <div style={{ padding: '0.75rem', background: c.bg, borderRadius: '0.75rem', color: c.text }}>
          <Icon size={24} />
        </div>
      </div>
    </div>
  );

  if (href) {
    return <Link href={href} style={{ textDecoration: 'none' }}>{Content}</Link>;
  }
  return Content;
}
