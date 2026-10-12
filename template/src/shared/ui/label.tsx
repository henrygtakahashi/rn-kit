import { cn } from '@/shared/utils/utils';
import * as LabelPrimitive from '@rn-primitives/label';
import type { ComponentProps } from 'react';
import { Platform } from 'react-native';

function Label({
  className,
  onPress,
  onLongPress,
  onPressIn,
  onPressOut,
  disabled,
  ...props
}: ComponentProps<typeof LabelPrimitive.Text>) {
  return (
    <LabelPrimitive.Root
      className={cn(
        'flex-row items-center gap-2 select-none',
        Platform.select({ web: 'cursor-default' }),
        disabled && 'opacity-50'
      )}
      onPress={onPress}
      onLongPress={onLongPress}
      onPressIn={onPressIn}
      onPressOut={onPressOut}
      disabled={disabled}>
      <LabelPrimitive.Text
        className={cn('text-caption font-medium text-foreground', className)}
        {...props}
      />
    </LabelPrimitive.Root>
  );
}

export { Label };
