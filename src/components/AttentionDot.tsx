import React, {useEffect, useRef} from 'react';
import {Animated, Easing, StyleSheet, ViewStyle} from 'react-native';
import {useTheme} from '../app/providers/ThemeProvider';

type Props = {
  active: boolean;
  size?: number;
  style?: Animated.WithAnimatedValue<ViewStyle>;
};

// Red attention dot shown on buttons that lead to a place where the user can
// act on a missing permission. While active it jiggles gently; flipping to
// inactive fades it out (the indicator is "wiped away").
export function AttentionDot({active, size = 12, style}: Props) {
  const theme = useTheme();
  const shake = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(active ? 1 : 0)).current;

  useEffect(() => {
    if (active) {
      Animated.timing(opacity, {
        toValue: 1,
        duration: 180,
        useNativeDriver: true,
      }).start();

      const loop = Animated.loop(
        Animated.sequence([
          Animated.timing(shake, {
            toValue: 1,
            duration: 160,
            easing: Easing.inOut(Easing.quad),
            useNativeDriver: true,
          }),
          Animated.timing(shake, {
            toValue: -1,
            duration: 160,
            easing: Easing.inOut(Easing.quad),
            useNativeDriver: true,
          }),
          Animated.timing(shake, {
            toValue: 1,
            duration: 160,
            easing: Easing.inOut(Easing.quad),
            useNativeDriver: true,
          }),
          Animated.timing(shake, {
            toValue: 0,
            duration: 320,
            easing: Easing.inOut(Easing.quad),
            useNativeDriver: true,
          }),
        ]),
      );
      loop.start();
      return () => loop.stop();
    }

    shake.stopAnimation();
    shake.setValue(0);
    Animated.timing(opacity, {
      toValue: 0,
      duration: 240,
      useNativeDriver: true,
    }).start();
  }, [active, opacity, shake]);

  const translateX = shake.interpolate({
    inputRange: [-1, 0, 1],
    outputRange: [-3, 0, 3],
  });

  return (
    <Animated.View
      pointerEvents="none"
      accessibilityElementsHidden={!active}
      importantForAccessibility={active ? 'auto' : 'no-hide-descendants'}
      accessibilityLabel="اعلان‌ها فعال نیست"
      style={[
        styles.dot,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: theme.colors.error,
          opacity,
          transform: [{translateX}],
        },
        style,
      ]}
    />
  );
}

const styles = StyleSheet.create({
  dot: {
    position: 'absolute',
  },
});
