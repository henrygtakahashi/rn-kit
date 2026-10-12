import { TextClassContext } from '@/shared/ui/text';
import { cn } from '@/shared/utils/utils';
import { cva, type VariantProps } from 'class-variance-authority';
import type { ComponentProps, RefAttributes } from 'react';
import { Platform, Pressable, type View } from 'react-native';

const buttonVariants = cva(
  cn(
    'group shrink-0 flex-row items-center justify-center gap-2 rounded-full',
    Platform.select({
      web: 'whitespace-nowrap transition-all outline-none focus-visible:ring-ring/50 disabled:pointer-events-none',
    })
  ),
  {
    variants: {
      variant: {
        default: cn('bg-primary active:opacity-80', Platform.select({ web: 'hover:opacity-90' })),
        destructive: cn(
          'bg-destructive active:opacity-80',
          Platform.select({ web: 'hover:opacity-90' })
        ),
        secondary: cn('bg-secondary active:opacity-70', Platform.select({ web: 'hover:opacity-80' })),
        ghost: cn('active:bg-accent', Platform.select({ web: 'hover:bg-accent' })),
      },
      size: {
        default: 'h-12 px-5',
        sm: 'h-11 px-4',
        icon: 'size-12',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

const buttonTextVariants = cva(
  cn('text-body font-medium', Platform.select({ web: 'pointer-events-none transition-colors' })),
  {
    variants: {
      variant: {
        default: 'text-primary-foreground',
        destructive: 'text-destructive-foreground',
        secondary: 'text-secondary-foreground',
        ghost: 'text-foreground',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

type ButtonProps = ComponentProps<typeof Pressable> &
  RefAttributes<View> &
  VariantProps<typeof buttonVariants>;

function Button({ className, variant, size, ...props }: ButtonProps) {
  return (
    <TextClassContext value={buttonTextVariants({ variant })}>
      <Pressable
        className={cn(props.disabled && 'opacity-50', buttonVariants({ variant, size }), className)}
        role="button"
        {...props}
      />
    </TextClassContext>
  );
}

export { Button, buttonTextVariants, buttonVariants };
export type { ButtonProps };
