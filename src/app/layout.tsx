import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Sidebar from "../components/Sidebar";
import { ThemeProvider } from "../components/ThemeProvider";
import Shell from "../components/Shell";

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

// ... (imports are preserved in logic below, this is just the function body replacement in logic)
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
          <Shell
            sidebar={<Sidebar />}
            banner={impersonatingOrgName ? <ImpersonationBanner orgName={impersonatingOrgName} /> : null}
          >
            {children}
          </Shell>
        </ThemeProvider>
      </body>
    </html>
  );
}
