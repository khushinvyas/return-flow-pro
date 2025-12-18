import { Ticket, Users, AlertCircle, CheckCircle2, Activity, ArrowRight, TrendingUp } from 'lucide-react';
import Link from 'next/link';
import { getDashboardStats } from './actions/dashboard';
import DashboardChart from '@/components/DashboardChart';
import ResolutionChart from '@/components/ResolutionChart';
import BrandChart from '@/components/BrandChart';

import { getSession } from '@/lib/auth';
import VendorInventoryWidget from '@/components/VendorInventoryWidget';

export default async function Home() {
  const session = await getSession();
  const stats = await getDashboardStats();

  return (
    <div className="page-transition" style={{ maxWidth: '1600px', margin: '0 auto', paddingBottom: '2rem' }}>
      {/* ... (Hero and KPI Grid remain the same) ... */}

      {/* Premium Hero Section */}
      <div className="premium-hero">
        <div className="premium-hero-pattern" />
        <div style={{ position: 'relative', zIndex: 10 }}>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 800, letterSpacing: '-0.03em', marginBottom: '0.5rem', color: 'white' }}>
            Dashboard
          </h1>
          <p style={{ fontSize: '1.1rem', opacity: 0.9, color: 'rgba(255, 255, 255, 0.9)' }}>
            Overview of your return operations and performance.
          </p>
        </div>
      </div>

      {/* KPI Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
        <KPICard
          title="Open Tickets"
          value={stats.totalOpenTickets}
          icon={Ticket}
          trend="+12%"
          color="primary"
          href="/tickets?status=OPEN"
        />
        <KPICard
          title="At Company"
          value={stats.pendingCompanyAction}
          icon={AlertCircle}
          trend="Pending action"
          color="warning"
          href="/tickets?itemStatus=SENT_TO_COMPANY"
        />
        <KPICard
          title="Ready for Delivery"
          value={stats.readyForDelivery}
          icon={CheckCircle2}
          trend="Needs dispatch"
          color="success"
          href="/tickets?itemStatus=RECEIVED_FROM_COMPANY"
        />
        <KPICard
          title="Total Customers"
          value={stats.activeCustomers}
          icon={Users}
          trend="Active base"
          color="info"
          href="/customers"
        />
      </div>

      {/* Main Content Grid */}
      <div className="premium-grid" style={{ gridTemplateColumns: 'minmax(0, 2fr) minmax(0, 1fr)', gap: '1.5rem', marginTop: '2rem' }}>

        {/* Left Column: Charts */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Main Chart */}
          <div className="premium-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <TrendingUp size={20} className="text-muted" />
                Ticket Volume
              </h3>
              <select className="input" style={{ width: 'auto', padding: '0.25rem 0.75rem', fontSize: '0.875rem' }}>
                <option>Last 7 Days</option>
                <option>Last 30 Days</option>
              </select>
            </div>
            <div style={{ height: '350px' }}>
              <DashboardChart data={stats.chartData} />
            </div>
          </div>

          {/* Secondary Charts Row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
            <div className="premium-card">
              <h3 style={{ fontSize: '1.1rem', marginBottom: '1.5rem' }}>Resolutions</h3>
              <div style={{ height: '300px' }}>
                <ResolutionChart data={stats.resolutionData} />
              </div>
            </div>
            <div className="premium-card">
              <h3 style={{ fontSize: '1.1rem', marginBottom: '1.5rem' }}>Top Brands</h3>
              <div style={{ height: '300px' }}>
                <BrandChart data={stats.brandData} />
              </div>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

          {/* Vendor Inventory Widget */}
          {session?.organizationId && <VendorInventoryWidget organizationId={session.organizationId} />}

          {/* Recent Activity */}
          <div className="premium-card" style={{ height: 'fit-content' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '1px solid hsl(var(--border))' }}>
              <h3 style={{ fontSize: '1.25rem' }}>Recent Activity</h3>
              <Link href="/tickets" className="btn btn-ghost btn-sm" style={{ padding: '0.25rem 0.5rem', fontSize: '0.8rem' }}>
                View All <ArrowRight size={14} />
              </Link>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {stats.recentActivity.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'hsl(var(--secondary-foreground))' }}>
                  <Activity size={32} style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
                  <p>No recent activity</p>
                </div>
              ) : (
                stats.recentActivity.map((ticket) => (
                  <Link key={ticket.id} href={`/tickets/${ticket.id}`}
                    className="activity-item"
                    style={{
                      display: 'flex',
                      gap: '1rem',
                      padding: '1rem',
                      borderRadius: 'var(--radius)',
                      transition: 'background 0.2s',
                      textDecoration: 'none',
                      color: 'inherit'
                    }}
                  >
                    <div style={{
                      width: '40px', height: '40px', borderRadius: '12px',
                      background: 'hsl(var(--secondary))',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      flexShrink: 0,
                      color: 'hsl(var(--primary))'
                    }}>
                      <Activity size={18} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                        <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>Ticket #{ticket.ticketNumber || ticket.id}</span>
                        <span style={{ fontSize: '0.75rem', color: 'hsl(var(--secondary-foreground))' }}>
                          {new Date(ticket.updatedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                        </span>
                      </div>
                      <p style={{ fontSize: '0.85rem', color: 'hsl(var(--secondary-foreground))', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {ticket.customer.name} • <span style={{ color: 'hsl(var(--primary))', fontWeight: 500 }}>{ticket.status}</span>
                      </p>
                    </div>
                  </Link>
                ))
              )}
            </div>
          </div>
        </div>

      </div>
      <style>{`
            .activity-item:hover {
                background: hsl(var(--secondary) / 0.5);
            }
        `}</style>
    </div>
  );
}

// Reusable KPI Card
function KPICard({ title, value, icon: Icon, color, href, trend }: any) {
  // Map simplified colors to theme variables
  const getIconStyle = (c: string) => {
    switch (c) {
      case 'primary': return { bg: 'hsl(var(--primary) / 0.1)', color: 'hsl(var(--primary))' };
      case 'warning': return { bg: 'hsl(var(--warning) / 0.1)', color: 'hsl(var(--warning))' };
      case 'success': return { bg: 'hsl(var(--success) / 0.1)', color: 'hsl(var(--success))' };
      case 'info': return { bg: 'hsl(var(--info) / 0.1)', color: 'hsl(var(--info))' };
      default: return { bg: 'hsl(var(--secondary))', color: 'hsl(var(--secondary-foreground))' };
    }
  };

  const style = getIconStyle(color);

  const Content = (
    <div className="premium-card card-interactive" style={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
        <div style={{
          width: '48px', height: '48px', borderRadius: '14px',
          background: style.bg, color: style.color,
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <Icon size={24} />
        </div>
        {href && <ArrowRight size={16} className="text-muted" />}
      </div>

      <div>
        <h3 style={{ fontSize: '2rem', fontWeight: 700, lineHeight: 1, marginBottom: '0.5rem', color: 'hsl(var(--foreground))' }}>
          {value}
        </h3>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <p style={{ fontSize: '0.9rem', color: 'hsl(var(--secondary-foreground))', fontWeight: 500 }}>{title}</p>
          {trend && (
            <span style={{ fontSize: '0.75rem', padding: '2px 8px', borderRadius: '99px', background: 'hsl(var(--secondary))', color: 'hsl(var(--secondary-foreground))' }}>
              {trend}
            </span>
          )}
        </div>
      </div>
    </div>
  );

  if (href) {
    return <Link href={href} style={{ textDecoration: 'none', display: 'block', height: '100%' }}>{Content}</Link>;
  }
  return <div style={{ height: '100%' }}>{Content}</div>;
}
