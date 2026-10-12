import { TextClassContext } from '@/shared/ui/text';
import { cn } from '@/shared/utils/utils';
import type { Icon as PhosphorIcon, IconProps as PhosphorIconProps } from 'phosphor-react-native';
import { use } from 'react';
import { withUniwind } from 'uniwind';

type IconSize = 16 | 20 | 24;

// DESIGN.md allows only these weights.
type IconWeight = 'regular' | 'fill' | 'bold';

type IconProps = Omit<PhosphorIconProps, 'size' | 'weight' | 'color'> & {
  as: PhosphorIcon;
  className?: string;
  size?: IconSize;
  weight?: IconWeight;
};

type IconImplProps = Omit<PhosphorIconProps, 'weight'> & { as: PhosphorIcon; weight?: IconWeight };

function IconImpl({ as: IconComponent, ...props }: IconImplProps) {
  return <IconComponent {...props} />;
}

const StyledIcon = withUniwind(IconImpl, {
  color: {
    fromClassName: 'className',
    styleProperty: 'color',
  },
});

/**
 * Renders a Phosphor icon with its color taken from a Uniwind text class.
 *
 * @example
 * <Icon as={House} size={24} weight="fill" className="text-muted-foreground" />
 */
function Icon({ as: IconComponent, className, size = 20, weight = 'regular', ...props }: IconProps) {
  const textClass = use(TextClassContext);
  return (
    <StyledIcon
      as={IconComponent}
      className={cn('text-foreground', textClass, className)}
      size={size}
      weight={weight}
      {...props}
    />
  );
}

export { Icon };
export type { IconProps, IconSize, IconWeight };
