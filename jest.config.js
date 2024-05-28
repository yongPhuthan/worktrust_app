module.exports = {
  preset: 'react-native',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': 'babel-jest',
  },
  testEnvironment: 'node',
  transformIgnorePatterns: [
    'node_modules/(?!(jest-)?react-native|@react-native|@react-native-firebase|@react-navigation|react-native-vector-icons)',
  ],
  moduleNameMapper: {
    '^@env$': '<rootDir>/__mocks__/@env.js',
  },
};
