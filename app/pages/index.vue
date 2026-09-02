<template>
  <div>
    <div class="font-bold text-xl">Нещодавні рецепти:</div>
    <div v-if="status === 'pending'">Зачекай-но...</div>
    <div v-if="status === 'success' && (recipes?.data?.length ?? 0) > 0" class="flex justify-center mt-3 flex-col">
      <ul v-if="recipes?.data">
        <RecipeCard v-for="recipe in recipes?.data" :key="recipe.id" :recipe="recipe" />
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { RecipesPaginationModel } from '~/types/types';

const {
  public: { apiUrl },
} = useRuntimeConfig();

const { data: recipes, status } = await useFetch<RecipesPaginationModel>(`${apiUrl}/api/recipes`, {
  query: { limit: 10, page: 1 },
});
</script>
