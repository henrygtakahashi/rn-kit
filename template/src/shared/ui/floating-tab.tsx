import type { MotionSpec, TabBarTransition } from '@/shared/ui/floating-tab-bar.presets';
import { Icon } from '@/shared/ui/icon';
import { Text } from '@/shared/ui/text';
import type { Icon as PhosphorIcon } from 'phosphor-react-native';
import { useEffect, useState } from 'react';
import { Pressable, View, type LayoutChangeEvent } from 'react-native';
import Animated, {
  Easing,
  ReduceMotion,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

// A collapsed tab is a 48 x 48 circle: the 24 icon plus 12 on each side. The
// label starts after a 12 gap, exactly at the collapsed edge, so no sliver of an
// opaque entering label shows before the pill grows.
const COLLAPSED_WIDTH = 48;

function animateTo(spec: MotionSpec, toValue: number) {
  if (spec.duration === 0) return toValue;
  const animation =
    spec.type === 'timing'
      ? withTiming(toValue, {
          duration: spec.duration,
          easing: Easing.bezier(...spec.easing),
          reduceMotion: ReduceMotion.System,
        })
      : withSpring(toValue, {
          duration: spec.duration,
          dampingRatio: spec.dampingRatio,
          // The width never passes its target, so no tab can overflow the bar.
          overshootClamping: true,
          reduceMotion: ReduceMotion.System,
        });
  return spec.delay ? withDelay(spec.delay, animation, ReduceMotion.System) : animation;
}

type FloatingTabProps = {
  label: string;
  icon: PhosphorIcon;
  isFocused: boolean;
  transition: TabBarTransition;
  onPress: () => void;
  onLongPress: () => void;
};

// Each tab owns its pill (DESIGN.md, "Floating pill tab bar"). `width` drives the
// pill between the collapsed circle and its full size; `fade` drives its
// background, its icon color, and, while leaving, its label. The entering label
// is opaque from the first frame and revealed by the growing pill's clip.
function FloatingTab({
  label,
  icon,
  isFocused,
  transition,
  onPress,
  onLongPress,
}: FloatingTabProps) {
  const width = useSharedValue(isFocused ? 1 : 0);
  const fade = useSharedValue(isFocused ? 1 : 0);
  const [expandedWidth, setExpandedWidth] = useState(COLLAPSED_WIDTH);
  const weight = isFocused ? 'fill' : 'regular';

  // Starts the Reanimated transition, which runs outside React.
  useEffect(() => {
    const motion = isFocused ? transition.enter : transition.exit;
    const target = isFocused ? 1 : 0;
    width.value = animateTo(motion.width, target);
    fade.value = animateTo(motion.fade, target);
  }, [isFocused, transition, width, fade]);

  // Yoga snaps edges to the pixel grid, so the measured width moves by a third of a
  // point as the bar shifts. Rounding keeps it stable instead of re-triggering layout.
  const handleContentLayout = (event: LayoutChangeEvent) => {
    setExpandedWidth(Math.max(COLLAPSED_WIDTH, Math.round(event.nativeEvent.layout.width)));
  };

  const pillStyle = useAnimatedStyle(() => ({
    width: interpolate(width.value, [0, 1], [COLLAPSED_WIDTH, expandedWidth]),
  }));
  const fadeStyle = useAnimatedStyle(() => ({ opacity: fade.value }));
  const inactiveIconStyle = useAnimatedStyle(() => ({ opacity: 1 - fade.value }));
  const labelStyle = useAnimatedStyle(() => ({ opacity: isFocused ? 1 : fade.value }));

  return (
    <Pressable
      onPress={onPress}
      onLongPress={onLongPress}
      accessibilityRole="tab"
      accessibilityLabel={label}
      accessibilityState={{ selected: isFocused }}
      className="rounded-full active:opacity-70">
      <Animated.View style={pillStyle} className="h-12 overflow-hidden rounded-full">
        <Animated.View style={fadeStyle} className="absolute inset-0 bg-background" />
        {/* The wide box lets the row take its natural width; measuring it inside the
            pill would tie the measurement to the animated width and loop. */}
        <View className="absolute inset-y-0 left-0 w-96 justify-center">
          <View
            onLayout={handleContentLayout}
            className="flex-row items-center gap-3 self-start px-3">
            <View className="size-6">
              <Animated.View style={fadeStyle} className="absolute inset-0">
                <Icon as={icon} size={24} weight={weight} className="text-foreground" />
              </Animated.View>
              <Animated.View style={inactiveIconStyle} className="absolute inset-0">
                <Icon as={icon} size={24} weight={weight} className="text-primary-foreground" />
              </Animated.View>
            </View>
            <Animated.View style={labelStyle} className="pr-1">
              <Text numberOfLines={1} className="font-medium text-foreground">
                {label}
              </Text>
            </Animated.View>
          </View>
        </View>
      </Animated.View>
    </Pressable>
  );
}

export { FloatingTab };
