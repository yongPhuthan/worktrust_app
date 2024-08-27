import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  Provider as PaperProvider,
  MD3LightTheme as DefaultTheme,
} from 'react-native-paper';
import Navigation from './navigations/navigation';
import withAuthCheck from './providers/withAuthCheck';

const queryClient = new QueryClient();

const AuthCheckedNavigation = withAuthCheck(Navigation);

const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    // primary: '#0c49c1',
    // primary:'#3e3e3e' ,
    primary:'#13202f' ,
    button: '#f78a20',
    textInput: '#0c49c1',
  },
  
  // Customizing component styles using theming
  components: {
    Button: {
      // By default, button uses the primary color, so we only need to set backgroundColor
      backgroundColor: '#f78a20',
      color: '#fff', // Text color of the button
    },
    TextInput: {
      backgroundColor: '#fff', // Background color of TextInput
      color: '#0c49c1', // Text color of TextInput
      underlineColor: '#0c49c1', // Underline color of TextInput
    },
  },
};

const App = () => {
  return (
    <PaperProvider theme={theme}>
      <QueryClientProvider client={queryClient}>
        <AuthCheckedNavigation initialRouteName='DashboardQuotation' />
      </QueryClientProvider>
    </PaperProvider>
  );
};

export default App;