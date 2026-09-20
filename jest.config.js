module.exports = {
  preset: 'react-native',
  setupFiles: ['<rootDir>/jest.setup.js'],
transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?|@react-native-async-storage|@react-navigation|react-native-safe-area-context|react-native-screens|react-native-notify-kit|react-native-gesture-handler|react-native-reanimated|react-native-drawer-layout))',
  ],
};
