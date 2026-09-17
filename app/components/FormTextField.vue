<template>
  <div class="relative flex flex-col">
    <CommonTextarea v-if="multiline" v-model="value" :rows="rows" :label="label" :placeholder="placeholder" />
    <CommonTextInput v-else v-model="value" :label="label" :placeholder="placeholder" />
    <p v-if="errorMessage" class="text-paragraph-xs text-dual-red-600 mt-1">{{ errorMessage }}</p>
    <DeleteIconButton v-if="showDelete" class="absolute -right-8 top-0" @click="$emit('remove')" />
  </div>
</template>

<script setup lang="ts">
import { useField } from 'vee-validate';

const props = withDefaults(
  defineProps<{
    name: string;
    label: string;
    multiline?: boolean;
    placeholder?: string;
    rows?: number;
    showDelete?: boolean;
  }>(),
  {
    multiline: false,
    rows: 4,
    showDelete: false,
  },
);

defineEmits<{ remove: [] }>();

const { value, errorMessage } = useField<string>(() => props.name);
</script>
