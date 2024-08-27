
import React from 'react';
import {
  Dimensions,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {Icon, IconButton} from 'react-native-paper';
import { QuotationEventsType } from '../validation/collection/subcollection/events';
import { QuotationStatus } from '../types/enums';
type Props = {
  customerName: string;
  download: number;
  print : number;
  pageView  : number;
  allTotal: number;
  events : QuotationEventsType;
  dateOffer: Date;
  dateEnd: Date;
  status: string;
  onCardPress?: () => void;
};

const windowWidth = Dimensions.get('window').width;
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
const CardDashBoard = (props: Props) => {
  return (
    <TouchableOpacity onPress={props.onCardPress} style={styles.subContainer}>
      <View style={styles.summary}>
        <Text style={styles.summaryText}>{props.customerName}</Text>
        <Text style={styles.summaryText}>
          {Number(props.allTotal)
            .toFixed(2)
            .replace(/\d(?=(\d{3})+\.)/g, '$&,')}
        </Text>

        {/* <FontAwesomeIcon icon={faChevronRight} size={24} color="#19232e" /> */}
      </View>
      {props.status?.length > 0 && (
        <View
          style={{
            backgroundColor:
              props.status === QuotationStatus.PENDING ||
              props.status === QuotationStatus.CUSTOMER_REJECTED
                ? '#ffdfdf'
                : props.status === QuotationStatus.APPROVED ||
                  props.status === QuotationStatus.CUSTOMER_REVIEWED
                ? '#43a047'
                : props.status === QuotationStatus.INVOICE_DEPOSIT ||
                  props.status === QuotationStatus.RECEIPT_DEPOSIT ||
                  props.status === QuotationStatus.CUSTOMER_APPROVED
                ? '#1079ae'
                : props.status === QuotationStatus.SUBMITTED
                ? 'orange'
                : props.status === QuotationStatus.EXPIRED
                ? '#ccc'
                : '#ccc',

            borderRadius: 4,
            paddingHorizontal: 8,
            paddingVertical: 4,
            marginTop: 8,
            alignSelf: 'flex-start',
          }}>
          <Text
            style={{
              color:
                props.status === QuotationStatus.PENDING ||
                props.status === QuotationStatus.EXPIRED
                  ? 'black'
                  : 'white',
              fontSize: 12,
              fontWeight: 'bold',
              textTransform: 'uppercase',
            }}>
            {props.status === QuotationStatus.PENDING
              ? 'เสนอราคาแล้ว'
              : props.status === QuotationStatus.APPROVED
              ? 'อนุมัติแล้ว'
              : props.status === QuotationStatus.INVOICE_DEPOSIT
              ? 'มัดจำใบวางบิล'
              : props.status === QuotationStatus.RECEIPT_DEPOSIT
              ? 'มัดจำใบเสร็จ'
              : props.status === QuotationStatus.SUBMITTED
              ? 'แจ้งส่งงานแล้ว'
              : props.status === QuotationStatus.CUSTOMER_REJECTED
              ? 'แก้ไขงานอีกครั้ง'
              : props.status === QuotationStatus.CUSTOMER_REVIEWED
              ? 'ลูกค้ารีวิวแล้ว'
              : props.status === QuotationStatus.CUSTOMER_APPROVED
              ? 'ลูกค้าอนุมัติแล้ว'
              : props.status === QuotationStatus.EXPIRED
              ? 'หมดอายุ'
              : ''}
          </Text>
        </View>
      )}

      <View style={styles.telAndTax}>
      <View
            style={{
              flexDirection: 'row',
              gap: 25,
              marginTop: 10,
            }}>
            {props.events.pageView > 0 && (
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'flex-start',
                  gap: 10,
                }}>
                <Icon source="eye" color="gray" size={20} />
                <Text>{props.events.pageView}</Text>
              </View>
            )}

            {props.events.download > 0 && (
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'flex-start',

                  gap: 10,
                }}>
                <Icon source="download" color="gray" size={20} />
                <Text>{props.events.download}</Text>
              </View>
            )}
            {props.events.print > 0 && (
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'flex-start',

                  gap: 10,
                }}>
                <Icon source="printer" color="gray" size={20} />
                <Text>{props.events.print}</Text>
              </View>
            )}
          </View>

        {/* <Text style={styles.summaryPrice}>
          วันที่ {convertDateToDDMMYYYY(props.date.toString())}
        </Text> */}
        {/* <Text style={styles.summaryPrice}>
          สิ้นสุด {convertDateToDDMMYYYY(props.end.toString())}
        </Text> */}
      </View>
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
