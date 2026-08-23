import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectDB } from '@/lib/mongodb';
import { Registration, Student, Payment, Course } from '@/lib/models';

export const dynamic = 'force-dynamic';

async function checkAuth() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return { ok: false as const, response: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) };
  }
  return { ok: true as const, session };
}

export async function GET() {
  const auth = await checkAuth();
  if (!auth.ok) return auth.response;

  try {
    await connectDB();
    const registrations = await Registration.find({}).sort({ createdAt: -1 }).lean();
    return NextResponse.json(registrations);
  } catch (error: any) {
    console.error('Fetch registrations error:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch registrations' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const auth = await checkAuth();
  if (!auth.ok) return auth.response;

  try {
    await connectDB();
    
    const body = await req.json();
    const { name, phone, regNo, course, amount, date, description, mode, email, address } = body;

    if (!name || !phone || !regNo || !course || !amount || !date || !description || !mode) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    
    if (mode !== 'Online' && mode !== 'Recording') {
      return NextResponse.json({ error: 'Invalid mode' }, { status: 400 });
    }

    const uppercaseRegNo = regNo.trim().toUpperCase();
    const trimmedCourse = course.trim();

    const existingRegistration = await Registration.findOne({
      regNo: uppercaseRegNo,
      course: trimmedCourse,
    });

    if (existingRegistration) {
      return NextResponse.json({ error: 'A registration for this student and course already exists' }, { status: 409 });
    }

    const courseDoc = await Course.findOne({ title: trimmedCourse });
    const courseCode = courseDoc ? courseDoc.courseCode : 'UNKNOWN';

    let studentRecord = await Student.findOne({ regNo: uppercaseRegNo });

    if (!studentRecord) {
      studentRecord = await Student.create({
        name: name.trim(),
        phone: phone.trim(),
        regNo: uppercaseRegNo,
        course: trimmedCourse,
        courseCode: courseCode,
        email: email ? email.trim() : undefined,
        address: address ? address.trim() : undefined,
      });
    } else {
      const currentCourses = studentRecord.course ? studentRecord.course.split(',').map((c: string) => c.trim()) : [];
      const currentCodes = studentRecord.courseCode ? studentRecord.courseCode.split(',').map((c: string) => c.trim()) : [];

      if (!currentCourses.includes(trimmedCourse)) {
        currentCourses.push(trimmedCourse);
        studentRecord.course = currentCourses.join(', ');
      }
      if (!currentCodes.includes(courseCode) && courseCode !== 'UNKNOWN') {
        currentCodes.push(courseCode);
        studentRecord.courseCode = currentCodes.join(', ');
      }
      if (email) studentRecord.email = email.trim();
      if (address) studentRecord.address = address.trim();
      
      await studentRecord.save();
    }

    const documentNo = `DOC-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const isCompleted = /Full course payment done/i.test(description);

    const payment = await Payment.create({
      studentId: studentRecord._id,
      studentName: name.trim(),
      studentRegNo: uppercaseRegNo,
      courseCode: courseCode,
      amount: Number(amount),
      date,
      description: description.trim(),
      documentNo,
      isCompleted,
    });

    const newRegistration = await Registration.create({
      name: name.trim(),
      phone: phone.trim(),
      regNo: uppercaseRegNo,
      course: trimmedCourse,
      courseCode: courseCode,
      amount: Number(amount),
      date,
      description: description.trim(),
      mode,
      documentNo,
    });

    return NextResponse.json({ registration: newRegistration, payment }, { status: 201 });
  } catch (error: any) {
    console.error('Registration/Payment error:', error);
    return NextResponse.json({ error: error.message || 'Failed to process transaction' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  const auth = await checkAuth();
  if (!auth.ok) return auth.response;

  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json({ error: 'Missing registration ID' }, { status: 400 });
  }

  try {
    await connectDB();
    const reg = await Registration.findById(id);

    if (!reg) {
      return NextResponse.json({ error: 'Registration not found' }, { status: 404 });
    }

    // Delete associated payments
    if (reg.documentNo) {
      await Payment.deleteMany({ documentNo: reg.documentNo });
    }

    // Delete the registration
    await Registration.findByIdAndDelete(id);

    // Clean up student course record
    if (reg.regNo) {
      const student = await Student.findOne({ regNo: reg.regNo });

      if (student) {
        const currentCourses = student.course 
          ? student.course.split(',').map((c: string) => c.trim()).filter(Boolean) 
          : [];
          
        const currentCourseCodes = student.courseCode 
          ? student.courseCode.split(',').map((c: string) => c.trim()).filter(Boolean) 
          : [];

        if (currentCourses.length > 1 || currentCourseCodes.length > 1) {
          const courseDoc = await Course.findOne({ title: reg.course.trim() });
          const deletedCourseCode = courseDoc ? courseDoc.courseCode : 'UNKNOWN';

          student.course = currentCourses
            .filter((c: string) => c !== reg.course.trim())
            .join(', ');
            
          student.courseCode = currentCourseCodes
            .filter((c: string) => c !== deletedCourseCode)
            .join(', ');
            
          await student.save();
        } else {
          await Student.deleteOne({ _id: student._id });
        }
      }
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Delete registration error:', error);
    return NextResponse.json({ error: error.message || 'Failed to process deletion' }, { status: 500 });
  }
}
