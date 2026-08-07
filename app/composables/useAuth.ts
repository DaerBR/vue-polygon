import type { UserModel } from '~/types/types';

export const useAuth = () => {
  const { public: { apiUrl } } = useRuntimeConfig();

  const user = useState<UserModel | null>('auth-user', () => null);
  const isLoggedIn = computed(() => user.value !== null);
  const areUserDataFetched = useState('auth-are-user-data-fetched', () => false);
  const isLoading = useState('auth-is-loading', () => false);

  const fetchUser = async () => {
    if (areUserDataFetched.value) return;
    isLoading.value = true;
    try {
      user.value = await $fetch<UserModel | null>(`${apiUrl}/api/current_user`, { credentials: 'include' });
      areUserDataFetched.value = true;
    } finally {
      isLoading.value = false;
    }
  };

  const login = () => {
    const width = 500;
    const height = 600;
    const left = window.screenX + (window.outerWidth - width) / 2;
    const top = window.screenY + (window.outerHeight - height) / 2;

    window.open(`${apiUrl}/auth/google`, 'google-auth', `width=${width},height=${height},left=${left},top=${top}`);

    const apiOrigin = new URL(apiUrl).origin;

    const handleMessage = (event: MessageEvent) => {
      if (event.origin !== apiOrigin) return;
      if (event.data?.type === 'GOOGLE_AUTH_SUCCESS') {
        user.value = event.data.payload;
        window.removeEventListener('message', handleMessage);
      }
    };
    window.addEventListener('message', handleMessage);
  };

  const logout = async () => {
    await $fetch(`${apiUrl}/api/logout`, { credentials: 'include' });
    user.value = null;
  };

  return { user, isLoggedIn, areUserDataFetched, isLoading, fetchUser, login, logout };
};
