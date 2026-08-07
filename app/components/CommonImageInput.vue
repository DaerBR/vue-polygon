<template>
  <div class="flex flex-col items-center w-full">
    <div
      class="max-w-full rounded border-2 border-dual-orange-100 bg-dual-orange-50 flex items-center justify-center bg-cover bg-center"
      :style="{
        width: `${width}px`,
        height: `${height}px`,
        backgroundImage: previewUrl ? `url(${previewUrl})` : undefined,
      }"
    >
      <IconImage v-if="!previewUrl" :size="48" class="text-dual-orange-300" />
    </div>
    <input
      :id="inputId"
      ref="fileInputRef"
      type="file"
      accept="image/jpeg,image/png"
      class="hidden"
      @change="onFileChange"
    />
    <CommonButton type="button" variant="secondary" class="mt-4" @click="fileInputRef?.click()">
      Оберіть зображення
    </CommonButton>
  </div>
</template>

<script setup lang="ts">
import { onBeforeUnmount, ref, useId, watch } from 'vue';

const props = withDefaults(
  defineProps<{ width?: number; height?: number; initialPreviewUrl?: string | null }>(),
  { width: 400, height: 350, initialPreviewUrl: null },
);

const modelValue = defineModel<File | null>({ default: null });

const inputId = useId();
const fileInputRef = ref<HTMLInputElement | null>(null);
const previewUrl = ref<string | null>(props.initialPreviewUrl);

watch(
  () => props.initialPreviewUrl,
  (url) => {
    if (url && modelValue.value === null) {
      previewUrl.value = url;
    }
  },
);

const onFileChange = (event: Event) => {
  const file = (event.target as HTMLInputElement).files?.[0];
  if (!file) {
    return;
  }
  if (previewUrl.value) {
    URL.revokeObjectURL(previewUrl.value);
  }
  previewUrl.value = URL.createObjectURL(file);
  modelValue.value = file;
};

onBeforeUnmount(() => {
  if (previewUrl.value) {
    URL.revokeObjectURL(previewUrl.value);
  }
});
</script>
