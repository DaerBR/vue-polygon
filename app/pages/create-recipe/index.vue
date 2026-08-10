<script setup lang="ts">
import type { RecipeFormSubmitPayload } from '~/utils/recipeFormValidation';

definePageMeta({
  middleware: 'auth-guard',
});

const { isLoggedIn } = useAuth();
const {
  public: { apiUrl },
} = useRuntimeConfig();

const handleCreate = async (payload: RecipeFormSubmitPayload) => {
  await $fetch(`${apiUrl}/api/recipes`, {
    method: 'POST',
    credentials: 'include',
    body: payload,
  });

  await navigateTo(payload.categories[0] ? `/category/${payload.categories[0]}` : '/');
};
</script>

<template>
  <div v-if="isLoggedIn">
    <PageTitle title="Додати рецепт" with-return-button />
    <RecipeForm :on-submit="handleCreate" />
  </div>
</template>
