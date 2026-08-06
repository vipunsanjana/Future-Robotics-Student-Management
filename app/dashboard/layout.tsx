import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { SessionProviderWrapper } from '@/components/session-provider';
import { DashboardShell } from '@/components/dashboard-shell';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);
  if (!session) redirect('/login');
  return (
    <SessionProviderWrapper>
      <DashboardShell>{children}</DashboardShell>
    </SessionProviderWrapper>
  );
}
