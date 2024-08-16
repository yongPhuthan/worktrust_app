import React, {useContext, useState} from 'react';
import {useQuery} from '@tanstack/react-query';

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
import { IServiceEmbed, IServiceImage } from 'types/interfaces/ServicesEmbed';
import * as stateAction from '../../redux/actions';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { QueryKeyType } from '../../types/enums';
import { useUser } from '../../providers/UserContext';
import {BACK_END_SERVER_URL} from '@env';

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
  const [selectService, setSelectService] = useState<IServiceEmbed | null>(
    null,
  );

  const removeAsync = async()=>{
    await AsyncStorage.removeItem(QueryKeyType.GALLERY)
    await AsyncStorage.removeItem(QueryKeyType.CATEGORY)
  }
  const getGallery = async () => {
    try {
      // 1. Try to load data from AsyncStorage
      const storedGallery = await AsyncStorage.getItem(QueryKeyType.GALLERY);
      const storedCategories = await AsyncStorage.getItem(
        QueryKeyType.CATEGORY,
      );

      if (storedGallery && storedCategories) {
        // Parse stored data
        const parsedGallery = JSON.parse(storedGallery);
        const parsedCategories = JSON.parse(storedCategories);

        // Check if data is valid and not empty
        if (parsedGallery.length > 0 && parsedCategories.length > 0) {
          console.log('Loaded gallery from AsyncStorage');

          // Set defaultChecked to false for each image if undefined
          const updatedGallery = parsedGallery.map((image: any) => ({
            ...image,
            defaultChecked: false,
          }));

          dispatch(stateAction.get_gallery(updatedGallery));
          dispatch(stateAction.get_categories(parsedCategories));
          dispatch(stateAction.get_initial_gallery(updatedGallery));
          console.log("G_Gallery", G_gallery)

          return updatedGallery;
        }
      }

      // 2. If AsyncStorage is empty or invalid, fetch from server
      console.log('Fetching gallery from server...');
      const token = await firebaseUser.getIdToken(true);

      const response = await fetch(
        `${BACK_END_SERVER_URL}/api/gallery/getAll?companyId=${encodeURIComponent(
          companyId.toString(),
        )}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (!response.ok) {
        throw new Error('Failed to fetch gallery');
      }

      const data = await response.json();
      console.log('Fetched gallery data:', data);  

      const images = data.categories.reduce((acc: any[], category: any) => {
        if (category.images && category.images.length > 0) {
          const imagesWithCategory = category.images.map((image: any) => ({
            id: image._id,
            url: image,
            categories: [category.name],
            defaultChecked: false, // Set defaultChecked to false
            created: new Date(category.created),
          }));
          acc.push(...imagesWithCategory);
        }
        return acc;
      }, []);

      const categories = data.categories.map((category: any) => ({
        id: category._id,
        name: category.name,
        created: new Date(category.created),
      }));

      const sortedImages = images.sort((a:IServiceImage, b:IServiceImage) => {
        const dateA = new Date(a.created || new Date());
        const dateB = new Date(b.created || new Date());
        return dateB.getTime() - dateA.getTime();
      });

      dispatch(stateAction.get_gallery(sortedImages));
      dispatch(stateAction.get_categories(categories));
      dispatch(stateAction.get_initial_gallery(sortedImages));

      // 3. Save the fetched data to AsyncStorage for future use
      await AsyncStorage.setItem(QueryKeyType.GALLERY, JSON.stringify(sortedImages));
      await AsyncStorage.setItem(
        QueryKeyType.CATEGORY,
        JSON.stringify(categories),
      );

      console.log('Gallery data saved to AsyncStorage');
      return images; // Return images array, even if it's empty
    } catch (error) {
      console.error('Error fetching gallery images:', error);
      return [];
    }
  };
  const {data, isLoading, error} = useQuery({
    queryKey: ['gallery'],
    // queryFn:fetchCategories
    queryFn: getGallery,
  });
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

  const handleSelectService = (service: IServiceEmbed) => {
    console.log("service", service)
    setSelectService(service);

    if (service.serviceImages && service.serviceImages.length > 0) {
        // กรองรูปภาพที่อยู่ใน G_gallery และมี thumbnailUrl ตรงกับ serviceImages
        const updatedGallery = G_gallery.map(image => {
            const isServiceImageSelected = service.serviceImages?.some(
                serviceImage => serviceImage.id === image.url.id
            );

            return {
                ...image,
                defaultChecked: isServiceImageSelected ? true : image.defaultChecked,
            };
        });

        // อัปเดต G_gallery ใน store
        dispatch(stateAction.get_gallery(updatedGallery));
    } else {
      // หากไม่มี serviceImages หรือ serviceImages ว่างเปล่า ให้ตั้งค่า defaultChecked เป็น false สำหรับทุกภาพ
      const updatedGallery = G_gallery.map(image => ({
          ...image,
          defaultChecked: false,
      }));

      // อัปเดต G_gallery ใน store
      dispatch(stateAction.get_gallery(updatedGallery));
  }
    setSelectService(service);

};
const handleAddService = () => {
    const updatedGallery = G_gallery.map(image => ({
      ...image,
      defaultChecked: false,
  }));

  // อัปเดต G_gallery ใน store
  dispatch(stateAction.get_gallery(updatedGallery));
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
