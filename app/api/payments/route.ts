import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Payment from '@/models/Payment';
import Student from '@/models/Student';
import { requireAuth, getCurrentUser } from '@/lib/auth-helpers';

function generateDocumentNo(): string {
  const n = new Date();
  return `DOC-${n.getFullYear()}${String(n.getMonth()+1).padStart(2,'0')}${String(n.getDate()).padStart(2,'0')}${String(n.getHours()).padStart(2,'0')}${String(n.getMinutes()).padStart(2,'0')}${String(n.getSeconds()).padStart(2,'0')}-${Math.floor(1000 + Math.random() * 9000)}`;
}

export async function GET(request: Request) {
  const auth = await requireAuth();
  if ('error' in auth) return NextResponse.json({ error: auth.error }, { status: auth.status });

  await connectDB();
  const { searchParams } = new URL(request.url);
  const search = searchParams.get('search') || '';
  const mode = searchParams.get('mode') || '';
  const startDate = searchParams.get('startDate') || '';
  const endDate = searchParams.get('endDate') || '';
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '10');

  const query: any = {};
  if (search) {
    query.$or = [
      { studentName: { $regex: search, $options: 'i' } },
      { studentRegNo: { $regex: search, $options: 'i' } },
      { documentNo: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
    ];
  }
  if (mode) query.mode = mode;
  if (startDate || endDate) {
    query.date = {};
    if (startDate) query.date.$gte = startDate;
    if (endDate) query.date.$lte = endDate;
  }

  const skip = (page - 1) * limit;
  const [payments, total] = await Promise.all([
    Payment.find(query).sort({ date: -1, createdAt: -1 }).skip(skip).limit(limit).lean(),
    Payment.countDocuments(query),
  ]);

  const totalAmount = await Payment.aggregate([{ $match: query }, { $group: { _id: null, total: { $sum: '$amount' } } }]);

  return NextResponse.json({
    payments: payments.map((p) => ({ 
      ...p, 
      _id: p._id.toString(),
      studentId: p.studentId ? p.studentId.toString() : '',
      createdBy: p.createdBy ? p.createdBy.toString() : undefined,
    })),
    total, 
    page, 
    totalPages: Math.ceil(total / limit),
    totalAmount: totalAmount[0]?.total || 0,
  });
}

export async function POST(request: Request) {
  const auth = await requireAuth();
  if ('error' in auth) return NextResponse.json({ error: auth.error }, { status: auth.status });

  await connectDB();
  const currentUser = await getCurrentUser();
  try {
    const body = await request.json();
    const student = await Student.findById(body.studentId);
    if (!student) return NextResponse.json({ error: 'Student not found' }, { status: 404 });

    const payment = await Payment.create({
      studentId: body.studentId, 
      studentName: student.name, 
      studentRegNo: student.regNo,
      courseCode: body.courseCode ? body.courseCode.trim().toUpperCase() : (student.courseCode || 'UNKNOWN'),
      amount: Number(body.amount), 
      date: body.date, 
      description: body.description, 
      isCompleted: Boolean(body.isCompleted), // Captures checkbox state
      documentNo: body.documentNo || generateDocumentNo(),
      createdBy: (currentUser as any)?.id,
    });

    const paymentObj = payment.toObject();
    return NextResponse.json({ 
      ...paymentObj, 
      _id: paymentObj._id.toString(),
      studentId: paymentObj.studentId ? paymentObj.studentId.toString() : '',
      createdBy: paymentObj.createdBy ? paymentObj.createdBy.toString() : undefined,
    }, { status: 201 });
  } catch (error: any) {
    if (error.code === 11000) return NextResponse.json({ error: 'Document number already exists' }, { status: 409 });
    return NextResponse.json({ error: error.message || 'Failed to create payment' }, { status: 500 });
  }
}
