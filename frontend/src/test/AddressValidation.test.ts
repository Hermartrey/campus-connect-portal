import { describe, it, expect } from 'vitest';
import { z } from 'zod';

const demographicsSchema = z.object({
    zipCode: z.string().min(4, 'Valid zip code is required'),
});

describe('Address Validation', () => {
    it('should accept 4-digit zip codes', () => {
        const result = demographicsSchema.safeParse({ zipCode: '1234' });
        expect(result.success).toBe(true);
    });

    it('should reject 3-digit zip codes', () => {
        const result = demographicsSchema.safeParse({ zipCode: '123' });
        expect(result.success).toBe(false);
    });
});
