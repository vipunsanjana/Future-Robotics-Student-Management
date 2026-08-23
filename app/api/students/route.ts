import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Student from '@/models/Student';
import { requireAuth } from '@/lib/auth-helpers';

export async function GET(request: Request) {
  const auth = await requireAuth();
  if ('error' in auth) return NextResponse.json({ error: auth.error }, { status: auth.status });

  await connectDB();
  const { searchParams } = new URL(request.url);
  const search = searchParams.get('search') || '';
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '10');

  const query: any = {};
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { regNo: { $regex: search, $options: 'i' } },
      { phone: { $regex: search, $options: 'i' } },
    ];
  }

  const skip = (page - 1) * limit;
  const [students, total] = await Promise.all([
    Student.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    Student.countDocuments(query),
  ]);

  return NextResponse.json({
    students: students.map((s) => ({ ...s, _id: s._id.toString() })),
    total, page, totalPages: Math.ceil(total / limit),
  });
}

export async function POST(request: Request) {
  const auth = await requireAuth();
  if ('error' in auth) return NextResponse.json({ error: auth.error }, { status: auth.status });

  await connectDB();
  try {
    const body = await request.json();
    const existing = await Student.findOne({ regNo: body.regNo.toUpperCase().trim() });
    if (existing) return NextResponse.json({ error: 'A student with this registration number already exists' }, { status: 409 });

    const student = await Student.create({
      name: body.name, 
      phone: body.phone, 
      regNo: body.regNo.toUpperCase().trim(),
      course: body.course, 
      courseCode: body.courseCode ? body.courseCode.toUpperCase().trim() : 'UNKNOWN',
    });
    
    return NextResponse.json({ ...student.toObject(), _id: student._id.toString() }, { status: 201 });
  } catch (error: any) {
    console.error('Create student error:', error);
    if (error.code === 11000) return NextResponse.json({ error: 'Registration number already exists' }, { status: 409 });
    return NextResponse.json({ error: error.message || 'Failed to create student' }, { status: 500 });
  }
}
