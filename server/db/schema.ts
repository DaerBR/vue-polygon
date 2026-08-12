import { relations } from 'drizzle-orm';
import { integer, primaryKey, sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const users = sqliteTable('users', {
  id: text()
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  googleId: text('google_id').notNull().unique(),
  displayName: text('display_name').notNull(),
  email: text().notNull().unique(),
  createdAt: integer('created_at', { mode: 'timestamp' })
    .notNull()
    .$defaultFn(() => new Date()),
});

export const categories = sqliteTable('categories', {
  id: text()
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text().notNull().unique(),
  categoryImagePublicId: text('category_image_public_id'),
  categoryImageSecureUrl: text('category_image_secure_url'),
  createdAt: integer('created_at', { mode: 'timestamp' })
    .notNull()
    .$defaultFn(() => new Date()),
});

export const recipes = sqliteTable('recipes', {
  id: text()
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text().notNull(),
  description: text(),
  sourceUrl: text('source_url'),
  recipeImagePublicId: text('recipe_image_public_id'),
  recipeImageSecureUrl: text('recipe_image_secure_url'),
  createdBy: text('created_by')
    .notNull()
    .references(() => users.id),
  createdAt: integer('created_at', { mode: 'timestamp' })
    .notNull()
    .$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' })
    .notNull()
    .$defaultFn(() => new Date()),
});

export const recipeCategories = sqliteTable(
  'recipe_categories',
  {
    recipeId: text('recipe_id')
      .notNull()
      .references(() => recipes.id, { onDelete: 'cascade' }),
    categoryId: text('category_id')
      .notNull()
      .references(() => categories.id, { onDelete: 'cascade' }),
  },
  (table) => [primaryKey({ columns: [table.recipeId, table.categoryId] })],
);

export const recipeIngredients = sqliteTable('recipe_ingredients', {
  id: text()
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  recipeId: text('recipe_id')
    .notNull()
    .references(() => recipes.id, { onDelete: 'cascade' }),
  text: text().notNull(),
  position: integer().notNull(),
});

export const recipeSteps = sqliteTable('recipe_steps', {
  id: text()
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  recipeId: text('recipe_id')
    .notNull()
    .references(() => recipes.id, { onDelete: 'cascade' }),
  stepDescription: text('step_description').notNull(),
  position: integer().notNull(),
});

export const usersRelations = relations(users, ({ many }) => ({
  recipes: many(recipes),
}));

export const categoriesRelations = relations(categories, ({ many }) => ({
  recipeCategories: many(recipeCategories),
}));

export const recipesRelations = relations(recipes, ({ one, many }) => ({
  createdByUser: one(users, { fields: [recipes.createdBy], references: [users.id] }),
  recipeCategories: many(recipeCategories),
  ingredients: many(recipeIngredients),
  steps: many(recipeSteps),
}));

export const recipeCategoriesRelations = relations(recipeCategories, ({ one }) => ({
  recipe: one(recipes, { fields: [recipeCategories.recipeId], references: [recipes.id] }),
  category: one(categories, { fields: [recipeCategories.categoryId], references: [categories.id] }),
}));

export const recipeIngredientsRelations = relations(recipeIngredients, ({ one }) => ({
  recipe: one(recipes, { fields: [recipeIngredients.recipeId], references: [recipes.id] }),
}));

export const recipeStepsRelations = relations(recipeSteps, ({ one }) => ({
  recipe: one(recipes, { fields: [recipeSteps.recipeId], references: [recipes.id] }),
}));
