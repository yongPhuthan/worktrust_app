import React from 'react';
import { View, Text, Image, TouchableOpacity,StyleSheet, Dimensions } from 'react-native';
import { Checkbox } from 'react-native-paper';
import { IWorkerEmbed } from 'types/interfaces/WorkerEmbed';

interface WorkerItemProps {
  item: IWorkerEmbed;
  onPress: () => void;
  currentWorkers: IWorkerEmbed[];
}
const {width, height} = Dimensions.get('window');

const WorkerItem: React.FC<WorkerItemProps> = React.memo(({ item, onPress, currentWorkers }) => {
  const [imageUri, setImageUri] = React.useState<string | undefined>(
    item.image.localPathUrl || item.image.thumbnailUrl
  );

  const isChecked = React.useMemo(() => {
    return currentWorkers.some(worker => worker.id === item.id);
  }, [item.id, currentWorkers]);

  const handleError = React.useCallback(() => {
    // เมื่อเกิดข้อผิดพลาดในการโหลดรูปภาพ ให้ซ่อนคอมโพเนนต์นี้
    setImageUri(undefined);
  }, []);

  if (!imageUri) {
    return null;
  }

  return (
    <TouchableOpacity
      style={[
        styles.card,
        isChecked && styles.cardChecked,
      ]}
      onPress={onPress}
    >
      <Checkbox.Android
        status={isChecked ? 'checked' : 'unchecked'}
        onPress={onPress}
        style={styles.checkboxContainer}
      />
      <View style={styles.textContainer}>
        <Text style={styles.productTitle}>{item.name}</Text>
        <Text style={styles.description}>{item.mainSkill}</Text>
      </View>
      <Image
        source={{ uri: imageUri }}
        style={styles.productImage}
        onError={handleError}
      />
    </TouchableOpacity>
  );
});
const styles = StyleSheet.create({

    titleText: {
      fontSize: 16,
      //   fontWeight: 'bold',
      textAlign: 'left',
      marginBottom: 16,
    },
    emptyListButton: {
      padding: 16,
      borderRadius: 8,
      backgroundColor: '#FFF',
      alignItems: 'center',
      justifyContent: 'center',
      shadowColor: '#000',
      shadowOffset: {width: 0, height: 2},
      shadowOpacity: 0.1,
      shadowRadius: 2,
      elevation: 3,
      marginTop: 20,
    },
    saveButton: {
      padding: 14,
      borderRadius: 8,
      backgroundColor: '#012b20',
      // backgroundColor: '#0073BA',
      alignItems: 'center',
      justifyContent: 'center',
  
      shadowOffset: {width: 0, height: 2},
      shadowOpacity: 0.1,
      shadowRadius: 2,
      elevation: 3,
    },
    emptyListText: {
      fontSize: 18,
      color: '#333',
      fontWeight: 'bold',
    },
    saveText: {
      fontSize: 16,
      color: 'white',
      fontWeight: 'bold',
    },
    loadingContainer: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
    },
  
    buttonText: {
      color: '#FFFFFF',
      fontSize: 16,
      fontWeight: 'bold',
    },
    containerBtn: {
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: '#F5FCFF',
      shadowColor: 'black',
      shadowOffset: {width: 1, height: 2},
      shadowOpacity: 0.5,
      shadowRadius: 4,
      bottom: 0,
      width: '100%',
  
      paddingBottom: 30,
    },
    button: {
      width: '90%',
      top: '30%',
      height: 50,
      backgroundColor: '#0073BA',
      borderRadius: 5,
      justifyContent: 'center',
      alignItems: 'center',
    },
    addNewButton: {
      width: 'auto',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingLeft: 15,
      paddingRight: 15,
      borderWidth: 1,
      borderColor: '#012b20',
  
      height: 50,
  
      borderRadius: 5,
    },
    modal: {
      justifyContent: 'flex-start',
      alignItems: 'center',
      paddingTop: 10,
      paddingHorizontal: 20, // Adjusted from 500 to a smaller value
    },
    closeButton: {
      paddingVertical: 10,
    },
    header: {
      justifyContent: 'space-between',
      flexDirection: 'row',
      paddingVertical: 10,
  
      backgroundColor: '#f5f5f5',
    },
  
    selected: {
      backgroundColor: '#F2F2F2',
    },
    onPlusButton: {
      paddingVertical: 10,
    },
    card: {
      flexDirection: 'row',
      justifyContent: 'flex-start',
      alignItems: 'center',
      backgroundColor: 'white',
      borderRadius: 8,
      padding: 10,
      marginVertical: 8,
      borderWidth: 1, // Add border to the card
      borderColor: 'transparent', // Default border color
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.1,
      shadowRadius: 2,
      elevation: 3,
      width: width - 32, // Adjust based on your padding
    },
    cardChecked: {
      borderColor: '#012b20', // Color when checked
    },
    checkboxContainer: {
      padding: 0,
      margin: 0,
      marginRight: 10,
      backgroundColor: 'transparent',
      borderWidth: 0,
    },
    textContainer: {
      flex: 1,
      justifyContent: 'center',
    },
    productTitle: {
      fontSize: 14,
      fontWeight: 'bold',
      color: 'black',
    },
    description: {
      fontSize: 12,
      color: 'gray',
    },
    productImage: {
      width: 100, // Adjust the size according to your design
      height: 100, // Adjust the size according to your design
      borderRadius: 4, // If you want rounded corners
    },
    addNewText: {
      color: '#012b20',
      fontSize: 14,
      fontStyle: 'normal',
      fontWeight: 'bold',
      fontFamily: 'Sukhumvit Set Bold',
    },
  
    icon: {
      color: '#012b20',
    },
  });
export default WorkerItem;