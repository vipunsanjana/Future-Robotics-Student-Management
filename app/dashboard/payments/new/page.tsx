'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, ArrowLeft, Save, Search } from 'lucide-react';
import { toast } from 'sonner';
import { Suspense } from 'react';
import { usePaymentStore } from '@/stores/payment-store';

const PAYMENT_MODES = ['Online', 'Cash', 'Bank Transfer', 'Card', 'Cheque'];

function PaymentFormInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedStudentId = searchParams.get('studentId');
  const { createPayment } = usePaymentStore();

  const [loading, setLoading] = useState(false);
  const [students, setStudents] = useState<{ _id: string; name: string; regNo: string }[]>([]);
  const [studentSearch, setStudentSearch] = useState('');
  const [showStudentList, setShowStudentList] = useState(false);
  const [form, setForm] = useState({
    studentId: preselectedStudentId || '', studentName: '',
    amount: '', date: new Date().toISOString().split('T')[0], description: '', mode: 'Online', documentNo: '',
  });

  useEffect(() => {
    if (studentSearch.length >= 1) {
      fetch(`/api/students?search=${encodeURIComponent(studentSearch)}&limit=10`).then((r) => r.json()).then((d) => { if (!d.error) setStudents(d.students); });
    } else {
      fetch('/api/students?limit=10').then((r) => r.json()).then((d) => { if (!d.error) setStudents(d.students); });
    }
  }, [studentSearch]);

  useEffect(() => {
    if (preselectedStudentId) {
      fetch(`/api/students/${preselectedStudentId}`).then((r) => r.json()).then((d) => {
        if (d.student) setForm((prev) => ({ ...prev, studentName: d.student.name, studentId: d.student._id }));
      });
    }
  }, [preselectedStudentId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.studentId) { toast.error('Please select a student'); return; }
    setLoading(true);
    const ok = await createPayment({
      studentId: form.studentId, amount: Number(form.amount), date: form.date,
      description: form.description, mode: form.mode, documentNo: form.documentNo || undefined,
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
        <Button asChild variant="ghost" size="icon"><Link href="/dashboard/payments"><ArrowLeft className="h-5 w-5" /></Link></Button>
        <div><h1 className="text-2xl font-bold tracking-tight">Record New Payment</h1><p className="text-sm text-muted-foreground mt-1">Enter the payment details below</p></div>
      </div>
      <Card className="border-border/50 shadow-sm">
        <CardHeader><CardTitle>Payment Information</CardTitle><CardDescription>All fields marked with * are required</CardDescription></CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="student">Student *</Label>
              {preselectedStudentId ? (
                <Input value={form.studentName} disabled className="bg-secondary/50" />
              ) : (
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input placeholder="Search student by name, reg no, or phone..." value={studentSearch} onChange={(e) => { setStudentSearch(e.target.value); setShowStudentList(true); }} onFocus={() => setShowStudentList(true)} className="pl-9" />
                  {showStudentList && students.length > 0 && (
                    <div className="absolute z-50 mt-1 max-h-60 w-full overflow-y-auto rounded-lg border border-border bg-popover shadow-lg scrollbar-thin">
                      {students.map((s) => (
                        <button key={s._id} type="button" className="flex w-full items-center justify-between px-3 py-2.5 text-left text-sm hover:bg-secondary transition-colors" onClick={() => { setForm({ ...form, studentId: s._id, studentName: s.name }); setStudentSearch(s.name); setShowStudentList(false); }}>
                          <span className="font-medium">{s.name}</span><span className="text-xs text-muted-foreground font-mono">{s.regNo}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2"><Label htmlFor="amount">Amount (Rs.) *</Label><Input id="amount" type="number" min="0" step="0.01" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} placeholder="8000" required /></div>
              <div className="space-y-2"><Label htmlFor="date">Payment Date *</Label><Input id="date" type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} required /></div>
            </div>
            <div className="space-y-2"><Label htmlFor="mode">Payment Mode *</Label><Select value={form.mode} onValueChange={(v) => setForm({ ...form, mode: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{PAYMENT_MODES.map((m) => <SelectItem key={m} value={m}>{m}</SelectItem>)}</SelectContent></Select></div>
            <div className="space-y-2"><Label htmlFor="description">Description *</Label><Textarea id="description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="1st month payment done" required rows={3} /></div>
            <div className="space-y-2"><Label htmlFor="documentNo">Document No. (optional)</Label><Input id="documentNo" value={form.documentNo} onChange={(e) => setForm({ ...form, documentNo: e.target.value })} placeholder="Auto-generated if left blank" className="font-mono" /><p className="text-xs text-muted-foreground">Leave blank to auto-generate (e.g. FR-DOC-20260802170016)</p></div>
            <div className="flex gap-3 pt-2">
              <Button type="submit" disabled={loading}>{loading ? (<><Loader2 className="mr-2 h-4 w-4 animate-spin" />Recording...</>) : (<><Save className="mr-2 h-4 w-4" />Record Payment</>)}</Button>
              <Button asChild variant="outline"><Link href="/dashboard/payments">Cancel</Link></Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

export default function NewPaymentPage() {
  return (<Suspense fallback={<div className="flex h-[60vh] items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>}><PaymentFormInner /></Suspense>);
}
