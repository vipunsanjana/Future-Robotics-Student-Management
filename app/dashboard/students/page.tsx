'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Users, Search, Plus, Loader2, Eye, Pencil, Trash2, Phone, GraduationCap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import { useStudentStore } from '@/stores/student-store';

export default function StudentsPage() {
  const { students, total, page, totalPages, loading, search, setSearch, setPage, fetchStudents, deleteStudent } = useStudentStore();
  const [searchInput, setSearchInput] = useState('');
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => { fetchStudents(); }, [fetchStudents]);

  useEffect(() => {
    const timer = setTimeout(() => setSearch(searchInput), 300);
    return () => clearTimeout(timer);
  }, [searchInput, setSearch]);

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    const ok = await deleteStudent(deleteId);
    if (ok) toast.success('Student deleted successfully');
    else toast.error('Failed to delete student');
    setDeleteId(null);
    setDeleting(false);
  };

  return (
    <div className="space-y-6 animate-in">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div><h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Students</h1><p className="text-sm text-muted-foreground mt-1">Manage student records — {total} total</p></div>
        <Button asChild><Link href="/dashboard/students/new"><Plus className="mr-2 h-4 w-4" />Add Student</Link></Button>
      </div>

      <Card className="border-border/50 shadow-sm">
        <CardContent className="p-4 sm:p-6">
          <div className="mb-4 relative max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search by name, reg no, or phone..." value={searchInput} onChange={(e) => setSearchInput(e.target.value)} className="pl-9" />
          </div>

          {loading ? (
            <div className="flex h-[300px] items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
          ) : students.length === 0 ? (
            <div className="flex h-[300px] flex-col items-center justify-center text-muted-foreground gap-3"><Users className="h-12 w-12 opacity-50" /><p>No students found. Add your first student to get started.</p></div>
          ) : (
            <>
              <div className="hidden overflow-x-auto md:block">
                <Table>
                  <TableHeader><TableRow><TableHead>Name</TableHead><TableHead>Reg. No</TableHead><TableHead>Course</TableHead><TableHead>Phone</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
                  <TableBody>
                    {students.map((student) => (
                      <TableRow key={student._id}>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary text-xs font-semibold">{student.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()}</div>
                            {student.name}
                          </div>
                        </TableCell>
                        <TableCell><Badge variant="secondary" className="font-mono text-xs">{student.regNo}</Badge></TableCell>
                        <TableCell className="max-w-[200px] truncate">{student.course}</TableCell>
                        <TableCell>{student.phone}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button asChild size="icon" variant="ghost" className="h-8 w-8"><Link href={`/dashboard/students/${student._id}`}><Eye className="h-4 w-4" /></Link></Button>
                            <Button asChild size="icon" variant="ghost" className="h-8 w-8"><Link href={`/dashboard/students/${student._id}/edit`}><Pencil className="h-4 w-4" /></Link></Button>
                            <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => setDeleteId(student._id)}><Trash2 className="h-4 w-4" /></Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              <div className="space-y-3 md:hidden">
                {students.map((student) => (
                  <div key={student._id} className="rounded-lg border border-border/50 p-4 space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary text-sm font-semibold">{student.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()}</div>
                        <div><p className="font-medium">{student.name}</p><Badge variant="secondary" className="font-mono text-xs mt-1">{student.regNo}</Badge></div>
                      </div>
                    </div>
                    <div className="space-y-1 text-sm">
                      <p className="flex items-center gap-2 text-muted-foreground"><GraduationCap className="h-4 w-4" /> {student.course}</p>
                      <p className="flex items-center gap-2 text-muted-foreground"><Phone className="h-4 w-4" /> {student.phone}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button asChild size="sm" variant="outline" className="flex-1"><Link href={`/dashboard/students/${student._id}`}><Eye className="mr-1.5 h-3.5 w-3.5" /> View</Link></Button>
                      <Button asChild size="sm" variant="outline" className="flex-1"><Link href={`/dashboard/students/${student._id}/edit`}><Pencil className="mr-1.5 h-3.5 w-3.5" /> Edit</Link></Button>
                      <Button size="sm" variant="outline" className="text-destructive hover:text-destructive" onClick={() => setDeleteId(student._id)}><Trash2 className="h-3.5 w-3.5" /></Button>
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
          <AlertDialogHeader><AlertDialogTitle>Delete Student</AlertDialogTitle><AlertDialogDescription>This will permanently delete the student and all associated payment records. This action cannot be undone.</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={deleting} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">{deleting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Delete'}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
