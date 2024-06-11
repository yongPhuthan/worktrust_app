import {View, Text, TextInput, StyleSheet, Dimensions,Platform} from 'react-native';
import React from 'react';

type Props = {
  label: string;
  value: string;
  onChange: Function;
};

const windowWidth = Dimensions.get('window').width;

const DocNumber = (props : Props) => {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>{props.label}</Text>
      <TextInput
      textAlign='right'
        style={styles.input}
        value={props.value}
        onChangeText={(text) => props.onChange(text)} // Pass the new text value
      />
    </View>
  );
};


export default DocNumber;

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor:'white',
    alignItems: 'center',
    paddingHorizontal: 10,
    height:40,
    borderWidth: 0.5,
    // borderColor:"#00674a",

    // borderColor: '#2196F3',

    borderRadius: 5,

    justifyContent: 'space-between',
  },
  label: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  input: {
    justifyContent: 'flex-end',
    width: '50%' ,
    fontSize: 14,
    
  },
});
