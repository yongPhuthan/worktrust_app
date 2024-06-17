import {StyleSheet, Text, View, ActivityIndicator, Image} from 'react-native';
import React from 'react';

type Props = {
  sellerSignature: string;
  isLoadingWebP: boolean;
  setIsLoadingWebP: (arg0: boolean) => void;
};

const ShowSignature = (props: Props) => {
  const {sellerSignature, isLoadingWebP, setIsLoadingWebP} = props;
  React.useEffect(() => {
    const interval = setInterval(async () => {
      if (sellerSignature && isLoadingWebP) {
        try {
          const response = await fetch(sellerSignature);
          if (response.ok) {
            setIsLoadingWebP(false);
          }
        } catch (error) {
          console.error('Error checking SignatureImage:', error);
        }
      }
    }, 1500);

    return () => clearInterval(interval);
  }, [sellerSignature, isLoadingWebP]);

  return (
    <View>
      {sellerSignature &&
        (isLoadingWebP ? (
          <View
            style={{
              flex: 1,
              justifyContent: 'center',
              alignItems: 'center',
            }}>
            <ActivityIndicator />
          </View>
        ) : (
          <View>
            <Image
              source={{uri: sellerSignature}}
              style={styles.signatureImage}
            />
          </View>
        ))}
    </View>
  );
};

export default ShowSignature;

const styles = StyleSheet.create({
  signatureImage: {
    width: '50%',
    aspectRatio: 1,
    borderRadius: 1,
    resizeMode: 'cover',
  },
});
