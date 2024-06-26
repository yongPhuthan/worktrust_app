import {
  faPlusCircle
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import {
  Button
} from 'react-native-paper';
type Props = {
  handleAddProductFrom: Function;
};

const AddServices = (props: Props) => {
  return (
    <View style={styles.container}>
                   <Button
                    children=
                      "เพิ่มบริการ-สินค้า"
                    
                    style={{
                      borderColor: '#0073BA',
                      borderStyle: 'dotted',
                    }}
                    mode="outlined"
                    icon={'plus'}
                    textColor="#0073BA"
                    contentStyle={{
              
                      justifyContent: 'center',
                    }}
                    onPress={() =>
                      props.handleAddProductFrom()
                    }></Button>
      {/* <TouchableOpacity
        onPress={() => props.handleAddProductFrom()}
        style={styles.button}>
        <View style={styles.containerButton}>
          <FontAwesomeIcon icon={faPlusCircle} color="#0073BA" size={18} />
          <Text style={styles.labelButton}>เพิ่มบริการ-สินค้า</Text>
        </View>
      </TouchableOpacity> */}
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
    fontFamily: 'Sukhumvit set Bold',
  },
  labelButton: {
    fontSize: 16,
    color: '#0073BA',
    // fontFamily: 'Sukhumvit set',
    marginLeft: 10,
  },
});

export default AddServices;
