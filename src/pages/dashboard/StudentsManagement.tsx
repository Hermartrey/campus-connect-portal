import { useStudents } from '@/hooks/useStudents';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { CheckCircle, XCircle, Clock, Mail, Trash2, Edit } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useState } from 'react';

import { useNavigate } from 'react-router-dom';

export default function StudentsManagement() {
  const { students, updateStudentStatus, deleteStudent } = useStudents();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [studentToDelete, setStudentToDelete] = useState<string | null>(null);

  const handleStatusUpdate = (studentId: string, status: 'approved' | 'rejected') => {
    updateStudentStatus(studentId, status);
    toast({
      title: `Student ${status}`,
      description: `The student has been ${status} successfully.`,
    });
  };

  const handleDeleteStudent = (studentId: string) => {
    deleteStudent(studentId);
    setStudentToDelete(null);
    toast({
      title: "Student Deleted",
      description: "The student has been permanently deleted.",
      variant: "destructive",
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-success/10 text-success">
            <CheckCircle className="h-3 w-3" /> Approved
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-destructive/10 text-destructive">
            <XCircle className="h-3 w-3" /> Rejected
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-warning/10 text-warning">
            <Clock className="h-3 w-3" /> Pending
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Students Management</h2>
        <p className="text-muted-foreground">Manage all registered students</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Students</CardTitle>
          <CardDescription>
            {students.length} student{students.length !== 1 ? 's' : ''} registered
          </CardDescription>
        </CardHeader>
        <CardContent>
          {students.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">No students registered yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Balance</TableHead>
                    <TableHead>Joined</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {students.map((student) => (
                    <TableRow
                      key={student.id}
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => navigate(`/dashboard/students/${student.id}`)}
                    >
                      <TableCell className="font-medium hover:underline text-primary">
                        {student.name}
                      </TableCell>
                      <TableCell>
                        <span className="flex items-center gap-2">
                          <Mail className="h-4 w-4 text-muted-foreground" />
                          {student.email}
                        </span>
                      </TableCell>
                      <TableCell>{getStatusBadge(student.enrollmentStatus)}</TableCell>
                      <TableCell>${student.tuitionBalance?.toLocaleString() || 0}</TableCell>
                      <TableCell>{new Date(student.createdAt).toLocaleDateString()}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2 items-center" onClick={(e) => e.stopPropagation()}>
                          {student.enrollmentStatus === 'pending' && (
                            <>
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-success hover:text-success"
                                onClick={() => handleStatusUpdate(student.id, 'approved')}
                              >
                                Approve
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-destructive hover:text-destructive"
                                onClick={() => handleStatusUpdate(student.id, 'rejected')}
                              >
                                Reject
                              </Button>
                            </>
                          )}
                          <Button
                            size="icon"
                            variant="ghost"
                            className="text-muted-foreground hover:text-primary transition-colors h-8 w-8"
                            onClick={() => navigate(`/dashboard/students/${student.id}?edit=true`)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="text-muted-foreground hover:text-destructive transition-colors h-8 w-8"
                            onClick={() => setStudentToDelete(student.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={!!studentToDelete} onOpenChange={(open) => !open && setStudentToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the student account
              and remove their data from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => studentToDelete && handleDeleteStudent(studentToDelete)}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
