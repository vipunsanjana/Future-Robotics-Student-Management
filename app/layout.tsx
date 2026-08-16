// @ts-ignore
import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { ThemeProvider } from '@/components/theme-provider';
import { SessionProviderWrapper } from '@/components/session-provider';
import { Toaster } from '@/components/ui/sonner';

const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap',
  fallback: ['system-ui', 'arial'],
});

const siteUrl = process.env.NEXTAUTH_URL!;

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),

  title: 'Future Robotics Academy',
  description:
    'Enterprise resource planning system for Future Robotics (PVT) LTD and Academy of Future Robotics. Manage students, payments, and administrative operations securely.',
  icons: {
    icon: '/Logo.jpeg',
    shortcut: '/Logo.jpeg',
    apple: '/Logo.jpeg',
  },
  openGraph: {
    title: 'Academy Of Future Robotics',
    description: 'Institute Management System for Future Robotics (PVT) LTD.',
    siteName: 'Academy Of Future Robotics',
    images: [
      {
        url: '/Logo.jpeg',
        width: 800,
        height: 800,
        alt: 'Future Robotics Logo',
      },
    ],
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider>
          <SessionProviderWrapper>{children}</SessionProviderWrapper>
          <Toaster position="top-right" richColors closeButton />
        </ThemeProvider>
      </body>
    </html>
  );
}
