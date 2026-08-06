'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Phone, Mail, MapPin, GraduationCap, Calendar, CreditCard, FileText } from 'lucide-react';

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'LKR', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(amount).replace('LKR', 'Rs. ');
}
function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

interface StudentDetailProps {
  student: { _id: string; name: string; phone: string; regNo: string; course: string; email?: string; address?: string; createdAt: string };
  payments: { _id: string; amount: number; date: string; description: string; mode: string; documentNo: string; createdAt: string }[];
  totalPaid: number;
}

export function StudentDetail({ student, payments, totalPaid }: StudentDetailProps) {
  const initials = student.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase();
  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      <div className="lg:col-span-1">
        <Card className="border-border/50 shadow-sm">
          <CardHeader><CardTitle>Student Information</CardTitle><CardDescription>Personal and enrollment details</CardDescription></CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary text-xl font-bold">{initials}</div>
              <div><p className="font-semibold text-lg">{student.name}</p><Badge variant="secondary" className="font-mono text-xs mt-1">{student.regNo}</Badge></div>
            </div>
            <div className="space-y-3 pt-2">
              <div className="flex items-start gap-3 text-sm"><GraduationCap className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" /><div><p className="text-muted-foreground text-xs">Course</p><p className="font-medium">{student.course}</p></div></div>
              <div className="flex items-start gap-3 text-sm"><Phone className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" /><div><p className="text-muted-foreground text-xs">Phone</p><p className="font-medium">{student.phone}</p></div></div>
              {student.email && <div className="flex items-start gap-3 text-sm"><Mail className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" /><div><p className="text-muted-foreground text-xs">Email</p><p className="font-medium">{student.email}</p></div></div>}
              {student.address && <div className="flex items-start gap-3 text-sm"><MapPin className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" /><div><p className="text-muted-foreground text-xs">Address</p><p className="font-medium">{student.address}</p></div></div>}
              <div className="flex items-start gap-3 text-sm"><Calendar className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" /><div><p className="text-muted-foreground text-xs">Enrolled</p><p className="font-medium">{formatDate(student.createdAt)}</p></div></div>
            </div>
            <div className="rounded-lg bg-success/10 p-4 border border-success/20">
              <p className="text-xs text-muted-foreground">Total Paid</p>
              <p className="text-2xl font-bold text-success">{formatCurrency(totalPaid)}</p>
              <p className="text-xs text-muted-foreground mt-1">{payments.length} payment(s)</p>
            </div>
          </CardContent>
        </Card>
      </div>
      <div className="lg:col-span-2">
        <Card className="border-border/50 shadow-sm">
          <CardHeader><CardTitle>Payment History</CardTitle><CardDescription>All recorded payments for this student</CardDescription></CardHeader>
          <CardContent>
            {payments.length === 0 ? (
              <div className="flex h-[200px] flex-col items-center justify-center text-muted-foreground gap-2"><CreditCard className="h-10 w-10 opacity-50" /><p className="text-sm">No payments recorded yet</p></div>
            ) : (
              <div className="space-y-3">
                {payments.map((payment) => (
                  <div key={payment._id} className="flex items-center justify-between gap-3 rounded-lg border border-border/50 p-4 hover:bg-secondary/30 transition-colors">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10"><FileText className="h-5 w-5 text-primary" /></div>
                      <div className="min-w-0"><p className="font-medium text-sm">{payment.description}</p><p className="text-xs text-muted-foreground font-mono">{payment.documentNo}</p><div className="flex items-center gap-2 mt-1"><Badge variant="secondary" className="text-xs">{payment.mode}</Badge><span className="text-xs text-muted-foreground">{formatDate(payment.date)}</span></div></div>
                    </div>
                    <span className="text-lg font-bold text-success shrink-0">{formatCurrency(payment.amount)}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
