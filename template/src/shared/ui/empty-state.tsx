import { Icon } from '@/shared/ui/icon';
import { Text } from '@/shared/ui/text';
import type { Icon as PhosphorIcon } from 'phosphor-react-native';
import type { ReactNode } from 'react';
import { View } from 'react-native';

type EmptyStateProps = {
  icon: PhosphorIcon;
  title: string;
  description: string;
  // The action that leads out of the empty state.
  children: ReactNode;
};

function EmptyState({ icon, title, description, children }: EmptyStateProps) {
  return (
    <View className="flex-1 items-center justify-center gap-6 px-4">
      <View className="size-16 items-center justify-center rounded-full bg-secondary">
        <Icon as={icon} size={24} className="text-muted-foreground" />
      </View>
      <View className="items-center gap-2">
        <Text variant="subtitle" className="text-center">
          {title}
        </Text>
        <Text className="text-center text-muted-foreground">{description}</Text>
      </View>
      {children}
    </View>
  );
}

export { EmptyState };
