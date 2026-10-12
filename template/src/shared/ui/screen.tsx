import { cn } from '@/shared/utils/utils';
import type { ComponentProps } from 'react';
import { View } from 'react-native';

type ScreenProps = ComponentProps<typeof View>;

// Every screen starts here: background, top safe area, and the 16 margin.
// Lists that scroll edge to edge pass their own padding and use `px-0`.
function Screen({ className, ...props }: ScreenProps) {
  return <View className={cn('flex-1 bg-background px-4 pt-safe', className)} {...props} />;
}

export { Screen };
