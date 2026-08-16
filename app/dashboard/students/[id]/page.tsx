import { notFound } from 'next/navigation';
import { connectDB } from '@/lib/mongodb';
import Student from '@/models/Student';
import Payment from '@/models/Payment';
import mongoose from 'mongoose';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Pencil, Plus } from 'lucide-react';
import { StudentDetail } from '@/components/student-detail';

export default async function StudentDetailPage({ params }: { params: { id: string } }) {
  await connectDB();
  
  const student = await Student.findById(params.id).lean();
  if (!student) notFound();
  
  // 🔥 THE FIX: Use native MongoDB collection to bypass Mongoose schema casting!
  // This ensures it matches exactly what is in your database.
  const paymentsCursor = await Payment.collection.find({
    $or: [
      { studentId: params.id }, // Matches if it was saved as a raw String
      { studentId: new mongoose.Types.ObjectId(params.id) }, // Matches if saved as ObjectId
      { studentRegNo: student.regNo } // Matches exactly by Registration Number
    ]
  }).sort({ date: -1 });

  // Convert the native MongoDB cursor to a standard array
  const rawPayments = await paymentsCursor.toArray();
  
  const totalPaid = rawPayments.reduce((sum, p) => sum + (p.amount || 0), 0);

  return (
    <div className="space-y-6 animate-in">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-4">
          <Button asChild variant="ghost" size="icon">
            <Link href="/dashboard/students">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{student.name}</h1>
            <p className="text-sm text-muted-foreground">Student profile and payment history</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline">
            <Link href={`/dashboard/students/${student._id}/edit`}>
              <Pencil className="mr-2 h-4 w-4" />
              Edit
            </Link>
          </Button>
          <Button asChild>
            <Link href={`/dashboard/payments/new?studentId=${student._id}`}>
              <Plus className="mr-2 h-4 w-4" />
              Add Payment
            </Link>
          </Button>
        </div>
      </div>
      <StudentDetail
        student={
          {
            _id: student._id.toString(),
            name: student.name,
            phone: student.phone,
            regNo: student.regNo,
            course: student.course,
            courseCode: student.courseCode,
            email: student.email,
            address: student.address,
            createdAt: student.createdAt,
          } as any
        }
        payments={rawPayments.map((p) => ({
          _id: p._id.toString(),
          amount: p.amount,
          date: p.date,
          description: p.description,
          mode: p.mode,
          documentNo: p.documentNo,
          courseCode: p.courseCode,
          isCompleted: p.isCompleted,
          createdAt: p.createdAt,
        }))}
        totalPaid={totalPaid}
      />
    </div>
  );
}
