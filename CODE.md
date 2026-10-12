# Kit code

Every code and configuration file in `template/`, besides the rule files. They were extracted from the second test app (2026-10-12) and verified there and alone in an empty project. Paths are relative to the project root; `SKILL.md` step 4 copies the tree into a new project as is.

## How everything was verified

Three checks apply to every file below. Each row also lists checks specific to that file.

- **App:** the 58 *verbatim* files are byte-identical to the files in `kit-test-2` (checked with `cmp`). There, `npm run check` passes: lint with `--max-warnings 0`, both typechecks, and 24 tests. `npx @react-native-reusables/cli@latest doctor` reports `All checks passed`.
- **Standalone:** this folder alone (all 62 files, including the 4 *starters*) was copied into an empty scratch project. That project had only the kit's root configuration (`package.json`, `eslint.config.js`, `global.css`, `app.json`), with `node_modules` linked from the app.
  - `npx drizzle-kit generate` produced the sync tables.
  - `npm run lint`: no issues.
  - `npm run typecheck`: no errors, app and tests.
  - `npm test`: 12 of 12 pass.

  So the kit files compile and pass together with no project code.
- **Device:** UI files ran on a Samsung SM-S931B (Android 17) in a development build, in light and dark mode. Recordings and frame strips are in `kit-test-2/screenshots/` (`tabbar-presets/`, `flash/`, and the earlier screen captures).

**Kinds of file:**
- **Verbatim:** ship as is.
- **Starter:** the project is expected to edit it. 4 files: `src/core/db/schema.ts`, `src/core/sync/syncable-tables.ts`, `src/core/i18n/locales/en.ts`, `src/core/i18n/locales/pt-BR.ts`. In the app these same files hold the notes tables and strings.

**Packages** are all installed by SKILL.md steps 2–3 (template plus `npx expo install` list), except `expo-system-ui` and `@rn-primitives/*`, which come with the Reusables template. Nothing here needs a package outside that set.

## Root configuration

| File | Why it is in the kit | Depends on | Project must change | Verified |
|---|---|---|---|---|
| `tsconfig.json` | Exact content TypeScript 6 needs: no `baseUrl` (TS5101), the `@/global.css` path listed before `@/*`, `__tests__` excluded from the app build. | `expo/tsconfig.base` | Nothing. | App, standalone. |
| `tsconfig.test.json` | Typechecks tests with `types: ["node"]` so Node globals never reach app code. Uses `src/**/__tests__/**/*`; an include ending in `/**` fails with TS5010. | `@types/node`, `tsconfig.json` | Nothing. | App, standalone. |
| `scripts/test-hooks.mjs` | Lets `node --test` resolve `@/` imports and extensionless TypeScript files. | Node 22.15+ (`module.registerHooks`) | Nothing. | App, standalone (all tests load through it). |
| `babel.config.js` | Inlines the Drizzle `.sql` migrations. | `babel-preset-expo`, `babel-plugin-inline-import` | Nothing. | App build. |
| `metro.config.js` | Adds `sql` to `sourceExts` and wraps the config with Uniwind. | `expo/metro-config`, `uniwind/metro` | Nothing. | App build, Metro. |
| `drizzle.config.ts` | Points Drizzle Kit at both schema files and the migrations folder that `use-database-migrations.ts` imports. | `drizzle-kit`, `src/core/db/sync-schema.ts`, `src/core/db/schema.ts` | Nothing. | App: `generate` reports "No schema changes". Standalone: generates the sync tables. |
| `components.json` | Aliases that `reusables add` and `doctor` need (`@/shared/ui`, `@/shared/utils`, `@/shared/utils/utils`, `@/shared/hooks`), with `iconLibrary` removed so `add` never brings Lucide. | Reusables CLI | Nothing. | `doctor` passes; `add card badge` wrote to `src/shared/ui`. |

## `src/app`

| File | Why | Depends on | Project must change | Verified |
|---|---|---|---|---|
| `src/app/_layout.tsx` | Gets the order right: `react-native-get-random-values` first, then `global.css`, providers, navigation theme from tokens, migration gate with loading and error views, `PortalHost`, and the `ErrorBoundary` re-export. | `app-providers`, `database-gate`, `use-navigation-theme`, `error-state`, `screen`, `@rn-primitives/portal`, `expo-router`, `expo-status-bar`, `react-i18next` | Nothing, unless the project adds stack screen options. | App, device. |
| `src/app/+not-found.tsx` | Every Expo Router app has one; this version uses the kit components and i18n keys. | `button`, `empty-state`, `screen`, `text`, `common.*` locale keys | Nothing. | App, device (`not-found-*.png`). |

## `src/shared/ui`

| File | Why | Depends on | Project must change | Verified |
|---|---|---|---|---|
| `floating-tab-bar.tsx` | The default navigation from DESIGN.md. Takes `icons` (keyed by route name) and `transition` (preset name or preset object). Hides with the keyboard, light haptic on change, forces `instant` when reduce motion is on. | `floating-tab`, `floating-tab-bar.presets`, `expo-router/tabs`, `expo-haptics`, `react-native-keyboard-controller`, `react-native-reanimated` | Nothing. Wire it in `(tabs)/_layout.tsx` (snippet below). | Device: four presets × three transitions, reduce motion, pt-BR at 1.3. |
| `floating-tab.tsx` | One pill: width and fade driven by the preset. Measures the expanded width in an unclipped `w-96` box (measuring inside the pill loops forever) and rounds with `Math.round` (sub-pixel snap). The label starts exactly at the 48 dp collapsed edge, so no sliver shows before the pill grows. Spring overshoot is always clamped. | `floating-tab-bar.presets`, `icon`, `text`, `react-native-reanimated`, `phosphor-react-native` | Nothing. | Device: idle recordings emit 1–2 frames in 2 s (no redraw loop); 0 px overshoot; end padding never below 17 px (nominal 18), so no overflow; nothing changes after the motion ends. |
| `floating-tab-bar.presets.ts` | The transition presets as plain data: `reference` (default, fitted to Gradient Weather), `smooth` (one 250 ms ease-out), `spring` (critically damped, clamped), `instant`. Types: `TabBarTransition`, `MotionSpec`, `TabBarTransitionName`, `BezierCurve`. | None | Nothing. A project adds a preset by defining a `TabBarTransition` at module level and passing it to `transition`. | Unit test; device. `reference` vs. the reference video: RMS difference 0.03–0.08 on new width, old width, new fade and old fade. |
| `__tests__/floating-tab-bar.presets.test.ts` | Guards the preset data: name resolution, reduce motion → `instant`, valid curves, no damping below 1, and the leaving pill fading before it collapses. | `floating-tab-bar.presets` | Nothing. | App, standalone. |
| `text.tsx` | Reusables `Text` with the kit's five variants and the color resolution from DESIGN.md (className > variant color > context color > `text-foreground`). The shipped version lets a parent context override the caption color. | `utils.ts` (`cn`), `@rn-primitives/slot`, `class-variance-authority` | Nothing. | Device: captions in cards are muted. |
| `icon.tsx` | The Reusables `Icon` wrapper adapted to Phosphor, limited to sizes 16/20/24 and weights regular/fill/bold. | `text` (context), `utils.ts`, `phosphor-react-native`, `uniwind` | Nothing. | App, device. |
| `button.tsx` | Pills, `text-body`, no shadows, token colors only, visible pressed state. The generated file fails the lint (`shadow-sm`, `text-white`, `text-sm`). | `text`, `utils.ts`, `class-variance-authority` | Nothing. | App, device. |
| `input.tsx`, `textarea.tsx` | `placeholderTextColorClassName="accent-muted-foreground"` (the generated `placeholderClassName` does not exist in Uniwind), plus cursor and selection colors, `bg-secondary` surface, 48 dp height, and an `isInvalid` state. | `utils.ts` | Nothing. | Typecheck; device (form screens). |
| `label.tsx` | Generated file with web-only classes and `text-sm`; adapted to `text-caption`. | `utils.ts`, `@rn-primitives/label` | Nothing. Note: tapping the label does not focus its field (see "Left out / known gaps"). | App, device. |
| `card.tsx` | Tone-only separation (no border, no shadow), `p-5`, and no text color context (DESIGN.md "Text color resolution"). | `text`, `utils.ts` | Nothing. | Device. |
| `skeleton.tsx` | Static on purpose: DESIGN.md "Motion" rules out the generated 1000 ms looping pulse. | `utils.ts` | Nothing. | Device (`notes-loading-*.png`). |
| `screen.tsx` | Background, top safe area, 16 margin on every screen. | `utils.ts` | Nothing. | Device. |
| `screen-header.tsx` | Page title, optional trailing action, and the offline strip under the title, which DESIGN.md requires on every data screen. | `offline-notice`, `text` | Nothing. | Device. |
| `offline-notice.tsx` | The quiet offline strip from DESIGN.md. | `use-network-status`, `icon`, `text`, `react-i18next`, key `common.offline` | Nothing. | Device: airplane mode on and off. |
| `empty-state.tsx` | Required empty state: icon, title, text, and an action passed as children. | `icon`, `text` | Nothing. | Device. |
| `error-state.tsx` | Required error state with a retry action. | `button`, `icon`, `text` | Nothing. | Device. |
| `sync-status-badge.tsx` | Every syncable record shows pending/synced/failed with an icon and text. | `shared/types/sync`, `icon`, `text`, keys `common.syncStatus.*` | Nothing. | Device (pending); synced/failed only in tests. |
| `form-message.tsx` | The error line below a field. | `text` | Nothing. | Device (validation screens). |
| `list-separator.tsx` | Virtualized lists cannot use `gap`; 8 between cards. | — | Nothing. | Device. |

## `src/shared` (other)

| File | Why | Depends on | Project must change | Verified |
|---|---|---|---|---|
| `utils/utils.ts` | `cn` with the `font-size` class group; plain `twMerge` drops the text size when a color class is present. | `clsx`, `tailwind-merge` | Nothing, unless the text scale names change in `global.css`. | Device (sizes render). |
| `utils/theme.ts` | The exact shape `doctor` checks: `NAV_THEME` plus the 13 token names, kept as a map to CSS variables, and a pure `buildNavigationTheme()`. | `expo-router/react-navigation` | Nothing. | `doctor`. |
| `utils/id.ts` | The single UUID v7 helper AGENTS.md requires. | `uuid` (`react-native-get-random-values` loaded in `_layout.tsx`) | Nothing. | Tests check `version(id) === 7`; device database showed v7 ids. |
| `utils/format-date.ts` | Dates follow the app language, not the device region. | — | Nothing. | Device (pt-BR "12 de out. de 2026"). |
| `hooks/use-navigation-theme.ts` | Navigation colors read from the tokens, so native screens follow `global.css`. | `utils/theme`, `uniwind` | Nothing. | Device. |
| `hooks/use-network-status.ts` | Offline detection for the strip. Unknown counts as online, so the strip never flashes at startup. | `expo-network` | Nothing. | Device. |
| `constants/motion.ts` | DESIGN.md's default durations (150/200/300 ms), in the file DESIGN.md names. No kit file imports it any more (the tab bar has its own presets). | — | Replace with the brief's durations when given. | Lint, typecheck. |
| `types/css.d.ts` | TypeScript 6 checks side-effect imports (`import '@/global.css'`). | — | Nothing. | Typecheck. |
| `types/sync.ts` | `SyncStatus`, shared by `shared/ui` and `core`. | — | Nothing. | Typecheck, tests. |

## `src/core`

| File | Why | Depends on | Project must change | Verified |
|---|---|---|---|---|
| `providers/app-providers.tsx` | Gesture root, `SafeAreaListener` → `Uniwind.updateInsets` (without it `pt-safe` is 0), keyboard provider, i18n init, language following, and the system background. | `i18n`, `use-follow-device-language`, `use-system-background`, gesture handler, keyboard controller, safe-area context, `uniwind` | Nothing. | Device. |
| `providers/use-system-background.ts` | **White-flash fix.** Android paints the window behind the navigators from the native theme, fixed at launch. During a push or pop it showed as a strip on the right edge: `#303030`-ish gray in dark mode, and near-black in light mode after a theme switch. This hook paints it with `--color-background` and repaints on theme change. | `expo-system-ui`, `uniwind`, `monitoring` | Nothing. | Device: push and pop recorded in light and dark before and after. Before: right-edge strip up to 85 px wide, up to 199 levels off the screen color. After: no frame where the right edge differs from mid-screen, also after a full rebuild (`screenshots/flash/`). |
| `providers/use-follow-device-language.ts` | `cmd locale set-app-locales` (DESIGN.md's own check) and in-app language changes did nothing until restart; this follows `useLocales()`. | `i18n`, `expo-localization`, `i18next` | Nothing. | Device: en-US ↔ pt-BR switched with no restart. |
| `providers/database-gate.tsx`, `migration-runner.tsx`, `use-database-migrations.ts` | Migrations run before any screen reads. Providers cannot render `shared/ui`, so the root layout passes the loading view and an error view with a retry (remount by key). | `db/client`, `db/migrations/migrations` (generated), `monitoring`, `drizzle-orm/expo-sqlite/migrator` | Nothing; run `npx drizzle-kit generate` once so the migrations exist. | Device (fresh database created and migrated after the DB rename). |
| `db/client.ts` | One `openDatabaseSync` with the change listener `useLiveQuery` needs. Fixed name `app.db`; each app has its own sandbox. | `expo-sqlite`, `drizzle-orm/expo-sqlite` | Nothing. | Device. |
| `db/types.ts` | `AppDatabase` and `AppExecutor` (database or transaction, including `run`). | `drizzle-orm/expo-sqlite` | Nothing. | Typecheck, tests. |
| `db/sync-schema.ts` | `syncableColumns()` (id, timestamps, `deleted_at`, `sync_status`), the `outbox` and `sync_state` tables. Split from the project schema so the sync engine has no project code. | `shared/types/sync`, `drizzle-orm` | Nothing. | Tests; Drizzle Kit. |
| `db/schema.ts` | **Starter.** Where the project's tables go. | `db/sync-schema` (in the example) | Add tables; spread `syncableColumns()` into syncable ones. | Standalone. In the app it holds `notes`. |
| `db/__tests__/test-database.ts` | An expo-sqlite stand-in over `node:sqlite`, so the real Drizzle Expo driver and the project's real migrations run in `node --test`. Imports `drizzle-orm/expo-sqlite/driver`, because the package index loads `expo-sqlite`. | `node:sqlite`, `drizzle-orm/expo-sqlite/driver`, `db/types`, generated migrations | Nothing. | App (repository tests), standalone (sync tests). |
| `sync/outbox.ts` | Enqueue in the same transaction; send strictly in order; a failed or not-yet-due operation blocks later ones; exponential backoff with a cap; `failed` after the limit; manual retry; idempotency key per operation. | `db/sync-schema`, `db/types`, `sync/backoff`, `sync/transport`, `monitoring`, `shared/utils/id`, `drizzle-orm` | Nothing. Not run until a server exists (AGENTS.md). | Tests (5). |
| `sync/backoff.ts` | 2 s doubling to 5 min, 8 attempts. | — | Tune if the server needs it. | Tests. |
| `sync/transport.ts` | The only boundary to the unknown server. | `db/sync-schema` | Implement `SyncTransport` when a server exists. | Typecheck. |
| `sync/record-status.ts` | `createRecordStatusUpdater(tables)`: updates `sync_status` by `id` on registered tables (entity = table name), with no project code in the engine. | `db/types`, `sync/outbox`, `drizzle-orm` | Nothing. | Tests (2). |
| `sync/syncable-tables.ts` | **Starter.** The project's list of syncable tables. | `sync/record-status` | Add each syncable table. | Standalone. In the app it registers `notes`. |
| `sync/__tests__/outbox.test.ts`, `record-status.test.ts` | Order, backoff, idempotency, failure limit, retry, blocking, and status updates, on a table created inside the test. | `test-database`, sync files | Nothing. | App, standalone. |
| `monitoring/monitoring.ts` | `captureError` with an in-memory buffer and pluggable reporters, because `no-console` forbids the usual fallback. | — | Add a reporter when there is a service. | Typecheck; used on device. |
| `i18n/i18n.ts` | i18next with the import form that passes the lint (`init` and `use` as named imports), language from `expo-localization`, sync init. | `locales/en`, `locales/pt-BR`, `expo-localization`, `i18next`, `react-i18next` | Nothing. | Device. |
| `i18n/locales/common.en.ts`, `common.pt-BR.ts` | Strings used by kit components and the root layout (offline strip, sync badge, retry, startup errors, not-found). The Portuguese follows the reviewed glossary. | — | Nothing. | Device in both languages at 1.3. |
| `i18n/locales/en.ts`, `pt-BR.ts` | **Starters.** Spread the common strings; the project adds its feature keys. `pt-BR` is typed against `en`, so a missing key fails the typecheck. | `common.*` | Add feature keys in both. | Standalone. In the app they hold the notes, home and sync strings. |

## Changes outside these files

These belong in project files that are not generic, so they are snippets here.

**`app.json`: dark splash** (part of the white-flash fix; needs a native rebuild). The hex values are the `background` tokens of the default theme:

```json
["expo-splash-screen", {
  "image": "./assets/images/splash.png",
  "resizeMode": "contain",
  "backgroundColor": "#f1f4f6",
  "dark": { "image": "./assets/images/splash.png", "backgroundColor": "#0c0d0f" }
}]
```

Verified: the splash measures `#0c0d0f` in dark mode and `#f1f4f6` in light mode on the device (`screenshots/flash/splash-*.png`). A project that changes the theme hue must recompute both values.

**`package.json` scripts:** as in SKILL.md step 4.

**Tab bar wiring** in `src/app/(tabs)/_layout.tsx` (project-specific: route names, labels, icons):

```tsx
// Full example with imports: SKILL.md step 5. Labels come from options.title via t().
const TAB_ICONS = { index: House, notes: Note, sync: ArrowsClockwise };

function renderTabBar(props: BottomTabBarProps) {
  return <FloatingTabBar {...props} icons={TAB_ICONS} />; // transition="smooth" | "spring" | "instant" | custom
}

<Tabs tabBar={renderTabBar} screenOptions={{ headerShown: false, animation: 'fade' }}>…</Tabs>
```

**After copying:** run `npx drizzle-kit generate` to create `src/core/db/migrations`, which `use-database-migrations.ts` and `test-database.ts` import.

## Considered and left out

| File | Why it is out |
|---|---|
| `src/shared/ui/badge.tsx` | Not used by any kit file or by every project. `reusables add badge` produces it; the adaptation (token colors, `text-caption`) is small. |
| `src/app/(tabs)/_layout.tsx` and route files | Route names, labels and icons are per project; the wiring is the snippet above. |
| `src/features/*` (notes, home, sync screen) | Feature code. The sync status screen is not needed by every project. |
| `src/core/db/migrations/*` | Generated per project from its schema. |
| `app.json`, `package.json` | Project identity; covered by snippets and SKILL.md. |
| `eslint.config.js`, `global.css`, `AGENTS.md`, `DESIGN.md`, `PROJECT_BRIEF.md`, `.claude/*` | Already in the kit's `template/`; unchanged in the app. |
| A shared `KeyboardAwareScrollView` wrapper | Not needed: wrapping children in a `View` with classes works, and FlashList accepted `contentContainerClassName` on the device. |

### Known gaps in the shipped files

- `label.tsx`: tapping the label does not focus the field.
- The sticky Save footer pattern (in the notes form) is not a kit component. DESIGN.md describes it.
- The tab bar width briefly stalls for about 2 frames (near 90 ms) during navigation commits; it was visible only frame by frame. Not fixed.
- With `reference`, the bar grows by up to ~8% mid-transition (the reference video shows ~5%) because the leaving pill collapses late. With the longest pt-BR labels at font scale 1.3 the bar stayed inside the screen and kept its padding.
- The template splash icon has low contrast on the light splash background.
