import { useStudents } from '@/hooks/useStudents';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { CheckCircle, XCircle, Clock, Mail, Trash2, Edit, Search, Filter, RotateCcw, Users } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
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
  const { students, updateStudentStatus, deleteStudent, resetAllEnrollments } = useStudents();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [studentToDelete, setStudentToDelete] = useState<string | null>(null);
  const [isResetDialogOpen, setIsResetDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [gradeFilter, setGradeFilter] = useState('all');
  const [sexFilter, setSexFilter] = useState('all');

  const handleStatusUpdate = (studentId: string, status: 'approved' | 'rejected') => {
    updateStudentStatus(studentId, status);
    toast({
      title: `Student ${status}`,
      description: `The student has been ${status} successfully.`,
    });
  };

  const handleResetAll = () => {
    resetAllEnrollments();
    setIsResetDialogOpen(false);
    toast({
      title: "Semester Reset Complete",
      description: "All student enrollments have been reset to 'Not Enrolled'.",
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

  const filteredStudents = students.filter(student => {
    const studentName = student.name || '';
    const studentEmail = student.email || '';

    const matchesSearch = studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      studentEmail.toLowerCase().includes(searchTerm.toLowerCase());

    // Check grade level - it could be at core object or within enrollmentData
    const studentGrade = student.gradeLevel || student.enrollmentData?.gradeLevel;
    const matchesGrade = gradeFilter === 'all' || studentGrade === gradeFilter;

    // Check gender/sex - usually in enrollmentData
    const studentSex = student.enrollmentData?.gender;
    const matchesSex = sexFilter === 'all' || studentSex === sexFilter;

    return matchesSearch && matchesGrade && matchesSex;
  });

  const resetFilters = () => {
    setSearchTerm('');
    setGradeFilter('all');
    setSexFilter('all');
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Students Management</h2>
        <p className="text-muted-foreground">Manage all registered students</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <CardTitle>All Students</CardTitle>
              <CardDescription>
                {filteredStudents.length} of {students.length} students matching filters
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => setIsResetDialogOpen(true)} className="gap-2 border-destructive text-destructive hover:bg-destructive/10">
                <RotateCcw className="h-4 w-4" /> End of Semester Reset
              </Button>
              <Button variant="outline" size="sm" onClick={resetFilters} className="gap-2 self-start">
                <RotateCcw className="h-4 w-4" /> Reset Filters
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search name or email..."
                className="pl-9"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <Select value={gradeFilter} onValueChange={setGradeFilter}>
              <SelectTrigger>
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4 text-muted-foreground" />
                  <SelectValue placeholder="Filter by Grade" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Grades</SelectItem>
                <SelectItem value="grade-7">Grade 7</SelectItem>
                <SelectItem value="grade-8">Grade 8</SelectItem>
                <SelectItem value="grade-9">Grade 9</SelectItem>
                <SelectItem value="grade-10">Grade 10</SelectItem>
                <SelectItem value="grade-11">Grade 11</SelectItem>
                <SelectItem value="grade-12">Grade 12</SelectItem>
              </SelectContent>
            </Select>

            <Select value={sexFilter} onValueChange={setSexFilter}>
              <SelectTrigger>
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <SelectValue placeholder="Filter by Sex" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Genders</SelectItem>
                <SelectItem value="male">Male</SelectItem>
                <SelectItem value="female">Female</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
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
                    <TableHead>Sex</TableHead>
                    <TableHead>Grade</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Balance</TableHead>
                    <TableHead>Joined</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredStudents.map((student) => (
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
                      <TableCell className="capitalize">
                        {student.enrollmentData?.gender || '-'}
                      </TableCell>
                      <TableCell>
                        {student.gradeLevel || student.enrollmentData?.gradeLevel || '-'}
                      </TableCell>
                      <TableCell>{getStatusBadge(student.enrollmentStatus)}</TableCell>
                      <TableCell>₱{student.tuitionBalance?.toLocaleString() || 0}</TableCell>
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

      <AlertDialog open={isResetDialogOpen} onOpenChange={setIsResetDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reset All Enrollments?</AlertDialogTitle>
            <AlertDialogDescription>
              This action will reset the enrollment status of ALL students to "Not Enrolled".
              This is intended for the end of a semester/school year.
              <br /><br />
              <strong>Note:</strong> Student accounts, tuition balances, and payment history will remain intact.
              Students with outstanding balances will be blocked from re-enrolling until paid.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={handleResetAll}
            >
              Reset All
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
