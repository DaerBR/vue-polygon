import { z } from 'zod';

export const recipeFormValidationSchema = z.object({
  name: z.string().min(3, 'Введіть назву рецепту, принаймні 3 символи'),
  categories: z.array(z.string()).min(1, 'Оберіть категорії'),
  description: z.string(),
  ingredients: z.array(z.object({ text: z.string() })),
  steps: z.array(z.object({ stepDescription: z.string().min(3) })).min(1, 'Додайте принаймні один крок'),
  recipeImage: z.custom<File | null>((val) => val === null || val instanceof File, { message: 'Недійсний файл' }),
  sourceUrl: z.string(),
});

export type RecipeFormValues = z.infer<typeof recipeFormValidationSchema>;

export interface RecipeFormSubmitPayload {
  name: string;
  categories: string[];
  ingredients: { text: string }[];
  steps: { stepDescription: string }[];
  recipeImage: { base64Content: string; nameWithExtension: string } | null;
  description: string | null;
  sourceUrl: string | undefined;
}
