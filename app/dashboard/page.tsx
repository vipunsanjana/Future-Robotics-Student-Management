'use client';

import { useEffect } from 'react';
import Image from 'next/image';
import {
  Users,
  CreditCard,
  DollarSign,
  TrendingUp,
  Loader2,
  GraduationCap,
  Cpu,
  Code2,
  Heart,
  Sparkles,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  Legend,
} from 'recharts';
import { useDashboardStore } from '@/stores/dashboard-store';

const PIE_COLORS = [
  'hsl(var(--chart-1))',
  'hsl(var(--chart-2))',
  'hsl(var(--chart-3))',
  'hsl(var(--chart-4))',
  'hsl(var(--chart-5))',
];

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'LKR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })
    .format(amount)
    .replace('LKR', 'Rs. ');
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export default function DashboardPage() {
  const { data, loading, fetchDashboard } = useDashboardStore();

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  if (loading && !data) {
    return (
      <div className="flex h-[70vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex h-[70vh] items-center justify-center text-muted-foreground">
        Failed to load dashboard data. Please try again.
      </div>
    );
  }

  // This will completely block "Unspecified" or empty modes from ever reaching the chart
  const safeModeBreakdown = (data.modeBreakdown || [])
    .filter((item: any) => item.name && item.name.trim() !== '' && item.name !== 'Unspecified')
    .map((item: any) => ({
      name: item.name,
      value: item.value !== undefined ? item.value : (item.total || 0),
    }));

  const safeCourseDistribution = (data.courseDistribution || [])
    .filter((item: any) => item.name && item.name.trim() !== '' && item.name !== 'Other Courses')
    .map((item: any) => ({
      name: item.name,
      value: item.value !== undefined ? item.value : (item.count || 0),
    }));

  const stats = [
    {
      label: 'Total Students',
      value: data.totalStudents.toLocaleString(),
      icon: Users,
      color: 'text-primary',
      bg: 'bg-primary/10',
    },
    {
      label: 'Total Payments',
      value: data.totalPayments.toLocaleString(),
      icon: CreditCard,
      color: 'text-success',
      bg: 'bg-success/10',
    },
    {
      label: 'Total Revenue',
      value: formatCurrency(data.totalRevenue),
      icon: DollarSign,
      color: 'text-warning',
      bg: 'bg-warning/10',
    },
    {
      label: "Today's Revenue",
      value: formatCurrency(data.todayRevenue),
      icon: TrendingUp,
      color: 'text-destructive',
      bg: 'bg-destructive/10',
      sub: `${data.todayCount} payments today`,
    },
  ];

  return (
    <div className="relative flex min-h-screen flex-col justify-between overflow-hidden bg-gradient-to-br from-background via-secondary/10 to-primary/5">
      {/* Ambient Glows */}
      <div className="absolute -top-32 -left-32 h-96 w-96 rounded-full bg-primary/10 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-secondary/20 blur-3xl pointer-events-none" />

      {/* =========================================================================
          MAIN CONTENT SECTION
         ========================================================================= */}
      <main className="z-10 mx-auto w-full max-w-7xl flex-grow space-y-6 px-4 py-6 sm:px-6 lg:px-8">
        {/* Page Title */}
        <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">Dashboard</h1>
            <p className="flex items-center gap-1.5 text-sm text-muted-foreground mt-0.5">
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              Real-time analytics and performance metrics for Future Robotics
            </p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <Card
                key={stat.label}
                className="border-border/60 bg-card/80 shadow-sm backdrop-blur-xl transition-all duration-300 hover:shadow-md hover:border-primary/40"
              >
                <CardContent className="p-5">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
                      <p className="text-2xl font-bold tracking-tight">{stat.value}</p>
                      {stat.sub && <p className="text-xs font-medium text-muted-foreground">{stat.sub}</p>}
                    </div>
                    <div
                      className={`flex h-12 w-12 items-center justify-center rounded-xl shadow-inner ${stat.bg}`}
                    >
                      <Icon className={`h-6 w-6 ${stat.color}`} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Charts Row 1 */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Revenue Trend Chart */}
          <Card className="border-border/60 bg-card/80 shadow-sm backdrop-blur-xl">
            <CardHeader>
              <CardTitle className="text-lg font-bold">Revenue Trend</CardTitle>
              <CardDescription>Monthly revenue generated over the last 6 months</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={data.monthlyData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--chart-1))" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(var(--chart-1))" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                  <YAxis tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--popover))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                      fontSize: '13px',
                    }}
                    formatter={(value: any) => [formatCurrency(Number(value) || 0), 'Revenue']}
                  />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="hsl(var(--chart-1))"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorRevenue)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Payment Modes Pie Chart */}
          <Card className="border-border/60 bg-card/80 shadow-sm backdrop-blur-xl">
            <CardHeader>
              <CardTitle className="text-lg font-bold">Payment Modes</CardTitle>
              <CardDescription>Breakdown by payment processing methods</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={safeModeBreakdown}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    innerRadius={55}
                    paddingAngle={3}
                  >
                    {safeModeBreakdown.map((_, i) => (
                      <Cell key={`cell-${i}`} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--popover))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                      fontSize: '13px',
                    }}
                    formatter={(value: any) => formatCurrency(Number(value) || 0)}
                  />
                  <Legend wrapperStyle={{ fontSize: '13px' }} />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Charts Row 2 */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Course Distribution */}
          <Card className="border-border/60 bg-card/80 shadow-sm backdrop-blur-xl">
            <CardHeader>
              <CardTitle className="text-lg font-bold">Course Distribution</CardTitle>
              <CardDescription>Number of active students enrolled per course</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={safeCourseDistribution} layout="vertical" margin={{ left: 10, right: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                  <YAxis
                    type="category"
                    dataKey="name"
                    tick={{ fontSize: 11 }}
                    stroke="hsl(var(--muted-foreground))"
                    width={150}
                    tickFormatter={(v: string) => (v.length > 22 ? v.slice(0, 22) + '…' : v)}
                  />
                  <Tooltip
                    cursor={{ fill: 'hsl(var(--muted))', opacity: 0.4 }}
                    contentStyle={{
                      backgroundColor: 'hsl(var(--popover))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                      fontSize: '13px',
                    }}
                    formatter={(value: any) => [value, 'Students']}
                  />
                  {/* Map over the bars to apply dynamic colors */}
                  <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                    {safeCourseDistribution.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Recent Payments List */}
          <Card className="border-border/60 bg-card/80 shadow-sm backdrop-blur-xl">
            <CardHeader>
              <CardTitle className="text-lg font-bold">Recent Payments</CardTitle>
              <CardDescription>Latest student transactions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {data.recentPayments.length === 0 ? (
                  <div className="flex h-[250px] flex-col items-center justify-center text-muted-foreground gap-2">
                    <GraduationCap className="h-10 w-10 opacity-50" />
                    <p className="text-sm">No recent payments recorded</p>
                  </div>
                ) : (
                  data.recentPayments.map((payment) => (
                    <div
                      key={payment._id}
                      className="flex items-center justify-between gap-3 rounded-xl border border-border/50 bg-background/40 p-3 transition-colors hover:bg-secondary/50"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                          <CreditCard className="h-5 w-5 text-primary" />
                        </div>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold">{payment.studentName}</p>
                          <p className="truncate text-xs text-muted-foreground">
                            {payment.description} · {formatDate(payment.date)}
                          </p>
                        </div>
                      </div>
                      <div className="flex shrink-0 items-center gap-2">
                        <Badge variant="secondary" className="text-[11px] font-medium">
                          {payment.mode}
                        </Badge>
                        <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                          {formatCurrency(payment.amount)}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* =========================================================================
          FOOTER SECTION
         ========================================================================= */}
      <footer className="z-20 mt-8 w-full border-t border-border/40 bg-background/60 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-6 py-6 sm:flex-row sm:px-8 lg:px-12">
          {/* Left Copyright */}
          <p className="text-xs text-muted-foreground sm:text-sm">
            © {new Date().getFullYear()}{' '}
            <span className="font-semibold text-foreground">Future Robotics (PVT) LTD</span>. All rights reserved.
          </p>

          {/* Developer Credit */}
          <div className="flex items-center gap-2 text-xs text-muted-foreground sm:text-sm">
            <Code2 className="h-4 w-4 text-primary" />
            <span>Developed with</span>
            <Heart className="h-3.5 w-3.5 fill-red-500 text-red-500 animate-pulse" />
            <span>by</span>
            <span className="font-bold text-foreground hover:text-primary transition-colors">
              Vipun Sanjana
            </span>
            <span className="rounded-md bg-primary/10 px-2.5 py-1 text-[11px] font-semibold text-primary border border-primary/20">
              Software Engineer
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
