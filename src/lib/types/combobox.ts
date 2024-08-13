import { z } from 'zod';

export const optionSchema = z
  .object(
    {
      id: z.string(),
      label: z.string(),
      img_url: z.string().optional(),
      createdAt: z.string().optional(),
    }
    // { required_error: 'Choisissez une option' }
  )
  .refine((data) => data.id.length > 0, {
    message: 'Choisissez une option',
    path: ['id'],
  });

export type Option = z.infer<typeof optionSchema>;
