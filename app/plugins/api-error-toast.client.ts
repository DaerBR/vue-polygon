import { FetchError } from 'ofetch';

export default defineNuxtPlugin((nuxtApp) => {
  const toast = useToast();

  nuxtApp.hook('vue:error', (error) => {
    if (!(error instanceof FetchError)) return;

    const message = (error.data as { message?: string } | undefined)?.message ?? 'Не вдалося виконати запит';

    toast.add({
      severity: 'error',
      summary: 'Помилка',
      detail: message,
      life: 5000,
    });
  });
});
