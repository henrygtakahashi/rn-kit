import { OfflineNotice } from '@/shared/ui/offline-notice';
import { Text } from '@/shared/ui/text';
import type { ReactNode } from 'react';
import { View } from 'react-native';

type ScreenHeaderProps = {
  title: string;
  children?: ReactNode;
};

// Page title, an optional trailing action, and the offline strip beneath.
function ScreenHeader({ title, children }: ScreenHeaderProps) {
  return (
    <View className="gap-3 pt-4 pb-2">
      <View className="min-h-12 flex-row items-center justify-between gap-4">
        <Text variant="title" className="flex-1" accessibilityRole="header">
          {title}
        </Text>
        {children}
      </View>
      <OfflineNotice />
    </View>
  );
}

export { ScreenHeader };
