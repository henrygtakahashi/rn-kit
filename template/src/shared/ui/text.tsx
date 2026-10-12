import { cn } from '@/shared/utils/utils';
import * as Slot from '@rn-primitives/slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { createContext, use, type ComponentProps, type RefAttributes } from 'react';
import { Platform, Text as RNText, type Role } from 'react-native';

// Variants set size and weight only. Color is resolved in Text (see DESIGN.md).
const textVariants = cva(Platform.select({ web: 'select-text' }), {
  variants: {
    variant: {
      display: 'text-display font-semibold',
      title: 'text-title font-semibold',
      subtitle: 'text-subtitle font-semibold',
      body: 'text-body',
      caption: 'text-caption',
    },
  },
  defaultVariants: {
    variant: 'body',
  },
});

type TextVariantProps = VariantProps<typeof textVariants>;

type TextVariant = NonNullable<TextVariantProps['variant']>;

// Only variants that need their own color appear here.
const VARIANT_COLOR: Partial<Record<TextVariant, string>> = {
  caption: 'text-muted-foreground',
};

const ROLE: Partial<Record<TextVariant, Role>> = {
  display: 'heading',
  title: 'heading',
  subtitle: 'heading',
};

const TextClassContext = createContext<string | undefined>(undefined);

type TextProps = ComponentProps<typeof RNText> &
  RefAttributes<RNText> &
  TextVariantProps & {
    asChild?: boolean;
  };

// Color resolution: explicit className, else the variant's own color, else the
// context color, else text-foreground.
function Text({ className, asChild = false, variant = 'body', ...props }: TextProps) {
  const textClass = use(TextClassContext);
  const Component = asChild ? Slot.Text : RNText;
  const resolvedVariant = variant ?? 'body';
  return (
    <Component
      className={cn(
        'text-foreground',
        textClass,
        textVariants({ variant: resolvedVariant }),
        VARIANT_COLOR[resolvedVariant],
        className
      )}
      role={ROLE[resolvedVariant]}
      {...props}
    />
  );
}

export { Text, TextClassContext };
export type { TextProps, TextVariant };
