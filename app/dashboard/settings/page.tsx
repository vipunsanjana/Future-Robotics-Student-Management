'use client';

import { useSession } from 'next-auth/react';
import { Shield, Mail, User, Calendar, CheckCircle2, Sparkles } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

export default function SettingsPage() {
  const { data: session } = useSession();
  const user = session?.user as any;

  const initials = user?.name
    ? user.name
        .split(' ')
        .map((n: string) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : 'US';

  const role = user?.role || 'Member';
  const formattedRole = role.charAt(0).toUpperCase() + role.slice(1);

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-in">
      <div>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Account Details</h1>
        <p className="text-sm text-muted-foreground mt-1">
          View your personal profile information and system permissions.
        </p>
      </div>

      <Card className="border-border/60 bg-card/85 backdrop-blur-xl shadow-sm overflow-hidden">
        <CardHeader className="border-b border-border/40 pb-6">
          <div className="flex flex-col sm:flex-row items-center gap-5">
            <Avatar className="h-20 w-20 ring-2 ring-primary/20 shadow-md shrink-0">
              <AvatarImage src={user?.image || ''} alt={user?.name || ''} />
              <AvatarFallback className="bg-primary/10 text-primary text-xl font-bold">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="space-y-1 text-center sm:text-left">
              <CardTitle className="text-xl font-bold">{user?.name || 'User'}</CardTitle>
              <CardDescription className="flex items-center justify-center sm:justify-start gap-1.5 text-xs">
                <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                {user?.email || 'No email provided'}
              </CardDescription>
              <div className="pt-2 flex items-center justify-center sm:justify-start gap-2">
                <Badge
                  variant={role === 'admin' ? 'default' : 'secondary'}
                  className="gap-1 capitalize font-semibold rounded-lg"
                >
                  <Shield className="h-3 w-3" />
                  {formattedRole}
                </Badge>
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  <CheckCircle2 className="h-3 w-3" /> Active Account
                </span>
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-6 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="rounded-xl border border-border/50 bg-secondary/30 p-4 space-y-1">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <User className="h-3.5 w-3.5 text-primary" /> Full Name
              </span>
              <p className="text-sm font-medium text-foreground">{user?.name || 'N/A'}</p>
            </div>

            <div className="rounded-xl border border-border/50 bg-secondary/30 p-4 space-y-1">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <Mail className="h-3.5 w-3.5 text-primary" /> Email Address
              </span>
              <p className="text-sm font-medium text-foreground">{user?.email || 'N/A'}</p>
            </div>

            <div className="rounded-xl border border-border/50 bg-secondary/30 p-4 space-y-1">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <Shield className="h-3 w-3.5 text-primary" /> System Role
              </span>
              <p className="text-sm font-medium text-foreground capitalize">{formattedRole}</p>
            </div>

            <div className="rounded-xl border border-border/50 bg-secondary/30 p-4 space-y-1">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5 text-primary" /> Authentication
              </span>
              <p className="text-sm font-medium text-foreground">Google SSO Secured</p>
            </div>
          </div>

          <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 text-xs text-muted-foreground flex items-center gap-3">
            <Sparkles className="h-5 w-5 text-primary shrink-0" />
            <p>
              Your account details are synchronized securely via your institutional Google account. Contact an administrator to update role permissions.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
