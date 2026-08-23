'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Loader2, ArrowLeft, Save, Search } from 'lucide-react';
import { toast } from 'sonner';
import { Suspense } from 'react';
import { usePaymentStore } from '@/stores/payment-store';

interface StudentOption {
  _id: string;
  name: string;
  regNo: string;
  courseCode: string;
}

function PaymentFormInner() {
  const router = useRouter();
  const { createPayment } = usePaymentStore();

  const [loading, setLoading] = useState(false);
  const [students, setStudents] = useState<StudentOption[]>([]);
  const [showStudentList, setShowStudentList] = useState(false);

  const [form, setForm] = useState({
    studentId: '',
    studentRegNo: '',
    studentName: '',
    courseCode: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    description: '',
    isCompleted: false,
  });

  // Fetch students as you type the Reg No to auto-fill name & ID
  useEffect(() => {
    const query = form.studentRegNo.trim();
    if (query.length >= 1) {
      fetch(`/api/students?search=${encodeURIComponent(query)}&limit=10`)
        .then((r) => r.json())
        .then((d) => {
          if (!d.error && d.students) setStudents(d.students);
        })
        .catch((err) => console.error('Failed to load students', err));
    } else {
      setStudents([]);
    }
  }, [form.studentRegNo]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.studentId) {
      toast.error('Please enter a valid Student Reg No and select from the list');
      return;
    }

    setLoading(true);
    const ok = await createPayment({
      studentId: form.studentId.trim(),
      studentName: form.studentName.trim(),
      studentRegNo: form.studentRegNo.trim().toUpperCase(),
      courseCode: form.courseCode.trim().toUpperCase(),
      amount: Number(form.amount),
      date: form.date,
      description: form.description.trim(),
      isCompleted: form.isCompleted,
    });

    if (ok) {
      toast.success('Payment recorded successfully');
      router.push('/dashboard/payments');
      router.refresh();
    } else {
      toast.error('Failed to record payment');
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-in max-w-2xl">
      <div className="flex items-center gap-4">
        <Button asChild variant="ghost" size="icon">
          <Link href="/dashboard/payments"><ArrowLeft className="h-5 w-5" /></Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Record New Payment</h1>
          <p className="text-sm text-muted-foreground mt-1">Enter payment information below</p>
        </div>
      </div>
      <Card className="border-border/50 shadow-sm">
        <CardHeader>
          <CardTitle>Payment Information</CardTitle>
          <CardDescription>All fields marked with * are required</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Student Reg No (Auto-searches & gets student name) */}
            <div className="space-y-2 relative">
              <Label htmlFor="studentRegNo">Student Reg No *</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input 
                  id="studentRegNo"
                  placeholder="Type registration number (e.g. 0726PLC983)..." 
                  value={form.studentRegNo} 
                  onChange={(e) => { 
                    setForm({ ...form, studentRegNo: e.target.value, studentId: '', studentName: '' }); 
                    setShowStudentList(true); 
                  }} 
                  onFocus={() => setShowStudentList(true)} 
                  className="pl-9 font-mono uppercase" 
                  required
                />
              </div>
              {showStudentList && students.length > 0 && (
                <div className="absolute z-50 mt-1 max-h-60 w-full overflow-y-auto rounded-lg border border-border bg-popover shadow-lg scrollbar-thin">
                  {students.map((s) => (
                    <button 
                      key={s._id} 
                      type="button" 
                      className="flex w-full items-center justify-between px-3 py-2.5 text-left text-sm hover:bg-secondary transition-colors" 
                      onClick={() => { 
                        setForm({ 
                          ...form, 
                          studentId: s._id, 
                          studentRegNo: s.regNo, 
                          studentName: s.name, 
                          courseCode: s.courseCode || form.courseCode
                        }); 
                        setShowStudentList(false); 
                      }}
                    >
                      <span className="font-mono font-medium">{s.regNo}</span>
                      <span className="text-xs text-muted-foreground">{s.name}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Student Name (Auto-filled) */}
            <div className="space-y-2">
              <Label htmlFor="studentName">Student Name *</Label>
              <Input 
                id="studentName" 
                value={form.studentName} 
                disabled 
                className="bg-secondary/50" 
                placeholder="Auto-filled from Reg No" 
              />
            </div>

            {/* Course Code (Manual Entry) */}
            <div className="space-y-2">
              <Label htmlFor="courseCode">Course Code *</Label>
              <Input 
                id="courseCode" 
                value={form.courseCode} 
                onChange={(e) => setForm({ ...form, courseCode: e.target.value })} 
                placeholder="0726PLC" 
                className="font-uppercase"
                required 
              />
            </div>

            {/* Amount & Date (Manual Entry) */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="amount">Amount (Rs.) *</Label>
                <Input 
                  id="amount" 
                  type="number" 
                  min="0" 
                  step="0.01" 
                  value={form.amount} 
                  onChange={(e) => setForm({ ...form, amount: e.target.value })} 
                  placeholder="14400" 
                  required 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="date">Payment Date *</Label>
                <Input 
                  id="date" 
                  type="date" 
                  value={form.date} 
                  onChange={(e) => setForm({ ...form, date: e.target.value })} 
                  required 
                />
              </div>
            </div>

            {/* Description (Manual Entry) */}
            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea 
                id="description" 
                value={form.description} 
                onChange={(e) => setForm({ ...form, description: e.target.value })} 
                placeholder="Full course payment done" 
                required 
                rows={3} 
              />
            </div>

            {/* isCompleted Checkbox */}
            <div className="flex items-center space-x-2 pt-2">
              <input 
                type="checkbox" 
                id="isCompleted" 
                checked={form.isCompleted} 
                onChange={(e) => setForm({ ...form, isCompleted: e.target.checked })} 
                className="h-4 w-4 rounded border-border text-primary focus:ring-primary cursor-pointer"
              />
              <Label htmlFor="isCompleted" className="cursor-pointer font-medium">Mark as Completed (isCompleted: true)</Label>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <Button type="submit" disabled={loading}>
                {loading ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Recording...</>
                ) : (
                  <><Save className="mr-2 h-4 w-4" />Record Payment</>
                )}
              </Button>
              <Button asChild variant="outline">
                <Link href="/dashboard/payments">Cancel</Link>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

export default function NewPaymentPage() {
  return (
    <Suspense fallback={<div className="flex h-[60vh] items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>}>
      <PaymentFormInner />
    </Suspense>
  );
}
