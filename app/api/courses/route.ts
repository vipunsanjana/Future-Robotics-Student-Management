import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Student from '@/models/Student';
import { requireAuth } from '@/lib/auth-helpers';

export async function GET() {
  const auth = await requireAuth();
  if ('error' in auth) return NextResponse.json({ error: auth.error }, { status: auth.status });
  await connectDB();
  const courses = await Student.distinct('course');
  return NextResponse.json({ courses: courses.sort() });
}
