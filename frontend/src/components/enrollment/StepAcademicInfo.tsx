import { EnrollmentFormData } from '@/types/auth';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';

interface StepAcademicInfoProps {
    data: Partial<EnrollmentFormData>;
    onUpdate: (data: Partial<EnrollmentFormData>) => void;
    onNext: () => void;
}

export default function StepAcademicInfo({ data, onUpdate, onNext }: StepAcademicInfoProps) {
    const isSeniorHigh = data.gradeLevel === 'grade-11' || data.gradeLevel === 'grade-12';

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onNext();
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <Card>
                <CardContent className="pt-6 space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="gradeLevel">Grade Level to Enroll In</Label>
                        <Select
                            value={data.gradeLevel}
                            onValueChange={(value) => onUpdate({ gradeLevel: value })}
                            required
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select Grade Level" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="grade-7">Grade 7</SelectItem>
                                <SelectItem value="grade-8">Grade 8</SelectItem>
                                <SelectItem value="grade-9">Grade 9</SelectItem>
                                <SelectItem value="grade-10">Grade 10</SelectItem>
                                <SelectItem value="grade-11">Grade 11 (Senior High)</SelectItem>
                                <SelectItem value="grade-12">Grade 12 (Senior High)</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {isSeniorHigh && (
                        <div className="space-y-2">
                            <Label htmlFor="strand">Senior High Strand</Label>
                            <Select
                                value={data.strand}
                                onValueChange={(value) => onUpdate({ strand: value })}
                                required
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select Strand" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="STEM">STEM (Science, Technology, Engineering, and Mathematics)</SelectItem>
                                    <SelectItem value="ABM">ABM (Accountancy, Business, and Management)</SelectItem>
                                    <SelectItem value="HUMSS">HUMSS (Humanities and Social Sciences)</SelectItem>
                                    <SelectItem value="GAS">GAS (General Academic Strand)</SelectItem>
                                    <SelectItem value="TVL">TVL (Technical-Vocational-Livelihood)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    )}
                </CardContent>
            </Card>

            <div className="flex justify-end">
                <Button type="submit">Next Step</Button>
            </div>
        </form>
    );
}
