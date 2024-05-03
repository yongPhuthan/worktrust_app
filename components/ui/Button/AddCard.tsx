import {
    faPlusCircle
  } from '@fortawesome/free-solid-svg-icons';
  import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
  import React, { useContext } from 'react';
  import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
  type Props = {
    handleAdd: Function;
    buttonName: string;
  };
  
  const AddCard = (props: Props) => {
    const { handleAdd, buttonName } = props;

    return (
      <View style={styles.container}>
        <TouchableOpacity
          onPress={() => handleAdd()}
          style={styles.button}>
          <View style={styles.containerButton}>
            <FontAwesomeIcon icon={faPlusCircle} color="#0073BA" size={18} />
            <Text style={styles.labelButton}>{buttonName}</Text>

            {/* <Text style={styles.labelButton}>เพิ่มบริการ-สินค้า</Text> */}
          </View>
        </TouchableOpacity>
      </View>
    );
  };
  
  const styles = StyleSheet.create({
    container: {
      marginTop: 10,
    },
    containerButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    button: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'white',
      borderRadius: 5,
      paddingVertical: 13,
      paddingHorizontal: 32,
      borderWidth: 1,
      borderStyle: 'dashed',
      borderColor: '#0073BA',
  
      // borderColor: '#19232e',
    },
    header: {
      flexDirection: 'row',
      paddingBottom: 10,
      alignItems: 'flex-start',
      justifyContent: 'flex-start',
    },
    icon: {
      width: 24,
      height: 24,
      marginRight: 8,
    },
    label: {
      fontSize: 16,
      color: '#19232e',
      // fontFamily: 'Sukhumvit set Bold',
    },
    labelButton: {
      fontSize: 16,
      color: '#0073BA',
      // fontFamily: 'Sukhumvit set',
      marginLeft: 10,
    },
  });
  
  export default AddCard;
  