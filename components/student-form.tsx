'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Loader2, ArrowLeft, Save } from 'lucide-react';
import { toast } from 'sonner';
import { useStudentStore } from '@/stores/student-store';

export interface StudentFormData { 
  name: string; 
  phone: string; 
  regNo: string; 
  course: string; 
  courseCode: string; 
}

export function StudentForm({ initialData, mode }: { initialData?: StudentFormData & { _id?: string }; mode: 'create' | 'edit' }) {
  const router = useRouter();
  const { createStudent, updateStudent } = useStudentStore();
  const [loading, setLoading] = useState(false);
  
  const [form, setForm] = useState<StudentFormData>({
    name: initialData?.name || '', 
    phone: initialData?.phone || '', 
    regNo: initialData?.regNo || '',
    course: initialData?.course || '', 
    courseCode: initialData?.courseCode || '', 
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const ok = mode === 'create' ? await createStudent(form) : await updateStudent(initialData!._id!, form);
    if (ok) {
      toast.success(mode === 'create' ? 'Student added successfully' : 'Student updated successfully');
      router.push('/dashboard/students');
      router.refresh();
    } else {
      toast.error('Something went wrong');
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-in max-w-2xl">
      <div className="flex items-center gap-4">
        <Button asChild variant="ghost" size="icon">
          <Link href="/dashboard/students"><ArrowLeft className="h-5 w-5" /></Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{mode === 'create' ? 'Add New Student' : 'Edit Student'}</h1>
          <p className="text-sm text-muted-foreground mt-1">{mode === 'create' ? 'Enter the student details below' : 'Update student information'}</p>
        </div>
      </div>
      <Card className="border-border/50 shadow-sm">
        <CardHeader>
          <CardTitle>Student Information</CardTitle>
          <CardDescription>All fields marked with * are required</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name *</Label>
                <Input id="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="G.M.R.K.Gajanayake" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="regNo">Registration No. *</Label>
                <Input id="regNo" value={form.regNo} onChange={(e) => setForm({ ...form, regNo: e.target.value })} placeholder="0726PLC983" required className="font-mono" disabled={mode === 'edit'} />
                {mode === 'edit' && <p className="text-xs text-muted-foreground">Registration number cannot be changed after creation</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number *</Label>
                <Input id="phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+94 70 398 3814" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="courseCode">Course Code *</Label>
                <Input id="courseCode" value={form.courseCode} onChange={(e) => setForm({ ...form, courseCode: e.target.value })} placeholder="0726PLC" required className="font-uppercase" />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="course">Course Title *</Label>
              <Input id="course" value={form.course} onChange={(e) => setForm({ ...form, course: e.target.value })} placeholder="PLC Programming Course 2026 July" required />
            </div>

            <div className="flex gap-3 pt-2">
              <Button type="submit" disabled={loading}>
                {loading ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" />{mode === 'create' ? 'Adding...' : 'Saving...'}</>
                ) : (
                  <><Save className="mr-2 h-4 w-4" />{mode === 'create' ? 'Add Student' : 'Save Changes'}</>
                )}
              </Button>
              <Button asChild variant="outline">
                <Link href="/dashboard/students">Cancel</Link>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
