import '@testing-library/jest-native/extend-expect';
jest.mock('./firebase.ts', () => require('./__mocks__/react-native-firebase.ts'));
