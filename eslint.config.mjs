// @ts-check
import withNuxt from './.nuxt/eslint.config.mjs';

export default withNuxt({
  rules: {
    // Optional props whose absence is meaningful (e.g. "no initial value yet")
    // shouldn't be forced into a redundant `default: undefined`.
    'vue/require-default-prop': 'off',
    // Prefer explicit self-closing on void elements (<img />) over the
    // Vue-ecosystem default of <img>, matching JSX convention.
    'vue/html-self-closing': [
      'error',
      {
        html: { void: 'always', normal: 'always', component: 'always' },
        svg: 'always',
        math: 'always',
      },
    ],
  },
});