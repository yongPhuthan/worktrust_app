import React from 'react';
import { Modal, Dimensions, SafeAreaView, StyleSheet } from 'react-native';
import { Appbar } from 'react-native-paper';
import SignatureComponent from './create'; // Adjust the import path

interface SignatureModalProps {
  visible: boolean;
  onClose: () => void;
  sellerSignature: string;
  title : string;
  setLoadingWebP: React.Dispatch<React.SetStateAction<boolean>>;
  setSelectedSignature: React.Dispatch<React.SetStateAction<string | null>>;
}

const SignatureModal = ({
  visible,
  onClose,
  sellerSignature,
  setLoadingWebP,
  title,
  setSelectedSignature,
}: SignatureModalProps) => {
  return (
    <Modal
      visible={visible}
      animationType="slide"
      style={styles.modal}
      onDismiss={onClose}>
      <Appbar.Header
        mode="center-aligned"
        style={{
          backgroundColor: 'white',
          width: Dimensions.get('window').width,
        }}>
        <Appbar.Action icon={'close'} onPress={onClose} />
        <Appbar.Content
          title={title}
          titleStyle={{ fontSize: 18, fontWeight: 'bold' }}
        />
      </Appbar.Header>
      <SafeAreaView style={styles.containerModal}>
        <SignatureComponent
          setLoadingWebP={setLoadingWebP}
          onClose={onClose}
          sellerSignature={sellerSignature ? sellerSignature : ''} // Adjust the user signature accordingly
          setSelectedSignature={setSelectedSignature}
        />
      </SafeAreaView>
    </Modal>
  );
};

const windowWidth = Dimensions.get('window').width;
const windowHeight = Dimensions.get('window').height;

const styles = StyleSheet.create({
  modal: {
    margin: 0,
    marginTop: 40,
    justifyContent: 'flex-start',
    alignItems: 'center',
    width: windowWidth,
    height: windowHeight,
  },
  containerModal: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
    width: windowWidth,
  },
});

export default SignatureModal;