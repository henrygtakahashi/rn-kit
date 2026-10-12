import { initI18n } from '@/core/i18n/i18n';
import { useFollowDeviceLanguage } from '@/core/providers/use-follow-device-language';
import { useSystemBackground } from '@/core/providers/use-system-background';
import type { ReactNode } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { KeyboardProvider } from 'react-native-keyboard-controller';
import { SafeAreaListener } from 'react-native-safe-area-context';
import { Uniwind } from 'uniwind';

initI18n();

type AppProvidersProps = {
  children: ReactNode;
};

// Uniwind's safe-area classes (pt-safe, pb-safe-*) resolve to 0 until it gets the insets.
export function AppProviders({ children }: AppProvidersProps) {
  useFollowDeviceLanguage();
  useSystemBackground();
  return (
    <GestureHandlerRootView className="flex-1">
      <SafeAreaListener
        className="flex-1"
        onChange={({ insets }) => Uniwind.updateInsets(insets)}>
        <KeyboardProvider>{children}</KeyboardProvider>
      </SafeAreaListener>
    </GestureHandlerRootView>
  );
}
