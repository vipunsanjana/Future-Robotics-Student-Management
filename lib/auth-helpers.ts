import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectDB } from '@/lib/mongodb';
import User from '@/models/User';
import type { UserRole } from '@/models/User';

export async function getCurrentUser() {
  const session = await getServerSession(authOptions);
  return session?.user ?? null;
}

export async function requireAuth() {
  const user = await getCurrentUser();
  if (!user) return { error: 'Unauthorized', status: 401 } as const;
  return { user } as const;
}

export async function requireRole(roles: UserRole[]) {
  const authResult = await requireAuth();
  if ('error' in authResult) return authResult;
  const userRole = (authResult.user as any).role as UserRole;
  if (!roles.includes(userRole)) return { error: 'Forbidden', status: 403 } as const;
  return authResult;
}

export async function seedAdmin(email: string) {
  if (!email) throw new Error('seedAdmin requires an email address');

  await connectDB();
  const normalized = email.toLowerCase();

  const existing = await User.findOne({ email: normalized });
  if (existing) {
    existing.role = 'admin';
    existing.active = true;
    await existing.save();
    return { created: false, email: normalized };
  }

  await User.create({
    email: normalized,
    name: 'Admin User',
    role: 'admin',
    active: true,
  });
  return { created: true, email: normalized };
}
