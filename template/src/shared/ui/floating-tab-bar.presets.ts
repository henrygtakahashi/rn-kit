// Transition presets for the floating pill tab bar. A preset is plain data, so a
// project can define its own and pass it to `transition` without editing the
// component.

/** A cubic-bezier curve, as in CSS: `[x1, y1, x2, y2]`. */
export type BezierCurve = readonly [number, number, number, number];

export type TimingSpec = {
  type: 'timing';
  duration: number;
  easing: BezierCurve;
  delay?: number;
};

/**
 * A Reanimated spring described by its perceptual duration and damping ratio.
 * The component always clamps overshoot, so the width never passes its target.
 */
export type SpringSpec = {
  type: 'spring';
  duration: number;
  dampingRatio: number;
  delay?: number;
};

export type MotionSpec = TimingSpec | SpringSpec;

/** How one pill moves when its tab becomes active (`enter`) or inactive (`exit`). */
export type PillMotion = {
  /** Width between the collapsed circle and the full pill. */
  width: MotionSpec;
  /** Background, label, and icon color. */
  fade: MotionSpec;
};

export type TabBarTransition = {
  enter: PillMotion;
  exit: PillMotion;
};

export const EASING = {
  linear: [0, 0, 1, 1],
  easeOutQuad: [0.25, 0.46, 0.45, 0.94],
  easeInOutQuad: [0.455, 0.03, 0.515, 0.955],
  // Fitted to the reference: a soft start and a long, gentle landing.
  softStart: [0.33, 0.05, 0.5, 1],
  // Fitted to the reference: a nearly linear fade that eases at the end.
  quickOut: [0.2, 0.2, 0.4, 1],
} as const satisfies Record<string, BezierCurve>;

const NONE: TimingSpec = { type: 'timing', duration: 0, easing: EASING.linear };

// Fitted to the Gradient Weather reference: two transitions recorded at 120 fps,
// each pill's width and opacity tracked frame by frame, then delay, duration, and
// curve chosen by least squares (RMS error 0.02 to 0.05 per curve).
// - The leaving pill's background, label, and icon color are gone in ~30 ms.
// - Its width starts collapsing ~65 ms after the tap and takes ~260 ms (ease-in-out).
// - The entering pill starts ~15 ms after the tap and fades in over ~160 ms.
// - Its width starts ~25 ms after the tap and grows over ~280 ms with a soft
//   start and a long, gentle landing.
// Because the leaving pill collapses late, the bar briefly grows, then settles.
const reference: TabBarTransition = {
  enter: {
    width: { type: 'timing', duration: 280, easing: EASING.softStart, delay: 25 },
    fade: { type: 'timing', duration: 160, easing: EASING.quickOut, delay: 15 },
  },
  exit: {
    width: { type: 'timing', duration: 260, easing: EASING.easeInOutQuad, delay: 65 },
    fade: { type: 'timing', duration: 30, easing: EASING.linear },
  },
};

// One shared timing for everything (DESIGN.md's original description).
const SMOOTH_TIMING: TimingSpec = { type: 'timing', duration: 250, easing: EASING.easeOutQuad };

const smooth: TabBarTransition = {
  enter: { width: SMOOTH_TIMING, fade: SMOOTH_TIMING },
  exit: { width: SMOOTH_TIMING, fade: SMOOTH_TIMING },
};

// The entering pill grows on a critically damped spring: soft, and it never
// overshoots. The leaving pill uses the same spring so both widths stay in step.
const SOFT_SPRING: SpringSpec = { type: 'spring', duration: 350, dampingRatio: 1 };

const spring: TabBarTransition = {
  enter: {
    width: SOFT_SPRING,
    fade: { type: 'timing', duration: 150, easing: EASING.easeOutQuad },
  },
  exit: {
    width: SOFT_SPRING,
    fade: { type: 'timing', duration: 100, easing: EASING.linear },
  },
};

const instant: TabBarTransition = {
  enter: { width: NONE, fade: NONE },
  exit: { width: NONE, fade: NONE },
};

export const TAB_BAR_TRANSITIONS = { reference, smooth, spring, instant } as const;

export type TabBarTransitionName = keyof typeof TAB_BAR_TRANSITIONS;

export const DEFAULT_TAB_BAR_TRANSITION: TabBarTransitionName = 'reference';

export function resolveTabBarTransition(
  transition: TabBarTransitionName | TabBarTransition,
  isReduceMotionEnabled: boolean
): TabBarTransition {
  if (isReduceMotionEnabled) return TAB_BAR_TRANSITIONS.instant;
  if (typeof transition === 'string') return TAB_BAR_TRANSITIONS[transition];
  return transition;
}
