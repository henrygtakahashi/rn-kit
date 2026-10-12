import { FloatingTab } from '@/shared/ui/floating-tab';
import {
  DEFAULT_TAB_BAR_TRANSITION,
  resolveTabBarTransition,
  type TabBarTransition,
  type TabBarTransitionName,
} from '@/shared/ui/floating-tab-bar.presets';
import * as Haptics from 'expo-haptics';
import type { BottomTabBarProps } from 'expo-router/tabs';
import type { Icon as PhosphorIcon } from 'phosphor-react-native';
import { View } from 'react-native';
import { useKeyboardState } from 'react-native-keyboard-controller';
import { useReducedMotion } from 'react-native-reanimated';

type FloatingTabBarProps = BottomTabBarProps & {
  icons: Record<string, PhosphorIcon>;
  /** A preset name, or a custom preset defined at module level (not inline). */
  transition?: TabBarTransitionName | TabBarTransition;
};

// Passed to the `tabBar` prop of Expo Router's Tabs. The bar hugs its content and
// stays centered while the pills change width.
function FloatingTabBar({
  state,
  descriptors,
  navigation,
  icons,
  transition = DEFAULT_TAB_BAR_TRANSITION,
}: FloatingTabBarProps) {
  const isKeyboardVisible = useKeyboardState((keyboard) => keyboard.isVisible);
  // With reduce motion on, every preset becomes "instant".
  const resolvedTransition = resolveTabBarTransition(transition, useReducedMotion());
  if (isKeyboardVisible) return null;

  return (
    <View pointerEvents="box-none" className="absolute inset-x-0 bottom-0 items-center pb-safe-offset-2">
      <View accessibilityRole="tablist" className="flex-row items-center gap-1 rounded-full bg-primary p-1.5">
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const label = options.title ?? route.name;
          const isFocused = state.index === index;

          const handlePress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });
            if (isFocused || event.defaultPrevented) return;
            void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            navigation.navigate(route.name, route.params);
          };

          const handleLongPress = () => {
            navigation.emit({ type: 'tabLongPress', target: route.key });
          };

          return (
            <FloatingTab
              key={route.key}
              label={label}
              icon={icons[route.name]}
              isFocused={isFocused}
              transition={resolvedTransition}
              onPress={handlePress}
              onLongPress={handleLongPress}
            />
          );
        })}
      </View>
    </View>
  );
}

export { FloatingTabBar };
