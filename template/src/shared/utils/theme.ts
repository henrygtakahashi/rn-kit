import { DarkTheme, DefaultTheme, type Theme } from 'expo-router/react-navigation';

// Theme tokens and the CSS variables in global.css that define them. Code that
// needs a raw value (navigation, native props) reads it through Uniwind's
// useCSSVariable instead of keeping a second copy of the palette.
export const THEME_VARIABLES = {
  background: '--color-background',
  foreground: '--color-foreground',
  card: '--color-card',
  popover: '--color-popover',
  primary: '--color-primary',
  secondary: '--color-secondary',
  muted: '--color-muted',
  accent: '--color-accent',
  destructive: '--color-destructive',
  border: '--color-border',
  input: '--color-input',
  ring: '--color-ring',
  radius: '--radius',
} as const;

// Navigation colors, in the order NAV_THEME_VARIABLE_NAMES lists their variables.
const NAV_THEME_TOKENS = [
  ['background', 'background'],
  ['border', 'border'],
  ['card', 'card'],
  ['notification', 'destructive'],
  ['primary', 'primary'],
  ['text', 'foreground'],
] as const;

export const NAV_THEME_VARIABLE_NAMES = NAV_THEME_TOKENS.map(
  ([, token]) => THEME_VARIABLES[token]
);

export const NAV_THEME: Record<'light' | 'dark', Theme> = {
  light: DefaultTheme,
  dark: DarkTheme,
};

export function buildNavigationTheme(
  scheme: 'light' | 'dark',
  values: readonly (string | number | undefined)[]
): Theme {
  const base = NAV_THEME[scheme];
  const colors = { ...base.colors };
  NAV_THEME_TOKENS.forEach(([color], index) => {
    const value = values[index];
    if (typeof value === 'string') colors[color] = value;
  });
  return { ...base, colors };
}
