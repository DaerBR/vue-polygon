<template>
  <div>
    <p class="text-paragraph-m text-dual-grey-900 font-semibold mb-2">
      {{ title }}
      <span v-if="isRequired" class="font-semibold text-dual-red-600">*</span>
    </p>
    <p v-if="captionText" class="text-paragraph-xs text-dual-grey-500">{{ captionText }}</p>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  title: string;
  captionText?: string;
  isRequired?: boolean;
}>();
</script>
