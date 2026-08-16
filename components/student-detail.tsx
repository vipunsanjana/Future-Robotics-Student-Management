'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { 
  GraduationCap, 
  Phone, 
  Calendar, 
  CreditCard, 
  FileText, 
  Mail, 
  MapPin, 
  CheckCircle2, 
  Clock 
} from 'lucide-react';

interface StudentProps {
  student: {
    _id: string;
    name: string;
    phone: string;
    regNo: string;
    course: string;
    courseCode?: string;
    email?: string;
    address?: string;
    createdAt: string | Date;
  };
  payments: {
    _id: string;
    amount: number;
    date: string | Date;
    description: string;
    mode?: string;
    documentNo?: string;
    courseCode?: string;
    isCompleted?: boolean;
    createdAt: string | Date;
  }[];
  totalPaid: number;
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'LKR',
    minimumFractionDigits: 0,
  }).format(amount).replace('LKR', 'Rs. ');
}

function formatDate(dateStr: string | Date) {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function StudentDetail({ student, payments, totalPaid }: StudentProps) {
  const initials = student.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Left Column: Student Information */}
      <div className="md:col-span-1 space-y-6">
        <Card className="shadow-sm border-border/60 bg-card/80 backdrop-blur-xl">
          <CardHeader>
            <CardTitle>Student Information</CardTitle>
            <CardDescription>Personal and enrollment details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16 bg-primary/10 text-primary text-xl font-bold">
                <AvatarFallback>{initials}</AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-bold text-lg leading-tight">{student.name}</h3>
                <Badge variant="secondary" className="mt-1 font-mono text-xs">
                  {student.regNo}
                </Badge>
              </div>
            </div>

            <div className="space-y-4 pt-4 border-t border-border/50">
              <div className="flex items-start gap-3 text-sm">
                <GraduationCap className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                <div>
                  <p className="text-muted-foreground text-xs font-medium uppercase">Course</p>
                  <p className="font-semibold text-foreground">{student.course}</p>
                  {student.courseCode && (
                    <p className="text-xs font-mono text-primary bg-primary/10 inline-block px-1.5 py-0.5 rounded mt-1">
                      {student.courseCode}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-start gap-3 text-sm">
                <Phone className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                <div>
                  <p className="text-muted-foreground text-xs font-medium uppercase">Phone</p>
                  <p className="font-medium text-foreground">{student.phone}</p>
                </div>
              </div>

              {student.email && (
                <div className="flex items-start gap-3 text-sm">
                  <Mail className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                  <div>
                    <p className="text-muted-foreground text-xs font-medium uppercase">Email</p>
                    <p className="font-medium text-foreground">{student.email}</p>
                  </div>
                </div>
              )}

              {student.address && (
                <div className="flex items-start gap-3 text-sm">
                  <MapPin className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                  <div>
                    <p className="text-muted-foreground text-xs font-medium uppercase">Address</p>
                    <p className="font-medium text-foreground">{student.address}</p>
                  </div>
                </div>
              )}

              <div className="flex items-start gap-3 text-sm">
                <Calendar className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                <div>
                  <p className="text-muted-foreground text-xs font-medium uppercase">Enrolled</p>
                  <p className="font-medium text-foreground">{formatDate(student.createdAt)}</p>
                </div>
              </div>
            </div>

            <div className="mt-6 rounded-xl bg-success/10 border border-success/20 p-4">
              <p className="text-xs font-semibold text-success uppercase tracking-wider mb-1">
                Total Paid
              </p>
              <p className="text-3xl font-bold text-success">{formatCurrency(totalPaid)}</p>
              <p className="text-xs text-success/80 mt-1 font-medium">
                Over {payments.length} payment(s)
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Right Column: Payment History */}
      <div className="md:col-span-2">
        <Card className="shadow-sm border-border/60 bg-card/80 backdrop-blur-xl h-full">
          <CardHeader>
            <CardTitle>Payment History</CardTitle>
            <CardDescription>All recorded payments for this student</CardDescription>
          </CardHeader>
          <CardContent>
            {payments.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center text-muted-foreground">
                <CreditCard className="h-12 w-12 opacity-20 mb-4" />
                <p className="text-lg font-medium">No payments recorded yet</p>
                <p className="text-sm">Click "Add Payment" to record a transaction.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {payments.map((payment) => (
                  <div
                    key={payment._id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-xl border border-border/50 bg-background/50 p-4 transition-colors hover:bg-secondary/30"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-lg text-foreground">
                          {formatCurrency(payment.amount)}
                        </span>
                        {payment.isCompleted ? (
                          <Badge variant="default" className="bg-emerald-500 hover:bg-emerald-600 gap-1 text-[10px] h-5">
                            <CheckCircle2 className="h-3 w-3" /> Completed
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="gap-1 text-[10px] h-5 text-amber-500 bg-amber-500/10 hover:bg-amber-500/20 border-amber-500/20">
                            <Clock className="h-3 w-3" /> Incomplete
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm font-medium text-foreground">
                        {payment.description}
                      </p>
                      <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground font-medium">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3.5 w-3.5" />
                          {formatDate(payment.date)}
                        </span>
                        {payment.documentNo && (
                          <span className="flex items-center gap-1">
                            <FileText className="h-3.5 w-3.5" />
                            {payment.documentNo}
                          </span>
                        )}
                        {payment.courseCode && (
                          <span className="flex items-center gap-1 text-primary">
                            <GraduationCap className="h-3.5 w-3.5" />
                            {payment.courseCode}
                          </span>
                        )}
                      </div>
                    </div>
                    {payment.mode && (
                      <div className="sm:self-end">
                        <Badge variant="outline" className="bg-background">
                          {payment.mode}
                        </Badge>
                      </div>
                    )}
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
