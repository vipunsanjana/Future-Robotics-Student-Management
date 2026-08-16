'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useSession, signOut } from 'next-auth/react';
import {
  LayoutDashboard,
  Users,
  CreditCard,
  UserCog,
  LogOut,
  Menu,
  ChevronDown,
  Cpu,
  Sparkles,
  Settings,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/theme-toggle';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from '@/components/ui/sheet';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/dashboard/students', label: 'Students', icon: Users },
  { href: '/dashboard/payments', label: 'Payments', icon: CreditCard },
];

const adminItems = [
  { href: '/dashboard/users', label: 'User Management', icon: UserCog },
  { href: '/dashboard/settings', label: 'Account Settings', icon: Settings },
];

function BrandHeader({ onClick }: { onClick?: () => void }) {
  return (
    <Link
      href="/dashboard"
      onClick={onClick}
      className="flex items-center gap-3 rounded-xl p-1 transition-opacity hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-primary/20"
    >
      <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-background/80 p-1 shadow-md shadow-primary/10 ring-1 ring-border/60 backdrop-blur-md">
        <Image
          src="/Logo.jpeg"
          alt="Future Robotics Logo"
          width={40}
          height={40}
          className="h-full w-full rounded-lg object-cover"
          priority
        />
      </div>
      <div>
        <span className="block text-base font-extrabold tracking-tight bg-gradient-to-r from-foreground via-foreground to-primary bg-clip-text text-transparent">
          Future Robotics
        </span>
        <span className="flex items-center gap-1 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
          <Cpu className="h-3 w-3 text-primary" />
          EduERP System
        </span>
      </div>
    </Link>
  );
}

function HeaderGreeting() {
  const { data: session } = useSession();
  const user = session?.user;
  const firstName = user?.name ? user.name.split(' ')[0] : 'User';
  const role = (user as any)?.role || 'Member';
  const formattedRole = role.charAt(0).toUpperCase() + role.slice(1);

  return (
    <div className="flex flex-col min-w-0">
      <span className="flex items-center gap-1.5 text-sm font-bold text-foreground truncate sm:text-base">
        <span>Hi, {formattedRole} {firstName}</span>
        <Sparkles className="h-4 w-4 text-primary shrink-0" />
      </span>
      <span className="text-[11px] text-muted-foreground font-medium sm:text-xs">
        Welcome back to your dashboard
      </span>
    </div>
  );
}

function DashboardNav({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const isAdmin = (session?.user as any)?.role === 'admin';

  return (
    <div className="flex flex-col gap-6">
      <div className="space-y-2">
        <p className="px-3 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70">
          Main Menu
        </p>
        <nav className="flex flex-col gap-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              pathname === item.href ||
              (item.href !== '/dashboard' && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onNavigate}
                className={cn(
                  'flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition-all duration-200',
                  isActive
                    ? 'bg-primary text-primary-foreground shadow-md shadow-primary/25'
                    : 'text-muted-foreground hover:bg-secondary/80 hover:text-foreground'
                )}
              >
                <Icon className="h-4 w-4 shrink-0" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>

      {isAdmin && (
        <div className="space-y-2 pt-2 border-t border-border/30">
          <p className="px-3 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70">
            Administration
          </p>
          <nav className="flex flex-col gap-2">
            {adminItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onNavigate}
                  className={cn(
                    'flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition-all duration-200',
                    isActive
                      ? 'bg-primary text-primary-foreground shadow-md shadow-primary/25'
                      : 'text-muted-foreground hover:bg-secondary/80 hover:text-foreground'
                  )}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
      )}
    </div>
  );
}

function SidebarBottomActions({ onNavigate }: { onNavigate?: () => void }) {
  const { data: session } = useSession();
  const user = session?.user;
  const initials =
    user?.name
      ?.split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2) || '?';

  return (
    <div className="mt-auto border-t border-border/40 p-4 space-y-3 shrink-0 bg-background/30 backdrop-blur-md">
      <Link
        href="/dashboard/settings"
        onClick={onNavigate}
        className="flex items-center gap-3 rounded-xl border border-border/50 bg-card/60 p-2.5 shadow-sm cursor-pointer transition-all hover:border-primary/50 group block"
      >
        <Avatar className="h-9 w-9 ring-1 ring-border/50 shrink-0">
          <AvatarImage src={user?.image || ''} alt={user?.name || ''} />
          <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">
            {initials}
          </AvatarFallback>
        </Avatar>
        <div className="flex flex-col min-w-0 flex-1">
          <span className="truncate text-xs font-bold text-foreground group-hover:text-primary transition-colors">{user?.name}</span>
          <span className="truncate text-[11px] text-muted-foreground">{user?.email}</span>
        </div>
        <Settings className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
      </Link>

      <Button
        variant="ghost"
        size="sm"
        onClick={() => signOut({ callbackUrl: '/login' })}
        className="w-full justify-start gap-3 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-destructive hover:bg-destructive/10 hover:text-destructive transition-colors"
      >
        <LogOut className="h-4 w-4 shrink-0" />
        <span>Sign Out</span>
      </Button>
    </div>
  );
}

function UserMenu() {
  const { data: session } = useSession();
  const user = session?.user;
  const initials =
    user?.name
      ?.split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2) || '?';
  const role = (user as any)?.role;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="flex items-center gap-2.5 px-2 hover:bg-secondary/80 rounded-xl">
          <Avatar className="h-8 w-8 ring-1 ring-border/50">
            <AvatarImage src={user?.image || ''} alt={user?.name || ''} />
            <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="hidden flex-col items-start text-left sm:flex">
            <span className="text-sm font-semibold leading-none">{user?.name}</span>
            <span className="text-[11px] font-medium capitalize text-muted-foreground mt-0.5">{role}</span>
          </div>
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56 rounded-xl border-border/60 bg-card/95 backdrop-blur-md">
        <DropdownMenuLabel>
          <div className="flex flex-col space-y-0.5">
            <span className="text-sm font-bold">{user?.name}</span>
            <span className="text-xs font-normal text-muted-foreground">{user?.email}</span>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild className="cursor-pointer font-medium">
          <Link href="/dashboard/settings">
            <Settings className="mr-2 h-4 w-4" /> Account Settings
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="text-destructive focus:text-destructive cursor-pointer font-medium"
          onClick={() => signOut({ callbackUrl: '/login' })}
        >
          <LogOut className="mr-2 h-4 w-4" /> Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-background via-secondary/10 to-primary/5">
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 border-r border-border/40 bg-card/60 backdrop-blur-xl lg:flex lg:flex-col justify-between overflow-hidden">
        <div className="flex flex-col flex-1 min-h-0">
          <div className="flex h-16 items-center shrink-0 border-b border-border/40 px-6">
            <BrandHeader />
          </div>
          <div className="flex-1 overflow-y-auto p-5 scrollbar-thin">
            <DashboardNav />
          </div>
        </div>

        <SidebarBottomActions />
      </aside>

      <div className="flex flex-1 flex-col min-w-0 min-h-screen">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border/40 bg-background/60 px-4 backdrop-blur-xl sm:px-6">
          <div className="flex items-center gap-3 min-w-0">
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="lg:hidden rounded-xl shrink-0">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent
                side="left"
                className="w-72 p-0 border-r border-border/40 bg-card/95 backdrop-blur-xl flex flex-col justify-between h-full"
              >
                <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
                <div className="flex flex-col flex-1 min-h-0">
                  <div className="flex h-16 items-center shrink-0 border-b border-border/40 px-6">
                    <BrandHeader onClick={() => setMobileOpen(false)} />
                  </div>
                  <div className="flex-1 overflow-y-auto p-5 scrollbar-thin">
                    <DashboardNav onNavigate={() => setMobileOpen(false)} />
                  </div>
                </div>
                <SidebarBottomActions onNavigate={() => setMobileOpen(false)} />
              </SheetContent>
            </Sheet>

            <HeaderGreeting />
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <ThemeToggle />
            <UserMenu />
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <div className="mx-auto max-w-7xl">{children}</div>
        </main>
      </div>
    </div>
  );
}
