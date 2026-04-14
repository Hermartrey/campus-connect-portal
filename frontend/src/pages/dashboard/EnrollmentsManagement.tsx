import { useStudents } from '@/hooks/useStudents';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, Clock, User, FileText, CreditCard, ChevronDown, ChevronUp, Eye, Download } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';
import { Student } from '@/types/auth';
import { useNotifications } from '@/hooks/useNotifications';
import { useTuition } from '@/hooks/useTuition';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

export default function EnrollmentsManagement() {
  const { students, updateStudentStatus, isEnrollmentOpen, toggleEnrollment, updateTuitionBalance, addPayment } = useStudents();
  const { getTuitionForGrade } = useTuition();
  const { toast } = useToast();
  const { addNotification } = useNotifications();
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [viewingDocument, setViewingDocument] = useState<{
    url: string;
    name?: string;
  } | null>(null);
  const [pendingAction, setPendingAction] = useState<{
    student: Student;
    status: 'approved' | 'rejected';
  } | null>(null);

  const pendingStudents = students.filter(s => s.enrollmentStatus === 'pending' && s.enrollmentData);

  const handleStatusUpdate = async (studentId: string, status: 'approved' | 'rejected') => {
    if (status === 'approved' && pendingAction?.student?.enrollmentData) {
      const data = pendingAction.student.enrollmentData;
      const fullTuition = getTuitionForGrade(data.gradeLevel || '');
      const upfront = data.paymentMethod === 'online' ? (data.paymentAmount || 0) : 0;
      const outstanding = Math.max(0, fullTuition - upfront);

      // Create completed payment record for upfront payment
      if (upfront > 0) {
        await addPayment(studentId, {
          amount: upfront,
          date: new Date().toISOString(),
          status: 'completed',
          description: 'Upfront Enrollment Payment',
          receipt: data.paymentReceipt,
          receiptName: data.paymentReceiptName,
          type: 'payment'
        });
      }

      // Initialize the tuition balance
      await updateTuitionBalance(studentId, outstanding);
    }

    await updateStudentStatus(studentId, status);
    addNotification({
      userId: studentId,
      title: `Enrollment ${status === 'approved' ? 'Approved' : 'Returned/Rejected'}`,
      message: `Your enrollment application has been ${status === 'approved' ? 'approved! You can now proceed.' : 'returned for revisions or rejected.'}`,
      type: status === 'approved' ? 'success' : 'warning',
      link: '/dashboard/enrollment',
    });
    toast({
      title: `Enrollment ${status}`,
      description: `The enrollment has been ${status} successfully.`,
    });
    setPendingAction(null);
  };



  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const handleDownloadReceipt = (receiptBase64: string, fileName: string) => {
    const link = document.createElement('a');
    link.href = receiptBase64;
    link.download = fileName || 'receipt';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatGradeLevel = (grade: string) => grade?.replace('grade-', 'Grade ') || 'N/A';

  const renderStudentDetails = (student: Student) => {
    const data = student.enrollmentData;
    if (!data) return null;

    return (
      <div className="mt-4 pt-4 border-t space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="p-3 bg-muted/50 rounded">
            <p className="text-muted-foreground">Date of Birth</p>
            <p className="font-medium">{data.dateOfBirth ? new Date(data.dateOfBirth).toLocaleDateString() : 'N/A'}</p>
          </div>
          <div className="p-3 bg-muted/50 rounded">
            <p className="text-muted-foreground">Phone</p>
            <p className="font-medium">{data.phone}</p>
          </div>
          <div className="p-3 bg-muted/50 rounded">
            <p className="text-muted-foreground">Grade Level</p>
            <p className="font-medium">{formatGradeLevel(data.gradeLevel)}</p>
          </div>
          <div className="p-3 bg-muted/50 rounded">
            <p className="text-muted-foreground">Previous School</p>
            <p className="font-medium">{data.primarySchool}</p>
          </div>
          <div className="p-3 bg-muted/50 rounded">
            <p className="text-muted-foreground">Guardian</p>
            <p className="font-medium">{data.guardianName} ({data.guardianRelationship})</p>
          </div>
          <div className="p-3 bg-muted/50 rounded">
            <p className="text-muted-foreground">Guardian Contact</p>
            <p className="font-medium">{data.guardianPhone}</p>
          </div>
          <div className="p-3 bg-muted/50 rounded md:col-span-3">
            <p className="text-muted-foreground">Address</p>
            <p className="font-medium">{data.address}, {data.city}, {data.state} {data.zipCode}</p>
          </div>
        </div>
        <div className="md:col-span-3 space-y-2 mt-2">
          <p className="font-medium flex items-center gap-2 text-sm">
            <FileText className="h-4 w-4" /> Documents
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {/* Birth Certificate */}
            {data.birthCertificate && (
              <div className="flex items-center justify-between p-2 border rounded bg-muted/20">
                <span className="text-sm truncate mr-2">{data.birthCertificate} (Birth Cert)</span>
                <div className="flex gap-1">
                  {data.birthCertificateData ? (
                    <>
                      <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => setViewingDocument({ url: data.birthCertificateData!, name: data.birthCertificate })}>
                        <Eye className="h-3 w-3" />
                      </Button>
                      <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => handleDownloadReceipt(data.birthCertificateData!, data.birthCertificate || 'document')}>
                        <Download className="h-3 w-3" />
                      </Button>
                    </>
                  ) : <span className="text-xs text-muted-foreground italic">No preview</span>}
                </div>
              </div>
            )}
            {/* Grades */}
            {data.primarySchoolGrades && (
              <div className="flex items-center justify-between p-2 border rounded bg-muted/20">
                <span className="text-sm truncate mr-2">{data.primarySchoolGrades} (Grades)</span>
                <div className="flex gap-1">
                  {data.primarySchoolGradesData ? (
                    <>
                      <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => setViewingDocument({ url: data.primarySchoolGradesData!, name: data.primarySchoolGrades })}>
                        <Eye className="h-3 w-3" />
                      </Button>
                      <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => handleDownloadReceipt(data.primarySchoolGradesData!, data.primarySchoolGrades || 'document')}>
                        <Download className="h-3 w-3" />
                      </Button>
                    </>
                  ) : <span className="text-xs text-muted-foreground italic">No preview</span>}
                </div>
              </div>
            )}
            {/* Additional Docs */}
            {data.additionalDocumentsData?.map((doc, idx) => (
              <div key={idx} className="flex items-center justify-between p-2 border rounded bg-muted/20">
                <span className="text-sm truncate mr-2">{doc.name} (Other)</span>
                <div className="flex gap-1">
                  <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => setViewingDocument({ url: doc.data, name: doc.name })}>
                    <Eye className="h-3 w-3" />
                  </Button>
                  <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => handleDownloadReceipt(doc.data, doc.name)}>
                    <Download className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="flex flex-col md:flex-row md:items-center gap-4 text-sm pt-2 border-t">
          <div className="flex items-center gap-2">
            <CreditCard className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">Payment:</span>
            <span className="text-muted-foreground">
              {data.paymentMethod === 'online' ? `Paid Online ($${data.paymentAmount?.toLocaleString()})` : 'Will Pay Onsite'}
            </span>
          </div>

          {data.paymentReceipt ? (
            <div className="flex items-center gap-2 p-2 bg-primary/5 rounded-lg border border-primary/10">
              <span className="text-xs font-medium text-primary">Receipt:</span>
              <span className="text-xs text-muted-foreground truncate max-w-[150px]">
                {data.paymentReceiptName || 'receipt'}
              </span>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-primary hover:text-primary hover:bg-primary/10"
                onClick={() => setViewingDocument({
                  url: data.paymentReceipt!,
                  name: data.paymentReceiptName
                })}
              >
                <Eye className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-primary hover:text-primary hover:bg-primary/10"
                onClick={() => handleDownloadReceipt(data.paymentReceipt!, data.paymentReceiptName || 'receipt')}
              >
                <Download className="h-4 w-4" />
              </Button>
            </div>
          ) : data.paymentMethod === 'online' ? (
            <div className="flex items-center gap-2 p-2 bg-muted rounded-lg border border-dashed border-muted-foreground/20">
              <span className="text-xs text-muted-foreground italic">No receipt uploaded</span>
            </div>
          ) : null}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Enrollment Management</h2>
          <p className="text-muted-foreground">Review and process enrollment applications</p>
        </div>
        <div className="flex items-center gap-2">
          <Switch
            id="enrollment-toggle"
            checked={isEnrollmentOpen}
            onCheckedChange={toggleEnrollment}
          />
          <Label htmlFor="enrollment-toggle" className="cursor-pointer">
            {isEnrollmentOpen ? 'Enrollment Open' : 'Enrollment Closed'}
          </Label>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Pending</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-warning" />
              <span className="text-2xl font-bold">{pendingStudents.length}</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Approved</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-success" />
              <span className="text-2xl font-bold">{students.filter(s => s.enrollmentStatus === 'approved').length}</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Rejected</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <XCircle className="h-5 w-5 text-destructive" />
              <span className="text-2xl font-bold">{students.filter(s => s.enrollmentStatus === 'rejected').length}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Pending Enrollments</CardTitle>
          <CardDescription>{pendingStudents.length} application{pendingStudents.length !== 1 ? 's' : ''} awaiting review</CardDescription>
        </CardHeader>
        <CardContent>
          {pendingStudents.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">No pending enrollments.</p>
          ) : (
            <div className="space-y-4">
              {pendingStudents.map((student) => (
                <div key={student.id} className="p-4 border rounded-lg">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <User className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h4 className="font-medium">{student.enrollmentData?.firstName} {student.enrollmentData?.lastName}</h4>
                        <p className="text-sm text-muted-foreground">{student.email}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Submitted: {student.enrollmentSubmittedAt ? new Date(student.enrollmentSubmittedAt).toLocaleDateString() : 'N/A'}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2 flex-wrap">
                      <Button variant="ghost" size="sm" onClick={() => toggleExpand(student.id)}>
                        {expandedId === student.id ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                        {expandedId === student.id ? 'Hide Details' : 'View Details'}
                      </Button>
                      {student.enrollmentData?.paymentReceipt && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-primary hover:bg-primary/10"
                          onClick={() => setViewingDocument({
                            url: student.enrollmentData!.paymentReceipt!,
                            name: student.enrollmentData!.paymentReceiptName
                          })}
                        >
                          <FileText className="h-4 w-4 mr-2" />
                          View Receipt
                        </Button>
                      )}
                      <Button variant="outline" className="text-success hover:bg-success/10" onClick={() => setPendingAction({ student, status: 'approved' })}>
                        <CheckCircle className="h-4 w-4 mr-2" />Approve
                      </Button>
                      <Button variant="outline" className="text-destructive hover:bg-destructive/10" onClick={() => setPendingAction({ student, status: 'rejected' })}>
                        <XCircle className="h-4 w-4 mr-2" />Reject
                      </Button>
                    </div>
                  </div>
                  {expandedId === student.id && renderStudentDetails(student)}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Confirmation Dialog */}
      <AlertDialog open={!!pendingAction} onOpenChange={() => setPendingAction(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {pendingAction?.status === 'approved' ? 'Approve Enrollment' : 'Reject Enrollment'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to {pendingAction?.status === 'approved' ? 'approve' : 'reject'} the enrollment for {pendingAction?.student.enrollmentData?.firstName} {pendingAction?.student.enrollmentData?.lastName}?

              {pendingAction?.student.enrollmentData?.paymentMethod === 'online' && (
                <div className="mt-4 p-4 bg-muted rounded-lg space-y-3 border border-border">
                  <div className="flex items-center gap-2">
                    <CreditCard className="h-4 w-4 text-primary" />
                    <span className="text-sm font-semibold">Online Payment Verification</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    This student paid an upfront amount of <strong>${pendingAction.student.enrollmentData.paymentAmount?.toLocaleString()}</strong> via GCash.
                  </p>
                  {pendingAction.student.enrollmentData.paymentReceipt ? (
                    <div className="mt-4 space-y-4">
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3 bg-background border rounded-md">
                        <div className="flex items-center gap-2 min-w-0">
                          <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
                          <span className="text-xs truncate font-medium">{pendingAction.student.enrollmentData.paymentReceiptName || 'receipt.png'}</span>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 gap-2"
                          onClick={() => handleDownloadReceipt(pendingAction.student.enrollmentData!.paymentReceipt!, pendingAction.student.enrollmentData!.paymentReceiptName || 'receipt')}
                        >
                          <Download className="h-4 w-4" /> Download
                        </Button>
                      </div>

                      {/* Direct Preview in Dialog */}
                      <div className="rounded-lg border bg-muted/30 p-2 overflow-hidden flex justify-center">
                        {pendingAction.student.enrollmentData.paymentReceipt.startsWith('data:image/') ? (
                          <img
                            src={pendingAction.student.enrollmentData.paymentReceipt}
                            alt="Receipt Preview"
                            className="max-w-full max-h-[300px] object-contain rounded shadow-sm"
                          />
                        ) : (
                          <div className="py-6 text-center space-y-2">
                            <FileText className="h-10 w-10 text-primary mx-auto opacity-50" />
                            <p className="text-xs text-muted-foreground font-medium">Receipt is a document file (PDF/Other)</p>
                            <Button variant="link" size="sm" onClick={() => handleDownloadReceipt(pendingAction.student.enrollmentData!.paymentReceipt!, pendingAction.student.enrollmentData!.paymentReceiptName || 'receipt')}>
                              Download to View
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="p-2 bg-destructive/10 border border-destructive/20 rounded-md">
                      <p className="text-xs text-destructive font-medium">Warning: No payment receipt uploaded!</p>
                    </div>
                  )}
                </div>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => handleStatusUpdate(pendingAction!.student.id, pendingAction!.status)}
              className={pendingAction?.status === 'rejected' ? 'bg-destructive text-white hover:bg-destructive/90' : ''}
            >
              {pendingAction?.status === 'approved' ? 'Confirm Approval' : 'Confirm Rejection'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Viewing Document Dialog */}
      <Dialog open={!!viewingDocument} onOpenChange={(open) => !open && setViewingDocument(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-auto">
          <DialogHeader>
            <DialogTitle>Document Preview</DialogTitle>
            <DialogDescription>
              {viewingDocument?.name || 'Document'}
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-center p-4 bg-muted rounded-lg overflow-hidden">
            {viewingDocument?.url.startsWith('data:image/') ? (
              <img
                src={viewingDocument.url}
                alt="Document"
                className="max-w-full h-auto object-contain shadow-sm"
              />
            ) : viewingDocument?.url.startsWith('data:application/pdf') ? (
              <div className="flex flex-col items-center gap-4 py-8">
                <FileText className="h-16 w-16 text-primary" />
                <p className="text-sm font-medium">PDF Document</p>
                <Button onClick={() => handleDownloadReceipt(viewingDocument.url, viewingDocument.name || 'document.pdf')}>
                  Download to View
                </Button>
              </div>
            ) : (
              <div className="py-8 text-center">
                <p className="text-sm text-muted-foreground">Preview not available for this file type.</p>
                <Button className="mt-4" onClick={() => handleDownloadReceipt(viewingDocument?.url || '', viewingDocument?.name || 'document')}>
                  Download anyway
                </Button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
