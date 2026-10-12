import { buildNavigationTheme, NAV_THEME_VARIABLE_NAMES } from '@/shared/utils/theme';
import { useCSSVariable, useUniwind } from 'uniwind';

export function useNavigationTheme() {
  const { theme } = useUniwind();
  const scheme = theme === 'dark' ? 'dark' : 'light';
  const values = useCSSVariable(NAV_THEME_VARIABLE_NAMES);
  return { scheme, navigationTheme: buildNavigationTheme(scheme, values) };
}
