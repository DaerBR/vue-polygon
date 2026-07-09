<script setup lang="ts">
const route = useRoute();
const { categories, fetchCategories } = useCategories();
await fetchCategories();

const selectedCategory = computed(() => categories.value.find((category) => category.id === route.params.id));
</script>

<template>
  <PageTitle v-if="selectedCategory" :title="`Рецепти категорії ${selectedCategory.name}`" with-return-button />
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
</template>
