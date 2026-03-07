import { useState } from 'react';
import { EnrollmentFormData } from '@/types/auth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FileText, Upload, ArrowRight, ArrowLeft, CheckCircle, X } from 'lucide-react';

interface StepDocumentsProps {
  data: Partial<EnrollmentFormData>;
  onUpdate: (data: Partial<EnrollmentFormData>) => void;
  onNext: () => void;
  onBack: () => void;
}

export default function StepDocuments({ data, onUpdate, onNext, onBack }: StepDocumentsProps) {
  const [birthCertificate, setBirthCertificate] = useState<string>(data.birthCertificate || '');
  const [birthCertificateData, setBirthCertificateData] = useState<string>(data.birthCertificateData || '');

  const [primarySchoolGrades, setPrimarySchoolGrades] = useState<string>(data.primarySchoolGrades || '');
  const [primarySchoolGradesData, setPrimarySchoolGradesData] = useState<string>(data.primarySchoolGradesData || '');

  const [additionalDocs, setAdditionalDocs] = useState<string[]>(data.additionalDocuments || []);
  const [additionalDocsData, setAdditionalDocsData] = useState<{ name: string; data: string }[]>(data.additionalDocumentsData || []);

  const [errors, setErrors] = useState<{ birthCertificate?: string; primarySchoolGrades?: string }>({});

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    setName: (value: string) => void,
    setData: (value: string) => void
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      setName(file.name);
      // Read file as Base64
      const reader = new FileReader();
      reader.onloadend = () => {
        setData(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAdditionalFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && !additionalDocs.includes(file.name)) {
      setAdditionalDocs(prev => [...prev, file.name]);

      const reader = new FileReader();
      reader.onloadend = () => {
        setAdditionalDocsData(prev => [...prev, { name: file.name, data: reader.result as string }]);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeAdditionalDoc = (fileName: string) => {
    setAdditionalDocs(prev => prev.filter(f => f !== fileName));
    setAdditionalDocsData(prev => prev.filter(f => f.name !== fileName));
  };

  const handleNext = () => {
    const newErrors: { birthCertificate?: string; primarySchoolGrades?: string } = {};

    if (!birthCertificate) {
      newErrors.birthCertificate = 'Birth certificate is required';
    }
    if (!primarySchoolGrades) {
      newErrors.primarySchoolGrades = 'Primary school grades are required';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onUpdate({
      birthCertificate,
      birthCertificateData,
      primarySchoolGrades,
      primarySchoolGradesData,
      additionalDocuments: additionalDocs,
      additionalDocumentsData: additionalDocsData,
    });
    onNext();
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Required Documents
          </CardTitle>
          <CardDescription>
            Upload the following documents to complete your enrollment application
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Birth Certificate */}
          <div className="space-y-2">
            <Label htmlFor="birthCertificate" className="flex items-center gap-2">
              Birth Certificate <span className="text-destructive">*</span>
            </Label>
            <div className="flex items-center gap-4">
              <div className="relative flex-1">
                <Input
                  id="birthCertificate"
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={(e) => handleFileChange(e, setBirthCertificate, setBirthCertificateData)}
                  className="cursor-pointer"
                />
              </div>
              {birthCertificate && (
                <div className="flex items-center gap-2 text-success">
                  <CheckCircle className="h-4 w-4" />
                  <span className="text-sm">{birthCertificate}</span>
                </div>
              )}
            </div>
            {errors.birthCertificate && (
              <p className="text-sm text-destructive">{errors.birthCertificate}</p>
            )}
            <p className="text-xs text-muted-foreground">
              Accepted formats: PDF, JPG, PNG (max 5MB)
            </p>
          </div>

          {/* Primary School Grades */}
          <div className="space-y-2">
            <Label htmlFor="primarySchoolGrades" className="flex items-center gap-2">
              Primary School Grades / Report Card <span className="text-destructive">*</span>
            </Label>
            <div className="flex items-center gap-4">
              <div className="relative flex-1">
                <Input
                  id="primarySchoolGrades"
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={(e) => handleFileChange(e, setPrimarySchoolGrades, setPrimarySchoolGradesData)}
                  className="cursor-pointer"
                />
              </div>
              {primarySchoolGrades && (
                <div className="flex items-center gap-2 text-success">
                  <CheckCircle className="h-4 w-4" />
                  <span className="text-sm">{primarySchoolGrades}</span>
                </div>
              )}
            </div>
            {errors.primarySchoolGrades && (
              <p className="text-sm text-destructive">{errors.primarySchoolGrades}</p>
            )}
            <p className="text-xs text-muted-foreground">
              Most recent report card or transcript from previous school
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Additional Documents */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Additional Documents (Optional)
          </CardTitle>
          <CardDescription>
            Upload any additional supporting documents such as awards, certificates, or recommendations
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="additionalDocs">Add Document</Label>
            <Input
              id="additionalDocs"
              type="file"
              accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
              onChange={handleAdditionalFile}
              className="cursor-pointer"
            />
          </div>

          {additionalDocs.length > 0 && (
            <div className="space-y-2">
              <Label>Uploaded Documents</Label>
              <div className="space-y-2">
                {additionalDocs.map((doc) => (
                  <div
                    key={doc}
                    className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                  >
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{doc}</span>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeAdditionalDoc(doc)}
                      className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex justify-between">
        <Button type="button" variant="outline" size="lg" onClick={onBack} className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Previous
        </Button>
        <Button type="button" size="lg" onClick={handleNext} className="gap-2">
          Next Step
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
