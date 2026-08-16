import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Student from '@/models/Student';
import Payment from '@/models/Payment';
import { requireAuth } from '@/lib/auth-helpers';
import mongoose from 'mongoose';

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const auth = await requireAuth();
  if ('error' in auth) return NextResponse.json({ error: auth.error }, { status: auth.status });

  await connectDB();

  // Validate ID to prevent Mongoose crashes
  if (!mongoose.Types.ObjectId.isValid(params.id)) {
    return NextResponse.json({ error: 'Invalid Student ID format' }, { status: 400 });
  }

  const student: any = await Student.findById(params.id).lean();
  if (!student) return NextResponse.json({ error: 'Student not found' }, { status: 404 });

  // Robust query: checks if studentId was saved as a String OR an ObjectId
  const payments = await Payment.find({
    $or: [
      { studentId: params.id },
      { studentId: new mongoose.Types.ObjectId(params.id) }
    ]
  }).sort({ date: -1 }).lean();

  const totalPaid = payments.reduce((sum, p: any) => sum + (p.amount || 0), 0);

  return NextResponse.json({
    student: { ...student, _id: student._id.toString() },
    payments: payments.map((p: any) => ({ ...p, _id: p._id.toString() })),
    totalPaid,
    paymentCount: payments.length,
  });
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const auth = await requireAuth();
  if ('error' in auth) return NextResponse.json({ error: auth.error }, { status: auth.status });

  await connectDB();

  if (!mongoose.Types.ObjectId.isValid(params.id)) {
    return NextResponse.json({ error: 'Invalid Student ID format' }, { status: 400 });
  }

  try {
    const body = await request.json();
    const update: any = {};
    
    // Included missing registration fields
    if (body.name) update.name = body.name;
    if (body.phone) update.phone = body.phone;
    if (body.course) update.course = body.course;
    if (body.courseCode) update.courseCode = body.courseCode; // Fixed!
    if (body.regNo) update.regNo = body.regNo;               // Fixed!
    if (body.email !== undefined) update.email = body.email || undefined;
    if (body.address !== undefined) update.address = body.address || undefined;

    const student: any = await Student.findByIdAndUpdate(params.id, update, { 
      returnDocument: 'after', 
      runValidators: true 
    }).lean();
    
    if (!student) return NextResponse.json({ error: 'Student not found' }, { status: 404 });
    
    return NextResponse.json({ ...student, _id: student._id.toString() });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to update student' }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const auth = await requireAuth();
  if ('error' in auth) return NextResponse.json({ error: auth.error }, { status: auth.status });

  await connectDB();

  if (!mongoose.Types.ObjectId.isValid(params.id)) {
    return NextResponse.json({ error: 'Invalid Student ID format' }, { status: 400 });
  }

  const student = await Student.findByIdAndDelete(params.id);
  if (!student) return NextResponse.json({ error: 'Student not found' }, { status: 404 });
  
  // Delete payments mapped to this student via String OR ObjectId
  await Payment.deleteMany({
    $or: [
      { studentId: params.id },
      { studentId: new mongoose.Types.ObjectId(params.id) }
    ]
  });
  
  return NextResponse.json({ success: true });
}
