<script setup lang="ts">
import {
  categoryFormValidationSchema,
  type CategoryFormSubmitPayload,
  type CategoryFormValues,
} from '~/utils/categoryFormValidation';
import { getBase64OfFile } from '~/utils/getBase64OfFile';
import { useForm } from 'vee-validate';
import { toTypedSchema } from '@vee-validate/zod';

const props = withDefaults(
  defineProps<{
    isEdit?: boolean;
    initialValues?: CategoryFormValues;
    initialImageUrl?: string;
    onSubmit: (payload: CategoryFormSubmitPayload) => Promise<void>;
  }>(),
  { isEdit: false },
);

const router = useRouter();

const defaultValues: CategoryFormValues = {
  categoryImage: null,
  name: '',
};

const { defineField, errors, meta, handleSubmit, resetForm } = useForm<CategoryFormValues>({
  validationSchema: toTypedSchema(categoryFormValidationSchema),
  initialValues: props.initialValues ?? defaultValues,
});

watch(
  () => props.initialValues,
  (values) => {
    if (values) resetForm({ values });
  },
);

const isSubmitting = ref(false);

const [name] = defineField('name');
const [categoryImage] = defineField('categoryImage');

const handleFormSubmit = handleSubmit(async (formValues) => {
  isSubmitting.value = true;
  const { name, categoryImage } = formValues;
  try {
    const payload: CategoryFormSubmitPayload = {
      name: name,
      categoryImage: categoryImage
        ? {
            base64Content: await getBase64OfFile(categoryImage),
            nameWithExtension: categoryImage.name,
          }
        : null,
    };

    await props.onSubmit(payload);
  } finally {
    isSubmitting.value = false;
  }
});
</script>

<template>
  <form class="flex flex-col" @submit.prevent="handleFormSubmit">
    <div class="flex">
      <div class="flex basis-75 flex-col max-sm:w-full">
        <CommonImageInput v-model="categoryImage" :initial-preview-url="initialImageUrl" />
      </div>
      <div class="flex flex-col ml-6 w-full max-sm:ml-0">
        <div class="mb-6">
          <CommonTextInput v-model="name" label="Назва категорії" />
          <p v-if="errors.name" class="text-paragraph-xs text-dual-red-600 mt-1">{{ errors.name }}</p>
        </div>
      </div>
    </div>
    <div class="flex gap-6 justify-center mt-3">
      <CommonButton type="submit" variant="primary" :is-disabled="!meta.valid" :is-busy="isSubmitting">
        {{ isEdit ? 'Зберегти' : 'Створити' }}
      </CommonButton>
      <CommonButton type="button" variant="outlined-neutral" @click="router.back()">Скасувати</CommonButton>
    </div>
  </form>
</template>
