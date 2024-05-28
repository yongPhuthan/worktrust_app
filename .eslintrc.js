module.exports = {
  root: true,
  semi: [2, "never"],
  files: ['**/__tests__/**/*.[jt]s?(x)', '**/?(*.)+(spec|test).[jt]s?(x)'],
  extends: ['plugin:testing-library/react','@react-native-community'],
};
