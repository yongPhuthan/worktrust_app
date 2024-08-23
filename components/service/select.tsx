import { useQuery } from '@tanstack/react-query';
import React, { useContext, useState } from 'react';

import { BACK_END_SERVER_URL } from '@env';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  Dimensions,
  FlatList,
  Image,
  Modal,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { Appbar, Button, Text } from 'react-native-paper';
import { useUser } from '../../providers/UserContext';
import * as stateAction from '../../redux/actions';
import { Store } from '../../redux/store';
import {  QueryKeyType } from '../../types/enums';
import AddProductFormModal from './addNew';
import { ServiceSchemaType } from '../../validation/field/services';
import firebase from '../../firebase'
import { ProjectImagesSchemaType } from 'validation/collection/subcollection/projectImages';
import {CategorySchemaType} from '../../validation/collection/subcollection/categories'
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
    state: {existingServices,companyId,G_gallery},
    dispatch,
  } = useContext(Store);
  const [showAddNewService, setShowAddNewService] = useState(false);
  const firebaseUser = useUser();
  if (!firebaseUser || !firebaseUser.uid) {
    throw new Error('User is not available');
  }
  const [selectService, setSelectService] = useState<ServiceSchemaType | null>(
    null,
  );
const firestore = firebase.firestore
  const removeAsync = async()=>{
    await AsyncStorage.removeItem(QueryKeyType.GALLERY)
    await AsyncStorage.removeItem(QueryKeyType.CATEGORY)
  }
  const getGalleryAndCategories = async () => {
    try {
  
      // 1. Disable network to ensure offline mode
      await firestore().disableNetwork();
  
      console.log('Fetching categories and gallery from Firestore in offline mode...');
  
      // 2. Fetch categories from Firestore's local cache
      const categoriesSnapshot = await firestore()
      .collection('companies')
      .doc(companyId)
        .collection('categories')
        .get();
  
      const categories: CategorySchemaType[] = categoriesSnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          name: data.name,
          createAt: data.createAt.toDate(),
          updateAt: data.updateAt.toDate(),
        };
      });
  
      // 3. Fetch gallery images from Firestore's local cache
      const gallerySnapshot = await firestore()
      .collection('companies')
      .doc(companyId)
        .collection('images')
        .get();
  
      const images: ProjectImagesSchemaType[] = gallerySnapshot.docs.flatMap((doc) => {
        const data = doc.data();
        return {
          ...data
        };
      });
  
      const sortedImages = images.sort((a, b) => {
        const dateA = new Date(a.createAt || new Date());
        const dateB = new Date(b.createAt || new Date());
        return dateB.getTime() - dateA.getTime();
      });
  
      // 4. Dispatch data to the state
      dispatch(stateAction.get_categories(categories));
      dispatch(stateAction.get_gallery(sortedImages));
      dispatch(stateAction.get_initial_gallery(sortedImages));
  
      return { categories, images: sortedImages };
  
    } catch (error) {
      return { categories: [], images: [] };
    } finally {
      // 5. Re-enable network for subsequent operations
      await firestore().enableNetwork();
    }
  };
  const {data, isLoading, error} = useQuery({
    queryKey: ['gallery'],
    // queryFn:fetchCategories
    queryFn: getGalleryAndCategories,
  });
  const [addNewService, setAddNewService] = useState(false);
  const uniqueExistingServices: ServiceSchemaType[] = existingServices.reduce(
    (acc: ServiceSchemaType[], current: ServiceSchemaType) => {
      const x = acc.find((item: ServiceSchemaType) => item.id === current.id);
      if (!x) {
        return acc.concat([current]);
      } else {
        return acc;
      }
    },
    [],
  );

  const handleSelectService = (service: ServiceSchemaType) => {
    setSelectService(service);

  //   if (service.images && service.images.length > 0) {
  //       // กรองรูปภาพที่อยู่ใน G_gallery และมี thumbnailUrl หรือ id ตรงกับ serviceImages
  //       const updatedGallery = G_gallery.map((image : ProjectImagesSchemaType) => {
  //           const isServiceImageSelected = service.images?.some(
  //               serviceImage => serviceImage.id === image.id
  //           );

  //           return {
  //               ...image,
  //               defaultChecked: isServiceImageSelected ? true : false,
  //           };
  //       });

  //       // อัปเดต G_gallery ใน store
  //       dispatch(stateAction.get_gallery(updatedGallery));
  //   } else {
  //     // หากไม่มี serviceImages หรือ serviceImages ว่างเปล่า ให้ตั้งค่า defaultChecked เป็น false สำหรับทุกภาพ
  //     const updatedGallery = G_gallery.map(image => ({
  //         ...image,
  //         defaultChecked: false,
  //     }));

  //     // อัปเดต G_gallery ใน store
  //     dispatch(stateAction.get_gallery(updatedGallery));
  // }
  //   setSelectService(service);

};
const handleAddService = () => {
  //   const updatedGallery = G_gallery.map(image => ({
  //     ...image,
  //     defaultChecked: false,
  // }));

  // // อัปเดต G_gallery ใน store
  // dispatch(stateAction.get_gallery(updatedGallery));
  setShowAddNewService(true);
  setAddNewService(true);
  onClose();
}
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
              onPress={() => 
         handleAddService()
              }></Button>
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
                  handleSelectService(item);
                  setShowAddNewService(true);
                  onClose();
                }}
                style={styles.subContainer}>
                <View style={styles.row}>
                {item.images &&  item.images.length > 0 &&  (
                    <Image
                      source={{uri: item.images[0].localPathUrl ?? ''}}
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
