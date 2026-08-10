<script setup lang="ts">
import type { CategoryFormSubmitPayload } from '~/utils/categoryFormValidation';

definePageMeta({
  middleware: 'auth-guard',
});

const { isLoggedIn } = useAuth();
const {
  public: { apiUrl },
} = useRuntimeConfig();

const handleCreate = async (payload: CategoryFormSubmitPayload) => {
  await $fetch(`${apiUrl}/api/categories`, {
    method: 'POST',
    credentials: 'include',
    body: payload,
  });

  await navigateTo('/categories');
};
</script>

<template>
  <div v-if="isLoggedIn">
    <PageTitle title="Створит категорію" with-return-button />
    <CategoryForm :on-submit="handleCreate" />
  </div>
</template>
