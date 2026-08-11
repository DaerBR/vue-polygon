<script setup lang="ts">
import { useFieldArray, useForm } from 'vee-validate';
import { toTypedSchema } from '@vee-validate/zod';
import {
  recipeFormValidationSchema,
  type RecipeFormSubmitPayload,
  type RecipeFormValues,
} from '~/utils/recipeFormValidation';
import { getBase64OfFile } from '~/utils/getBase64OfFile';

const props = withDefaults(
  defineProps<{
    isEdit?: boolean;
    initialValues?: RecipeFormValues;
    initialImageUrl?: string;
    onSubmit: (payload: RecipeFormSubmitPayload) => Promise<void>;
  }>(),
  { isEdit: false },
);

const router = useRouter();

const { categories, fetchCategories } = useCategories();
await fetchCategories();

const categoriesOptions = computed(() =>
  categories.value.map((category) => ({ value: category.id, label: category.name })),
);

const defaultValues: RecipeFormValues = {
  name: '',
  categories: [],
  description: '',
  ingredients: [{ text: '' }],
  steps: [{ stepDescription: '' }],
  recipeImage: null,
  sourceUrl: '',
};

const { defineField, errors, meta, handleSubmit, resetForm } = useForm<RecipeFormValues>({
  validationSchema: toTypedSchema(recipeFormValidationSchema),
  initialValues: props.initialValues ?? defaultValues,
});

watch(
  () => props.initialValues,
  (values) => {
    if (values) resetForm({ values });
  },
);

const [selectedCategories] = defineField('categories');
const [recipeImage] = defineField('recipeImage');

const {
  fields: ingredientFields,
  push: addIngredient,
  remove: removeIngredient,
} = useFieldArray<{ text: string }>('ingredients');
const { fields: stepFields, push: addStep, remove: removeStep } = useFieldArray<{ stepDescription: string }>('steps');

const isSubmitting = ref(false);

const handleFormSubmit = handleSubmit(async (formValues) => {
  isSubmitting.value = true;
  try {
    const payload: RecipeFormSubmitPayload = {
      name: formValues.name,
      categories: formValues.categories,
      ingredients: formValues.ingredients,
      steps: formValues.steps,
      recipeImage: formValues.recipeImage
        ? {
            base64Content: await getBase64OfFile(formValues.recipeImage),
            nameWithExtension: formValues.recipeImage.name,
          }
        : null,
      description: formValues.description || null,
      sourceUrl: formValues.sourceUrl || undefined,
    };

    await props.onSubmit(payload);
  } finally {
    isSubmitting.value = false;
  }
});
</script>

<template>
  <form class="flex flex-col" @submit.prevent="handleFormSubmit">
    <div class="flex gap-6 flex-nowrap basis-full max-sm:flex-col">
      <div class="flex basis-75 flex-col max-sm:w-full">
        <CommonImageInput v-model="recipeImage" :initial-preview-url="initialImageUrl" />

        <div class="flex flex-col mt-6">
          <FieldsGroupTitle title="Інгредієнти" />
          <div class="flex flex-col gap-2 mt-2">
            <FormField
              v-for="(field, index) in ingredientFields"
              :key="field.key"
              :name="`ingredients[${index}].text`"
              label='Опис (напр. "300 гр пшеничного борошна")'
              :show-delete="index !== 0"
              @remove="removeIngredient(index)"
            />
          </div>
          <div class="flex justify-start">
            <CommonButton
              type="button"
              variant="secondary"
              class="mt-3 max-w-60 gap-2"
              @click="addIngredient({ text: '' })"
            >
              <IconPlus :size="14" />
              Додати
            </CommonButton>
          </div>
        </div>

        <div class="mt-6">
          <FormField name="sourceUrl" label="Посилання" />
        </div>
      </div>

      <div class="flex flex-col ml-6 w-full max-sm:ml-0">
        <div class="mb-6">
          <FormField name="name" label="Назва рецепту" />
        </div>

        <div class="mb-6">
          <CommonMultiSelect
            v-model="selectedCategories"
            :options="categoriesOptions"
            placeholder="Оберіть категорії"
          />
          <p v-if="errors.categories" class="text-paragraph-xs text-dual-red-600 mt-1">{{ errors.categories }}</p>
        </div>

        <div class="mb-6">
          <FormField name="description" label="Опис" multiline :rows="3" />
        </div>

        <div class="mb-6">
          <FieldsGroupTitle title="Покрокова інструкція" />
          <div class="flex flex-col gap-4 mt-2">
            <FormField
              v-for="(field, index) in stepFields"
              :key="field.key"
              :name="`steps[${index}].stepDescription`"
              :label="`Крок ${index + 1}`"
              multiline
              :rows="4"
              :show-delete="index !== 0"
              @remove="removeStep(index)"
            />
          </div>
          <p v-if="errors.steps" class="text-paragraph-xs text-dual-red-600 mt-1">{{ errors.steps }}</p>
          <CommonButton
            type="button"
            variant="secondary"
            class="mt-3 max-w-60 gap-2"
            @click="addStep({ stepDescription: '' })"
          >
            <IconPlus :size="14" />
            Додати наступний крок
          </CommonButton>
        </div>
      </div>
    </div>

    <div class="flex gap-6 justify-center mt-3">
      <CommonButton
        type="submit"
        variant="primary"
        :is-disabled="!meta.valid || categories.length === 0"
        :is-busy="isSubmitting"
      >
        {{ isEdit ? 'Зберегти' : 'Створити' }}
      </CommonButton>
      <CommonButton type="button" variant="outlined-neutral" @click="router.back()">Скасувати</CommonButton>
    </div>
  </form>
</template>
