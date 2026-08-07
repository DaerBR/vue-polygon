<script setup lang="ts">
import type { RecipeDetailModel } from '~/types/types';
import type { RecipeFormSubmitPayload, RecipeFormValues } from '~/utils/recipeFormValidation';

definePageMeta({
  middleware: 'auth-guard',
});

const { public: { apiUrl } } = useRuntimeConfig();
const route = useRoute();
const recipeId = route.params.id as string;

const { data: recipeDetails, status } = await useFetch<RecipeDetailModel>(`${apiUrl}/api/recipes/${recipeId}`);

const initialValues = computed<RecipeFormValues | undefined>(() => {
  if (!recipeDetails.value) return undefined;
  return {
    name: recipeDetails.value.name,
    categories: recipeDetails.value.categories.map((category) => category.id),
    description: recipeDetails.value.description ?? '',
    ingredients: recipeDetails.value.ingredients.map((ingredient) => ({ text: ingredient.text })),
    steps: recipeDetails.value.steps.map((step) => ({ stepDescription: step.stepDescription })),
    recipeImage: null,
    sourceUrl: recipeDetails.value.sourceUrl ?? '',
  };
});

const isDeleteModalOpen = ref(false);

const handleUpdate = async (payload: RecipeFormSubmitPayload) => {
  await $fetch(`${apiUrl}/api/recipes/${recipeId}`, {
    method: 'PUT',
    credentials: 'include',
    body: payload,
  });

  await navigateTo(payload.categories[0] ? `/category/${payload.categories[0]}` : '/');
};

const handleDelete = async () => {
  const categoryId = recipeDetails.value?.categories[0]?.id;
  await $fetch(`${apiUrl}/api/recipes/${recipeId}`, {
    method: 'DELETE',
    credentials: 'include',
  });
  isDeleteModalOpen.value = false;
  await navigateTo(categoryId ? `/category/${categoryId}` : '/categories');
};
</script>

<template>
  <div v-if="status === 'success' && recipeDetails">
    <PageTitle :title="recipeDetails.name" with-return-button>
      <template #controls>
        <CommonButton variant="outlined-error" class="gap-2" @click="isDeleteModalOpen = true">
          <IconTrash :size="14" />
          Видалити рецепт
        </CommonButton>
      </template>
    </PageTitle>

    <RecipeForm
      submit-label="Зберегти"
      :initial-values="initialValues"
      :initial-image-url="recipeDetails.recipeImage?.secureUrl"
      :on-submit="handleUpdate"
    />

    <ConfirmModal v-model:is-open="isDeleteModalOpen" title="Видалити рецепт?" confirm-label="Видалити" @confirm="handleDelete">
      Цей рецепт буде видалений безповоротно. Ви впевнені, що хочете продовжити?
    </ConfirmModal>
  </div>
</template>
