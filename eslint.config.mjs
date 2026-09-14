// @ts-check
import { configs, plugins } from 'eslint-config-airbnb-extended';
import stylistic from '@stylistic/eslint-plugin';
import withNuxt from './.nuxt/eslint.config.mjs';

// Nuxt only wires type-aware TypeScript parsing into its own generated
// project references (app/server/shared/node); stray root-level config
// files like drizzle.config.ts are deliberately left out of that. Airbnb's
// TypeScript config enables type-aware parsing for every file, so it must
// skip the same files Nuxt does, or typescript-eslint's project service
// fails to find a project for them. (Extending Nuxt's own allowDefaultProject
// list instead isn't possible: ESLint's flat-config merge turns two configs'
// array values for the same parserOptions key into a corrupted plain object.)
const rootConfigFilesOutsideNuxtProjects = ['drizzle.config.ts'];
const airbnbTypeAwareConfigs = [plugins.typescriptEslint, ...configs.base.typescript].map(
  (config) => ({
    ...config,
    ignores: [...(config.ignores ?? []), ...rootConfigFilesOutsideNuxtProjects],
  }),
);

export default withNuxt(
  // Airbnb-style base rules: register the plugins the rule sets below need,
  // then layer the rule sets themselves on top of Nuxt's own generated config.
  plugins.stylistic,
  plugins.importX,
  ...configs.base.recommended,
  ...airbnbTypeAwareConfigs,
  {
    // Airbnb's own @stylistic plugin registration only covers js/ts files,
    // so .vue files need it registered separately to use @stylistic rules
    // (e.g. padding-line-between-statements below) inside their <script>.
    files: ['**/*.vue'],
    plugins: { '@stylistic': stylistic },
  },
  {
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
      // Nuxt's auto-import scans composables/utils for named exports, so
      // forcing a default export here would break auto-import by name.
      'import-x/prefer-default-export': 'off',
      '@stylistic/max-len': 'off',
      // Airbnb only requires a blank line after directives (e.g. "use
      // strict"); also require one before `return` for readability.
      '@stylistic/padding-line-between-statements': [
        'error',
        {
          blankLine: 'always',
          prev: 'directive',
          next: '*',
        },
        {
          blankLine: 'any',
          prev: 'directive',
          next: 'directive',
        },
        {
          blankLine: 'always',
          prev: '*',
          next: 'return',
        },
      ],
    },
  },
  {
    // eslint.config.mjs is executed directly by Node, so the relative
    // import of the Nuxt-generated config must keep its .mjs extension and
    // its default-exported `withNuxt` name, both of which the Airbnb import
    // rules otherwise forbid.
    files: ['eslint.config.mjs'],
    rules: {
      'import-x/extensions': 'off',
      'import-x/no-named-as-default': 'off',
    },
  },
);
