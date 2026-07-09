<template>
  <Button
    :unstyled="true"
    :class="[baseClasses, variantClasses, { 'w-full': fullWidth, 'opacity-60 cursor-wait': isBusy }]"
    :disabled="isDisabled || isBusy"
    :type="type"
    v-bind="$attrs"
  >
    <slot />
  </Button>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import Button from 'primevue/button';

type Variant = 'primary' | 'secondary' | 'outlined-neutral' | 'outlined-primary' | 'outlined-success' | 'outlined-error';

const props = withDefaults(defineProps<{
  variant?: Variant;
  fullWidth?: boolean;
  isDisabled?: boolean;
  isBusy?: boolean;
  type?: 'button' | 'submit' | 'reset';
}>(), {
  variant: 'primary',
  type: 'button',
});

const baseClasses = 'cursor-pointer font-medium min-w-16 rounded px-7 h-10 flex items-center justify-center text-paragraph-s transition-colors duration-[250ms] box-border disabled:cursor-default disabled:pointer-events-none';

const variantClasses = computed(() => {
  switch (props.variant) {
    case 'primary':
      return 'bg-dual-orange-500 text-white hover:bg-dual-orange-400 active:bg-dual-orange-700 disabled:bg-dual-grey-100';
    case 'secondary':
      return 'bg-dual-orange-100 text-dual-orange-600 hover:bg-dual-orange-300 active:bg-dual-orange-100 disabled:bg-dual-orange-100 disabled:text-dual-orange-300';
    case 'outlined-neutral':
      return 'bg-white text-dual-grey-900 border border-dual-grey-100 shadow-xs hover:border-dual-grey-300 hover:text-dual-grey-600 active:border-dual-grey-300 disabled:text-dual-grey-400';
    case 'outlined-primary':
      return 'bg-white text-dual-orange-600 border border-dual-orange-600 shadow-xs hover:bg-dual-orange-100 active:border-dual-orange-300 disabled:text-dual-orange-300';
    case 'outlined-success':
      return 'bg-white text-dual-green-600 border border-dual-green-600 shadow-xs hover:bg-dual-green-100 active:border-dual-green-300 disabled:text-dual-green-300';
    case 'outlined-error':
      return 'bg-white text-dual-red-600 border border-dual-red-600 shadow-xs hover:bg-dual-red-100 active:border-dual-red-300 disabled:text-dual-red-300';
  }
});
</script>
