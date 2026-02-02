import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DollarSign, Save } from 'lucide-react';
import { useTuition } from '@/hooks/useTuition';
import { useToast } from '@/hooks/use-toast';

const GRADE_LABELS: Record<string, string> = {
    'grade-7': 'Grade 7',
    'grade-8': 'Grade 8',
    'grade-9': 'Grade 9',
    'grade-10': 'Grade 10',
    'grade-11': 'Grade 11',
    'grade-12': 'Grade 12',
};

export default function TuitionManagement() {
    const { config, updateTuitionRate, syncStudentBalances } = useTuition();
    const { toast } = useToast();
    const [editedRates, setEditedRates] = useState<Record<string, number>>({});

    const handleAmountChange = (gradeLevel: string, value: string) => {
        const amount = parseFloat(value) || 0;
        setEditedRates((prev) => ({ ...prev, [gradeLevel]: amount }));
    };

    const handleSave = () => {
        // Store old rates before updating
        const oldRates = [...config.rates];

        // Update tuition rates
        Object.entries(editedRates).forEach(([gradeLevel, amount]) => {
            updateTuitionRate(gradeLevel, amount);
        });

        // Sync student balances proportionally
        const updatedCount = syncStudentBalances(oldRates);

        setEditedRates({});
        toast({
            title: 'Success',
            description: updatedCount > 0
                ? `Tuition rates updated. ${updatedCount} student balance${updatedCount !== 1 ? 's' : ''} adjusted.`
                : 'Tuition rates updated successfully',
        });
    };

    const hasChanges = Object.keys(editedRates).length > 0;

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-foreground">Tuition Management</h1>
                <p className="text-muted-foreground">Manage tuition amounts for each grade level</p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <DollarSign className="h-5 w-5" />
                        Tuition Rates by Grade Level
                    </CardTitle>
                    <CardDescription>
                        Set the tuition amount for each grade. Existing student balances will be adjusted proportionally when rates change.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Grade Level</TableHead>
                                <TableHead>Tuition Amount</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {config.rates.map((rate) => {
                                const currentAmount = editedRates[rate.gradeLevel] ?? rate.amount;
                                const hasEdit = rate.gradeLevel in editedRates;

                                return (
                                    <TableRow key={rate.gradeLevel}>
                                        <TableCell className="font-medium">
                                            {GRADE_LABELS[rate.gradeLevel] || rate.gradeLevel}
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2 max-w-xs">
                                                <Label htmlFor={`amount-${rate.gradeLevel}`} className="sr-only">
                                                    Amount for {GRADE_LABELS[rate.gradeLevel]}
                                                </Label>
                                                <span className="text-muted-foreground">$</span>
                                                <Input
                                                    id={`amount-${rate.gradeLevel}`}
                                                    type="number"
                                                    min="0"
                                                    step="100"
                                                    value={currentAmount}
                                                    onChange={(e) => handleAmountChange(rate.gradeLevel, e.target.value)}
                                                    className={hasEdit ? 'border-primary' : ''}
                                                />
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            {hasEdit && (
                                                <span className="text-sm text-primary">Modified</span>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>

                    <div className="flex justify-between items-center mt-6 pt-6 border-t">
                        <p className="text-sm text-muted-foreground">
                            Last updated: {new Date(config.lastUpdated).toLocaleString()}
                        </p>
                        <Button onClick={handleSave} disabled={!hasChanges} className="gap-2">
                            <Save className="h-4 w-4" />
                            Save Changes
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
