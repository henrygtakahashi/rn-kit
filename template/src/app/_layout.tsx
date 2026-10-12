import 'react-native-get-random-values';
import '@/global.css';

import { AppProviders } from '@/core/providers/app-providers';
import { DatabaseGate } from '@/core/providers/database-gate';
import { useNavigationTheme } from '@/shared/hooks/use-navigation-theme';
import { ErrorState } from '@/shared/ui/error-state';
import { Screen } from '@/shared/ui/screen';
import { PortalHost } from '@rn-primitives/portal';
import { Stack } from 'expo-router';
import { ThemeProvider } from 'expo-router/react-navigation';
import { StatusBar } from 'expo-status-bar';
import { useTranslation } from 'react-i18next';

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from 'expo-router';

export default function RootLayout() {
  const { t } = useTranslation();
  const { scheme, navigationTheme } = useNavigationTheme();

  return (
    <AppProviders>
      <ThemeProvider value={navigationTheme}>
        <StatusBar style={scheme === 'dark' ? 'light' : 'dark'} />
        <DatabaseGate
          loading={<Screen accessibilityLabel={t('startup.loadingLabel')} />}
          renderError={(retry) => (
            <Screen>
              <ErrorState
                title={t('startup.errorTitle')}
                description={t('startup.errorBody')}
                retryLabel={t('common.retry')}
                onRetry={retry}
              />
            </Screen>
          )}>
          <Stack screenOptions={{ headerShown: false }} />
        </DatabaseGate>
        <PortalHost />
      </ThemeProvider>
    </AppProviders>
  );
}
