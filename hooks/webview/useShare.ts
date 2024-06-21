import { Alert } from 'react-native';
import Share from 'react-native-share';  

type UseShareOptions = {
  url: string;
  title: string;
};

const useShare = ({ url, title }: UseShareOptions) => {
  const handleShare = async () => {
    try {
      await Share.open({
        message: `${title} ${url}`,  // Use the title and URL passed to the hook
        // url,  // Comment out this line
        // title: `${title} ${url}`,  // Customizable title with URL
      });
      // Optional: Add logic here if you need to handle the success scenario
    } catch (error) {
      console.log(error);
      // Alert.alert('Error', 'Unable to share');
    }
  };

  return handleShare;
};

export default useShare;
