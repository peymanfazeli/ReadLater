/* eslint-env jest */
// Hermes exposes crypto.getRandomValues on device; jest's Node environment
// does not, so polyfill it here (same approach react-native-get-random-values
// uses in production).
if (!global.crypto) {
  const webcrypto = require('crypto').webcrypto;
  global.crypto = webcrypto;
}

// Reanimated runs its animations on a UI thread worklet; setUpTests() activates
// the JS-thread mock so animations/frames never touch native in jest.
require('react-native-reanimated').setUpTests();

// Gesture handlers need a native component mock; the package ships jestSetup.
require('react-native-gesture-handler/jestSetup');

jest.mock('react-native-safe-area-context', () => {
  const mock = require('react-native-safe-area-context/jest/mock');
  return mock.default ?? mock;
});

// In-memory AsyncStorage so screens hit the real store code (JSON round-trip)
// without a native module.
jest.mock('@react-native-async-storage/async-storage', () => {
  const store = new Map();
  return {
    __esModule: true,
    default: {
      getItem: jest.fn(async key => (store.has(key) ? store.get(key) : null)),
      setItem: jest.fn(async (key, value) => store.set(key, value)),
      removeItem: jest.fn(async key => store.delete(key)),
      clear: jest.fn(async () => store.clear()),
    },
  };
});

// NotifyKit's official in-memory mock (scheduling/display/spies).
jest.mock('react-native-notify-kit', () =>
  require('react-native-notify-kit/jest-mock'),
);

// Clipboard ships a native TurboModule; mock the JS surface for tests.
jest.mock('@react-native-clipboard/clipboard', () => ({
  __esModule: true,
  default: {
    setString: jest.fn(async () => {}),
    getString: jest.fn(async () => ''),
  },
}));

jest.mock('react-native-screens', () => {
  const React = require('react');
  const {View} = require('react-native');

  const MockView = props => React.createElement(View, props);
  const MockStack = props =>
    React.createElement(View, {...props, style: [{flex: 1}, props.style]});

  return {
    __esModule: true,
    enableScreens: jest.fn(),
    enableFreeze: jest.fn(),
    Screen: MockView,
    ScreenContainer: MockView,
    ScreenStack: MockStack,
    ScreenStackItem: MockStack,
    ScreenFooter: MockView,
    ScreenStackHeaderConfig: MockView,
    ScreenStackHeaderSubview: MockView,
    ScreenStackHeaderBackButtonImage: MockView,
    ScreenStackHeaderCenterView: MockView,
    ScreenStackHeaderLeftView: MockView,
    ScreenStackHeaderRightView: MockView,
    ScreenStackHeaderSearchBarView: MockView,
    FullWindowOverlay: MockView,
    useTransitionProgress: () => ({
      progress: 0,
      closing: 0,
      goingForward: 0,
    }),
    compatibilityFlags: {},
    ScreenProps: View,
    ScreenStackHeaderConfigProps: View,
  };
});
