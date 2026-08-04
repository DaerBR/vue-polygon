<template>
  <div v-if="status === 'pending'">Зачекай-но...</div>
  <div v-else-if="status === 'success' && recipeDetails">
    <PageTitle :title="recipeDetails.name" with-return-button>
      <template #controls>
        <CommonButton variant="primary" @click="() => console.log('Click')">Зберегти</CommonButton>
      </template>
    </PageTitle>
    <div class="flex justify-center mt-3 flex-col" data-aos="fade-up" data-aos-duration="1000">
      <div class="flex justify-center mb-5">
        <img
          v-if="recipeDetails.recipeImage"
          :src="recipeDetails.recipeImage?.secureUrl"
          :alt="recipeDetails.name"
          class="h-auto rounded-lg mb-4 w-125"
        />
        <div v-else class="flex justify-center w-95 border border-dual-orange-200 p-8 rounded-lg">
          <img src="/logo-images/bear-cooks.png" :alt="recipeDetails.name" class="h-auto mb-4 opacity-50" />
        </div>
      </div>
      <div class="flex gap-2 align-middle my-4 mx-0">
        <span
          v-for="category in recipeDetails.categories"
          :key="category.id"
          class="bg-dual-orange-600 text-dual-orange-100 px-2.5 py-0.5 whitespace-nowrap rounded-full font-semibold"
        >
          {{ category.name }}
        </span>
      </div>
      <div class="flex flex-col gap-3 mb-5">
        <FieldsGroupTitle title="Опис" />
        <div>{{ recipeDetails.description }}</div>
      </div>
      <div class="flex flex-col mb-5" data-aos="flip-left" data-aos-duration="1000">
        <FieldsGroupTitle title="Інгредієнти" />
        <ul class="list-[circle] pl-6 list-outside mt-4">
          <li class="mb-3" v-for="ingredient in recipeDetails.ingredients" :key="ingredient.id">
            {{ ingredient.text }}
          </li>
        </ul>
      </div>
      <div class="flex flex-col gap-3 mb-5" data-aos="flip-down" data-aos-duration="1000">
        <FieldsGroupTitle title="Інструкція" />
        <ol class="list-decimal list-outside pl-6">
          <li v-for="step in recipeDetails.steps" class="mb-3 text-justify">{{ step.stepDescription }}</li>
        </ol>
      </div>

      <div class="line-clamp-2" v-if="recipeDetails.sourceUrl">
        <span class="text-paragraph-m text-dual-grey-900 font-semibold mr-1">Посилання:</span>
        <a :href="recipeDetails.sourceUrl">{{ recipeDetails.sourceUrl }}</a>
      </div>
      <div class="text-paragraph-xs text-dual-grey-500 mt-2">
        {{ formatDate(recipeDetails.createdAt) }} - {{ recipeDetails.createdBy.displayName }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { RecipeDetailModel } from '~/types/types';
import PageTitle from '~/components/PageTitle.vue';
import FieldsGroupTitle from '~/components/FieldsGroupTitle.vue';
const { public: { apiUrl } } = useRuntimeConfig();
const route = useRoute();
const recipeId = route.params.id;

const { data: recipeDetails, status } = await useFetch<RecipeDetailModel>(
  `${apiUrl}/api/recipes/${recipeId}`,
);
</script>
