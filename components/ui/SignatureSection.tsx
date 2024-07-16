// SignatureSection.tsx
import React from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';
import {
    Switch
} from 'react-native-paper';
import useSignature from '../../hooks/useSignature';
import SignatureModal from '../utils/signature/select';
import ShowSignature from '../utils/signature/view';
const SignatureSection = ({ fieldName, title }: { fieldName: string, title: string }) => {
  const {
    sellerSignature,
    isLoadingWebP,
    setIsLoadingWebP,
    toggleSignature,
    signatureModal,
    onCloseSignature,
    setSelectedSignature,
  } = useSignature(fieldName);

  return (
    <>
      <View style={styles.signatureRow}>
        <Text style={styles.signHeader}>{title}</Text>
        <Switch
          ios_backgroundColor="#3e3e3e"
          onValueChange={toggleSignature}
          value={!!sellerSignature}
          style={Platform.select({
            ios: {
              transform: [{ scaleX: 0.7 }, { scaleY: 0.7 }],
              marginTop: 5,
            },
            android: {},
          })}
        />
      </View>
      {sellerSignature && (
        <ShowSignature
          sellerSignature={sellerSignature}
          isLoadingWebP={isLoadingWebP}
          setIsLoadingWebP={setIsLoadingWebP}
        />
      )}
      <SignatureModal
        visible={signatureModal}
        onClose={onCloseSignature}
        sellerSignature={sellerSignature || ''}
        setLoadingWebP={setIsLoadingWebP}
        title={`${title}`}
        setSelectedSignature={setSelectedSignature}
      />
    </>
  );
};

const styles = StyleSheet.create({
  signatureRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  signHeader: {
    flexDirection: 'row',
    marginVertical: 10,
    fontSize: 16,
    color: '#19232e',
  },
});

export default SignatureSection;