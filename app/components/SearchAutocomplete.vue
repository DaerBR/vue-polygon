<template>
  <div class="flex items-center gap-2 w-full">
    <div class="relative w-full">
      <AutoComplete
        v-model="selectedRecipe"
        :suggestions="suggestions"
        option-label="name"
        :loading="isSearching"
        :unstyled="true"
        :pt="pt"
        append-to="self"
        placeholder="Шукати"
        @complete="onComplete"
        @option-select="onOptionSelect"
      />
    </div>
    <button
      class="p-2.5 bg-transparent border-none cursor-pointer text-dual-orange-600 hover:text-dual-orange-500"
      type="button"
      @click="handleNavigate"
    >
      <IconSearch :size="14" />
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import AutoComplete from 'primevue/autocomplete';
import type { RecipeTableModel, RecipesPaginationModel } from '~/types/types';

const MIN_QUERY_LENGTH = 3;
const DEBOUNCE_MS = 400;

const { public: { apiUrl } } = useRuntimeConfig();

const selectedRecipe = ref<RecipeTableModel | string>('');
const suggestions = ref<RecipeTableModel[]>([]);
const isSearching = ref(false);

let searchTerm = '';
let debounceTimer: ReturnType<typeof setTimeout> | null = null;

const fetchSuggestions = async (query: string) => {
  isSearching.value = true;
  try {
    const result = await $fetch<RecipesPaginationModel>(`${apiUrl}/api/recipes`, {
      query: { search: query, limit: 10, page: 1 },
    });
    suggestions.value = result.data;
  } finally {
    isSearching.value = false;
  }
};

const onComplete = (event: { query: string }) => {
  searchTerm = event.query;
  if (event.query.length < MIN_QUERY_LENGTH) {
    suggestions.value = [];
    return;
  }
  if (debounceTimer) clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => fetchSuggestions(event.query), DEBOUNCE_MS);
};

const onOptionSelect = (event: { value: RecipeTableModel }) => {
  navigateTo(`/recipe/${event.value.id}`);
  selectedRecipe.value = '';
  searchTerm = '';
};

const handleNavigate = () => {
  navigateTo(searchTerm ? `/search?searchTerm=${searchTerm}` : '/search');
};

const pt = {
  root: { class: 'relative w-full' },
  pcInputText: {
    root: {
      class:
        'w-full border-0 border-b border-dual-orange-300 outline-none text-paragraph-s text-dual-grey-800 pb-1 pr-5 bg-transparent focus:ring-0 focus:outline-none',
    },
  },
  loader: { class: 'absolute right-0 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-dual-grey-400' },
  overlay: { class: 'mt-1 bg-white border border-dual-grey-100 rounded shadow-xs z-10 absolute w-full' },
  list: { class: 'max-h-[300px] overflow-y-auto p-0 list-none' },
  option: ({ context }: { context: { focused: boolean; selected: boolean } }) => ({
    class: `px-3 py-2 text-paragraph-s text-dual-grey-800 cursor-pointer ${context.focused || context.selected ? 'bg-dual-grey-100' : 'bg-white'}`,
  }),
  emptyMessage: { class: 'px-3 py-2 text-paragraph-s text-dual-grey-500' },
};
</script>
