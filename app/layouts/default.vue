<script setup lang="ts">
const { user, isLoggedIn, areUserDataFetched, isLoading, fetchUser, login, logout } = useAuth();

onMounted(() => {
  if (!areUserDataFetched.value) {
    fetchUser();
  }
});
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
</template>
