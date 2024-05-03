import React from 'react';
import {
  Dimensions,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Modal from 'react-native-modal';

type Props = {
  contract: {
    title: string;
    description: string;
    unitPrice: number;
    discountPercent: number;
    qty: number;
    total: number;
  };
  index: number;
  handleEditService: () => void;
  visibleModalIndex: boolean;
  setVisibleModalIndex: () => void;
  handleModalClose: () => void;
  handleRemoveService: () => void;
};
const windowWidth = Dimensions.get('window').width;

const CardContract = (props: Props) => {
  const {
    contract,
    handleRemoveService,
    index,
    handleEditService,
    setVisibleModalIndex,
    visibleModalIndex,
    handleModalClose,
  } = props;

  return (
    <View>
      <TouchableOpacity
        style={styles.subContainer}
        onPress={setVisibleModalIndex}>
        <View style={styles.row}>
          <Text style={styles.summaryText}>
            {props.index + 1}. {contract.title}
          </Text>
        </View>
        <View style={styles.description}>
          <Text>{contract.description}</Text>
          <Text></Text>
        </View>
        <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
          <View style={styles.unitPrice}>
            <Text>
              {contract.unitPrice
                ? new Intl.NumberFormat().format(contract.unitPrice)
                : '0'}
            </Text>
            <Text> x</Text>
            <Text> {contract.qty}</Text>
          </View>
          <Text style={styles.summaryPrice}>
            {contract.total
              ? new Intl.NumberFormat().format(contract.total)
              : '0'}
          </Text>
        </View>
      </TouchableOpacity>
    </View>
  );
};

export default CardContract;

const styles = StyleSheet.create({
  subContainer: {
    backgroundColor: '#ffffff',
    padding: 50,
    marginBottom: 0,
    height: 'auto',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    marginVertical: 10,
    paddingHorizontal: 30,
    paddingVertical: 30,
  },
  title: {
    marginBottom: 20,
    fontSize: 14,
    fontFamily: 'Sukhumvit Set Bold',
    color: 'gray',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  description: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  unitPrice: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: windowWidth * 0.2,
    marginTop: 10,
  },
  subummary: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  summaryText: {
    fontSize: 16,
  },
  summaryPrice: {
    marginTop: 5,
    fontWeight: 'bold',
    fontSize: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
    marginTop: 30,
  },
  modalContainer: {
    backgroundColor: 'white',
    padding: 20,
    borderTopLeftRadius: 5,
    borderTopRightRadius: 5,
    width: '90%',
    alignItems: 'center',
    position: 'absolute',
    bottom: 0,
    // bottom: '40%',
    left: 0,
  },
  closeButtonText: {
    fontSize: 20,
    borderBottomWidth: 1,
    borderColor: 'white',
    paddingBottom: 10,
    paddingTop: 10,
    fontWeight: 'bold',
    fontFamily: 'Sukhumvit set',
  },
  deleteButtonText: {
    fontSize: 20,
    borderBottomWidth: 1,
    fontWeight: 'bold',
    textDecorationColor: 'red',
    color: 'red',
    borderColor: 'white',
    paddingBottom: 10,
    fontFamily: 'Sukhumvit set',
    paddingTop: 10,
  },
  icon: {
    width: 24,
    height: 24,
    marginRight: 8,
  },
  closeButton: {
    paddingVertical: 10,
  },
  headerModal: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    backgroundColor: '#ffffff',
  },
  label: {
    fontSize: 16,
    color: '#19232e',
  },
  containerModal: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modal: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 5,
    width: '80%',
    height: '80%',
  },
});
