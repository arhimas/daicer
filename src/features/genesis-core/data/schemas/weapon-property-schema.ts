
import { z } from 'zod';

export const WeaponPropertySchema = z.object({
    name: z.string(),
    desc: z.array(z.string()).or(z.string()).optional(),
    url: z.string().optional(),
    index: z.string().optional()
});
