import React, {useContext, useState} from 'react';
import {
  Dimensions,
  FlatList,
  Image,
  Modal,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import {Appbar, Button, Text} from 'react-native-paper';
import {Store} from '../../redux/store';
import AddProductFormModal from './addNew';
import { IServiceEmbed } from 'types/interfaces/ServicesEmbed';

interface Props {
  visible: boolean;
  onClose: () => void;
  onAddService: (service: any) => void;
}

const SelectProductModal: React.FC<Props> = ({
  visible,
  onClose,
  onAddService,
}) => {
  const {
    state: {existingServices},
    dispatch,
  } = useContext(Store);
  const [showAddNewService, setShowAddNewService] = useState(false);
  const [selectService, setSelectService] = useState<IServiceEmbed | null>(
    null,
  );
  const [addNewService, setAddNewService] = useState(false);
  const uniqueExistingServices: IServiceEmbed[] = existingServices.reduce(
    (acc: IServiceEmbed[], current: IServiceEmbed) => {
      const x = acc.find((item: IServiceEmbed) => item.id === current.id);
      if (!x) {
        return acc.concat([current]);
      } else {
        return acc;
      }
    },
    [],
  );
  return (
    <>
      <Modal animationType="slide" visible={visible}>
        <Appbar.Header
          mode="center-aligned"
          elevated
          style={{
            backgroundColor: 'white',
            width: Dimensions.get('window').width,
          }}>
          <Appbar.Action icon={'close'} onPress={onClose} />

          <Appbar.Content
            title={`เลือกสินค้า-บริการ`}
            titleStyle={{
              fontSize: 18,
       
            }}
          />
          {uniqueExistingServices.length > 0 && (
            <Button
              testID="submited-button"
              mode="outlined"
              children="เพิ่มใหม่"
              onPress={() => {
                setShowAddNewService(true);
                setAddNewService(true);
                onClose();
              }}></Button>
          )}
        </Appbar.Header>
        <View style={styles.container}>
          <FlatList
            data={uniqueExistingServices}
            keyExtractor={item => item.id}
            renderItem={({item, index}) => (
              <TouchableOpacity
                key={index}
                onPress={() => {
                  setSelectService(item);
                  setShowAddNewService(true);
                  onClose();
                }}
                style={styles.subContainer}>
                <View style={styles.row}>
                {item.serviceImages && item.serviceImages.length > 0 && (
                    <Image
                    source={{uri: item.serviceImages[0].thumbnailUrl}}
                    style={{width: 50, height: 50}}
                  />
                )}

                
                  <View>
                    <Text style={styles.title}>{item.title}</Text>
                    <Text style={styles.description}>{item.description}</Text>
                  </View>
                </View>
              </TouchableOpacity>
            )}
            ListEmptyComponent={
              <View
                style={{
                  flex: 1,
                  justifyContent: 'center',
                  alignItems: 'center',
                  alignContent: 'center',
                  marginTop: 50,
                }}>
                {/* <Text style={{fontSize: 16, color: 'gray', marginBottom: 10}}>
                  ยังไม่มีรายการสินค้า
                </Text> */}
                <Button
                  icon={'plus'}
                  children="เพิ่มรายการใหม่"
                  testID="submited-button"
                  contentStyle={{flexDirection: 'row-reverse'}}
                  mode="contained"
                  onPress={() => {
                    setShowAddNewService(true);
                    setAddNewService(true);
                    onClose();
                  }}></Button>
              </View>
            }
          />
        </View>
      </Modal>
      {selectService && (
        <AddProductFormModal
          resetSelectService={() => setSelectService(null)}
          selectService={selectService}
          resetAddNewService={() => setAddNewService(false)}
          onAddService={onAddService}
          visible={showAddNewService}
          onClose={() => setShowAddNewService(false)}
        />
      )}
      {addNewService && (
        <AddProductFormModal
          resetSelectService={() => setSelectService(null)}
          selectService={selectService}
          resetAddNewService={() => setAddNewService(false)}
          onAddService={onAddService}
          visible={showAddNewService}
          onClose={() => setShowAddNewService(false)}
        />
      )}
    </>
  );
};
const windowWidth = Dimensions.get('window').width;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    paddingTop: 20,
    paddingHorizontal: 16,
  },
  itemContainer: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
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
  row: {
    flexDirection: 'row',
    width: '99%',
    justifyContent: 'flex-start',
    gap: 30,
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
  title: {
    fontSize: 16,
    color: '#19232e',
  },
  description: {
    fontSize: 14,
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

export default SelectProductModal;
