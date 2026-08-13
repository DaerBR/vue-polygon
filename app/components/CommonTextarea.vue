<template>
  <div class="relative w-full">
    <Textarea
      :id="inputId"
      v-model="modelValue"
      :rows="rows"
      :disabled="isDisabled"
      :unstyled="true"
      :pt="pt"
      v-bind="$attrs"
      :placeholder="placeholder"
    />
    <label
      :for="inputId"
      class="absolute left-3 -top-2 px-1 text-paragraph-xs text-dual-grey-600 bg-white pointer-events-none peer-focus:text-dual-orange-600"
    >
      {{ label }}
    </label>
  </div>
</template>

<script setup lang="ts">
import { useId } from 'vue';
import Textarea from 'primevue/textarea';

defineOptions({ inheritAttrs: false });

withDefaults(
  defineProps<{
    label: string;
    rows?: number;
    isDisabled?: boolean;
    placeholder?: string;
  }>(),
  {
    rows: 3,
    isDisabled: false,
  },
);

const modelValue = defineModel<string>();

const inputId = useId();

const pt = {
  root: {
    class:
      'peer w-full border border-dual-grey-100 rounded px-3 py-2.5 text-paragraph-s text-dual-grey-800 bg-white shadow-xs outline-none resize-none focus:border-dual-orange-300 focus:ring-0 focus:outline-none disabled:cursor-default disabled:bg-dual-grey-50 disabled:text-dual-grey-400',
  },
};
</script>
