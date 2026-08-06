import { create } from 'zustand';

interface DashboardData {
  totalStudents: number;
  totalPayments: number;
  totalRevenue: number;
  todayRevenue: number;
  todayCount: number;
  recentPayments: any[];
  monthlyData: { month: string; revenue: number; count: number }[];
  modeBreakdown: { _id: string; count: number; total: number }[];
  courseDistribution: { _id: string; count: number }[];
}

interface DashboardState {
  data: DashboardData | null;
  loading: boolean;
  error: string | null;
  fetchDashboard: () => Promise<void>;
}

export const useDashboardStore = create<DashboardState>((set) => ({
  data: null,
  loading: false,
  error: null,
  fetchDashboard: async () => {
    set({ loading: true, error: null });
    try {
      const res = await fetch('/api/dashboard');
      const d = await res.json();
      if (d.error) throw new Error(d.error);
      set({ data: d, loading: false });
    } catch (err: any) {
      set({ error: err.message, loading: false });
    }
  },
}));
