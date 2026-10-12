// Enforces the rules in AGENTS.md and DESIGN.md.
// Base: https://docs.expo.dev/guides/using-eslint/
// eslint-config-expo (SDK 55+) already includes the React Compiler rules.
const fs = require('node:fs');
const path = require('node:path');
const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');
const betterTailwind = require('eslint-plugin-better-tailwindcss');
const {
  getDefaultAttributes,
  getDefaultCallees,
} = require('eslint-plugin-better-tailwindcss/api/defaults');
const i18next = require('eslint-plugin-i18next');

// Theme colors exist for the lint only after Uniwind generates its CSS.
// Without it, a direct `eslint` call (an editor, a wrapper, a hook) reports
// every theme color as unknown. Fail with the fix instead.
const uniwindCss = path.join(__dirname, 'node_modules', 'uniwind', 'uniwind.css');
if (fs.existsSync(uniwindCss) && !fs.readFileSync(uniwindCss, 'utf8').includes('--color-primary:')) {
  throw new Error(
    'Uniwind artifacts are missing. Run `npx uniwind generate-artifacts --css ./global.css` first (`npm run lint` does it).',
  );
}

// Features that any other feature may import from, for example ['session'].
// Keep in sync with "Base features" in PROJECT_BRIEF.md.
const BASE_FEATURES = [];

const SOURCE = ['src/**/*.{ts,tsx}'];

// ---------------------------------------------------------------------------
// Import restrictions
// ---------------------------------------------------------------------------

// React's memoization and FC imports are restricted in no-restricted-syntax
// instead, because `importNames` here would also reject `import * as React`.
const RESTRICTED_PATHS = [
  { name: 'lucide-react-native', message: 'Icons come from phosphor-react-native only.' },
  { name: '@expo/vector-icons', message: 'Icons come from phosphor-react-native only.' },
  { name: 'nativewind', message: 'The styling engine is Uniwind, not NativeWind.' },
];

const BASE_PATTERNS = [
  {
    regex: '^\\.\\./\\.\\./',
    message: 'Do not climb more than one level with relative imports. Use the @/ alias.',
  },
];

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// Flat config replaces rule options instead of merging them, so every block
// that sets this rule must carry the full list.
const restrictImports = (extraPatterns = [], extraPaths = []) => [
  'error',
  {
    paths: [...RESTRICTED_PATHS, ...extraPaths],
    patterns: [...BASE_PATTERNS, ...extraPatterns],
  },
];

const featuresDir = path.join(__dirname, 'src', 'features');
const featureNames = fs.existsSync(featuresDir)
  ? fs
      .readdirSync(featuresDir, { withFileTypes: true })
      .filter((entry) => entry.isDirectory())
      .map((entry) => entry.name)
  : [];

// One set of blocks per feature, so a feature may import itself and the base
// features, and nothing else under features/.
const featureBoundaries = featureNames.flatMap((feature) => {
  const self = escapeRegex(feature);
  const allowed = [feature, ...BASE_FEATURES].map(escapeRegex).join('|');
  const own = `^(\\.\\./|@/features/${self}/)`;

  const general = [
    {
      regex: `^@/features/(?!(?:${allowed})/)`,
      message:
        'Features do not import other features. Compose them in app/, or move shared logic to shared/ or its own feature.',
    },
    { regex: '^@/app/', message: 'Features do not import from app/.' },
  ];

  return [
    {
      files: [`src/features/${feature}/**/*.{ts,tsx}`],
      rules: { 'no-restricted-imports': restrictImports(general) },
    },
    {
      // Files at the feature root could reach a sibling feature with "../".
      files: [`src/features/${feature}/*.{ts,tsx}`],
      rules: {
        'no-restricted-imports': restrictImports([
          ...general,
          { regex: '^\\.\\./', message: 'Do not import outside the feature with relative paths.' },
        ]),
      },
    },
    {
      files: [`src/features/${feature}/ui/**/*.{ts,tsx}`],
      rules: {
        'no-restricted-imports': restrictImports([
          ...general,
          {
            regex: `${own}(data|sync)/`,
            message: 'ui/ does not import data/ or sync/. Go through a hook in hooks/.',
          },
          {
            regex: '^@/core/(db|api|sync)/',
            message: 'Components do not touch the database, the API, or sync. Go through a hook.',
          },
        ]),
      },
    },
    {
      files: [`src/features/${feature}/hooks/**/*.{ts,tsx}`],
      rules: {
        'no-restricted-imports': restrictImports([
          ...general,
          { regex: `${own}ui/`, message: 'hooks/ does not import ui/.' },
        ]),
      },
    },
    {
      files: [`src/features/${feature}/model/**/*.{ts,tsx}`],
      rules: {
        'no-restricted-imports': restrictImports([
          ...general,
          {
            regex: '^(react|react-native|expo-router)($|/)',
            message: 'model/ holds plain business rules. It does not import React.',
          },
          { regex: `${own}(ui|hooks)/`, message: 'model/ does not import ui/ or hooks/.' },
        ]),
      },
    },
    {
      files: [`src/features/${feature}/{data,sync}/**/*.{ts,tsx}`],
      rules: {
        'no-restricted-imports': restrictImports([
          ...general,
          { regex: `${own}(ui|hooks)/`, message: 'data/ and sync/ do not import ui/ or hooks/.' },
        ]),
      },
    },
  ];
});

// ---------------------------------------------------------------------------
// Class restrictions (DESIGN.md)
// ---------------------------------------------------------------------------

const PALETTE =
  'slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose';
const COLOR_UTILITIES =
  'bg|text|border|ring|fill|stroke|outline|decoration|divide|placeholder|caret|accent';

const RESTRICTED_CLASSES = [
  {
    pattern: '\\[([^\\[\\]]*?)\\](?!:)',
    message: 'No arbitrary values. Use a token from global.css, or ask before adding one.',
  },
  {
    pattern: `^(.*:)?(${COLOR_UTILITIES})-(${PALETTE})-\\d{2,3}(\\/\\d+)?$`,
    message: 'No palette colors. Use a semantic token such as bg-card or text-muted-foreground.',
  },
  {
    pattern: `^(.*:)?(${COLOR_UTILITIES})-(black|white)(\\/\\d+)?$`,
    message: 'No black or white. Use a semantic token.',
  },
  {
    pattern: '^(.*:)?text-(xs|sm|base|lg|xl|[2-9]xl)$',
    message: 'Use the text scale: text-caption, text-body, text-subtitle, text-title, text-display.',
  },
  {
    // shadow-none and blur-none remove an effect, so they are allowed.
    pattern:
      '^(.*:)?(shadow|drop-shadow|blur|backdrop-blur)(-(?!none$).+)?$|^(.*:)?bg-(gradient|linear|radial|conic)(-.+)?$',
    message:
      'No shadows, gradients, or blur outside the hero area. In a hero, use expo-linear-gradient or Skia.',
  },
];

const tailwindRules = (
  betterTailwind.configs['recommended-error'] ?? betterTailwind.configs.recommended
).rules;

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

module.exports = defineConfig([
  expoConfig,
  // Rules cannot be switched off from inside a file. A leftover
  // `eslint-disable` comment is reported as a warning, so it fails through
  // --max-warnings 0 (the lint script and the hook both use it).
  { linterOptions: { noInlineConfig: true } },
  {
    ignores: [
      'dist/**',
      '.expo/**',
      'android/**',
      'ios/**',
      '.claude/**',
      'scripts/**',
      '*.config.{js,ts}',
    ],
  },
  {
    files: SOURCE,
    rules: {
      'no-restricted-imports': restrictImports(),
      'no-restricted-syntax': [
        'error',
        {
          selector: 'ExportAllDeclaration',
          message: 'No barrel re-exports. Import from the file that defines the symbol.',
        },
        {
          // Local re-exports only: Expo Router requires `export { ErrorBoundary } from 'expo-router'`.
          selector: "ExportNamedDeclaration[source.value=/^(\\.|@\\/)/]",
          message: 'No barrel re-exports. Import from the file that defines the symbol.',
        },
        {
          // Tab labels and headers come from screen options, which the i18n rule does not see.
          selector:
            "JSXAttribute[name.name='options'] Property[key.name=/^(title|headerTitle|headerBackTitle|tabBarLabel|tabBarAccessibilityLabel)$/] > :matches(Literal, TemplateLiteral)",
          message: 'Screen titles and tab labels are user-visible. Use t().',
        },
        {
          selector:
            "ImportDeclaration[source.value='react'] ImportSpecifier[imported.name=/^(useMemo|useCallback|memo)$/]",
          message: 'The React Compiler memoizes for you. Remove manual memoization.',
        },
        {
          selector:
            "ImportDeclaration[source.value='react'] ImportSpecifier[imported.name=/^(FC|FunctionComponent)$/]",
          message: 'Type props with `type` and a plain function. Do not use React.FC.',
        },
        {
          selector:
            "MemberExpression[object.name='React'][property.name=/^(memo|useMemo|useCallback)$/]",
          message: 'The React Compiler memoizes for you. Remove manual memoization.',
        },
        {
          selector: "TSQualifiedName[left.name='React'][right.name=/^(FC|FunctionComponent)$/]",
          message: 'Type props with `type` and a plain function. Do not use React.FC.',
        },
      ],
      'no-console': 'error',
      'no-empty': ['error', { allowEmptyCatch: false }],
      'react/no-unstable-nested-components': 'error',
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/ban-ts-comment': 'error',
      '@typescript-eslint/consistent-type-definitions': ['error', 'type'],
      // `as const` stays allowed. Test doubles may cast (see the block below).
      '@typescript-eslint/consistent-type-assertions': ['error', { assertionStyle: 'never' }],
    },
  },
  {
    files: ['src/**/__tests__/**/*.{ts,tsx}'],
    rules: { '@typescript-eslint/consistent-type-assertions': 'off' },
  },
  {
    // Module augmentation (for example typed i18next keys) requires `interface`.
    files: ['src/**/*.d.ts'],
    rules: { '@typescript-eslint/consistent-type-definitions': 'off' },
  },
  {
    // Vendored Reusables components in shared/ui may be longer.
    files: ['src/**/*.tsx'],
    ignores: ['src/shared/ui/**'],
    rules: {
      'max-lines': ['error', { max: 150, skipBlankLines: true, skipComments: true }],
    },
  },
  {
    files: ['src/**/*.tsx'],
    ignores: ['src/**/__tests__/**'],
    plugins: { i18next },
    rules: {
      // Catches text in JSX expressions and in user-facing attributes, and
      // does not let emoji through (emoji are not icons, see DESIGN.md).
      'i18next/no-literal-string': [
        'error',
        {
          mode: 'jsx-only',
          'should-validate-template': true,
          'jsx-attributes': {
            include: [
              '^placeholder$',
              '^accessibilityLabel$',
              '^accessibilityHint$',
              '^title$',
              '^aria-label$',
              '^description$',
              '^label$',
              '^message$',
            ],
          },
          // Only numbers, symbols, and spaces are allowed. All-caps words
          // (SAVE, OK) are user-visible text too.
          words: { exclude: ['[0-9!-/:-@[-`{-~\\s—–·•…]+'] },
          callees: {
            exclude: [
              'i18n(ext)?',
              't',
              'require',
              'emit',
              'navigate',
              'includes',
              'indexOf',
              'startsWith',
              'endsWith',
            ],
          },
        },
      ],
    },
  },
  {
    files: SOURCE,
    plugins: { 'better-tailwindcss': betterTailwind },
    // Theme colors are known only after `uniwind generate-artifacts` has run.
    // The `lint` script runs it first; see SKILL.md.
    settings: {
      'better-tailwindcss': {
        entryPoint: 'global.css',
        // Uniwind has many *ClassName props, and Reusables puts classes in Platform.select.
        attributes: [...getDefaultAttributes(), '^(?:class|className|.+ClassName)$'],
        callees: [...getDefaultCallees(), ['^Platform\\.select$', [{ match: 'objectValues' }]]],
      },
    },
    rules: {
      ...tailwindRules,
      'better-tailwindcss/enforce-consistent-line-wrapping': 'off',
      'better-tailwindcss/no-restricted-classes': ['error', { restrict: RESTRICTED_CLASSES }],
    },
  },

  // Layer boundaries. Order matters: the last matching block wins.
  {
    files: ['src/app/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': restrictImports([
        {
          regex: '^@/core/(?!providers/)',
          message: 'Routes import from features, shared, and core/providers only.',
        },
      ]),
    },
  },
  {
    files: ['src/shared/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': restrictImports([
        {
          regex: '^@/(features|core|app)/',
          message: 'shared/ knows nothing about features, core, or routes.',
        },
      ]),
    },
  },
  {
    files: ['src/core/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': restrictImports([
        { regex: '^@/(features|app)/', message: 'core/ does not import features or routes.' },
        {
          regex: '^@/shared/(?!(utils|types)/)',
          message: 'core/ may import only shared/utils and shared/types.',
        },
      ]),
    },
  },
  ...featureBoundaries,
]);
