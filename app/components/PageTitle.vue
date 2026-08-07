<template>
  <div class="flex justify-between mb-9 items-center max-sm:mb-4">
    <div class="flex items-center">
      <button
        v-if="withReturnButton"
        class="p-3 border-none bg-transparent cursor-pointer text-dual-grey-600 hover:text-dual-grey-900"
        @click="handleBack"
      >
        <IconChevronLeft :size="18" />
      </button>
      <h5 class="text-2xl font-bold m-0 max-sm:text-[18px]">{{ title }}</h5>
    </div>
    <div v-if="$slots.controls" class="flex gap-3">
      <slot name="controls" />
    </div>
  </div>
</template>

<script setup lang="ts">
interface PageTitleProps {
  title: string;
  returnUrl?: string;
  withReturnButton?: boolean;
}
const router = useRouter();

const props = defineProps<PageTitleProps>();

const handleBack = () => {
  if (props.returnUrl) {
    router.push(props.returnUrl);
  } else {
    router.back();
  }
};
</script>
