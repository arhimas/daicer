
import { z } from 'zod';

export const MagicSchoolSchema = z.object({
    index: z.string(),
    name: z.string(),
    desc: z.string(),
    url: z.string()
});

export type SourceMagicSchool = z.infer<typeof MagicSchoolSchema>;
