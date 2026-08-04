<template>
  <Paginator
    v-if="totalRecords > 0"
    :first="(page - 1) * (rows ?? 1)"
    :rows="rows"
    :total-records="totalRecords"
    :unstyled="true"
    @page="onPage"
  >
    <template
      #container="{ page: currentPageIndex, pageCount, prevPageCallback, nextPageCallback, changePageCallback }"
    >
      <div class="flex justify-center items-center gap-2">
        <button
          type="button"
          class="min-w-10 w-10 h-10 p-1 flex items-center justify-center border border-dual-grey-100 rounded shadow-xs text-dual-grey-600 hover:border-dual-grey-300 disabled:opacity-40 disabled:pointer-events-none"
          :disabled="currentPageIndex <= 0"
          @click="prevPageCallback"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="10"
            height="10"
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

        <div class="flex items-center gap-3 max-sm:hidden">
          <template v-for="(item, index) in pageItems" :key="`${item}-${index}`">
            <span
              v-if="item === 'ellipsis'"
              class="min-w-7.5 w-7.5 flex items-end justify-center select-none text-paragraph-s text-dual-grey-500"
              >…</span
            >
            <button
              v-else
              type="button"
              class="min-w-10 w-10 h-10 p-1 flex items-center justify-center border rounded text-paragraph-s"
              :class="
                currentPageIndex + 1 === item
                  ? 'border-dual-grey-300 shadow-sm text-dual-grey-900 font-semibold'
                  : 'border-dual-grey-100 shadow-xs text-dual-grey-600 font-normal hover:border-dual-grey-300'
              "
              @click="changePageCallback(item - 1)"
            >
              {{ item }}
            </button>
          </template>
        </div>

        <button
          type="button"
          class="min-w-10 w-10 h-10 p-1 flex items-center justify-center border border-dual-grey-100 rounded shadow-xs text-dual-grey-600 hover:border-dual-grey-300 disabled:opacity-40 disabled:pointer-events-none"
          :disabled="!pageCount || currentPageIndex >= pageCount - 1"
          @click="nextPageCallback"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="10"
            height="10"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </template>
  </Paginator>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import Paginator from 'primevue/paginator';

const props = withDefaults(
  defineProps<{
    totalRecords: number;
    rows?: number;
  }>(),
  {
    rows: 10,
  },
);

const page = defineModel<number>('page', { default: 1 });

const pageCount = computed(() => Math.ceil(props.totalRecords / props.rows));
const pageItems = computed(() => getPageItems(page.value, pageCount.value));

const onPage = (event: { page: number }) => {
  page.value = event.page + 1;
};
</script>
