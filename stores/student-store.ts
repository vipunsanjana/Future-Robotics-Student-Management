import { create } from 'zustand';

export interface Student {
  _id: string;
  name: string;
  phone: string;
  regNo: string;
  course: string;
  email?: string;
  address?: string;
  createdAt: string;
}

interface StudentDetail {
  student: Student;
  payments: any[];
  totalPaid: number;
  paymentCount: number;
}

interface StudentState {
  students: Student[];
  total: number;
  page: number;
  totalPages: number;
  loading: boolean;
  error: string | null;
  search: string;
  setSearch: (search: string) => void;
  setPage: (page: number) => void;
  fetchStudents: () => Promise<void>;
  createStudent: (data: Partial<Student>) => Promise<boolean>;
  updateStudent: (id: string, data: Partial<Student>) => Promise<boolean>;
  deleteStudent: (id: string) => Promise<boolean>;
  detail: StudentDetail | null;
  detailLoading: boolean;
  fetchStudentDetail: (id: string) => Promise<void>;
}

export const useStudentStore = create<StudentState>((set, get) => ({
  students: [],
  total: 0,
  page: 1,
  totalPages: 1,
  loading: false,
  error: null,
  search: '',
  detail: null,
  detailLoading: false,

  setSearch: (search) => {
    set({ search, page: 1 });
    get().fetchStudents();
  },

  setPage: (page) => {
    set({ page });
    get().fetchStudents();
  },

  fetchStudents: async () => {
    const { search, page } = get();
    set({ loading: true, error: null });
    try {
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      params.set('page', String(page));
      params.set('limit', '10');
      const res = await fetch(`/api/students?${params}`);
      const d = await res.json();
      if (d.error) throw new Error(d.error);
      set({ students: d.students, total: d.total, totalPages: d.totalPages, loading: false });
    } catch (err: any) {
      set({ error: err.message, loading: false });
    }
  },

  createStudent: async (data) => {
    try {
      const res = await fetch('/api/students', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error);
      await get().fetchStudents();
      return true;
    } catch (err: any) {
      set({ error: err.message });
      return false;
    }
  },

  updateStudent: async (id, data) => {
    try {
      const res = await fetch(`/api/students/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error);
      await get().fetchStudents();
      return true;
    } catch (err: any) {
      set({ error: err.message });
      return false;
    }
  },

  deleteStudent: async (id) => {
    try {
      const res = await fetch(`/api/students/${id}`, { method: 'DELETE' });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error);
      }
      await get().fetchStudents();
      return true;
    } catch (err: any) {
      set({ error: err.message });
      return false;
    }
  },

  fetchStudentDetail: async (id) => {
    set({ detailLoading: true });
    try {
      const res = await fetch(`/api/students/${id}`);
      const d = await res.json();
      if (d.error) throw new Error(d.error);
      set({ detail: d, detailLoading: false });
    } catch (err: any) {
      set({ error: err.message, detailLoading: false });
    }
  },
}));
