import {QueryClient, QueryClientProvider} from '@tanstack/react-query';
import {
  Provider,
  PaperProvider,
  MD3LightTheme as DefaultTheme,
} from 'react-native-paper';
import Navigation from './navigations/navigation';
import withAuthCheck from './providers/withAuthCheck';
// import { View } from 'react-native';

const queryClient = new QueryClient();

const AuthCheckedNavigation = withAuthCheck(Navigation);
const theme = {
  ...DefaultTheme,
  // Specify custom property
  myOwnProperty: true,
  // Specify custom property in nested object
  colors: {
    ...DefaultTheme.colors,
    // primary: '#1b72e8',
    // primary:'#0363d3',
    primary: '#00674a',
    secondaryContainer: '#e3fcf7', // This is a lighter shade of the primary color

    // primary:'#f79020'
    // primary :'#173799'
    // primary : '#009995'
    // primary : '#0b65c2',
  },
};

const App = () => {
  return (
    <PaperProvider theme={theme}>
      <QueryClientProvider client={queryClient}>
        <AuthCheckedNavigation />
      </QueryClientProvider>
    </PaperProvider>
  );
};

export default App;
