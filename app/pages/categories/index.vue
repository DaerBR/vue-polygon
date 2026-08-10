<script setup lang="ts">
const { categories, fetchCategories } = useCategories();

await fetchCategories();
</script>

<template>
  <PageTitle title="Всі категорії">
    <template #controls>
      <CommonButton variant="secondary" class="gap-2" @click="navigateTo('/create-category')">
        <IconPlus :size="14" />
        Додати категорію
      </CommonButton>
    </template>
  </PageTitle>
  <div class="grid grid-rows-1 grid-cols-2 gap-6 max-sm:grid-cols-1 max-sm:gap-3">
    <CategoryCard v-for="category in categories" :key="category.id" :category="category" />
  </div>
</template>
