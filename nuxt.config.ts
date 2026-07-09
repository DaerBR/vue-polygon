import tailwindcss from '@tailwindcss/vite';

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  app: {
    head: {
      title: 'Nuxt Полігон',
      link: [
        { rel: 'icon', type: 'image/svg+xml', href: '/favicon.png' },
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Roboto:ital,wght@0,100..900;1,100..900&display=swap',
        },
      ],
    },
  },
  devServer: {
    port: 5174,
  },
  css: ['./app/assets/css/main.css'],
  vite: {
    plugins: [tailwindcss()],
  },
  modules: ['@primevue/nuxt-module'],
  primevue: {/* Configuration */},
});
