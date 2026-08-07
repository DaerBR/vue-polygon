export interface RecipeTableModel {
  categories: [{ id: string; name: string }];
  createdAt: string;
  description: string | null;
  id: string;
  name: string;
  recipeImage?: { publicId: string; secureUrl: string };
  updatedAt: string;
}

export interface ImageDataModel {
  publicId: string;
  secureUrl: string;
}

export interface CategoryModel {
  id: string;
  name: string;
  categoryImage?: ImageDataModel;
}

export interface RecipesPaginationModel {
  data: RecipeTableModel[];
  pagination: { limit: number; page: number; total: number; totalPages: number } | null;
}

export interface RecipeStep {
  id?: string;
  stepDescription: string;
}
export interface RecipeIngredient {
  id?: string;
  text: string;
}

export interface RecipeDetailModel extends RecipeTableModel {
  createdBy: { displayName: string; id: string };
  description: string;
  ingredients: RecipeIngredient[];
  recipeImage: ImageDataModel;
  sourceUrl?: string;
  steps: RecipeStep[];
}

export interface UserModel {
  id: string;
  displayName: string;
  email: string;
}
