import { useNetworkStatus } from '@/shared/hooks/use-network-status';
import { Icon } from '@/shared/ui/icon';
import { Text } from '@/shared/ui/text';
import { WifiSlash } from 'phosphor-react-native';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

// The quiet strip under a screen title while the device is offline (DESIGN.md).
function OfflineNotice() {
  const { t } = useTranslation();
  const { isOffline } = useNetworkStatus();
  if (!isOffline) return null;
  return (
    <View
      className="flex-row items-center gap-2 rounded-md bg-muted px-3 py-2"
      accessibilityRole="alert"
      accessibilityLiveRegion="polite">
      <Icon as={WifiSlash} size={16} className="text-muted-foreground" />
      <Text variant="caption" className="flex-1">
        {t('common.offline')}
      </Text>
    </View>
  );
}

export { OfflineNotice };
