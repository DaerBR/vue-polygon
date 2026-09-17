export default defineNuxtRouteMiddleware(async () => {
  if (import.meta.server) {
    return undefined;
  }

  const { isLoggedIn, areUserDataFetched, fetchUser } = useAuth();

  if (!areUserDataFetched.value) {
    await fetchUser();
  }

  if (!isLoggedIn.value) {
    return navigateTo('/');
  }

  return undefined;
});
