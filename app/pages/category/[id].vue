<script setup lang="ts">
import IconPencil from '~/components/IconPencil.vue';
import type { RecipesPaginationModel, RecipeTableModel } from '~/types/types';

const PAGE_SIZE = 10;

const route = useRoute();
const { categories, fetchCategories } = useCategories();
await fetchCategories();
const {
  public: { apiUrl },
} = useRuntimeConfig();

const selectedCategory = computed(() => categories.value.find((category) => category.id === route.params.id));

const categoryRecipes = ref<RecipeTableModel[]>([]);
const totalRecipes = ref(0);
const currentPage = ref(1);
const isLoadingRecipes = ref(false);

const fetchCategoryRecipes = async (page = 1) => {
  isLoadingRecipes.value = true;
  currentPage.value = page;
  try {
    const result = await $fetch<RecipesPaginationModel>(`${apiUrl}/api/recipes`, {
      query: { limit: PAGE_SIZE, page, categories: route.params.id },
    });
    categoryRecipes.value = result.data;
    totalRecipes.value = result.pagination?.total ?? 0;
  } finally {
    isLoadingRecipes.value = false;
  }
};

await fetchCategoryRecipes();
</script>

<template>
  <PageTitle v-if="selectedCategory" :title="`Рецепти категорії ${selectedCategory.name}`" with-return-button>
    <template #controls>
      <CommonButton variant="secondary" class="gap-2" @click="navigateTo(`/edit-category/${route.params.id}`)">
        <IconPencil :size="14" />
        Змінити категорію
      </CommonButton>
    </template>
  </PageTitle>
  <div class="flex justify-center w-full">
    <img
      v-if="selectedCategory?.categoryImage"
      :src="selectedCategory?.categoryImage.secureUrl"
      :alt="selectedCategory.name"
      class="h-auto rounded-lg mb-4 w-125"
    />
    <div v-else class="flex justify-center w-95 border border-dual-orange-200 p-8 rounded-lg">
      <img src="/logo-images/bear-cooks.png" :alt="selectedCategory?.name" class="h-auto mb-4 opacity-50" />
    </div>
  </div>
  <div class="flex flex-col mt-6">
    <div v-if="categoryRecipes.length > 0" class="flex flex-col mt-4">
      <RecipeCard v-for="recipe in categoryRecipes" :key="recipe.id" :recipe="recipe" />
    </div>
    <CommonPagination
      :total-records="totalRecipes"
      :rows="PAGE_SIZE"
      :page="currentPage"
      class="mt-6"
      @update:page="fetchCategoryRecipes"
    />
  </div>
</template>
