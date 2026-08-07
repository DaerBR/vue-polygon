<template>
  <button
    type="button"
    class="p-1 bg-transparent border-none cursor-pointer text-dual-grey-300 hover:text-dual-red-600"
    aria-label="Видалити"
    @click="$emit('click')"
  >
    <IconXCircle :size="16" />
  </button>
</template>

<script setup lang="ts">
defineEmits<{ click: [] }>();
</script>
