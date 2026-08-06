'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { CreditCard, Search, Plus, Loader2, Trash2, Eye, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import { usePaymentStore } from '@/stores/payment-store';

const PAYMENT_MODES = ['Online', 'Cash', 'Bank Transfer', 'Card', 'Cheque'];

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'LKR', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(amount).replace('LKR', 'Rs. ');
}
function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function PaymentsPage() {
  const { payments, total, totalAmount, page, totalPages, loading, search, mode, setSearch, setMode, setPage, fetchPayments, deletePayment } = usePaymentStore();
  const [searchInput, setSearchInput] = useState('');
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => { fetchPayments(); }, [fetchPayments]);

  useEffect(() => {
    const timer = setTimeout(() => setSearch(searchInput), 300);
    return () => clearTimeout(timer);
  }, [searchInput, setSearch]);

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    const ok = await deletePayment(deleteId);
    if (ok) toast.success('Payment deleted successfully');
    else toast.error('Failed to delete payment');
    setDeleteId(null);
    setDeleting(false);
  };

  return (
    <div className="space-y-6 animate-in">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div><h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Payments</h1><p className="text-sm text-muted-foreground mt-1">{total} payments · Total: {formatCurrency(totalAmount)}</p></div>
        <Button asChild><Link href="/dashboard/payments/new"><Plus className="mr-2 h-4 w-4" />Record Payment</Link></Button>
      </div>

      <Card className="border-border/50 shadow-sm">
        <CardContent className="p-4 sm:p-6">
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Search by name, doc no, description..." value={searchInput} onChange={(e) => setSearchInput(e.target.value)} className="pl-9" />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <Select value={mode} onValueChange={(v) => setMode(v)}>
                <SelectTrigger className="w-[160px]"><SelectValue placeholder="All modes" /></SelectTrigger>
                <SelectContent><SelectItem value="all">All modes</SelectItem>{PAYMENT_MODES.map((m) => <SelectItem key={m} value={m}>{m}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>

          {loading ? (
            <div className="flex h-[300px] items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
          ) : payments.length === 0 ? (
            <div className="flex h-[300px] flex-col items-center justify-center text-muted-foreground gap-3"><CreditCard className="h-12 w-12 opacity-50" /><p>No payments found. Record a payment to get started.</p></div>
          ) : (
            <>
              <div className="hidden overflow-x-auto md:block">
                <Table>
                  <TableHeader><TableRow><TableHead>Document No.</TableHead><TableHead>Student</TableHead><TableHead>Description</TableHead><TableHead>Mode</TableHead><TableHead>Date</TableHead><TableHead className="text-right">Amount</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
                  <TableBody>
                    {payments.map((payment) => (
                      <TableRow key={payment._id}>
                        <TableCell className="font-mono text-xs">{payment.documentNo}</TableCell>
                        <TableCell><div><p className="font-medium">{payment.studentName}</p><p className="text-xs text-muted-foreground">{payment.studentRegNo}</p></div></TableCell>
                        <TableCell className="max-w-[200px] truncate">{payment.description}</TableCell>
                        <TableCell><Badge variant="secondary" className="text-xs">{payment.mode}</Badge></TableCell>
                        <TableCell>{formatDate(payment.date)}</TableCell>
                        <TableCell className="text-right font-semibold text-success">{formatCurrency(payment.amount)}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button asChild size="icon" variant="ghost" className="h-8 w-8"><Link href={`/dashboard/students?search=${encodeURIComponent(payment.studentRegNo)}`}><Eye className="h-4 w-4" /></Link></Button>
                            <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => setDeleteId(payment._id)}><Trash2 className="h-4 w-4" /></Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              <div className="space-y-3 md:hidden">
                {payments.map((payment) => (
                  <div key={payment._id} className="rounded-lg border border-border/50 p-4 space-y-2">
                    <div className="flex items-start justify-between">
                      <div className="min-w-0"><p className="font-medium">{payment.studentName}</p><p className="text-xs text-muted-foreground font-mono">{payment.documentNo}</p></div>
                      <span className="font-bold text-success">{formatCurrency(payment.amount)}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">{payment.description}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2"><Badge variant="secondary" className="text-xs">{payment.mode}</Badge><span className="text-xs text-muted-foreground">{formatDate(payment.date)}</span></div>
                      <Button size="sm" variant="outline" className="text-destructive hover:text-destructive h-7" onClick={() => setDeleteId(payment._id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                    </div>
                  </div>
                ))}
              </div>

              {totalPages > 1 && (
                <div className="flex items-center justify-between pt-4">
                  <p className="text-sm text-muted-foreground">Page {page} of {totalPages}</p>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => setPage(page - 1)} disabled={page === 1}>Previous</Button>
                    <Button variant="outline" size="sm" onClick={() => setPage(page + 1)} disabled={page === totalPages}>Next</Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader><AlertDialogTitle>Delete Payment</AlertDialogTitle><AlertDialogDescription>This will permanently delete this payment record. This action cannot be undone.</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={deleting} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">{deleting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Delete'}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
