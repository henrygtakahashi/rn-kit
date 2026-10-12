import { cn } from '@/shared/utils/utils';
import type { ComponentProps, RefAttributes } from 'react';
import { Platform, TextInput } from 'react-native';

type InputProps = ComponentProps<typeof TextInput> &
  RefAttributes<TextInput> & {
    isInvalid?: boolean;
  };

function Input({ className, isInvalid = false, ...props }: InputProps) {
  return (
    <TextInput
      className={cn(
        'h-12 w-full min-w-0 rounded-md bg-secondary px-4 text-body text-secondary-foreground',
        isInvalid && 'border border-destructive',
        props.editable === false && 'opacity-50',
        Platform.select({
          web: 'outline-none focus-visible:ring-2 focus-visible:ring-ring',
        }),
        className
      )}
      placeholderTextColorClassName="accent-muted-foreground"
      cursorColorClassName="accent-foreground"
      selectionColorClassName="accent-ring"
      aria-invalid={isInvalid}
      {...props}
    />
  );
}

export { Input };
export type { InputProps };
