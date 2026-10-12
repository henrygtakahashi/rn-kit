import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  resolveTabBarTransition,
  TAB_BAR_TRANSITIONS,
  type MotionSpec,
  type TabBarTransition,
} from '@/shared/ui/floating-tab-bar.presets';

const specsOf = (transition: TabBarTransition): MotionSpec[] => [
  transition.enter.width,
  transition.enter.fade,
  transition.exit.width,
  transition.exit.fade,
];

describe('tab bar transition presets', () => {
  it('resolves a preset by name and passes a custom preset through', () => {
    const custom = TAB_BAR_TRANSITIONS.smooth;
    assert.equal(resolveTabBarTransition('spring', false), TAB_BAR_TRANSITIONS.spring);
    assert.equal(resolveTabBarTransition(custom, false), custom);
  });

  it('forces "instant" when reduce motion is on', () => {
    assert.equal(resolveTabBarTransition('reference', true), TAB_BAR_TRANSITIONS.instant);
    assert.ok(specsOf(TAB_BAR_TRANSITIONS.instant).every((spec) => spec.duration === 0));
  });

  it('has valid timings and curves in every preset', () => {
    for (const transition of Object.values(TAB_BAR_TRANSITIONS)) {
      for (const spec of specsOf(transition)) {
        assert.ok(spec.duration >= 0 && (spec.delay ?? 0) >= 0);
        if (spec.type === 'timing') {
          const [x1, , x2] = spec.easing;
          assert.ok(x1 >= 0 && x1 <= 1 && x2 >= 0 && x2 <= 1);
        } else {
          assert.ok(spec.dampingRatio >= 1, 'a damping ratio below 1 would bounce');
        }
      }
    }
  });

  it('makes the "reference" leaving pill fade before its width starts to collapse', () => {
    const { exit } = TAB_BAR_TRANSITIONS.reference;
    assert.ok(exit.fade.duration <= (exit.width.delay ?? 0));
  });
});
