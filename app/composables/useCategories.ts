import type { CategoryModel } from '~/types/types';

const API_URL = 'https://dual-cookbook-server.onrender.com';

export const useCategories = () => {
  const categories = useState<CategoryModel[]>('categories', () => []);
  const areCategoriesFetched = useState('areCategoriesFetched', () => false);

  const fetchCategories = async () => {
    if (areCategoriesFetched.value) return;
    categories.value = await $fetch<CategoryModel[]>(`${API_URL}/api/categories/all`);
    areCategoriesFetched.value = true;
  };

  return { categories, fetchCategories };
};
