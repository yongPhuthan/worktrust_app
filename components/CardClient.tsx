import {
  StyleSheet,
  Dimensions,
  Text,
  View,
  Touchable,
  TouchableOpacity,
} from 'react-native';
import React, {useState, useContext, useEffect, useRef} from 'react';
import {Store} from '../redux/store';
import {useForm, Controller, useFormContext, set} from 'react-hook-form';

import {FontAwesomeIcon} from '@fortawesome/react-native-fontawesome';
import {
  faEdit,
  faPencil,
  faPeopleCarry,
  faUser,
} from '@fortawesome/free-solid-svg-icons';
type Props = {
  handleEditClient: Function;
};
const windowWidth = Dimensions.get('window').width;

const CardClient = (props: Props) => {
  const context = useFormContext();

  const {
    register,
    control,
    getValues,
    setValue,
    watch,
    formState: {errors},
  } = context;


  return (
    <View>
      <View style={styles.header}>
        <View style={styles.labelContainer}>
          <FontAwesomeIcon icon={faUser} color="#19232e" size={20} />
          <Text style={styles.label}>ลูกค้า</Text>
        </View>

      </View>
      <TouchableOpacity onPress={() => props.handleEditClient()} style={styles.subContainer}>
        <View style={styles.summary}>
          <Text style={styles.summaryText}>{watch('customer.name')}</Text>
          <Text style={styles.summaryPrice}></Text>
        </View>
        <View style={styles.description}>
          <Text>{watch('customer.address')}</Text>
        </View>
        <View style={styles.telAndTax}>
          <Text>โทร.{watch('customer.phone')}</Text>
          <Text>{watch('customer.companyId')}</Text>
        </View>
      </TouchableOpacity>
    </View>
  );
};

export default CardClient;

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
  summary: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  description: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  telAndTax: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
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
    fontSize: 18,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 4,
    borderRadius: 4,
    marginLeft: 'auto',
  },
  editButtonText: {
    fontSize: 14,
    color: '#19232e',
    marginLeft: 4,
  },
  icon: {
    width: 24,
    height: 24,
    marginRight: 8,
  },
  label: {
    fontSize: 16,
    color: '#19232e',
    fontWeight: 'bold',
  },
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
  },
});
