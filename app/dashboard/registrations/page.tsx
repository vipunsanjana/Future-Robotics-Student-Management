"use client";

import { useEffect, useState, useMemo } from "react";
import { Download, Trash2, Search, Bot, PlayCircle, Loader2, CheckCircle2, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { downloadRegistrationPdf } from "@/lib/pdf";
import type { Registration } from "@/lib/types";

export default function RegistrationsPage() {
  const [regs, setRegs] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [modeFilter, setModeFilter] = useState<"all" | "Online" | "Recording">("all");
  
  // States for deleting
  const [deleting, setDeleting] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [registrationToDelete, setRegistrationToDelete] = useState<string | null>(null);
  
  // State for our awesome message
  const [awesomeMessage, setAwesomeMessage] = useState<string | null>(null);

  const showAwesomeMessage = (msg: string) => {
    setAwesomeMessage(msg);
    setTimeout(() => setAwesomeMessage(null), 3000);
  };

  useEffect(() => {
    fetch("/api/registrations")
      .then((r) => (r.ok ? r.json() : []))
      .then((d) => setRegs(d))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    return regs.filter((r) => {
      if (modeFilter !== "all" && r.mode !== modeFilter) return false;
      if (!search) return true;
      const q = search.toLowerCase();
      return (
        r.name.toLowerCase().includes(q) ||
        r.regNo.toLowerCase().includes(q) ||
        r.course.toLowerCase().includes(q) ||
        r.phone.toLowerCase().includes(q)
      );
    });
  }, [regs, search, modeFilter]);

  // Open the custom dialog instead of the browser confirm
  const confirmDelete = (id: string) => {
    setRegistrationToDelete(id);
    setDeleteDialogOpen(true);
  };

// Actually execute the delete
  const executeDelete = async () => {
    if (!registrationToDelete) return;
    setDeleting(registrationToDelete);
    try {
      // Pass the ID as a query parameter to match your backend route!
      await fetch(`/api/registrations?id=${registrationToDelete}`, { method: "DELETE" });
      setRegs(regs.filter((r) => r._id?.toString() !== registrationToDelete));
      setDeleteDialogOpen(false);
      showAwesomeMessage("Awesome! Registration deleted successfully! 🎉");
    } finally {
      setDeleting(null);
      setRegistrationToDelete(null);
    }
  };

  const handleDownload = async (r: Registration) => {
    await downloadRegistrationPdf(r);
    showAwesomeMessage("Awesome! PDF downloaded successfully! 🚀");
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Registrations</h1>
        <p className="text-sm text-muted-foreground">View, download, and manage all student registrations.</p>
      </div>

      {awesomeMessage && (
        <div className="flex animate-in fade-in slide-in-from-top-2 items-center gap-2 rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm font-medium text-emerald-600 dark:text-emerald-400">
          <CheckCircle2 className="h-4 w-4" />
          {awesomeMessage}
        </div>
      )}

      {/* Custom Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              Confirm Deletion
            </DialogTitle>
          </DialogHeader>
          <div className="py-4 text-sm text-muted-foreground">
            Are you absolutely sure you want to delete this registration? This action cannot be undone and the data will be permanently removed from the server.
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button 
              variant="outline" 
              onClick={() => setDeleteDialogOpen(false)} 
              disabled={!!deleting}
            >
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={executeDelete} 
              disabled={!!deleting}
            >
              {deleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Yes, Delete it
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle className="text-lg">All Registrations ({filtered.length})</CardTitle>
            <div className="flex flex-col gap-2 sm:flex-row">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search name, reg no, course..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9 sm:w-64"
                />
              </div>
              <div className="flex gap-1">
                {(["all", "Online", "Recording"] as const).map((m) => (
                  <Button
                    key={m}
                    size="sm"
                    variant={modeFilter === m ? "default" : "outline"}
                    onClick={() => setModeFilter(m)}
                  >
                    {m === "all" ? "All" : m}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex h-40 items-center justify-center text-muted-foreground">
              <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Loading...
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex h-40 items-center justify-center text-sm text-muted-foreground">
              No registrations found. Add some awesome students!
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Doc No</TableHead>
                    <TableHead>Student</TableHead>
                    <TableHead>Course</TableHead>
                    <TableHead>Reg No</TableHead>
                    <TableHead>Mode</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((r) => {

                    const rawId = (r as any)._id || (r as any).id;
                    const registrationId = typeof rawId === 'string' ? rawId : rawId?.toString() || r.documentNo;

                    return (
                      <TableRow key={registrationId}>
                        <TableCell className="font-mono text-xs">{r.documentNo}</TableCell>
                        <TableCell>
                          <div className="font-medium">{r.name}</div>
                          <div className="text-xs text-muted-foreground">{r.phone}</div>
                        </TableCell>
                        <TableCell>{r.course}</TableCell>
                        <TableCell className="font-medium">{r.regNo}</TableCell>
                        <TableCell>
                          <Badge variant={r.mode === "Online" ? "default" : "secondary"}>
                            {r.mode === "Online" ? <Bot className="mr-1 h-3 w-3" /> : <PlayCircle className="mr-1 h-3 w-3" />}
                            {r.mode}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right font-medium">LKR {r.amount.toLocaleString()}</TableCell>
                        <TableCell className="text-sm">{r.date}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            <Button 
                              size="icon" 
                              variant="ghost" 
                              onClick={() => handleDownload(r)} 
                              title="Download PDF"
                            >
                              <Download className="h-4 w-4" />
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => confirmDelete(registrationId)}
                              disabled={deleting === registrationId}
                              title="Delete"
                              className="text-destructive hover:text-destructive hover:bg-destructive/10"
                            >
                              {deleting === registrationId ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
