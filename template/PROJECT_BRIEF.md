# Project brief

This file gives the project its identity and records its exceptions to `AGENTS.md` and `DESIGN.md`. Fill it in before building the first screen. If a field needed for the current task is empty, ask the user instead of choosing a value.

## Product

- **Name**:
- **What it does** (one or two sentences):
- **Who uses it and in what situation**:
- **Tone** (for example: calm and technical, friendly and playful):

## Identity tokens

### Color

The default theme derives every surface from one hue. Most projects only need these two values:

- **Theme hue** (0 to 360, the H in `oklch(L C H)`):
- **Surface chroma** (0 for neutral gray, up to 0.03 for a visible tint):

Fill in the table only for tokens that must differ from the derived default. Provide a light and a dark value for each.

| Token | Light | Dark |
|---|---|---|
| `background` | | |
| `foreground` | | |
| `card` | | |
| `muted` | | |
| `muted-foreground` | | |
| `primary` | | |
| `primary-foreground` | | |
| `secondary` | | |
| `border` | | |
| `input` | | |
| `destructive` | | |
| `success` | | |
| `warning` | | |

### Typography

- **Font family**:
- **Text scale** (size and line height for title, subtitle, body, caption):
- **Weights in use** (two at most):

### Shape and density

- **Radius scale** (small, medium, large, pill):
- **Density** (compact, regular, or spacious):

### Motion

- **Durations** (fast, normal):
- **Character** (for example: quick and subtle, soft and springy):

### Hero

- **Hero screens** (which screens have a hero area, and what it shows: gradient, animated scene, or illustration). Leave empty for none.

## Navigation

- **Tabs** (four at most, with Phosphor icon names):
- **Tab bar**: floating pill tab bar (default). Note here if this project uses something else.

## Data and sync

- **Offline-first**: yes (default). Note here if this project is not.
- **Sync mechanism** (custom outbox or a named sync service):
- **Conflict policy** (which version wins when a record changed in two places before syncing: last write wins, server wins, client wins, or the user chooses):

## Base features

Features that any other feature may import from (for example: session). Keep this list identical to `BASE_FEATURES` in `eslint.config.js`.

-

## Exceptions

Anything in this project that overrides the general rules, such as allowed shadows or gradients, extra dependencies, or a different navigation pattern.

-
