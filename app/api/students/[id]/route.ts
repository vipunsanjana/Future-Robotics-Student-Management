import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Student from '@/models/Student';
import Payment from '@/models/Payment';
import { requireAuth } from '@/lib/auth-helpers';

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const auth = await requireAuth();
  if ('error' in auth) return NextResponse.json({ error: auth.error }, { status: auth.status });

  await connectDB();
  const student = await Student.findById(params.id).lean();
  if (!student) return NextResponse.json({ error: 'Student not found' }, { status: 404 });

  const payments = await Payment.find({ studentId: params.id }).sort({ date: -1 }).lean();
  const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0);

  return NextResponse.json({
    student: { ...student, _id: student._id.toString() },
    payments: payments.map((p) => ({ ...p, _id: p._id.toString() })),
    totalPaid, paymentCount: payments.length,
  });
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const auth = await requireAuth();
  if ('error' in auth) return NextResponse.json({ error: auth.error }, { status: auth.status });

  await connectDB();
  try {
    const body = await request.json();
    const update: any = {};
    if (body.name) update.name = body.name;
    if (body.phone) update.phone = body.phone;
    if (body.course) update.course = body.course;
    if (body.email !== undefined) update.email = body.email || undefined;
    if (body.address !== undefined) update.address = body.address || undefined;

    const student = await Student.findByIdAndUpdate(params.id, update, { new: true, runValidators: true });
    if (!student) return NextResponse.json({ error: 'Student not found' }, { status: 404 });
    return NextResponse.json({ ...student.toObject(), _id: student._id.toString() });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to update student' }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const auth = await requireAuth();
  if ('error' in auth) return NextResponse.json({ error: auth.error }, { status: auth.status });

  await connectDB();
  const student = await Student.findByIdAndDelete(params.id);
  if (!student) return NextResponse.json({ error: 'Student not found' }, { status: 404 });
  await Payment.deleteMany({ studentId: params.id });
  return NextResponse.json({ success: true });
}
