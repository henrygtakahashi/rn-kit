import { cn } from '@/shared/utils/utils';
import type { ComponentProps, RefAttributes } from 'react';
import { Platform, TextInput } from 'react-native';

type TextareaProps = ComponentProps<typeof TextInput> &
  RefAttributes<TextInput> & {
    isInvalid?: boolean;
  };

function Textarea({
  className,
  multiline = true,
  // On native, numberOfLines sets the maximum height before the field scrolls.
  numberOfLines = Platform.select({ web: 2, native: 8 }),
  isInvalid = false,
  ...props
}: TextareaProps) {
  return (
    <TextInput
      className={cn(
        'min-h-32 w-full rounded-md bg-secondary px-4 py-3 text-body text-secondary-foreground',
        isInvalid && 'border border-destructive',
        props.editable === false && 'opacity-50',
        Platform.select({
          web: 'resize-y outline-none focus-visible:ring-2 focus-visible:ring-ring',
        }),
        className
      )}
      placeholderTextColorClassName="accent-muted-foreground"
      cursorColorClassName="accent-foreground"
      selectionColorClassName="accent-ring"
      aria-invalid={isInvalid}
      multiline={multiline}
      numberOfLines={numberOfLines}
      textAlignVertical="top"
      {...props}
    />
  );
}

export { Textarea };
export type { TextareaProps };
