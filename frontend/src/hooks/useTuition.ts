import { useState, useEffect, useCallback } from 'react';
import { TuitionConfig, TuitionRate } from '@/types/tuition';
import api from '@/lib/api';

const DEFAULT_TUITION_RATES: TuitionRate[] = [
    { gradeLevel: 'grade-7', amount: 5000 },
    { gradeLevel: 'grade-8', amount: 5000 },
    { gradeLevel: 'grade-9', amount: 5500 },
    { gradeLevel: 'grade-10', amount: 5500 },
    { gradeLevel: 'grade-11', amount: 6000 },
    { gradeLevel: 'grade-12', amount: 6000 },
];

export function useTuition() {
    const [config, setConfig] = useState<TuitionConfig>({
        rates: DEFAULT_TUITION_RATES,
        lastUpdated: new Date().toISOString(),
    });

    const loadConfig = useCallback(async () => {
        try {
            const res = await api.get('/tuition/config');
            setConfig(res.data);
        } catch (e) {
            console.error("Failed to load tuition config", e);
        }
    }, []);

    useEffect(() => {
        loadConfig();
    }, [loadConfig]);

    const updateTuitionRate = async (gradeLevel: string, amount: number) => {
        try {
            await api.put('/tuition/config', { gradeLevel, amount });
            await loadConfig();
        } catch (e) {
            console.error("Failed to update tuition rate", e);
        }
    };

    const getTuitionForGrade = (gradeLevel: string): number => {
        const rate = config.rates.find((r) => r.gradeLevel === gradeLevel);
        return rate?.amount || 5000; // fallback to default
    };

    const syncStudentBalances = async (oldRates: TuitionRate[]): Promise<number> => {
        // Backend doesn't currently support a bulk resync route out of the box like this frontend trick does,
        // but students' balances map dynamically via our status update flows.
        // I am stripping out this local storage mass update trick. 
        // Real systems usually recalculate via background jobs or lazily.
        console.warn("syncStudentBalances is deprecated: backend handles actual ledgers.");
        return Promise.resolve(0);
    };

    return {
        config,
        updateTuitionRate,
        getTuitionForGrade,
        syncStudentBalances,
    };
}
