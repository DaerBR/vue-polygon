<template>
  <span class="relative mb-4 block">
    <NuxtLink :to="`/recipe/${recipe.id}`" class="no-underline text-inherit">
      <div
        class="border border-dual-grey-50 rounded-lg flex relative shadow-xs hover:shadow-md overflow-hidden items-center"
      >
        <!-- Image -->
        <div class="flex justify-center h-37.5 relative min-w-50 max-sm:min-w-1/3 p-1 rounded shrink-0">
          <div
            v-if="recipe.recipeImage?.secureUrl"
            :style="{ backgroundImage: `url(${recipe.recipeImage.secureUrl})` }"
            class="bg-cover bg-center h-full w-full rounded-lg min-w-full"
          />
          <img
            v-else
            src="/logo-images/bear-cooks.png"
            :alt="recipe.name"
            class="h-full opacity-20 max-w-full object-contain"
          />
        </div>

        <!-- Content -->
        <div class="flex flex-col gap-2 p-4">
          <p class="text-paragraph-m font-bold">{{ recipe.name }}</p>

          <div class="flex gap-2 flex-nowrap h-6 overflow-y-scroll [&::-webkit-scrollbar]:hidden">
            <span
              v-for="category in recipe.categories"
              :key="category.id"
              class="text-paragraph-xs text-dual-orange-600 bg-dual-orange-100 px-2.5 py-0.5 rounded-full whitespace-nowrap"
            >
              {{ category.name }}
            </span>
          </div>

          <p class="text-paragraph-s text-dual-grey-600 overflow-hidden text-ellipsis line-clamp-2 min-h-10">
            {{ recipe.description ?? '' }}
          </p>

          <p class="text-paragraph-xs text-dual-grey-500">
            {{ recipe.createdAt ? `Додано ${formatDate(recipe.createdAt)}` : '' }}
          </p>
        </div>
      </div>
    </NuxtLink>
  </span>
</template>

<script setup lang="ts">
import type { RecipeTableModel } from '~/types/types';

defineProps<{
  recipe: RecipeTableModel;
}>();
</script>
