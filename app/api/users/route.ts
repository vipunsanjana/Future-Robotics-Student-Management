import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import User from '@/models/User';
import { requireRole } from '@/lib/auth-helpers';
import type { UserRole } from '@/models/User';

export async function GET(request: Request) {
  const auth = await requireRole(['admin']);
  if ('error' in auth) return NextResponse.json({ error: auth.error }, { status: auth.status });
  await connectDB();
  const { searchParams } = new URL(request.url);
  const search = searchParams.get('search') || '';
  const query: any = {};
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
    ];
  }
  const users = await User.find(query).sort({ createdAt: -1 }).lean();
  return NextResponse.json({
    users: users.map((u) => ({
      id: u._id.toString(),
      name: u.name,
      email: u.email,
      image: u.image,
      role: u.role,
      createdAt: u.createdAt,
      updatedAt: u.updatedAt,
    })),
  });
}

export async function POST(request: Request) {
  const auth = await requireRole(['admin']);
  if ('error' in auth) return NextResponse.json({ error: auth.error }, { status: auth.status });
  await connectDB();
  try {
    const body = await request.json();
    if (!body.email) {
      return NextResponse.json(
        { error: 'Email address is required' },
        { status: 400 }
      );
    }
    const existing = await User.findOne({ email: body.email.toLowerCase() });
    if (existing) {
      return NextResponse.json(
        { error: 'A user with this email address already exists' },
        { status: 409 }
      );
    }
    const role: UserRole = body.role === 'admin' ? 'admin' : 'manager';
    const user = await User.create({
      name: body.name || '',
      email: body.email.toLowerCase(),
      role,
    });
    return NextResponse.json(
      {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
      },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to create user' },
      { status: 500 }
    );
  }
}
