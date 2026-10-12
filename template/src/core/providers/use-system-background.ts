import { captureError } from '@/core/monitoring/monitoring';
import { setBackgroundColorAsync } from 'expo-system-ui';
import { useEffect } from 'react';
import { useCSSVariable } from 'uniwind';

// The window behind the navigators shows through while a stack screen slides in
// or out. Android paints it from the native theme (dark gray or near white,
// fixed at launch), so it showed as a strip on the right edge. Paint it with
// the theme's background and repaint whenever the theme changes.
export function useSystemBackground() {
  const background = useCSSVariable('--color-background');

  useEffect(() => {
    if (typeof background !== 'string') return;
    setBackgroundColorAsync(background).catch((error: unknown) =>
      captureError(error, { area: 'system-ui' })
    );
  }, [background]);
}
