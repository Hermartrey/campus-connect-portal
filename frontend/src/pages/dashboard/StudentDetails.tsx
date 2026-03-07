import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useStudents } from '@/hooks/useStudents';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, User, School, Calendar, DollarSign, Wallet, FileText, Edit, Save, X, Eye } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Student, EnrollmentFormData } from '@/types/auth';
import { useToast } from '@/hooks/use-toast';

export default function StudentDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { getStudentById, updateStudentData, updateTuitionBalance } = useStudents();
    const [student, setStudent] = useState<Student | undefined>();
    const [isEditing, setIsEditing] = useState(searchParams.get('edit') === 'true');
    const [isEditingBalance, setIsEditingBalance] = useState(false);
    const [formData, setFormData] = useState<Partial<EnrollmentFormData>>({});
    const [editableBalance, setEditableBalance] = useState<string>('0');
    const { toast } = useToast();

    useEffect(() => {
        if (id) {
            const data = getStudentById(id);
            setStudent(data);
            if (data?.enrollmentData) {
                setFormData(data.enrollmentData);
            }
            if (data) {
                setEditableBalance(data.tuitionBalance?.toString() || '0');
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]);

    const handleSave = () => {
        if (id && formData) {
            updateStudentData(id, formData);

            const balance = parseFloat(editableBalance);
            if (!isNaN(balance)) {
                updateTuitionBalance(id, balance);
            }

            // Re-fetch to confirm update
            const updated = getStudentById(id);
            setStudent(updated);
            setIsEditing(false);
            toast({
                title: "Student Updated",
                description: "Student information and balance have been successfully updated.",
            });
        }
    };

    const handleCancel = () => {
        setIsEditing(false);
        if (student?.enrollmentData) {
            setFormData(student.enrollmentData);
        }
        if (student) {
            setEditableBalance(student.tuitionBalance?.toString() || '0');
        }
    };

    const handleChange = (field: keyof EnrollmentFormData, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    if (!student) {
        return (
            <div className="flex flex-col items-center justify-center h-[50vh] gap-4">
                <p className="text-muted-foreground">Student not found</p>
                <Button variant="outline" onClick={() => navigate('/dashboard/students')}>
                    Go Back
                </Button>
            </div>
        );
    }

    const enrollmentData = student.enrollmentData;
    // Helper to render field value or input
    const Field = ({ label, field, value, type = "text" }: { label: string, field: keyof EnrollmentFormData, value: any, type?: string }) => (
        <div className="p-3 bg-muted/50 rounded-lg">
            <dt className="text-sm text-muted-foreground mb-1">{label}</dt>
            <dd className="font-medium">
                {isEditing ? (
                    <Input
                        value={formData[field] as string || ''}
                        onChange={(e) => handleChange(field, e.target.value)}
                        className="h-8 bg-background"
                    />
                ) : (
                    value
                )}
            </dd>
        </div>
    );

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => navigate('/dashboard/students')}>
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <div>
                        <h2 className="text-2xl font-bold text-foreground">Student Profile</h2>
                        <p className="text-muted-foreground">{student.name} ({student.email})</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    {isEditing ? (
                        <>
                            <Button variant="outline" size="sm" onClick={handleCancel} className="gap-2">
                                <X className="h-4 w-4" /> Cancel
                            </Button>
                            <Button size="sm" onClick={handleSave} className="gap-2">
                                <Save className="h-4 w-4" /> Save Changes
                            </Button>
                        </>
                    ) : (
                        <Button variant="outline" size="sm" onClick={() => setIsEditing(true)} className="gap-2">
                            <Edit className="h-4 w-4" /> Edit Profile
                        </Button>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Main Info */}
                <div className="md:col-span-2 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <User className="h-5 w-5" />
                                Personal Information
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {enrollmentData ? (
                                <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <Field label="First Name" field="firstName" value={enrollmentData.firstName} />
                                    <Field label="Last Name" field="lastName" value={enrollmentData.lastName} />
                                    <Field label="Date of Birth" field="dateOfBirth" value={enrollmentData.dateOfBirth ? new Date(enrollmentData.dateOfBirth).toLocaleDateString() : 'N/A'} />
                                    <Field label="Gender" field="gender" value={enrollmentData.gender} />
                                    <Field label="Phone" field="phone" value={enrollmentData.phone} />

                                    <div className="p-3 bg-muted/50 rounded-lg sm:col-span-2">
                                        <dt className="text-sm text-muted-foreground mb-1">Address</dt>
                                        <dd className="font-medium">
                                            {isEditing ? (
                                                <div className="grid grid-cols-2 gap-2">
                                                    <Input placeholder="Address" value={formData.address || ''} onChange={(e) => handleChange('address', e.target.value)} className="col-span-2 h-8" />
                                                    <Input placeholder="City" value={formData.city || ''} onChange={(e) => handleChange('city', e.target.value)} className="h-8" />
                                                    <Input placeholder="State" value={formData.state || ''} onChange={(e) => handleChange('state', e.target.value)} className="h-8" />
                                                    <Input placeholder="Zip Code" value={formData.zipCode || ''} onChange={(e) => handleChange('zipCode', e.target.value)} className="h-8" />
                                                </div>
                                            ) : (
                                                `${enrollmentData.address}, ${enrollmentData.city}, ${enrollmentData.state} ${enrollmentData.zipCode}`
                                            )}
                                        </dd>
                                    </div>
                                </dl>
                            ) : (
                                <div className="text-center py-8 text-muted-foreground">
                                    No enrollment data available
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <School className="h-5 w-5" />
                                Academic Information
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {enrollmentData ? (
                                <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <Field label="Previous School" field="primarySchool" value={enrollmentData.primarySchool} />
                                    <Field label="Grade Level" field="gradeLevel" value={enrollmentData.gradeLevel?.replace('-', ' ')} />
                                </dl>
                            ) : (
                                <div className="text-center py-8 text-muted-foreground">
                                    No academic data available
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Guardian Information */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <User className="h-5 w-5" />
                                Guardian Information
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {enrollmentData ? (
                                <div className="space-y-6">
                                    <div>
                                        <h4 className="font-medium mb-3">Primary Guardian</h4>
                                        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <Field label="Name" field="guardianName" value={enrollmentData.guardianName} />
                                            <Field label="Relationship" field="guardianRelationship" value={enrollmentData.guardianRelationship} />
                                            <Field label="Phone" field="guardianPhone" value={enrollmentData.guardianPhone} />
                                            <Field label="Email" field="guardianEmail" value={enrollmentData.guardianEmail} />
                                        </dl>
                                    </div>

                                    <div>
                                        <h4 className="font-medium mb-3">Secondary Guardian</h4>
                                        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <Field label="Name" field="secondaryGuardianName" value={enrollmentData.secondaryGuardianName || 'N/A'} />
                                            <Field label="Phone" field="secondaryGuardianPhone" value={enrollmentData.secondaryGuardianPhone || 'N/A'} />
                                        </dl>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center py-8 text-muted-foreground">
                                    No guardian data available
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Uploaded Documents */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <FileText className="h-5 w-5" />
                                Uploaded Documents
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {enrollmentData ? (
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                                        <div className="flex items-center gap-2">
                                            <FileText className="h-4 w-4 text-muted-foreground" />
                                            <span className="text-sm">Birth Certificate</span>
                                        </div>
                                        {isEditing ? (
                                            <div className="flex flex-col items-end gap-1 w-1/2">
                                                <span className="text-xs text-muted-foreground mr-1">{formData.birthCertificate}</span>
                                                <Input
                                                    type="file"
                                                    accept=".pdf,.jpg,.png"
                                                    onChange={(e) => e.target.files?.[0] && handleChange('birthCertificate', e.target.files[0].name)}
                                                    className="h-8 bg-background text-xs"
                                                />
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm font-medium text-primary">{enrollmentData.birthCertificate}</span>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-6 w-6"
                                                    onClick={() => toast({ title: "Viewing Document", description: `Opening ${enrollmentData.birthCertificate}...` })}
                                                >
                                                    <Eye className="h-4 w-4 text-muted-foreground" />
                                                </Button>
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                                        <div className="flex items-center gap-2">
                                            <FileText className="h-4 w-4 text-muted-foreground" />
                                            <span className="text-sm">Primary School Grades</span>
                                        </div>
                                        {isEditing ? (
                                            <div className="flex flex-col items-end gap-1 w-1/2">
                                                <span className="text-xs text-muted-foreground mr-1">{formData.primarySchoolGrades}</span>
                                                <Input
                                                    type="file"
                                                    accept=".pdf,.jpg,.png"
                                                    onChange={(e) => e.target.files?.[0] && handleChange('primarySchoolGrades', e.target.files[0].name)}
                                                    className="h-8 bg-background text-xs"
                                                />
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm font-medium text-primary">{enrollmentData.primarySchoolGrades}</span>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-6 w-6"
                                                    onClick={() => toast({ title: "Viewing Document", description: `Opening ${enrollmentData.primarySchoolGrades}...` })}
                                                >
                                                    <Eye className="h-4 w-4 text-muted-foreground" />
                                                </Button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center py-8 text-muted-foreground">
                                    No documents available
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Sidebar Info */}
                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Wallet className="h-5 w-5" />
                                Financial Status
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="p-4 bg-primary/5 rounded-lg border border-primary/20 relative group">
                                <div className="flex justify-between items-start">
                                    <p className="text-sm text-muted-foreground">Current Balance</p>
                                    {!isEditing && !isEditingBalance && (
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                                            onClick={() => setIsEditingBalance(true)}
                                        >
                                            <Edit className="h-3.5 w-3.5" />
                                        </Button>
                                    )}
                                </div>
                                {isEditing || isEditingBalance ? (
                                    <div className="mt-1 space-y-2">
                                        <div className="relative">
                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-primary font-bold">$</span>
                                            <Input
                                                type="number"
                                                value={editableBalance}
                                                onChange={(e) => setEditableBalance(e.target.value)}
                                                className="pl-7 h-9 font-bold text-lg bg-background"
                                                autoFocus={isEditingBalance}
                                            />
                                        </div>
                                        {isEditingBalance && (
                                            <div className="flex gap-2">
                                                <Button size="sm" className="h-7 px-3 text-xs" onClick={() => {
                                                    const balance = parseFloat(editableBalance);
                                                    if (!isNaN(balance)) {
                                                        updateTuitionBalance(id!, balance);
                                                        toast({ title: "Balance Updated", description: "The student's balance has been updated." });
                                                        setIsEditingBalance(false);
                                                        setStudent(getStudentById(id!));
                                                    }
                                                }}>
                                                    Save
                                                </Button>
                                                <Button variant="outline" size="sm" className="h-7 px-3 text-xs" onClick={() => {
                                                    setIsEditingBalance(false);
                                                    setEditableBalance(student?.tuitionBalance?.toString() || '0');
                                                }}>
                                                    Cancel
                                                </Button>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <p className="text-2xl font-bold text-primary">
                                        ${student.tuitionBalance?.toLocaleString() || '0.00'}
                                    </p>
                                )}
                            </div>

                            <div className="p-4 bg-muted/30 rounded-lg border relative group">
                                <div className="flex justify-between items-start mb-2">
                                    <p className="text-sm text-muted-foreground">Payment Status</p>
                                </div>
                                {isEditing ? (
                                    <select
                                        className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                                        value={formData.paymentStatus || 'pending'}
                                        onChange={(e) => handleChange('paymentStatus', e.target.value)}
                                    >
                                        <option value="pending">Pending</option>
                                        <option value="completed">Completed</option>
                                    </select>
                                ) : (
                                    <div className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${student.enrollmentData?.paymentStatus === 'completed'
                                        ? 'border-transparent bg-green-500 text-white hover:bg-green-600'
                                        : 'border-transparent bg-yellow-500 text-white hover:bg-yellow-600'
                                        }`}>
                                        {(student.enrollmentData?.paymentStatus || 'pending').charAt(0).toUpperCase() + (student.enrollmentData?.paymentStatus || 'pending').slice(1)}
                                    </div>
                                )}
                            </div>

                            <div>
                                <h4 className="font-medium mb-3 flex items-center gap-2">
                                    <DollarSign className="h-4 w-4" />
                                    Recent Payments
                                </h4>
                                {student.payments && student.payments.length > 0 ? (
                                    <div className="space-y-2">
                                        {student.payments.slice(0, 5).map((payment) => (
                                            <div key={payment.id} className="flex justify-between items-center p-2 bg-muted/50 rounded text-sm">
                                                <span>{new Date(payment.date).toLocaleDateString()}</span>
                                                <span className="font-medium">${payment.amount.toLocaleString()}</span>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-sm text-muted-foreground">No payments recorded</p>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Calendar className="h-5 w-5" />
                                System Info
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <dl className="space-y-3">
                                <div className="flex justify-between text-sm">
                                    <dt className="text-muted-foreground">Joined</dt>
                                    <dd>{new Date(student.createdAt).toLocaleDateString()}</dd>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <dt className="text-muted-foreground">Status</dt>
                                    <dd className="capitalize">{student.enrollmentStatus.replace('_', ' ')}</dd>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <dt className="text-muted-foreground">ID</dt>
                                    <dd className="font-mono text-xs truncate max-w-[150px]">{student.id}</dd>
                                </div>
                            </dl>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
