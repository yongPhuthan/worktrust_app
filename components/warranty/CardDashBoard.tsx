import {InvoiceStatus, WarrantyStatus} from '@prisma/client';
import React from 'react';
import {
  Dimensions,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
type Props = {
  customerName: string;
  price: number;
  status: string;
  onCardPress?: () => void;
  endProductWaranty: Date | null;
  endSkillwaranty: Date | null;
};

const windowWidth = Dimensions.get('window').width;

const CardDashBoard = (props: Props) => {
  function convertDateToDDMMYYYY(dateString: string) {
    const date = new Date(dateString);

    // Get the day, month, and year from the date object
    const day = date.getDate();
    const month = date.getMonth() + 1; // getMonth() returns month from 0 to 11
    const year = date.getFullYear();

    // Pad the day and month with zeros if they are less than 10
    const formattedDay = day < 10 ? '0' + day : day;
    const formattedMonth = month < 10 ? '0' + month : month;

    // Return the formatted date string
    return `${formattedDay}/${formattedMonth}/${year}`;
  }
  return (
    <TouchableOpacity onPress={props.onCardPress} style={styles.subContainer}>
      <View style={styles.summary}>
        <Text style={styles.summaryText}>{props.customerName}</Text>
        <Text style={styles.summaryText}>
          {Number(props.price)
            .toFixed(2)
            .replace(/\d(?=(\d{3})+\.)/g, '$&,')}
        </Text>

        {/* <FontAwesomeIcon icon={faChevronRight} size={24} color="#19232e" /> */}
      </View>
      {props.status && (
        <View
          style={{
            backgroundColor:
              props.status === WarrantyStatus.PENDING
                ? '#ccc'
                : props.status === WarrantyStatus.ACTIVE
                ? '#43a047'
                : props.status === WarrantyStatus.EXPIRED
                ? '#1079ae'
                : '#ccc',
            borderRadius: 4,
            paddingHorizontal: 8,
            paddingVertical: 4,
            marginTop: 8,
            alignSelf: 'flex-start',
          }}>
          <Text
            style={{
              color: props.status === WarrantyStatus.PENDING ? '#000' : '#fff',
              fontSize: 12,
              fontWeight: 'bold',
              textTransform: 'uppercase',
            }}>
            {props.status === WarrantyStatus.PENDING
              ? 'ยังไม่ออกใบรับประกัน'
              : props.status === WarrantyStatus.ACTIVE
              ? 'อยู่ในระยะประกัน'
              : props.status === WarrantyStatus.EXPIRED
              ? 'สิ้นสุดการรับประกัน'
              : ''}
          </Text>
        </View>
      )}
      {props.status === WarrantyStatus.ACTIVE &&
        props.customerName &&
        props.endSkillwaranty &&
        props.endProductWaranty && (
          <>
            <View style={styles.telAndTax}>
              <Text style={styles.summaryPrice}>ประกันงานติดตั้งถึง</Text>
              <Text style={styles.summaryPrice}>
                {convertDateToDDMMYYYY(props.endSkillwaranty.toString())}
              </Text>
            </View>
            <View style={styles.telAndTax}>
              <Text style={styles.summaryPrice}>ประกันวัสดุอุปกรณ์ถึง</Text>
              <Text style={styles.summaryPrice}>
                {convertDateToDDMMYYYY(props.endProductWaranty.toString())}
              </Text>
            </View>
          </>
        )}
    </TouchableOpacity>
  );
};

export default CardDashBoard;

const styles = StyleSheet.create({
  subContainer: {
    backgroundColor: '#ffffff',

    height: 'auto',
    borderColor: '#ccc',
    width: windowWidth,
    paddingHorizontal: 20,
    paddingVertical: 15,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.05,
    shadowRadius: 3.84,
    elevation: 5,
  },
  summary: {
    flexDirection: 'row',
    width: '99%',
    justifyContent: 'space-between',
  },
  description: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  telAndTax: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  unitPrice: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    color: '#19232e',

    width: windowWidth * 0.2,
    marginTop: 10,
  },
  subummary: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    color: '#19232e',
  },
  summaryText: {
    fontSize: 16,
    maxWidth: '70%',
    color: '#19232e',
  },
  summaryPrice: {
    fontSize: 14,
    alignSelf: 'flex-end',
    color: '#19232e',
  },
  icon: {
    width: '10%',
  },
  status: {
    backgroundColor: '#43a047',
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginTop: 8,
    alignSelf: 'flex-start',
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
});
