import { create } from 'zustand';

export interface User {
  id: string;
  name: string;
  email: string;
  image?: string;
  role: string;
  active: boolean;
  createdAt: string;
  hasPassword: boolean;
}

interface UserState {
  users: User[];
  loading: boolean;
  error: string | null;
  search: string;
  setSearch: (search: string) => void;
  fetchUsers: () => Promise<void>;
  createUser: (data: any) => Promise<boolean>;
  updateUser: (id: string, data: any) => Promise<boolean>;
  deleteUser: (id: string) => Promise<boolean>;
}

export const useUserStore = create<UserState>((set, get) => ({
  users: [],
  loading: false,
  error: null,
  search: '',

  setSearch: (search) => {
    set({ search });
    get().fetchUsers();
  },

  fetchUsers: async () => {
    const { search } = get();
    set({ loading: true, error: null });
    try {
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      const res = await fetch(`/api/users?${params}`);
      const d = await res.json();
      if (d.error) throw new Error(d.error);
      set({ users: d.users, loading: false });
    } catch (err: any) {
      set({ error: err.message, loading: false });
    }
  },

  createUser: async (data) => {
    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error);
      await get().fetchUsers();
      return true;
    } catch (err: any) {
      set({ error: err.message });
      return false;
    }
  },

  updateUser: async (id, data) => {
    try {
      const res = await fetch(`/api/users/${id}`, {
        method: 'PATCH', // <--- FIXED: Changed from 'PUT' to 'PATCH'
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error);
      await get().fetchUsers();
      return true;
    } catch (err: any) {
      set({ error: err.message });
      return false;
    }
  },

  deleteUser: async (id) => {
    try {
      const res = await fetch(`/api/users/${id}`, { method: 'DELETE' });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error);
      }
      await get().fetchUsers();
      return true;
    } catch (err: any) {
      set({ error: err.message });
      return false;
    }
  },
}));
