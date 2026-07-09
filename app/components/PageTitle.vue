<template>
  <div class="flex justify-between mb-9 items-center max-sm:mb-4">
    <div class="flex items-center">
      <button
        v-if="withReturnButton"
        class="p-3 border-none bg-transparent cursor-pointer text-dual-grey-600 hover:text-dual-grey-900"
        @click="handleBack"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <path d="M19 12H5M12 19l-7-7 7-7" />
        </svg>
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
