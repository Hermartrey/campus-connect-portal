import { useState, useEffect } from 'react';
import { TuitionConfig, TuitionRate } from '@/types/tuition';

const TUITION_CONFIG_KEY = 'tuition_config';

const DEFAULT_TUITION_RATES: TuitionRate[] = [
    { gradeLevel: 'grade-7', amount: 5000 },
    { gradeLevel: 'grade-8', amount: 5000 },
    { gradeLevel: 'grade-9', amount: 5500 },
    { gradeLevel: 'grade-10', amount: 5500 },
    { gradeLevel: 'grade-11', amount: 6000 },
    { gradeLevel: 'grade-12', amount: 6000 },
];

export function useTuition() {
    const [config, setConfig] = useState<TuitionConfig>(() => {
        const stored = localStorage.getItem(TUITION_CONFIG_KEY);
        if (stored) {
            return JSON.parse(stored);
        }
        return {
            rates: DEFAULT_TUITION_RATES,
            lastUpdated: new Date().toISOString(),
        };
    });

    useEffect(() => {
        localStorage.setItem(TUITION_CONFIG_KEY, JSON.stringify(config));
    }, [config]);

    const updateTuitionRate = (gradeLevel: string, amount: number) => {
        setConfig((prev) => ({
            rates: prev.rates.map((rate) =>
                rate.gradeLevel === gradeLevel ? { ...rate, amount } : rate
            ),
            lastUpdated: new Date().toISOString(),
        }));
    };

    const getTuitionForGrade = (gradeLevel: string): number => {
        const rate = config.rates.find((r) => r.gradeLevel === gradeLevel);
        return rate?.amount || 5000; // fallback to default
    };

    const syncStudentBalances = (oldRates: TuitionRate[]): number => {
        const USERS_KEY = 'school_users';
        const users = JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
        let updatedCount = 0;

        const updatedUsers = users.map((user: any) => {
            // Only update approved students with outstanding balance
            if (user.role === 'student' && user.enrollmentStatus === 'approved' && user.tuitionBalance > 0) {
                const gradeLevel = user.enrollmentData?.gradeLevel || user.gradeLevel;

                if (gradeLevel) {
                    // Find old and new rates for this grade
                    const oldRate = oldRates.find((r) => r.gradeLevel === gradeLevel);
                    const newRate = config.rates.find((r) => r.gradeLevel === gradeLevel);

                    if (oldRate && newRate && oldRate.amount !== newRate.amount) {
                        // Calculate proportional new balance
                        const proportionOwed = user.tuitionBalance / oldRate.amount;
                        const newBalance = Math.round(proportionOwed * newRate.amount);

                        updatedCount++;
                        return {
                            ...user,
                            tuitionBalance: newBalance,
                        };
                    }
                }
            }
            return user;
        });

        localStorage.setItem(USERS_KEY, JSON.stringify(updatedUsers));
        return updatedCount;
    };

    return {
        config,
        updateTuitionRate,
        getTuitionForGrade,
        syncStudentBalances,
    };
}
