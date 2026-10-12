# React Native kit

Rules, theme, lint configuration, device-verified base code, and a setup skill for starting React Native (Expo) apps that coding agents build well. The kit carries decisions and code, not versions: there is no app `package.json` here, so a new project always installs current packages.

## What is in here

| File | Purpose |
|---|---|
| `SKILL.md` | Claude Code skill `new-expo-app`: creates a project and installs the kit into it |
| `CODE.md` | What each code file in `template/` does, what it depends on, what a project changes, and how it was verified |
| `template/AGENTS.md` | Engineering rules: stack, architecture, offline-first data, clean code, git |
| `template/DESIGN.md` | Design system and UI/UX rules, and the visual verification checklist |
| `template/PROJECT_BRIEF.md` | Per-project identity and exceptions, filled in for each app |
| `template/CLAUDE.md` | Makes Claude Code load `AGENTS.md` |
| `template/global.css` | Default theme: tonal surfaces from one hue, text scale, radius |
| `template/eslint.config.js` | Enforces the rules that can be checked by a tool |
| `template/.claude/settings.json` | Registers the lint hook |
| `template/.claude/hooks/lint-edited-file.mjs` | Lints each file Claude edits and reports problems back to it |
| `template/src/` | Base code: design system (including the floating tab bar and its presets), providers, database gate, offline sync engine, i18n, monitoring |
| `template/scripts/`, `tsconfig*.json`, `babel`, `metro`, `drizzle`, `components.json` | Configuration that TypeScript 6, Drizzle, Uniwind, and `reusables doctor` need exactly as written |

Everything under `template/` is copied into each new project.

## Install

The kit is a personal Claude Code skill. `SKILL.md` must end up at `~/.claude/skills/new-expo-app/SKILL.md`, with the `template/` folder beside it.

From the Git repository:

```
git clone <this-repo-url> ~/.claude/skills/new-expo-app
```

From the zip, which has a top-level `rn-kit/` folder:

```
unzip rn-kit.zip -d /tmp
mkdir -p ~/.claude/skills/new-expo-app
cp -R /tmp/rn-kit/. ~/.claude/skills/new-expo-app/
```

Install the kit in one place only. If the same skill also exists in your Claude account, remove one copy so `/new-expo-app` always runs this version: in Claude Code, check the skill list and confirm only one `new-expo-app` appears. Only the Git copy receives updates with `git pull`.

## Use

In Claude Code, from the folder where the app should be created:

```
/new-expo-app
```

Other agents can follow `SKILL.md` as a plain checklist, and they read `AGENTS.md` in the project directly.

## Update

Change the files here, commit, and `git pull` in `~/.claude/skills/new-expo-app`. Existing projects keep the copy they were created with; copy a changed file over by hand when you want it.

When the setup skill reports that a step needed a workaround, fix that step here so the next project does not hit it.

## What the lint enforces

- Layer and feature boundaries, including feature isolation and the `ui → hooks → model/data` direction
- No `eslint-disable` comments: inline configuration is ignored and reported as a warning, which fails `--max-warnings 0`
- Fails with a clear message when Uniwind's generated CSS is missing, instead of reporting every theme color as unknown
- No literal screen titles or tab labels in screen `options`
- No manual memoization, no `React.FC`, no barrel re-exports (`export *` and local named re-exports), no `console`, no empty `catch`, no `as` casts outside tests (`as const` is allowed)
- Phosphor as the only icon library, Uniwind as the only styling engine
- No arbitrary values, palette colors, raw text sizes, shadows, gradients, or blur, in `className`, in any `*ClassName` prop, and inside `Platform.select`
- No hardcoded text in JSX, in JSX expressions and template literals, or in `placeholder`, `accessibilityLabel`, `accessibilityHint`, `title`, `label`, `description`, and `message`, including all-caps words
- Component files of at most 150 lines (Reusables components in `shared/ui` are exempt)

The `lint` script runs `uniwind generate-artifacts` first. Without it, every theme color is reported as an unknown class.

Not enforced by a tool, so they depend on the agent following the text: literal strings outside JSX (for example `Alert.alert('…')`), kebab-case file names, colors and shadows in `style` objects, raw `View` or `Pressable` with ad hoc classes, the required screen states, natural Portuguese copy, and everything visual that only a screenshot or a recording shows.

## Recommended third-party skills

These complement the kit with up-to-date API and performance knowledge. `AGENTS.md` tells the agent that the kit rules win when they conflict.

- **Expo skills** (official): `/plugin marketplace add expo/skills` in Claude Code
- **Vercel React Native skill**: `npx skills add vercel-labs/agent-skills --skill react-native-skills`

Check each project's README for the current install command.

## Verified

Tested on 2026-10-11 and 2026-10-12 with Expo SDK 57, React Native 0.86, Uniwind 1.12, and TypeScript 6, on an Android phone (Samsung, Android 17), in three runs of the skill. The third run created a project with no kit file edited.

- **Kit code**: every file in `template/src` ran in a test app, passed lint, both typechecks, and the tests, and passed again alone in an empty project (12 tests). `reusables doctor` passes.
- **Tab bar**: the four presets recorded on three tab changes each, plus the longest Portuguese labels at 1.3 font scale. No overflow, no icon under a pill, no overshoot, no movement after the animation, no idle redraws. `reference` is within about one frame of the Gradient Weather video on all four measured curves.
- **Push and pop**: no strip at the screen edge, in light and dark mode, after a full rebuild.
- **Offline**: the strip appears and disappears with airplane mode; notes created offline are stored and listed as pending.
- **Contrast**: every text pair of the default theme passes 4.5:1. The lowest are `destructive` on `background` (4.66) and `muted-foreground` on `secondary` (5.24).
- **Setup**: the `expect` form of the Reusables CLI works as written and leaves no `.git`. Nothing is installed outside the project.
- **Lint**: passes on the kit as shipped; inline disables, `hooks/` importing `ui/`, all-caps text, template literals, and literal `description` props are caught.
- **Data**: ids and idempotency keys in the device database are UUID v7; soft deletes and the outbox order are correct.

## Not yet verified

- iOS: nothing has been built or run on iOS. The Skia postinstall may be needed there.
- Sync with a real server: the outbox is tested, but "synced" and "failed" have not been seen on a device.
- Haptics: implemented, but not observable from screenshots or recordings.

## Known gaps

- The tab bar width stalls for about two frames near 90 ms while the new screen renders. Visible only frame by frame.
- With `reference`, the bar grows by up to about 8% mid-transition (the reference app about 5%).
- Once in 22 tries, a tab screen rendered empty (only the tab bar showed) right after a theme switch. Not reproduced. Suspects: the tabs' `animation: 'fade'` and screen freezing after a theme change.
- The CLI still writes `expo` with a caret and installs zod 3.
