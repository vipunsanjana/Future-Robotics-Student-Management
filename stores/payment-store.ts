import { create } from 'zustand';

export interface Payment {
  _id: string;
  studentName: string;
  studentRegNo: string;
  amount: number;
  date: string;
  description: string;
  mode: string;
  documentNo: string;
  createdAt: string;
}

interface PaymentState {
  payments: Payment[];
  total: number;
  totalAmount: number;
  page: number;
  totalPages: number;
  loading: boolean;
  error: string | null;
  search: string;
  mode: string;
  setSearch: (search: string) => void;
  setMode: (mode: string) => void;
  setPage: (page: number) => void;
  fetchPayments: () => Promise<void>;
  createPayment: (data: any) => Promise<boolean>;
  deletePayment: (id: string) => Promise<boolean>;
}

export const usePaymentStore = create<PaymentState>((set, get) => ({
  payments: [],
  total: 0,
  totalAmount: 0,
  page: 1,
  totalPages: 1,
  loading: false,
  error: null,
  search: '',
  mode: 'all',

  setSearch: (search) => {
    set({ search, page: 1 });
    get().fetchPayments();
  },

  setMode: (mode) => {
    set({ mode, page: 1 });
    get().fetchPayments();
  },

  setPage: (page) => {
    set({ page });
    get().fetchPayments();
  },

  fetchPayments: async () => {
    const { search, mode, page } = get();
    set({ loading: true, error: null });
    try {
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      if (mode !== 'all') params.set('mode', mode);
      params.set('page', String(page));
      params.set('limit', '10');
      const res = await fetch(`/api/payments?${params}`);
      const d = await res.json();
      if (d.error) throw new Error(d.error);
      set({
        payments: d.payments,
        total: d.total,
        totalAmount: d.totalAmount,
        totalPages: d.totalPages,
        loading: false,
      });
    } catch (err: any) {
      set({ error: err.message, loading: false });
    }
  },

  createPayment: async (data) => {
    try {
      const res = await fetch('/api/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error);
      await get().fetchPayments();
      return true;
    } catch (err: any) {
      set({ error: err.message });
      return false;
    }
  },

  deletePayment: async (id) => {
    try {
      const res = await fetch(`/api/payments/${id}`, { method: 'DELETE' });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error);
      }
      await get().fetchPayments();
      return true;
    } catch (err: any) {
      set({ error: err.message });
      return false;
    }
  },
}));
