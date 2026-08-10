<script setup lang="ts">
import Toast from 'primevue/toast';

const { user, isLoggedIn, areUserDataFetched, isLoading, fetchUser, login, logout } = useAuth();

onMounted(() => {
  if (!areUserDataFetched.value) {
    fetchUser();
  }
});

const toastPt = {
  root: { class: 'fixed top-4 right-4 z-50 flex flex-col gap-3 w-full max-w-100' },
  message: ({ instance }: { instance: { message?: { severity?: string } } }) => ({
    class: [
      'flex items-start gap-3 p-4 rounded shadow-md border bg-white',
      instance.message?.severity === 'error' && 'border-dual-red-600',
      instance.message?.severity === 'success' && 'border-dual-green-600',
      (!instance.message?.severity || instance.message?.severity === 'info') && 'border-dual-orange-300',
    ],
  }),
  messageContent: { class: 'flex items-start gap-3 w-full' },
  summary: { class: 'text-paragraph-s font-semibold text-dual-grey-900' },
  detail: { class: 'text-paragraph-xs text-dual-grey-600 mt-1' },
  closeButton: {
    class: 'ml-auto p-1 rounded text-dual-grey-400 hover:text-dual-grey-700 bg-transparent border-none cursor-pointer shrink-0',
  },
  closeIcon: { class: 'w-3.5 h-3.5' },
};
</script>

<template>
  <header class="sticky top-0 z-50">
    <div
      class="box-border py-3 px-9 h-20 fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-300 flex items-center justify-between bg-white rounded z-3"
    >
      <div class="flex items-center height-full">
        <NuxtLink to="/">
          <div
            class="bg-[url('/logo-images/squirrel.png')] h-16 w-16 max-sm:h-12 max-sm:w-12 bg-contain bg-no-repeat bg-center rounded-full border-2 border-[#fda477] mr-4"
          />
        </NuxtLink>
        <NuxtLink to="/categories">
          <div class="font-bold mr-6 no-underline text-dual-orange-500 hover:underline text-1">Всі категорії</div>
        </NuxtLink>
        <div class="w-[300px] max-md:w-[230px] max-sm:hidden">
          <SearchAutocomplete />
        </div>
      </div>
      <div class="flex items-center gap-3">
        <template v-if="isLoggedIn">
          <CommonButton @click="navigateTo('/create-recipe')" class="mr-4">Створити рецепт</CommonButton>
          <button
            class="p-2.5 bg-transparent border-none cursor-pointer text-dual-orange-600 hover:text-dual-orange-500"
            type="button"
            aria-label="Вийти"
            @click="logout"
          >
            <IconLogout :size="18" />
          </button>
        </template>
        <CommonButton v-else-if="!isLoading" variant="primary" @click="login">Вхід</CommonButton>
      </div>
    </div>
  </header>
  <div
    class="max-w-300 mt-22.5 mx-auto mb-0 py-6 px-9 min-h-screen bg-white rounded box-border relative max-sm:py-2 max-sm:px-3 max-sm:mt-29.5"
  >
    <slot />
  </div>
  <Toast :unstyled="true" :pt="toastPt" />
</template>
