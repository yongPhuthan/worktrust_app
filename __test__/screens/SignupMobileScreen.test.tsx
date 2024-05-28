import React from 'react';
import { render, waitFor } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';
import SignupMobileScreen from '../../screens/register/phoneAuth/signupMobile';
import { StackNavigationProp } from '@react-navigation/stack';
import { ParamListBase } from '../../types/navigationType';
import { SafeAreaProvider } from 'react-native-safe-area-context';

const mockNavigation: Partial<StackNavigationProp<ParamListBase>> = {
  navigate: jest.fn(),
  goBack: jest.fn(),
  addListener: jest.fn(),
  canGoBack: jest.fn(),
  dispatch: jest.fn(),
  getId: jest.fn(),
  getParent: jest.fn(),
  getState: jest.fn(),
  isFocused: jest.fn(),
  removeListener: jest.fn(),
  reset: jest.fn(),
  setOptions: jest.fn(),
  setParams: jest.fn(),
};

describe('SignupMobileScreen', () => {
  it('renders correctly', async () => {
    const { debug, getByText, getByPlaceholderText } = render(
      <SafeAreaProvider>
        <NavigationContainer>
          <SignupMobileScreen navigation={mockNavigation as StackNavigationProp<ParamListBase, 'RegisterScreen'>} />
        </NavigationContainer>
      </SafeAreaProvider>
    );

    // Log the rendered output
    debug();

    // Use waitFor if the text might be rendered asynchronously
    await waitFor(() => {
      expect(getByText('ยินดีต้อนรับ')).toBeTruthy();
    });

    expect(getByPlaceholderText('หมายเลขโทรศัพท์')).toBeTruthy();
    expect(getByText('ต่อไป')).toBeTruthy();
  });
});
