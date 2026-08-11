<script setup lang="ts">
import type { NuxtError } from 'nuxt/app';

defineProps<{
  error: NuxtError;
}>();
</script>

<template>
  <NuxtLayout name="default">
    <div class="flex flex-col items-center justify-center text-center py-20">
      <h2 class="text-paragraph-l text-dual-orange-600">Page not found, sorry</h2>
    </div>
  </NuxtLayout>
</template>
