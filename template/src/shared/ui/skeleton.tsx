import { cn } from '@/shared/utils/utils';
import type { ComponentProps, RefAttributes } from 'react';
import { View } from 'react-native';

// Static on purpose: DESIGN.md allows ambient animation only in the hero, and
// limits other motion to 150-300 ms state changes, which rules out a looping pulse.
function Skeleton({ className, ...props }: ComponentProps<typeof View> & RefAttributes<View>) {
  return <View className={cn('rounded-md bg-secondary', className)} {...props} />;
}

export { Skeleton };
