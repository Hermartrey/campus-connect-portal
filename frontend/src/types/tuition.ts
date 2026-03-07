export interface TuitionRate {
    gradeLevel: string;
    amount: number;
}

export interface TuitionConfig {
    rates: TuitionRate[];
    lastUpdated: string;
}
