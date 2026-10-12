# Front-end engineering rules

These rules apply to every React Native project in this workspace. They exist because coding agents tend to produce working code with weak structure and generic design. Follow them unless the user says otherwise in the conversation; the user's explicit instruction always wins.

Read these companion files before working:

- `DESIGN.md`: design system and UI/UX rules. Read it before creating or changing any screen or component.
- `PROJECT_BRIEF.md`: this project's identity, tokens, and exceptions. If a field you need is empty, ask the user instead of inventing a value.

Installed third-party skills (such as the Expo skills or the Vercel React Native skill) are a reference for current APIs and performance. When one of them conflicts with this file or `DESIGN.md`, these files win. Common conflicts: they may suggest native tabs, SF Symbols, or NativeWind; this project uses the floating pill tab bar, Phosphor, and Uniwind.

## Kit code

The project starts with working, device-verified code from the kit: the design system in `src/shared/ui`, providers, the database gate, the offline sync engine, i18n, monitoring, and the test helpers. `CODE.md` in the kit describes each file. Build on it:

- Use the kit's files before writing anything similar. Extend them; do not rebuild them.
- Each file carries a fix that cost real debugging (text sizes, safe areas, caption colors, the tab bar, the white edge on push and pop). When you edit one, keep the behavior its comments describe.
- The starters (`src/core/db/schema.ts`, `src/core/sync/syncable-tables.ts`, and the two locale files `en.ts` and `pt-BR.ts`) are where the project's own tables and strings go.

## Stack

Use the latest stable Expo SDK at project start. Install every dependency with `npx expo install` so versions match the SDK. Before using an Expo or library API, check the documentation for the installed version, because your training data likely describes older versions.

| Concern | Choice |
|---|---|
| Framework | Expo (New Architecture, React Compiler enabled) |
| Language | TypeScript, `strict` |
| Navigation | Expo Router |
| Styling | Tailwind CSS v4 classes through Uniwind |
| Base components | React Native Reusables, adapted in `shared/ui` |
| System controls | Expo UI (date/time picker, modal bottom sheet, menus, picker, slider, segmented control) |
| Icons | Phosphor (`phosphor-react-native`), imported from the package root and rendered through the kit's `Icon` |
| Local database | expo-sqlite with Drizzle ORM (stable release, not `@rc`) and Drizzle Kit |
| Network status | expo-network |
| Key-value storage | MMKV |
| Secrets | expo-secure-store |
| IDs | UUID v7 (`uuid` with `react-native-get-random-values`) |
| Online-only requests | TanStack Query |
| Client state | Zustand |
| Forms | React Hook Form with Zod |
| Lists | FlashList |
| Animation and gestures | Reanimated, Gesture Handler |
| Haptics | expo-haptics |
| Hero gradients and scenes | expo-linear-gradient, React Native Skia (hero area only, see `DESIGN.md`) |
| Images | expo-image |
| Keyboard | react-native-keyboard-controller |
| i18n | i18next, react-i18next, expo-localization |
| Tests | Node's built-in runner (`node:test`) with `@types/node`; data tests run Drizzle against `node:sqlite` |
| System window | expo-system-ui (comes with the template; paints the window behind the navigators) |

Do not add a dependency that is not in this table without asking first. Build tooling that a listed library documents as required is pre-approved: `babel-plugin-inline-import` for Drizzle migrations, `drizzle-kit`, and `@types/node`. Name it in your summary.

### Project setup

- The package manager is always npm. Never use yarn, pnpm, or bun, and never create their lockfiles. Run packages with `npx` and install Expo-ecosystem dependencies with `npx expo install`.
- New projects are created by the kit's `new-expo-app` skill (`SKILL.md`), which runs the Reusables CLI, copies the kit, and wires the app.
- Add Reusables components one at a time with `npx @react-native-reusables/cli@latest add <component> -y`, then adapt them to these rules. Never let the CLI overwrite a kit file. Do not write a base component from scratch when Reusables has one.
- After adding or changing Reusables components, run `npx @react-native-reusables/cli@latest doctor` and fix what it reports. It checks `src/shared/utils/utils.ts` and `src/shared/utils/theme.ts` by name and content; do not rename them or remove the token names from `theme.ts`.
- MMKV and other native modules do not run in Expo Go. Use a development build.

### Styling

- The theme is defined in CSS, in the Tailwind v4 format (`@theme` and CSS variables in `global.css`). Do not create a `tailwind.config.js`; that is the Tailwind v3 format.
- Tokens are CSS variables with light and dark values, shared in name and structure with the web projects.
- Uniwind is the engine, not NativeWind. Do not use NativeWind APIs or setup steps (`nativewind/babel`, `cssInterop`, `nativewind-env.d.ts`). Check the Uniwind documentation (`https://docs.uniwind.dev/llms.txt`) before changing styling configuration.
- Merge classes with the kit's `cn` in `src/shared/utils/utils.ts`. It knows the custom text scale; plain `tailwind-merge` reads `text-body` as a color and drops the size. If you rename or add a text style in `global.css`, update the `font-size` group there too.
- `AppProviders` mounts a `SafeAreaListener` that feeds insets to Uniwind. Without it, `pt-safe` and `pb-safe-*` resolve to 0.
- Run `uniwind generate-artifacts` before linting (the `lint` script does). Until it runs, the lint reports every theme color as an unknown class.

Rules are backend-agnostic. Never assume a specific backend, API shape, or sync service.

Web projects use the same conventions with shadcn/ui and `@phosphor-icons/react`: same tokens, same component names, same variant names. Components are not shared between web and mobile; the design language is.

## Architecture

Feature-based, with enforced boundaries.

```
global.css              # design tokens (theme)
src/
  app/                  # Expo Router routes: composition only
  features/
    <feature>/
      ui/               # components and screens of the feature
      hooks/            # connect ui to model and data
      model/            # business rules, types, Zod schemas
      data/             # repository: reads and writes on SQLite
      sync/             # mapping between local records and the server
      __tests__/
  shared/
    ui/                 # design system components
    hooks/              # generic hooks
    utils/              # pure functions
    types/
    constants/
  core/
    db/                 # Drizzle schema, migrations, client
    sync/               # sync engine: outbox, retry, conflicts
    api/                # HTTP client, typed errors
    storage/            # MMKV and secure-store wrappers
    config/             # environment variables validated with Zod
    providers/          # app-level providers
    monitoring/         # logging and error capture
    i18n/               # i18next setup
```

A small feature starts with only `ui/` and `hooks/`. Add `model/`, `data/`, and `sync/` when the feature needs them. Do not create empty folders.

### Dependency rules

| Layer | May import from |
|---|---|
| `app/` | `features`, `shared`, `core/providers` |
| `features/` | `shared`, `core`, itself, base features |
| `shared/` | nothing else in `src/` |
| `core/` | other `core/` folders, `shared/utils`, `shared/types` |

- Features never import from other features. When a screen needs two features, compose them in `app/`.
- The only exception is the list of base features in `PROJECT_BRIEF.md` (for example, session). Any feature may import from those. The same list lives in `BASE_FEATURES` in `eslint.config.js`; keep the two identical.
- Logic needed by two features moves up: generic logic to `shared/`, business logic to its own feature.
- Code moves to `shared/` only when two or more features use it. Nothing in `shared/` knows about a specific feature.
- Inside a feature the direction is `ui → hooks → model/data → core`. `ui` never imports from `data`, `sync`, `core/db`, `core/api`, or `core/sync`. `model` never imports React. `data` and `sync` never import `ui` or `hooks`.
- Route files in `app/` hold no business logic.
- `core/providers` cannot render `shared/ui`. A provider that needs a visible state (database migrations, for example) exposes a hook, and the root layout renders the loading and error states with `shared/ui`.

### Imports and naming

- No barrel files (`index.ts` re-exports). Import directly from the file that defines the symbol. Barrels hurt bundle size and startup on Metro and cause circular dependencies.
- Use the `@/` path alias (`@/features`, `@/shared`, `@/core`). No relative import climbing more than one level.
- Files in kebab-case. One component per file. Hooks are `use-*.ts`. Repositories are `*.repository.ts`.
- Boundaries are enforced by `eslint.config.js`. Never disable a rule or edit the config to make code compile; fix the import, or ask.

## Offline-first

Every project is offline-first unless the user says it is not.

- The local database is the source of truth. Screens read from SQLite, never directly from the API.
- Writes go to the local database first and enter an outbox queue. The UI never waits for the network.
- A sync layer pulls from the server and writes to the local database. UI code never calls the API for domain data.
- TanStack Query is only for online-only operations such as sign-in, remote search, and uploads. Never copy server data into Zustand.
- Every syncable record exposes a sync status (pending, synced, failed), and the UI shows it.
- Every screen must work with no network, and shows when it is offline (see `DESIGN.md`).
- Until the project has a sync server, build the outbox behind a transport interface, cover it with tests, and do not run it. Records stay pending on screen, and `PROJECT_BRIEF.md` says there is no server yet.
- The sync mechanism itself (custom outbox or a sync service) and the conflict policy are per-project decisions recorded in `PROJECT_BRIEF.md`.

### Data rules

- **IDs**: UUID v7, generated on the client when the record is created, through one helper in `shared/utils`. Never autoincrement, and never wait for the server to assign an id. `import 'react-native-get-random-values'` is the first line of `src/app/_layout.tsx`, so the polyfill loads before any id is created.
- **Columns**: every syncable table has `id`, `created_at`, `updated_at`, `deleted_at`, and a sync status.
- **Deletes are soft**: set `deleted_at`. Queries exclude deleted rows. Purge a row only after the server confirms the delete. A hard delete while offline would never reach the server.
- **Outbox**: one row per operation (create, update, delete), written in the same transaction as the local change. The order is global: operations are sent strictly in the order they were written, and a failed or not-yet-due operation blocks every later one until it succeeds or the user retries it. The kit's `core/sync/outbox.ts` implements this; enqueue through it.
- **Idempotency**: each outbox operation carries its own key (UUID v7), so resending after a dropped connection never duplicates anything.
- **Clocks**: client timestamps are for display only. Ordering and conflict decisions use a cursor or version issued by the server. Never compare device clocks.
- **Pull**: incremental, from the last cursor stored locally. A full reload happens only on first sync or an explicit reset.
- **Retry**: exponential backoff with a cap. After the limit, mark the operation `failed`, show it, and offer a manual retry. Never retry silently forever and never drop an operation.
- **Files and photos**: a separate upload queue. The record stores the local path and the remote URL, and syncs without waiting for the file.
- **Migrations**: generated by Drizzle Kit into `src/core/db/migrations`, committed, and applied at startup before any screen reads. Never edit a migration that was already applied.
- **Reads**: reactive queries (Drizzle `useLiveQuery`) inside feature hooks, so screens update when sync writes to the database.

## TypeScript

- No `any`, no `@ts-ignore`, no `as` cast used to silence an error.
- Derive types from Zod schemas and the Drizzle schema. Do not duplicate them by hand.
- Type props with `type`. Do not use `React.FC`.

## Components

- A component only renders. Logic goes in a hook; business rules go in `model/`.
- Maximum 150 lines per component file. Split when it grows past that. Components brought from Reusables into `shared/ui` are exempt.
- Never define a component inside another component.
- Prefer composition with `children` over accumulating boolean props (`isCompact`, `hasIcon`, `showFooter`).
- Style variants use `cva`. No long ternaries inside `className`.
- Before creating a component, hook, or utility, search `shared/` and the current feature for an existing one.

## React Compiler

The React Compiler is enabled (`experiments.reactCompiler` in the app config) and handles memoization. Write code it can optimize.

- Never write `useMemo`, `useCallback`, or `React.memo` by hand.
- Never mutate props, state, or values returned by hooks.
- Rendering must be pure: no side effects during render.
- Follow the Rules of Hooks strictly. The compiler silently skips components that break the rules of React.
- The compiler lint rules come with `eslint-config-expo`. Fix the code; never disable a rule.

## State and effects

- Keep state minimal. Anything computable from other state or props is not state.
- `useEffect` is only for synchronizing with an external system. Never use it to derive state or to respond to a user event.
- State lives in the lowest place that needs it. Use Zustand only for state shared across distant parts of the app.

## Functions and naming

- Small functions with early returns instead of nested conditionals.
- Full, descriptive names. Booleans start with `is`, `has`, or `can`. Handlers are `handle*`; callback props are `on*`.
- No magic numbers or strings. Use constants or design tokens.
- All code, identifiers, and comments are in English.
- No premature abstraction. Extract for reuse on the second or third repetition.

## Internationalization

The interface supports English and Brazilian Portuguese.

- No user-visible string is written directly in a component. Every string goes through i18next. This includes placeholders and accessibility labels.
- Translation keys are grouped by feature.
- Add both languages whenever you add a key.
- Write the Portuguese as a native speaker would for a phone screen, not word for word, following "Copy and translation" in `DESIGN.md`.
- Format dates, numbers, and currency with the active locale.
- The kit's `core/i18n/i18n.ts` already sets up i18next with the import form that passes lint (`init` and `use` as named imports; `i18next.init(...)` and `i18next.use(...)` fail). Add strings, not setup.
- Strings used by kit components live in `common.en.ts` and `common.pt-BR.ts`. Project strings go in `en.ts` and `pt-BR.ts`, grouped by feature. `pt-BR.ts` is typed against `en.ts`, so a missing key fails the typecheck.
- The app follows the system language live (`use-follow-device-language.ts`).

## Errors

- No empty `catch`, and no `catch` that only logs to the console.
- `core/api` converts failures into typed errors. UI code never handles a raw HTTP error.
- The user never sees a technical or developer message: no status codes, stack traces, exception names, or raw server text. Show a plain-language message that says what happened and what the user can do next.
- Technical detail goes to `core/monitoring`. Without a monitoring service, it keeps recent errors in memory and accepts pluggable reporters. It never uses `console`.

## Comments and cleanup

- Comments explain why, never what the code does.
- No commented-out code, no `console.log`, and no context-free `TODO` in finished work.

## Tests

- Required for `model/` and `data/`, where the logic lives.
- Optional for `ui/`.
- Tests live in `__tests__/` and run with `node --test` through `scripts/test-hooks.mjs`, which resolves `@/` imports.
- Data tests open a database with `src/core/db/__tests__/test-database.ts`: an expo-sqlite stand-in over `node:sqlite` that applies the real migrations, so the real Drizzle driver runs in Node. Import Drizzle's driver from `drizzle-orm/expo-sqlite/driver` in tests; the package index loads `expo-sqlite`, which cannot run in Node.
- Tests are type-checked with their own `tsconfig.test.json` (`types: ["node"]`), so Node globals never reach app code. Test doubles may use `as` casts; app code may not.

## Git

- **Commits** follow Conventional Commits: `type(scope): summary`. Types: `feat`, `fix`, `refactor`, `perf`, `style`, `test`, `docs`, `build`, `ci`, `chore`. The scope is the feature or layer (`feat(orders): add offline order list`). Summary in English, imperative, lowercase, no period, 72 characters at most.
- One logical change per commit. Do not mix a refactor with a feature.
- **Branches** are semantic: `type/short-description` in kebab-case, with the same types as commits (`feat/order-list`, `fix/sync-retry-backoff`).
- **Native folders**: `android/` and `ios/` are generated by prebuild and listed in `.gitignore`. Native configuration lives in the app config and config plugins.
- **New context, new branch**: whenever the work changes context (another feature, another fix, another concern), create a new branch from the up-to-date default branch before touching code. Never continue unrelated work on the current branch.

## Working agreement

- Stay inside the scope of the task. Do not modify unrelated files.
- Ask before adding a dependency, changing architecture, or deviating from these rules.
- When a rule here conflicts with what the task needs, stop and ask instead of working around it.
- A hook lints each file you edit and reports problems to you. Fix them as they appear. It only runs when the session starts in the project folder; otherwise run `npm run lint` yourself after each change.
- When Prettier and the lint disagree on class order, run `eslint --fix` after Prettier. The lint wins.
- Never install anything outside the project (SDKs, NDKs, global packages) without asking. If a build installs something on its own, stop and tell the user.
- Before reporting a task as done: `npm run check` passes (lint, type check, tests), and the verification checklist in `DESIGN.md` is complete for any UI change.
