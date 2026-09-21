import React, {useEffect} from 'react';
import {StyleSheet, View} from 'react-native';
import Animated, {
  Easing,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import type {TransitionOrigin} from '../providers/SettingsProvider';

type Props = {
  origin: TransitionOrigin;
  radius: number;
  color: string;
  animationKey: number;
  onDone: () => void;
};

// Circular-reveal overlay for theme changes. The screen is already flipped to
// the new theme by the time this mounts; this view is a disc in the *previous*
// background color (covering the whole window) that shrinks inward to the
// toggle position, revealing the new theme from that point outward.
//
// The disc is always a full-window-sized circle, so it is exact regardless of
// screen size, safe areas, drawer position, or RTL/LTR. A fresh `animationKey`
// remounts the disc, which safely restarts a rapid second toggle.
export function ThemeWave({
  origin,
  radius,
  color,
  animationKey,
  onDone,
}: Props) {
  const scale = useSharedValue(1);

  useEffect(() => {
    scale.value = 1;
    scale.value = withTiming(
      0.001,
      {duration: 420, easing: Easing.out(Easing.quad)},
      finished => {
        if (finished) {
          runOnJS(onDone)();
        }
      },
    );
    // Restart only on a new key (rapid toggle), not on every parent render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [animationKey]);

  const style = useAnimatedStyle(() => ({
    transform: [{scale: scale.value}],
  }));

  return (
    <View pointerEvents="none" style={styles.layer}>
      <Animated.View
        style={[
          style,
          styles.disc,
          {
            width: radius * 2,
            height: radius * 2,
            borderRadius: radius,
            backgroundColor: color,
            left: origin.x - radius,
            top: origin.y - radius,
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  layer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1000,
  },
  disc: {
    position: 'absolute',
  },
});
