import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Sidebar from "../components/Sidebar";
import PageTransition from "../components/PageTransition";
import { ThemeProvider } from "../components/ThemeProvider";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ReturnFlow Pro",
  description: "Advanced Product Replacement Tracking",
};

import ImpersonationBanner from "../components/ImpersonationBanner";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getSession();
  let impersonatingOrgName = null;

  if (session?.isImpersonating && session.organizationId) {
    const org = await prisma.organization.findUnique({
      where: { id: session.organizationId },
      select: { name: true }
    });
    impersonatingOrgName = org?.name;
  }

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.variable}>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={false}
          disableTransitionOnChange
        >
          <div className="layout-wrapper" style={{ display: 'flex', minHeight: '100vh', background: 'hsl(var(--background))' }}>
            <Sidebar />
            <main className="main-content" style={{
              marginLeft: '280px',
              width: 'calc(100% - 280px)',
              minHeight: '100vh',
              padding: '2rem',
              position: 'relative',
              background: 'hsl(var(--background))',
              paddingTop: impersonatingOrgName ? '4rem' : '2rem' // Adjust for banner
            }}>
              {impersonatingOrgName && <ImpersonationBanner orgName={impersonatingOrgName} />}

              {/* Background Gradient Mesh (Optional nice touch) */}
              <div style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                zIndex: 0,
                pointerEvents: 'none',
                background: 'radial-gradient(circle at 100% 0%, hsla(var(--primary), 0.05) 0%, transparent 50%), radial-gradient(circle at 0% 100%, hsla(var(--accent), 0.05) 0%, transparent 50%)'
              }} />

              <div style={{ position: 'relative', zIndex: 1 }}>
                <PageTransition>{children}</PageTransition>
              </div>
            </main>
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
