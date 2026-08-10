<script setup lang="ts">
import IconPencil from '~/components/IconPencil.vue';

const route = useRoute();
const { categories, fetchCategories } = useCategories();
await fetchCategories();

const selectedCategory = computed(() => categories.value.find((category) => category.id === route.params.id));
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
</template>
