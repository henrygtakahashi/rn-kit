---
name: new-expo-app
description: Create a new React Native (Expo) app from Henry's kit, with the standard stack, architecture, theme, lint rules, base components, and agent rules already in place. Use when asked to start, scaffold, or bootstrap a new mobile app or Expo project.
---

# New Expo app from the kit

This skill scaffolds a project and installs the kit into it. The kit lives in the `template/` folder next to this file: rules, theme, lint configuration, and the base code every project needs (design system components, providers, offline sync engine, test helpers). `CODE.md` next to this file describes every code file: why it exists, what it depends on, and what a project changes in it.

The kit holds no dependency versions on purpose: every package is installed fresh, so the project always starts on current versions.

Work through the steps in order. Run each command, read its output, and fix problems before moving on. When a step fails because a tool or library changed since this skill was written, solve it using the current documentation, then tell the user at the end so the kit can be updated.

Always use npm. Never use yarn, pnpm, or bun. Never install anything outside the project folder (SDKs, NDKs, global packages) without asking.

## 1. Collect the basics

Ask the user for anything not already given:

- App name, the folder to create it in, and the Android package (for example `dev.henry.myapp`).
- Whether the project is offline-first (default: yes).
- The identity values for `PROJECT_BRIEF.md`: what the app does, theme hue and surface chroma, font family, and the tabs (names and Phosphor icons). The user may choose to fill these in later.

## 2. Create the project

The Reusables CLI prompts three times: the project name, `Would you like to install dependencies? (Y/n)`, and `Would you like to initialize a Git repository? (Y/n)`. Answer `n` to both questions.

- The two yes/no prompts take a single keypress, with no Enter. An extra Enter answers the next prompt with "yes", and a "yes" to Git makes the CLI commit.
- The package-manager prompt appears only after a "yes" to installing, so it should never appear.

Run it unattended with `expect`, waiting for each prompt:

```
expect -c 'set timeout 300
  spawn npx @react-native-reusables/cli@latest init -t minimal-uniwind
  expect "name of your project"; sleep 1; send "<name>\r"
  expect "install dependencies"; sleep 1; send "n"
  expect "Git repository"; sleep 1; send "n"
  expect eof'
```

If `expect` is not available, ask the user to run the command and answer the prompts.

Check that the new folder has no `.git` and no foreign lockfile. Then, inside it:

```
rm -f .npmrc
npm install
npx expo install expo@latest --fix
```

The template ships a pnpm `.npmrc`; it must go before `npm install`.

Set `name` in `package.json`, and `name`, `slug`, `scheme`, and `android.package` in `app.json`. The CLI leaves the template's name in place.

## 3. Install the stack

```
npx expo install expo-sqlite drizzle-orm react-native-mmkv react-native-nitro-modules expo-secure-store expo-network expo-system-ui uuid react-native-get-random-values @tanstack/react-query zustand react-hook-form @hookform/resolvers zod @shopify/flash-list expo-image expo-haptics expo-linear-gradient @shopify/react-native-skia @expo/ui i18next react-i18next expo-localization phosphor-react-native react-native-reanimated react-native-gesture-handler react-native-keyboard-controller
```

```
npx expo install eslint eslint-config-expo eslint-plugin-better-tailwindcss eslint-plugin-i18next drizzle-kit babel-plugin-inline-import @types/node -- -D
```

`npx expo install` puts `eslint-config-expo` in `dependencies` even with `-- -D`. Move it:

```
npm install -D eslint-config-expo@"$(node -p "require('./package.json').dependencies['eslint-config-expo']")"
```

Use the stable Drizzle release that `npx expo install` picks, not the `@rc` tag some guides show. If the project is not offline-first, tell the user which kit files depend on the database (`CODE.md`) and ask how to proceed.

Then:

- Remove the template's icon library: `npm uninstall lucide-react-native`.
- npm 11 skips install scripts not covered by `allowScripts`: `@shopify/react-native-skia`, `esbuild`, `unrs-resolver`, and `fsevents`. None is needed for an Android build, and `drizzle-kit` works without the esbuild one. Before an iOS build, ask the user whether to allow the Skia postinstall.

## 4. Copy the kit

1. Delete the template's own code that the kit replaces: the `app/`, `components/`, and `lib/` folders at the root (the kit's code lives in `src/`).
2. Copy everything in `template/` into the project root, keeping paths. This replaces the template's `tsconfig.json`, `babel.config.js`, `metro.config.js`, `components.json`, and `global.css`, and adds the ESLint config. `CODE.md` lists every file.
3. If the project already had a `.claude/settings.json`, merge the `hooks` entry instead of overwriting it.
4. Generate the first migration, which the database gate and the test helper import:

   ```
   npx drizzle-kit generate
   ```

5. Merge two changes into `app.json`, keeping everything else:
   - Add `"reactCompiler": true` to the existing `experiments` object.
   - In `plugins`, replace only the existing `expo-splash-screen` entry with the one below. Keep every other plugin (`expo-router`, `expo-status-bar`, and the ones step 3 added).

   ```json
   ["expo-splash-screen", {
     "image": "./assets/images/splash.png",
     "resizeMode": "contain",
     "backgroundColor": "#f1f4f6",
     "dark": { "image": "./assets/images/splash.png", "backgroundColor": "#0c0d0f" }
   }]
   ```

   The two colors are the `background` token of the default theme. A project that changes the theme hue recomputes them.

6. Add `android/` and `ios/` to `.gitignore`.
7. Set the scripts in `package.json`:

   ```json
   {
     "lint": "uniwind generate-artifacts --css ./global.css && eslint . --max-warnings 0",
     "typecheck": "tsc --noEmit && tsc --noEmit -p tsconfig.test.json",
     "test": "node --disable-warning=MODULE_TYPELESS_PACKAGE_JSON --import ./scripts/test-hooks.mjs --test \"src/**/__tests__/**/*.test.ts\"",
     "check": "npm run lint && npm run typecheck && npm test"
   }
   ```

The template's `.prettierrc` orders classes differently from the lint. Run `eslint --fix` after Prettier.

## 5. Wire the app

The kit code is complete; the project only connects it.

- **Tabs**: create `src/app/(tabs)/_layout.tsx` with the tabs from the brief and the kit's tab bar. Route names, labels, and icons are per project:

  ```tsx
  import { FloatingTabBar } from '@/shared/ui/floating-tab-bar';
  import { Tabs, type BottomTabBarProps } from 'expo-router/tabs'; // `Tabs` from 'expo-router' is deprecated
  import { GearSix, House, Note } from 'phosphor-react-native';
  import { useTranslation } from 'react-i18next';

  const TAB_ICONS = { index: House, notes: Note, settings: GearSix };

  function renderTabBar(props: BottomTabBarProps) {
    return <FloatingTabBar {...props} icons={TAB_ICONS} />;
  }

  export default function TabsLayout() {
    const { t } = useTranslation();
    return (
      <Tabs tabBar={renderTabBar} screenOptions={{ headerShown: false, animation: 'fade' }}>
        <Tabs.Screen name="index" options={{ title: t('tabs.home') }} />
        …
      </Tabs>
    );
  }
  ```

  The bar reads each tab's label from `options.title`, so titles always come from `t()`; the lint rejects literals there. The default transition is `reference`. Pass `transition` only when the brief asks for another preset.

- **Home screen**: one screen per tab, built from `shared/ui` (`Screen`, `ScreenHeader`, `EmptyState`, …), with every string in both locale files.
- **Database**: add the project's tables to `src/core/db/schema.ts` (spread `syncableColumns()` into syncable ones), register them in `src/core/sync/syncable-tables.ts`, and run `npx drizzle-kit generate` again.

### Adding Reusables components later

```
npx @react-native-reusables/cli@latest add <component> -y
```

`-y` does not answer overwrite prompts: the CLI stops at the first file that already exists (usually `text.tsx`) and skips the remaining components without saying so. Add one component at a time, and check that the output says `Created` for it. If it asks to overwrite a kit file, answer no; the kit version is the adapted one.

Adapt every new component to the rules: Phosphor through `Icon`, the text scale, token colors, no shadows, and `placeholderTextColorClassName` instead of `placeholderClassName`. The lint reports most of it.

## 6. Fill in the brief

Write the answers from step 1 into `PROJECT_BRIEF.md`. If the user gave a theme hue and chroma, apply them to the neutral tokens in `global.css` as its header comment describes, recompute the splash colors, and measure the contrast of the text pairs again. If base features were named, set the same list in `BASE_FEATURES` in `eslint.config.js`.

Leave unanswered fields empty. Do not invent values.

## 7. Verify

1. `npx @react-native-reusables/cli@latest doctor`, and fix what it reports.
2. `npm run check`, until it passes with no errors and no warnings. Fix the code, not the rules.
3. List the Android SDK folder (`$ANDROID_HOME`, usually `~/Library/Android/sdk`). Build with `npx expo run:android`. List it again afterwards and tell the user if anything was installed.
4. If the development build hangs on the splash, run `adb reverse tcp:8081 tcp:8081` and open `<scheme>://expo-development-client/?url=http%3A%2F%2Flocalhost%3A8081`.
5. Follow "Verification before finishing" in `DESIGN.md` on the user's phone, including the frame-by-frame checks of the tab bar and of a stack push and pop.

If no device is connected, say so and ask the user. Do not report the app as working without having seen it run.

## 8. Hand over

- Initialize git if needed. When the user confirms, commit the scaffold as `chore: scaffold app from kit`.
- Report: what was installed (with the Expo SDK version), what was wired, what is still empty in the brief, anything installed outside the project, and every step that needed a workaround because a tool or library behaved differently from this skill.
