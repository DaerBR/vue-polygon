import { z } from 'zod';

export const categoryFormValidationSchema = z.object({
  categoryImage: z.custom<File | null>((val) => val === null || val instanceof File, { message: 'Недійсний файл' }),
  name: z.string().min(3, 'Введіть назву категорії, принаймні 3 символи'),
});

export type CategoryFormValues = z.infer<typeof categoryFormValidationSchema>;

export interface CategoryFormSubmitPayload {
  categoryImage: { base64Content: string; nameWithExtension: string } | null;
  name: string;
}
