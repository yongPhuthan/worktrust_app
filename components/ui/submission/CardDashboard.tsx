import { QuotationStatus, SubmissionStatus} from '@prisma/client';
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
  date: Date;
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
const CardDashBoardSubmission = (props: Props) => {
  return (
    <TouchableOpacity onPress={props.onCardPress} style={styles.subContainer}>
      <View style={styles.summary}>
        <Text style={styles.summaryText}>{props.customerName}</Text>
        <Text style={styles.summaryPrice}>
          วันที่ส่งงาน {convertDateToDDMMYYYY(props.date.toString())}
        </Text>

        {/* <FontAwesomeIcon icon={faChevronRight} size={24} color="#19232e" /> */}
      </View>
      {props.status?.length > 0 && (
        <View
          style={{
            backgroundColor:
              props.status === SubmissionStatus.PENDING
                ? '#ccc'
                : props.status === SubmissionStatus.APPROVED
                ? '#43a047'
                : props.status === SubmissionStatus.REJECTED
                ? 'red'
                : '#ccc',
            borderRadius: 4,
            paddingHorizontal: 8,
            paddingVertical: 4,
            marginTop: 8,
            alignSelf: 'flex-start',
          }}>
          <Text
            style={{
              color: props.status === SubmissionStatus.PENDING ? '#000' : '#fff',
              fontSize: 12,
              fontWeight: 'bold',
              textTransform: 'uppercase',
            }}>
            {props.status === SubmissionStatus.PENDING
              ? 'รอตรวจงาน'
              : props.status === SubmissionStatus.APPROVED
              ? 'ลูกค้าอนุมัติแล้ว'
              : props.status === SubmissionStatus.REJECTED
              ? 'รอแก้ไขงาน'
              : ''}
          </Text>
        </View>
      )}


    </TouchableOpacity>
  );
};

export default CardDashBoardSubmission;

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

    color: '#19232e',
  },
  summaryPrice: {
    fontSize: 12,
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
