import { z } from 'zod';

/**
 * Standard 3D Coordinate Schema.
 */
export const CoordinatesSchema = z.object({
  x: z.number(),
  y: z.number(),
  z: z.number(),
});

export type Coordinates = z.infer<typeof CoordinatesSchema>;
