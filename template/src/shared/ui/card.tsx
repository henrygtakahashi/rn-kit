import { Text, type TextProps } from '@/shared/ui/text';
import { cn } from '@/shared/utils/utils';
import type { ComponentProps, RefAttributes } from 'react';
import { View } from 'react-native';

type ViewProps = ComponentProps<typeof View> & RefAttributes<View>;

// Cards separate from the screen by tone alone, and do not set a text color
// context (see "Text color resolution" in DESIGN.md).
function Card({ className, ...props }: ViewProps) {
  return <View className={cn('gap-3 rounded-lg bg-card p-5', className)} {...props} />;
}

function CardHeader({ className, ...props }: ViewProps) {
  return <View className={cn('gap-1', className)} {...props} />;
}

function CardTitle({ className, ...props }: TextProps) {
  return <Text variant="subtitle" className={cn('text-card-foreground', className)} {...props} />;
}

function CardDescription(props: TextProps) {
  return <Text variant="caption" {...props} />;
}

function CardContent({ className, ...props }: ViewProps) {
  return <View className={cn('gap-2', className)} {...props} />;
}

function CardFooter({ className, ...props }: ViewProps) {
  return <View className={cn('flex-row items-center gap-2', className)} {...props} />;
}

export { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle };
