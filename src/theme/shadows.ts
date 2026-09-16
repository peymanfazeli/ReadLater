import {Platform, ViewStyle} from 'react-native';

type ShadowStyle = Pick<ViewStyle, 'elevation' | 'shadowColor' | 'shadowOffset' | 'shadowOpacity' | 'shadowRadius'>;

export const shadows = {
  sm: Platform.select<ShadowStyle>({
    android: {elevation: 2},
    ios: {
      shadowColor: '#000',
      shadowOffset: {width: 0, height: 1},
      shadowOpacity: 0.08,
      shadowRadius: 2,
    },
  })!,
  md: Platform.select<ShadowStyle>({
    android: {elevation: 4},
    ios: {
      shadowColor: '#000',
      shadowOffset: {width: 0, height: 2},
      shadowOpacity: 0.12,
      shadowRadius: 4,
    },
  })!,
  lg: Platform.select<ShadowStyle>({
    android: {elevation: 8},
    ios: {
      shadowColor: '#000',
      shadowOffset: {width: 0, height: 4},
      shadowOpacity: 0.16,
      shadowRadius: 8,
    },
  })!,
} as const;
