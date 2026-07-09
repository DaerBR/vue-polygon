<template>
  <Select
    v-model="modelValue"
    :options="options"
    option-label="label"
    option-value="value"
    :placeholder="placeholder"
    :disabled="isDisabled"
    :unstyled="true"
    :pt="pt"
    append-to="self"
    v-bind="$attrs"
  />
</template>

<script setup lang="ts">
import Select from 'primevue/select';

export interface SelectOption {
  label: string;
  value: string;
}

withDefaults(defineProps<{
  options: SelectOption[];
  placeholder?: string;
  isDisabled?: boolean;
}>(), {
  placeholder: undefined,
  isDisabled: false,
});

const modelValue = defineModel<string>();

const pt = {
  root: { class: 'relative w-full flex items-center justify-between gap-2 border border-dual-grey-100 rounded px-3 h-10 bg-white cursor-pointer text-paragraph-s text-dual-grey-800 shadow-xs hover:border-dual-grey-300 focus:outline-none disabled:cursor-default disabled:bg-dual-grey-50 disabled:text-dual-grey-400' },
  label: { class: 'overflow-hidden text-ellipsis whitespace-nowrap' },
  dropdown: { class: 'text-dual-grey-500 shrink-0' },
  overlay: { class: 'mt-1 bg-white border border-dual-grey-100 rounded shadow-xs z-10 w-full' },
  list: { class: 'max-h-[300px] overflow-y-auto p-0 list-none' },
  option: ({ context }: { context: { focused: boolean; selected: boolean } }) => ({
    class: `px-3 py-2 text-paragraph-s text-dual-grey-800 cursor-pointer ${context.focused || context.selected ? 'bg-dual-grey-100' : 'bg-white'}`,
  }),
  emptyMessage: { class: 'px-3 py-2 text-paragraph-s text-dual-grey-500' },
};
</script>
