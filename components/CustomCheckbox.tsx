import React from 'react';
import { TouchableOpacity, View, StyleSheet } from 'react-native';
import {FontAwesomeIcon} from '@fortawesome/react-native-fontawesome';
import { faBriefcase, faCheck } from '@fortawesome/free-solid-svg-icons';

type CustomCheckboxProps = {
  checked: boolean;
  onPress: () => void;
};

const CustomCheckbox: React.FC<CustomCheckboxProps> = ({ checked, onPress }) => {
  return (
    <TouchableOpacity style={[
        styles.checkbox, 
        checked && styles.checkedCheckbox
      ]}  onPress={onPress}>
      {checked && (
        <View style={styles.checkedCircle}>
          <FontAwesomeIcon icon={faCheck} size={20} color="white" />
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkedCheckbox: {
    borderWidth: 0,
  },
  checkedCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#4285F4', 
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default CustomCheckbox;
