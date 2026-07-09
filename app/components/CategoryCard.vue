<template>
  <NuxtLink
    :to="`/category/${category.id}`"
    :style="
      category.categoryImage?.secureUrl ? { backgroundImage: `url(${category.categoryImage.secureUrl})` } : undefined
    "
    class="relative flex items-center justify-center h-50 w-full rounded overflow-hidden border border-dual-orange-100 shadow-sm hover:shadow-md bg-cover bg-center no-underline transition-opacity"
    :class="{ 'hover:opacity-60': category.categoryImage }"
  >
    <img
      v-if="!category.categoryImage"
      src="/logo-images/bear-cooks.png"
      :alt="category.name"
      class="h-4/5 absolute opacity-20"
    />
    <div
      class="text-[36px] font-bold z-10"
      :class="
        category.categoryImage
          ? 'text-white [text-shadow:1px_1px_4px_var(--color-dual-orange-700)]'
          : 'text-dual-orange-600'
      "
    >
      {{ category.name }}
    </div>
  </NuxtLink>
</template>

<script setup lang="ts">
import type { CategoryModel } from '~/types/types';

defineProps<{
  category: CategoryModel;
}>();
</script>
