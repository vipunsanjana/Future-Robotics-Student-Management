import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import User from '@/models/User';
import { requireRole } from '@/lib/auth-helpers';
import bcrypt from 'bcryptjs';
import type { UserRole } from '@/models/User';

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const auth = await requireRole(['admin']);
  if ('error' in auth) return NextResponse.json({ error: auth.error }, { status: auth.status });
  await connectDB();
  try {
    const body = await request.json();
    const update: any = {};
    if (body.name) update.name = body.name;
    if (body.role && ['admin','manager'].includes(body.role)) update.role = body.role as UserRole;
    if (body.active !== undefined) update.active = body.active;
    if (body.password) {
      if (body.password.length < 6) return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 });
      update.password = await bcrypt.hash(body.password, 12);
    }
    const user = await User.findByIdAndUpdate(params.id, update, { new: true }).lean();
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });
    return NextResponse.json({ id: user._id.toString(), name: user.name, email: user.email, role: user.role, active: user.active });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to update user' }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const auth = await requireRole(['admin']);
  if ('error' in auth) return NextResponse.json({ error: auth.error }, { status: auth.status });
  await connectDB();
  const currentUserId = (auth.user as any)?.id;
  if (currentUserId === params.id) return NextResponse.json({ error: 'You cannot delete your own account' }, { status: 400 });
  const user = await User.findByIdAndDelete(params.id);
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });
  return NextResponse.json({ success: true });
}
