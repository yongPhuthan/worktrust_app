import React from 'react';
import {
  Dimensions,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {Menu, Button} from 'react-native-paper';

import Modal from 'react-native-modal';

type Props = {
  serviceList: {
    title: string;
    description: string;
    unitPrice: number;
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

const CardProject = (props: Props) => {
  const {
    serviceList,
    handleRemoveService,
    index,
    handleEditService,
    setVisibleModalIndex,
    visibleModalIndex,
    handleModalClose,
  } = props;

  return (
    <Menu
    visible={visibleModalIndex}
    onDismiss={handleModalClose}
    anchorPosition="bottom"
    anchor={
      <TouchableOpacity
        style={styles.subContainer}
        onPress={setVisibleModalIndex}>
        <View style={styles.summary}>
          <Text style={styles.summaryText}>
            {props.index + 1}. {serviceList.title}
          </Text>
        </View>
        <View style={styles.description}>
          <Text>{serviceList.description}</Text>
          <Text></Text>
        </View>
        <View
          style={{flexDirection: 'row', justifyContent: 'space-between'}}>
          <View style={styles.unitPrice}>
            <Text>
              {serviceList.unitPrice
                ? new Intl.NumberFormat().format(serviceList.unitPrice)
                : '0'}
            </Text>
            <Text> x</Text>
            <Text> {serviceList.qty}</Text>
          </View>
          <Text style={styles.summaryPrice}>
            {serviceList.total
              ? new Intl.NumberFormat().format(serviceList.total)
              : '0'}
          </Text>
        </View>
      </TouchableOpacity>
    }>
    <Menu.Item
      leadingIcon="pencil"
      onPress={() => handleEditService()}
      title="แก้ไข"
    />
    <Menu.Item
      leadingIcon="delete"
      onPress={() => handleRemoveService()}
      title="ลบ"
    />
  </Menu>
  );
};

export default CardProject;

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
  summary: {
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
    fontSize: 18,
    borderBottomWidth: 1,
    borderColor: 'white',
    paddingBottom: 10,
    paddingTop: 10,
  },
  deleteButtonText: {
    fontSize: 18,
    borderBottomWidth: 1,

    textDecorationColor: 'red',
    color: 'red',
    borderColor: 'white',
    paddingBottom: 10,

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
