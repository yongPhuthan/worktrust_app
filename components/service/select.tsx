import React, { useContext, useState } from 'react';
import {
  Dimensions,
  FlatList,
  Image,
  Modal,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  Appbar,
  Button,
  Text
} from 'react-native-paper';
import { Store } from '../../redux/store';
import AddProductFormModal from './addNew';
interface Item {
  id: string;
  name: string;
}

interface Props {
  visible: boolean;
  onClose: () => void;
  quotationId: string;
  onAddService: (service: any) => void;
  currentValue: any;
}

const SelectProductModal: React.FC<Props> = ({
  visible,
  onClose,
  onAddService,
  quotationId,
  currentValue,
}) => {
  const {
    state: { existingServices },
    dispatch,
  }: any = useContext(Store);
  const [showAddNewService, setShowAddNewService] = useState(false);
  const [selectService, setSelectService] = useState<any>(null);
  const [addNewService, setAddNewService] = useState(false);
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
            title={`เลือกจากรายการเดิม`}
            titleStyle={{
              fontSize: 18,
              fontWeight: 'bold',
              fontFamily: 'Sukhumvit set',
            }}
          />
          {existingServices.length > 0 && (
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
            data={existingServices}
            keyExtractor={item => item.id}
            renderItem={({ item, index }) => (
              <TouchableOpacity
                key={index}
                onPress={() => {
                  console.log('item', item);
                  setSelectService(item);
                  setShowAddNewService(true);
                  onClose();
                }}
                style={styles.subContainer}>
                <View style={styles.row}>
                  <Image
                    source={{ uri: item.serviceImages[0] }}
                    style={{ width: 50, height: 50 }}
                  />
                  <View>
                    <Text style={styles.title}>{item.title}</Text>
                    <Text style={styles.description}>{item.description}</Text>
                  </View>
                </View>
              </TouchableOpacity>
            )}
            ListEmptyComponent={
              <Button
                icon={'plus'}
                children="เพิ่มรายการใหม่"
                testID="submited-button"
                mode="outlined"
                onPress={() => { 
                  setShowAddNewService(true);
                  setAddNewService(true);
                  onClose();
                }}></Button>
            }
          />
        </View>
      </Modal>
      {selectService  && (
        <AddProductFormModal
          resetSelectService={() => setSelectService(null)}
          selectService={selectService}
          resetAddNewService={() => setAddNewService(false)}
          quotationId={quotationId}
          onAddService={onAddService}
          currentValue={currentValue}
          visible={showAddNewService}
          onClose={() => setShowAddNewService(false)}
        />
      )}
            {addNewService  && (
        <AddProductFormModal
          resetSelectService={() => setSelectService(null)}
          selectService={selectService}
          resetAddNewService={() => setAddNewService(false)}
          quotationId={quotationId}
          onAddService={onAddService}
          currentValue={currentValue}
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
    shadowOffset: { width: 0, height: 1 },
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
