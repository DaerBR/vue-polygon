import type { CategoryModel } from '~/types/types';

export const useCategories = () => {
  const { public: { apiUrl } } = useRuntimeConfig();

  const categories = useState<CategoryModel[]>('categories', () => []);
  const areCategoriesFetched = useState('areCategoriesFetched', () => false);

  const fetchCategories = async () => {
    if (areCategoriesFetched.value) return;
    categories.value = await $fetch<CategoryModel[]>(`${apiUrl}/api/categories/all`);
    areCategoriesFetched.value = true;
  };

  return { categories, fetchCategories };
};
