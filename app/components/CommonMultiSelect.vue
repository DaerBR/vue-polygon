<template>
  <Select
    v-model="modelValue"
    :options="options"
    option-label="label"
    option-value="value"
    multiple
    show-clear
    :placeholder="placeholder"
    :disabled="isDisabled"
    :unstyled="true"
    :pt="pt"
    append-to="self"
    v-bind="$attrs"
  >
    <template #header>
      <div class="flex items-center gap-2 p-2 pl-3 cursor-pointer" @click="onToggleAll(!allSelected)">
        <Checkbox
          :model-value="allSelected"
          binary
          :indeterminate="indeterminate"
          readonly
          :tabindex="-1"
          :unstyled="true"
          :pt="checkboxPt"
        />
        <span>Обрати всі</span>
      </div>
    </template>
    <template #value="slotProps">
      <span>{{ getLabel() !== '' ? getLabel() : slotProps.placeholder }}</span>
    </template>
    <template #option="slotProps">
      <div class="flex items-center gap-2">
        <Checkbox
          :model-value="isItemSelected(slotProps.option)"
          binary
          readonly
          :tabindex="-1"
          :unstyled="true"
          :pt="checkboxPt"
        />
        <span>{{ slotProps.option.label }}</span>
      </div>
    </template>
  </Select>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import Select from 'primevue/select';
import Checkbox from 'primevue/checkbox';
import type { SelectOption } from '~/components/CommonSelect.vue';

const props = withDefaults(
  defineProps<{
    options: SelectOption[];
    placeholder?: string;
    isDisabled?: boolean;
  }>(),
  {
    placeholder: undefined,
    isDisabled: false,
  },
);

const modelValue = defineModel<string[]>({ default: () => [] });

const pt = {
  root: {
    class:
      'relative w-full flex items-center gap-2 border border-dual-grey-100 rounded px-3 h-10 bg-white cursor-pointer text-paragraph-s text-dual-grey-800 shadow-xs hover:border-dual-grey-300 focus:outline-none disabled:cursor-default disabled:bg-dual-grey-50 disabled:text-dual-grey-400',
  },
  label: { class: 'flex-1 overflow-hidden text-ellipsis whitespace-nowrap' },
  clearIcon: { class: 'text-dual-grey-400 hover:text-dual-grey-600 shrink-0 w-3.5 h-3.5' },
  dropdown: { class: 'text-dual-grey-500 shrink-0' },
  overlay: { class: 'mt-1 bg-white border border-dual-grey-100 rounded shadow-xs z-10 absolute w-full' },
  list: { class: 'max-h-[300px] overflow-y-auto p-0 list-none' },
  option: ({ context }: { context: { focused: boolean; selected: boolean } }) => ({
    class: `flex items-center gap-2 px-3 py-2 text-paragraph-s text-dual-grey-800 cursor-pointer ${context.focused || context.selected ? 'bg-dual-grey-100' : 'bg-white'}`,
  }),
  emptyMessage: { class: 'px-3 py-2 text-paragraph-s text-dual-grey-500' },
};

const checkboxPt = {
  root: { class: 'relative inline-flex items-center justify-center w-4 h-4 shrink-0 mr-1' },
  input: { class: 'absolute inset-0 m-0 w-full h-full cursor-pointer opacity-0' },
  box: ({ context }: { context: { checked: boolean; indeterminate: boolean } }) => ({
    class: `w-4 h-4 rounded border flex items-center justify-center transition-colors ${context.checked || context.indeterminate ? 'bg-dual-orange-500 border-dual-orange-500' : 'bg-white border-dual-grey-300'}`,
  }),
  icon: { size: 10, color: '#ffffff' },
};

const allSelected = computed(() => props.options.length > 0 && modelValue.value.length === props.options.length);
const indeterminate = computed(() => modelValue.value.length > 0 && !allSelected.value);

const isItemSelected = (option: SelectOption) => modelValue.value.includes(option.value);

const getLabel = () => {
  if (modelValue.value.length === 0) return '';
  const first = props.options.find((option) => option.value === modelValue.value[0])?.label ?? modelValue.value[0];
  return modelValue.value.length > 1 ? `${first} (+${modelValue.value.length - 1})` : first;
};

const onToggleAll = (checked: boolean) => {
  modelValue.value = checked ? props.options.map((option) => option.value) : [];
};
</script>
