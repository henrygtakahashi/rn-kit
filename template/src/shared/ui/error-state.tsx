import { Button } from '@/shared/ui/button';
import { Icon } from '@/shared/ui/icon';
import { Text } from '@/shared/ui/text';
import { ArrowClockwise, WarningCircle } from 'phosphor-react-native';
import { View } from 'react-native';

type ErrorStateProps = {
  title: string;
  description: string;
  retryLabel: string;
  onRetry: () => void;
};

function ErrorState({ title, description, retryLabel, onRetry }: ErrorStateProps) {
  return (
    <View className="flex-1 items-center justify-center gap-6 px-4" accessibilityRole="alert">
      <View className="size-16 items-center justify-center rounded-full bg-secondary">
        <Icon as={WarningCircle} size={24} className="text-destructive" />
      </View>
      <View className="items-center gap-2">
        <Text variant="subtitle" className="text-center">
          {title}
        </Text>
        <Text className="text-center text-muted-foreground">{description}</Text>
      </View>
      <Button variant="secondary" onPress={onRetry} accessibilityLabel={retryLabel}>
        <Icon as={ArrowClockwise} size={20} />
        <Text>{retryLabel}</Text>
      </Button>
    </View>
  );
}

export { ErrorState };
