<script setup lang="ts">
import type { CategoryModel, RecipeDetailModel } from '~/types/types';
import type { CategoryFormSubmitPayload, CategoryFormValues } from '~/utils/categoryFormValidation';
import type { RecipeFormSubmitPayload, RecipeFormValues } from '~/utils/recipeFormValidation';

definePageMeta({
  middleware: 'auth-guard',
});

const {
  public: { apiUrl },
} = useRuntimeConfig();
const route = useRoute();
const categoryId = route.params.id as string;

const { categories, fetchCategories } = useCategories();
await fetchCategories();

const categoryDetails = computed(() => categories.value.find((category) => category.id === categoryId));

const initialValues = computed<CategoryFormValues | undefined>(() => {
  if (!categoryDetails.value) return undefined;
  return {
    name: categoryDetails.value.name,
    categoryImage: null,
  };
});

const isDeleteModalOpen = ref(false);

const handleUpdate = async (payload: CategoryFormSubmitPayload) => {
  await $fetch(`${apiUrl}/api/categories/${categoryId}`, {
    method: 'PUT',
    credentials: 'include',
    body: payload,
  });

  await navigateTo(`/category/${categoryId}`);
};

const handleDelete = async () => {
  await $fetch(`${apiUrl}/api/categories/${categoryId}`, {
    method: 'DELETE',
    credentials: 'include',
  });
  isDeleteModalOpen.value = false;
  await navigateTo('/categories');
};
</script>

<template>
  <div v-if="categoryDetails">
    <PageTitle :title="categoryDetails.name" with-return-button>
      <template #controls>
        <CommonButton variant="outlined-error" class="gap-2" @click="isDeleteModalOpen = true">
          <IconTrash :size="14" />
          Видалити категорію
        </CommonButton>
      </template>
    </PageTitle>
    <CategoryForm
      isEdit
      :initial-values="initialValues"
      :initial-image-url="categoryDetails.categoryImage?.secureUrl"
      :on-submit="handleUpdate"
    />
    <ConfirmModal
      v-model:is-open="isDeleteModalOpen"
      title="Видалити категорію?"
      confirm-label="Видалити"
      @confirm="handleDelete"
    >
      Ця дія неможлива, якщо існують рецепти, в яких використовується ця категорія.
    </ConfirmModal>
  </div>
</template>
