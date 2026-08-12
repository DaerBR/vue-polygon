import type { categories, recipeIngredients, recipes, recipeSteps, users } from '../db/schema';

type CategoryRow = typeof categories.$inferSelect;

export const toCategoryModel = (row: CategoryRow) => ({
  id: row.id,
  name: row.name,
  createdAt: row.createdAt,
  ...(row.categoryImagePublicId && row.categoryImageSecureUrl
    ? { categoryImage: { publicId: row.categoryImagePublicId, secureUrl: row.categoryImageSecureUrl } }
    : {}),
});

type RecipeRow = typeof recipes.$inferSelect;
type IngredientRow = typeof recipeIngredients.$inferSelect;
type StepRow = typeof recipeSteps.$inferSelect;
type UserRow = typeof users.$inferSelect;

const toRecipeImage = (row: RecipeRow) =>
  row.recipeImagePublicId && row.recipeImageSecureUrl
    ? { publicId: row.recipeImagePublicId, secureUrl: row.recipeImageSecureUrl }
    : undefined;

interface RecipeTableRow extends RecipeRow {
  recipeCategories: { category: CategoryRow }[];
}

export const toRecipeTableModel = (row: RecipeTableRow) => ({
  id: row.id,
  name: row.name,
  description: row.description,
  categories: row.recipeCategories.map(({ category }) => ({ id: category.id, name: category.name })),
  recipeImage: toRecipeImage(row),
  createdAt: row.createdAt,
  updatedAt: row.updatedAt,
});

interface RecipeDetailRow extends RecipeTableRow {
  ingredients: IngredientRow[];
  steps: StepRow[];
  createdByUser: UserRow;
}

export const toRecipeDetailModel = (row: RecipeDetailRow) => ({
  ...toRecipeTableModel(row),
  sourceUrl: row.sourceUrl ?? undefined,
  createdBy: { id: row.createdByUser.id, displayName: row.createdByUser.displayName },
  ingredients: row.ingredients.map((ingredient) => ({ id: ingredient.id, text: ingredient.text })),
  steps: row.steps.map((step) => ({ id: step.id, stepDescription: step.stepDescription })),
});
