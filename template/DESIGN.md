# Design system and UI/UX rules

These rules apply to every screen and component. They exist because generated interfaces tend to look generic: inconsistent spacing, weak hierarchy, too many cards and effects, missing states. Each rule below can be checked on a screen. When a rule conflicts with an explicit user instruction, the user wins.

Target: phones in portrait orientation. Ignore tablets and landscape.

The project's visual identity comes from `PROJECT_BRIEF.md`. This file defines a neutral base; the brief fills in the tokens. If the brief is missing a value you need, ask the user. Never invent brand colors, fonts, or radii.

## Visual style

The look is tonal, soft, and typographic. Hierarchy comes from size, weight, and lightness, not from color or decoration.

- **One hue**: every surface and text color is the same hue at a different lightness, with low chroma. Changing the hue re-themes the whole app. Status colors (`destructive`, `success`, `warning`) are the only other hues.
- **Three surface levels**, from back to front: `background` (the screen), `card` (a group of content), `secondary` (controls on a card or on the screen: chips, icon buttons, inputs). Levels separate by tone alone: no border, no shadow, no divider.
- **`primary` is the inverted surface**: dark in light mode, light in dark mode. It is reserved for the single main action and the floating tab bar, so it is the highest-contrast object on the screen.
- **Soft shapes**: large radius on cards (`rounded-lg`), full pills (`rounded-full`) for buttons, chips, switches, and the tab bar.
- **Extreme type contrast**: one very large element per screen at most (`text-display`, for the key number or value), a clear page title, and quiet body text. Secondary text is `text-caption` in `muted-foreground`.
- **Quiet icons**: inside cards, icons are `muted-foreground` and support the text. They are never the loudest element.
- **Human sentences**: headlines state the conclusion in plain language ("Rain possible, peaking right now"), not a field label ("Precipitation").
- **Minimal data graphics**: thin or dotted lines, at most two grid lines, values printed under the chart. No legends, no heavy axes.

## Tokens

All visual values come from tokens defined in `global.css` and exposed as Tailwind classes.

- **Color**: semantic tokens only: `background`, `foreground`, `card`, `popover`, `primary`, `secondary`, `accent`, `muted`, `destructive`, `success`, `warning` (each with a matching `-foreground` for content placed on it), plus `border`, `input`, and `ring`. Each has a light and a dark value in `global.css`. Always pair a fill with its own foreground, for example `bg-primary` with `text-primary-foreground`.
- **Text scale**: `text-caption` (14/20), `text-body` (16/24), `text-subtitle` (20/28), `text-title` (28/34), `text-display` (96/100).
- **Spacing**: the Tailwind scale, in steps of 4.
- **Radius**: base of 20 (`rounded-lg`), with `rounded-sm` 12, `rounded-md` 16, `rounded-xl` 24.
- **Typography and motion**: font family and durations from the brief. Without a brief value, use 150 ms (fast), 200 ms (normal), and 300 ms (slow), defined once in `src/shared/constants/motion.ts`.

Never write a hex value, a palette color (`blue-500`), or an arbitrary value (`mt-[13px]`, `text-[15px]`) in a component, in a `className`, in any `*ClassName` prop, or in a `style` object. If a needed value has no token, ask before adding one.

## Components

Screens are assembled from design system components, never from raw `View`, `Text`, and `Pressable` with ad hoc classes.

- **`shared/ui`** holds the base components. The kit ships these ready, adapted and verified on a device: `Screen`, `ScreenHeader`, `Text`, `Icon`, `Button`, `Input`, `Textarea`, `Label`, `FormMessage`, `Card`, `Skeleton`, `EmptyState`, `ErrorState`, `OfflineNotice`, `SyncStatusBadge`, `ListSeparator`, and `FloatingTabBar`. Use them before anything else. Add other components (`Badge`, `Avatar`, `Checkbox`, `Switch`, `Toast`, …) from Reusables when needed and adapt them to these rules. This code belongs to the project and may be edited, but keep the fixes described below.
- **Expo UI** provides system controls: date and time picker, bottom sheet, context menu, picker, slider, segmented control.
- **Deciding between them**: if the component must follow the tokens and exist identically on web, it belongs in `shared/ui`. If it is a system control, use Expo UI.
- **Bottom sheets**: use the Expo UI bottom sheet (`@expo/ui/community/bottom-sheet`) for modal sheets such as contextual actions and short forms. It is presented by the system, so it cannot have a custom handle, backdrop, or footer, its background follows the system on iOS and Material 3's container color on Android (pass `backgroundStyle` with the `card` value from `useCSSVariable` to follow the tokens there), and it cannot stay partially open over the screen. When a design needs a persistent sheet that stays peeking over content (for example over a map) or a fully token-styled sheet, ask the user before adding `@gorhom/bottom-sheet`.
- When adding a Reusables component, replace its Lucide icons with Phosphor through the kit's `Icon`.
- Reusables overlays (dialog, popover, select, tooltip) need a `PortalHost` mounted once at the root layout.

### Text color resolution

The kit's `Text` resolves color in this order: an explicit `className` color, then the variant's own color (`caption` is `text-muted-foreground`), then the color a parent provides through `TextClassContext`, then `text-foreground`. Reusables as generated lets the parent win, so a caption inside a `Card` loses its muted color. Keep this order if you edit `Text`, and do not give `Card` a text color context.

### Differences from shadcn/ui on web

Reusables follows shadcn/ui, but React Native behaves differently. Do not carry web habits over.

- **No style inheritance**: a class on a parent does not style child text. Style each `Text` directly, or rely on the resolution above.
- **No `data-*` attributes**: variants and states come from props or state, never from data attribute selectors.
- **Programmatic control**: some components, such as `DropdownMenu`, are not controlled with `open` and `onOpenChange`. Open and close them through a `ref`.
- **Icons**: pass icons through the `Icon` wrapper (`<Icon as={...} />`) instead of styling each imported icon.
- **Placeholders**: in Uniwind the prop is `placeholderTextColorClassName` with an `accent-*` class (`accent-muted-foreground`), not `placeholderClassName`.
- **Animation**: use Reanimated, as the components already do.
- Search `shared/ui` before creating a component. Extend an existing component with a variant instead of creating a near-duplicate.
- Every screen is wrapped in `Screen`, which handles safe area, background, and horizontal padding.

## Icons

- Phosphor only. Never Lucide, `@expo/vector-icons`, or emoji as icons.
- Weight `regular` everywhere.
- Weight `fill` for the selected state (active tab, marked favorite).
- Weight `bold` only for rare emphasis. Never `thin`, `light`, or `duotone`.
- Sizes: 16, 20, or 24. Navigation uses 24.
- Color always from tokens.

## Layout and spacing

- One horizontal screen margin for the whole app: 16.
- Space between siblings with `gap` on the container, not margins on each child. Virtualized lists cannot use `gap`: they space items with `ItemSeparatorComponent`.
- Related elements sit close together. Separate groups with larger space, not with lines or borders: cards in the same list are 8 apart, sections are 40 apart.
- Card padding is 20 (`p-5`). A section title sits outside and above its card.
- Use one separation device per surface: space, a border, or a background change. Never stack them.
- No card inside a card.
- Safe-area classes (`pt-safe`, `pb-safe-offset-*`) only work while the root `SafeAreaListener` feeds insets to Uniwind (see `AGENTS.md`).

## Typography and hierarchy

- Text is rendered only through the `Text` component with a variant (title, subtitle, body, caption, display). No ad hoc font sizes.
- At most three hierarchy levels and two font weights per screen.
- One primary action per screen. Other actions are secondary or text buttons.
- Body text is at least 16. Nothing below 12.

## Color and surfaces

- Light and dark mode are required on every screen.
- Text contrast is at least 4.5:1. The default theme is measured; when a project changes the hue or a status color, measure the pairs it uses again.
- Color is never the only indicator of a state. Pair it with an icon or text.
- Separate floating elements from content with color contrast.

### Gradients and effects

Decoration is confined to one place.

- **Allowed only in the hero area**: the top region of a screen, behind its main number or title. There, a gradient, an animated scene (clouds, rain, stars), or particles may be used to express the content's state. At most one hero per screen.
- **Forbidden everywhere else**, unless the user asks explicitly: shadows, gradients, blur and glass, glow, and decorative animation. Cards, lists, buttons, inputs, and the tab bar stay flat.
- Build hero gradients with `expo-linear-gradient` and animated scenes or particles with React Native Skia. These libraries are used only inside a hero.
- Hero colors derive from the theme hue. Text over the hero keeps 4.5:1 contrast.
- Hero animation stops when the system reduce-motion setting is on, and never blocks scrolling or touch.
- Static illustrations are allowed in the hero and in empty states.
- Do not add a hero to a screen that has no single main value or state to express.

## Required states

Every screen that shows data implements all of these:

- **Loading**: a skeleton shaped like the content. No full-screen spinner.
- **Empty**: the `EmptyState` component with an icon, a short text, and an action that leads out of the empty state.
- **Error**: the `ErrorState` component with a plain-language message and a retry action.
- **Offline**: the screen keeps working. A quiet `muted` strip under the screen title says the device is offline and that changes will sync later. It reads the connection from `expo-network`, never blocks content, and disappears when the connection returns.
- **Sync status**: each syncable record shows pending, synced, or failed, with an icon and text. Failed offers a retry. While the project has no sync server, records stay pending, and the brief says so.

Error messages are written for the end user. Never show technical or developer errors: no status codes, exception names, stack traces, or raw server text. Say what happened and what the user can do.

## Touch and feedback

- Minimum touch target of 44 by 44 points. Use `hitSlop` when the visual element is smaller.
- Every touchable element has a visible pressed state.
- Buttons are pills (`rounded-full`).
- Destructive actions ask for confirmation or offer undo.
- A button that is submitting is disabled and shows progress.
- Haptic feedback on important actions: light impact on tab change and selection, success notification on a completed action, error notification on a failed action. Do not add haptics to ordinary taps or scrolling.

## Navigation

- Native stack for screen transitions. The back gesture always works.
- Every layer behind the screens follows the theme, or it shows through while a screen slides in or out. On Android the window behind the navigators is painted from the native theme at launch and showed as a gray or white strip on the right edge during push and pop. The kit's `use-system-background.ts` (mounted in `AppProviders`) paints it with `background` and repaints on theme change; the navigation theme reads the tokens through `use-navigation-theme.ts`; the splash has a dark variant. Keep all three.
- Contextual actions open in a bottom sheet or native menu, never in a centered web-style modal.

### Floating pill tab bar

The default tab navigation in every project is the kit's floating pill tab bar, `src/shared/ui/floating-tab-bar.tsx`, unless the user says otherwise. Use it as is; do not rebuild it. It took several rounds of frame-by-frame measurement to get right, and the obvious implementations redraw forever, overflow the bar, or snap after the animation.

- Wire it through the `tabBar` prop of Expo Router `Tabs`, with an `icons` map keyed by route name (see `SKILL.md`).
- The active tab shows icon and label inside its own pill; inactive tabs show only the icon. Phosphor `fill` on the active tab, `regular` on the others, size 24.
- At most four tabs, because the expanded label takes width. Tab labels use the shortest natural word in both languages.
- It already hides with the keyboard, gives a light haptic on change, and turns instant when reduce motion is on.
- Every scrollable screen adds bottom padding (`pb-safe-offset-24`) so the last item is not hidden behind the bar.
- Floating action buttons on a screen align with the bar and share its height and radius.

**Transitions.** Pass `transition` to choose a preset from `floating-tab-bar.presets.ts`:

| Preset | Behavior |
|---|---|
| `reference` (default) | Fitted frame by frame to the Gradient Weather app. The old pill vanishes in about 30 ms while its width collapses a little later; the new pill fades in and grows with a soft start. |
| `smooth` | One shared 250 ms ease-out timing for every part. |
| `spring` | The new pill grows on a critically damped spring, never past its final width. |
| `instant` | No animation. Forced when reduce motion is on. |

A project can define its own preset as a `TabBarTransition` object at module level and pass it to `transition`. Do not edit the component to change the motion.

Whatever the preset, these stay true and are part of the verification: every tab owns its pill and no indicator slides across the bar; the label is revealed by the growing pill, never faded in after it; no tab overflows the bar and no icon passes under a pill; the bar stays centered; nothing moves after the animation ends.

## Lists

- Long lists are always virtualized with FlashList.
- FlashList v2 measures items itself: do not set `estimatedItemSize`. Give every item a stable key.
- FlashList v2 keeps the visible item in place when data changes. In a newest-first list, set `maintainVisibleContentPosition={{ disabled: true }}`, or new items appear above the viewport and the user does not see them.
- Pull-to-refresh only when a sync transport exists. Lists read the local database through live queries, so they already update when sync writes.

## Forms

- The label is always visible above the field. A placeholder never replaces a label.
- Each field sets the correct keyboard type, autocomplete, and return key.
- Validate on blur and on submit. Show the error below the field.
- The keyboard never covers the focused field or the submit button. Wrap the fields in `KeyboardAwareScrollView` and put the submit button in a `KeyboardStickyView` footer; the scroll view alone keeps only the focused field visible. Give the scroll content bottom padding equal to the footer's height, so the footer never covers the lower part of a tall field.
- Tapping a label focuses its field: give the input a ref and focus it from the label's `onPress`. The kit's `Label` does not do it on its own.

## Motion

- Animate only to explain a state change. Duration between 150 and 300 ms. The hero area is the only place where ambient animation is allowed.
- Animate only transform, opacity, and, for the tab bar pills, width.
- Respect the system reduce-motion setting.
- Skeletons are static. A looping pulse is ambient animation.

## Copy and translation

The interface ships in English and Brazilian Portuguese. Write each language as a native speaker would for a phone screen, never as a word-for-word translation.

- **Use the term people use in apps**, not the dictionary equivalent: "Notes" is "Notas", not "Anotações"; "Settings" is "Ajustes" or "Configurações" (pick one and keep it); "Sign in" is "Entrar"; "Sync" is "Sincronizar".
- **Keep the meaning, not the structure.** Rewrite the sentence so it sounds natural in Portuguese, even when the grammar differs from English.
- **Fit the layout.** Portuguese runs about 20 to 30 percent longer. Tab labels, buttons, and badges use the shortest natural word. If a label does not fit the space at 1.3 font scale, change the word, not the layout.
- **Be consistent.** The same concept has the same word on every screen. Keep a glossary at the top of the Portuguese translation file and follow it.
- **Address the user as "você"**, in a friendly and direct tone, without slang.
- Buttons are verbs in the infinitive ("Salvar", "Tentar de novo"). Titles are nouns or short sentences.

## Accessibility

- Every interactive element has `accessibilityLabel` and `accessibilityRole`.
- The layout does not break with enlarged system font size.

## Things to avoid

These are the most common failures in generated interfaces. Check for each one before finishing.

- Arbitrary spacing or colors outside the tokens.
- Everything the same size and weight, with no clear primary element.
- Cards, borders, shadows, gradients, blur, or glow added for decoration outside the hero area.
- Color used for hierarchy where size, weight, or lightness would do.
- A web page squeezed into a phone: centered modals, hover-style interactions, tiny touch targets, dense tables.
- Missing loading, empty, error, or offline state.
- Content under the notch, status bar, home indicator, or tab bar.
- Emoji used as icons.
- A new component built from scratch when one exists in `shared/ui`.
- Hardcoded user-visible text instead of an i18n key.
- Literal translations that read as translated, or labels that overflow in Portuguese.
- Technical error text shown to the user.

## Verification before finishing

Do this for every UI change. Do not report the work as done on the basis of reading the code.

1. Run the app on the user's Android phone, connected over USB, in a development build (the stack has native modules that Expo Go does not include). While iterating, run Metro without `CI=1`; CI mode disables reloads.
2. Capture each changed screen with `adb exec-out screencap -p > screen.png` and look at the image. Capture only when the app is in the foreground: check `adb shell dumpsys window | grep mCurrentFocus` for the app's package first, so a capture never records the user's other apps or home screen.
3. Do this in light mode and dark mode (`adb shell "cmd uimode night yes"` and `no`).
4. Check Portuguese without changing the phone's language (`adb shell cmd locale set-app-locales <package> --locales pt-BR`, reset with `--locales ""`), and enlarged font (`adb shell settings put system font_scale 1.3`, restore it to the value it had before). The app follows the locale change live through `use-follow-device-language.ts`. Fast Refresh does not reload translation files, so restart the app after editing them. Read the Portuguese copy for naturalness, not only for fit.
5. For any animation, record it (`adb shell screenrecord --time-limit 3 /sdcard/clip.mp4`, then `adb pull`), extract frames with their real timestamps (`ffmpeg -i clip.mp4 -fps_mode passthrough frame_%03d.png`; read times with `ffprobe -show_entries frame=pts_time`), and inspect them one by one. `screenrecord` drops unchanged frames, so resampling with `-vf fps=60` pads the start with old frames. Motion bugs such as overflow, a late label, or a strip at the edge are invisible in screenshots.
   - Always record one tab change and one stack push and pop, in light and dark mode. Check that the screen edges never show a color different from the screen.
   - Start recordings only after the app is in the foreground, so they never capture the user's other apps or home screen.
6. Confirm the loading, empty, error, and offline states exist and look correct. For offline, first record `adb shell settings get global airplane_mode_on`, `wifi_on`, and `bluetooth_on`; then run `adb shell cmd connectivity airplane-mode enable`, capture, run `disable`, and confirm the strip disappears. Restore Wi-Fi and Bluetooth to the recorded values if airplane mode changed them. States that only happen briefly (loading, error) may be forced by temporarily changing the hook's return value; restore the file and run `npm run check` afterwards.
7. Confirm nothing is hidden behind the safe areas, the tab bar, or the keyboard.
8. Go through "Things to avoid" and fix what applies.
9. Restore every setting you changed on the phone before finishing. Record the original values first; do not assume the defaults.

If no device is connected, say so and ask the user; do not skip this step silently.
