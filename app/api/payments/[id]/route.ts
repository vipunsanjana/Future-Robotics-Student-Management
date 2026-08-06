import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Payment from '@/models/Payment';
import { requireAuth } from '@/lib/auth-helpers';

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const auth = await requireAuth();
  if ('error' in auth) return NextResponse.json({ error: auth.error }, { status: auth.status });
  await connectDB();
  const payment = await Payment.findById(params.id).lean();
  if (!payment) return NextResponse.json({ error: 'Payment not found' }, { status: 404 });
  return NextResponse.json({ ...payment, _id: payment._id.toString() });
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const auth = await requireAuth();
  if ('error' in auth) return NextResponse.json({ error: auth.error }, { status: auth.status });
  await connectDB();
  try {
    const body = await request.json();
    const update: any = {};
    if (body.amount !== undefined) update.amount = body.amount;
    if (body.date) update.date = body.date;
    if (body.description) update.description = body.description;
    if (body.mode) update.mode = body.mode;
    const payment = await Payment.findByIdAndUpdate(params.id, update, { new: true });
    if (!payment) return NextResponse.json({ error: 'Payment not found' }, { status: 404 });
    return NextResponse.json({ ...payment.toObject(), _id: payment._id.toString() });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to update payment' }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const auth = await requireAuth();
  if ('error' in auth) return NextResponse.json({ error: auth.error }, { status: auth.status });
  await connectDB();
  const payment = await Payment.findByIdAndDelete(params.id);
  if (!payment) return NextResponse.json({ error: 'Payment not found' }, { status: 404 });
  return NextResponse.json({ success: true });
}
