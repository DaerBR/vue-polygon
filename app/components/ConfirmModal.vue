<template>
  <Dialog v-model:visible="isOpen" modal :header="title" :unstyled="true" :pt="pt">
    <div class="text-paragraph-s text-dual-grey-700">
      <slot />
    </div>
    <template #footer>
      <div class="flex gap-3 w-full">
        <CommonButton variant="outlined-error" full-width @click="$emit('confirm')">{{ confirmLabel }}</CommonButton>
        <CommonButton variant="outlined-neutral" full-width @click="isOpen = false">Скасувати</CommonButton>
      </div>
    </template>
  </Dialog>
</template>

<script setup lang="ts">
import Dialog from 'primevue/dialog';

withDefaults(defineProps<{ title: string; confirmLabel?: string }>(), { confirmLabel: 'Підтвердити' });
defineEmits<{ confirm: [] }>();

const isOpen = defineModel<boolean>('isOpen', { default: false });

const pt = {
  mask: { class: 'fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4' },
  root: { class: 'bg-white rounded-lg shadow-lg w-full max-w-100 flex flex-col' },
  header: { class: 'flex items-center justify-between px-6 pt-6 pb-2' },
  title: { class: 'text-paragraph-l font-semibold text-dual-grey-900' },
  content: { class: 'px-6 py-2' },
  footer: { class: 'flex gap-3 px-6 pb-6 pt-4' },
};
</script>
