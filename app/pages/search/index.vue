<template>
  <div>
    <PageTitle title="Пошук рецептів" />

    <div class="flex flex-col items-center">
      <div class="w-full max-w-md flex flex-col gap-6 mb-6">
        <CommonTextInput v-model="searchTerm" label="Введіть назву страви" @keyup.enter="performSearch()" />

        <div>
          <FieldsGroupTitle title="Фільтри" />
          <CommonMultiSelect v-model="selectedCategoryIds" :options="categoryOptions" placeholder="Оберіть категорії" />
        </div>
      </div>

      <div class="flex gap-3 mb-9">
        <CommonButton variant="primary" :is-busy="isSearching" @click="performSearch()">Шукати</CommonButton>
        <CommonButton variant="outlined-neutral" @click="handleReset">Скинути</CommonButton>
      </div>
    </div>

    <div v-if="isSearching">Зачекай-но...</div>
    <div v-else-if="hasSearched && recipes.length > 0" class="flex flex-col">
      <FieldsGroupTitle title="Результати:" />
      <RecipeCard v-for="recipe in recipes" :key="recipe.id" :recipe="recipe" />
    </div>
    <div v-else-if="hasSearched" class="text-paragraph-s text-dual-grey-500 text-center">Нічого не знайдено</div>

    <CommonPagination
      :total-records="totalRecords"
      :rows="PAGE_SIZE"
      :page="currentPage"
      class="mt-6"
      @update:page="performSearch"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import type { RecipesPaginationModel, RecipeTableModel } from '~/types/types';

const PAGE_SIZE = 10;

const {
  public: { apiUrl },
} = useRuntimeConfig();
const route = useRoute();

const searchTerm = ref(typeof route.query.searchTerm === 'string' ? route.query.searchTerm : '');
const selectedCategoryIds = ref<string[]>([]);
const recipes = ref<RecipeTableModel[]>([]);
const isSearching = ref(false);
const hasSearched = ref(false);
const currentPage = ref(1);
const totalRecords = ref(0);

const { categories, fetchCategories } = useCategories();
await fetchCategories();
const categoryOptions = computed(() =>
  categories.value.map((category) => ({ label: category.name, value: category.id })),
);

const performSearch = async (page = 1) => {
  isSearching.value = true;
  hasSearched.value = true;
  currentPage.value = page;
  try {
    const result = await $fetch<RecipesPaginationModel>(`${apiUrl}/api/recipes`, {
      query: {
        search: searchTerm.value || undefined,
        categories: selectedCategoryIds.value.length > 0 ? selectedCategoryIds.value.join(',') : undefined,
        limit: PAGE_SIZE,
        page,
      },
    });
    recipes.value = result.data;
    totalRecords.value = result.pagination?.total ?? 0;
  } finally {
    isSearching.value = false;
  }
};

const handleReset = () => {
  searchTerm.value = '';
  selectedCategoryIds.value = [];
  recipes.value = [];
  hasSearched.value = false;
  currentPage.value = 1;
  totalRecords.value = 0;
};

if (searchTerm.value) {
  await performSearch();
}
</script>
