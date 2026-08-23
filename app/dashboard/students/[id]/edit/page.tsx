import { notFound } from 'next/navigation';
import { connectDB } from '@/lib/mongodb';
import Student from '@/models/Student';
import { StudentForm } from '@/components/student-form';

export default async function EditStudentPage({ params }: { params: { id: string } }) {
  await connectDB();
  const student = await Student.findById(params.id).lean();
  if (!student) notFound();
  return <StudentForm mode="edit" initialData={{
    _id: student._id.toString(), name: student.name, phone: student.phone,
    regNo: student.regNo, course: student.course, courseCode: student.courseCode,
  }} />;
}
