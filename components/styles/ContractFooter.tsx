import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Platform,
  KeyboardAvoidingView,
  ActivityIndicator,
} from 'react-native';
import React from 'react';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {FontAwesomeIcon} from '@fortawesome/react-native-fontawesome';
import {
  faPlus,
  faDrawPolygon,
  faCog,
  faBell,
  faChevronRight,
  faCashRegister,
  faCoins,
} from '@fortawesome/free-solid-svg-icons';
type Props = {
  onNext: Function;
  onBack: Function;
  finalStep: boolean;
  disabled: boolean;
  isLoading: boolean;
};

const ContractFooter = (props: Props) => {
  const {onNext, onBack, disabled, isLoading} = props;
  return (
    <View style={styles.containerBtn}>
<TouchableOpacity
            style={[
              styles.submitedButton,
              {
                backgroundColor: props.finalStep
                  ? 'green'
                  : props.disabled
                  ? '#ccc'
                  : '#0073BA',
                opacity: props.disabled ? 0.5 : 1,
              },
            ]}
            onPress={() => props.onNext()}
            disabled={props.disabled}>
            {isLoading ? (
              <ActivityIndicator size="small" color="#ffffff" />
            ) : (
              <Text style={styles.buttonText}>
                {props.finalStep ? 'บันทึกสัญญา' : 'ไปต่อ55'}
              </Text>
            )}
          </TouchableOpacity>
      {/* <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{flex: 1}}> */}


        {/* <View style={styles.subContainer}>
          <TouchableOpacity
            style={[styles.previousButton, styles.outlinedButton]}
            onPress={() => props.onBack()}>
            <Text style={[styles.buttonText, styles.outlinedButtonText]}>
              ย้อนกลับ
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.submitedButton,
              {
                backgroundColor: props.finalStep
                  ? 'green'
                  : props.disabled
                  ? '#ccc'
                  : '#0073BA',
                opacity: props.disabled ? 0.5 : 1,
              },
            ]}
            onPress={() => props.onNext()}
            disabled={props.disabled}>
            {isLoading ? (
              <ActivityIndicator size="small" color="#ffffff" />
            ) : (
              <Text style={styles.buttonText}>
                {props.finalStep ? 'บันทึกสัญญา' : 'ไปต่อ'}
              </Text>
            )}
          </TouchableOpacity>
        </View> */}
      {/* </KeyboardAvoidingView> */}
    </View>
  );
};

export default ContractFooter;

const styles = StyleSheet.create({
  containerBtn: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center', 
    backgroundColor: '#FFFFFF',
    width: '90%',
    paddingBottom: 30,
    shadowColor: '#000', // สีเงา
    shadowOffset: {
      width: 0, // ตำแหน่งแนวนอนของเงา
      height: 10, // ตำแหน่งแนวตั้งของเงา
    },
    shadowOpacity: 0.10, // ความโปร่งใสของเงา
    shadowRadius: 20, // รัศมีของเงา
    elevation: 5, // สำหรับ Android เพื่อให้มีเงา
  },
  subContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  containerSubmitBtn: {
    flexDirection: 'row',
    justifyContent: 'center',
    backgroundColor: '#F5FCFF',
    shadowColor: 'black',
    shadowOffset: {width: 1, height: 2},
    shadowOpacity: 0.5,
    shadowRadius: 4,
    padding: 20,
    bottom: 0,
  },
  button: {
    backgroundColor: 'green',
    paddingVertical: 12.5,
    paddingHorizontal: 20,
    borderRadius: 5,
    height: 50,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 8,
    marginTop: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
  },
  icon: {
    color: 'white',
    marginTop: 3,
  },
  submitedButton: {
    width: '100%',
    height: 50,
    top: '30%',
    backgroundColor: '#0073BA',
    borderRadius: 5,
    justifyContent: 'center',
    alignItems: 'center', // Aligns content of the button to the right


  },
  disabledButton: {
    width: '90%',
    top: '30%',
    height: 50,
    backgroundColor: '#d9d9d9',
    borderRadius: 5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  previousButton: {
    borderColor: '#0073BA',
    backgroundColor: 'white',
    marginTop: 10,
  },
  outlinedButtonText: {
    color: '#0073BA',
    textDecorationLine: 'underline',
  },
  iconPrev: {
    color: '#0073BA',
  },
  outlinedButton: {
    backgroundColor: 'transparent',
  },
});
