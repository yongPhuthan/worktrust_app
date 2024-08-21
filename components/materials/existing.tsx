import React, {useContext, useEffect, useState} from 'react';
import {
  Dimensions,
  FlatList,
  Image,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';

import {useFormContext} from 'react-hook-form';
import Modal from 'react-native-modal';
import {
  ActivityIndicator,
  Appbar,
  Button,
  Checkbox,
  Text,
} from 'react-native-paper';
import useFetchMaterial from '../../hooks/materials/read';
import {IMaterials} from '../../models/Materials';
import {useUser} from '../../providers/UserContext';
import {Store} from '../../redux/store';
import CreateMaterial from './createMaterial';
import {Types} from 'mongoose';
import useImageUri from 'hooks/materials/imageUri';
import MaterialItem from './materialItem';

interface ExistingModalProps {
  isVisible: boolean;
  onClose: () => void;
  serviceId: string;
}

const {width, height} = Dimensions.get('window');
const imageContainerWidth = width / 3 - 10;

const ExistingMaterials = ({
  isVisible,
  onClose,
  serviceId,
}: ExistingModalProps) => {
  const [materials, setMaterials] = useState<IMaterials[]>([]);
  const [isOpenModal, setIsOpenModal] = useState(false);
  const context = useFormContext();
  const [isCreateMaterial, setIsCreateMaterial] = useState(false);

  const {
    register,
    control,
    getValues,
    setValue,
    watch,
    formState: {errors},
  } = context;
  const user = useUser();

  const {
    state: {companyId, G_materials},
    dispatch,
  } = useContext(Store);

  const {isLoading, isError, error, refetch} = useFetchMaterial();

  const handleSelectMaterial = (material: IMaterials) => {
    const currentMaterials = getValues('materials') || [];
    const materialIndex = currentMaterials.findIndex(
      (materialData: IMaterials) => materialData._id === material._id,
    );
    if (materialIndex !== -1) {
      const updatedMaterials = [...currentMaterials];
      updatedMaterials.splice(materialIndex, 1);
      setValue('materials', updatedMaterials, {shouldDirty: true});
    } else {
      const updatedMaterials = [
        ...currentMaterials,
        {
          _id: material._id,
          name: material.name,
          description: material.description,
          image: material.image,
        },
      ];
      setValue('materials', updatedMaterials, {shouldDirty: true});
    }
  };

  const handleDonePress = () => {
    if (watch('materials')?.length > 0) {
      onClose();
    }
  };
  useEffect(() => {
    if (G_materials) {
      setMaterials(G_materials);
    }
  }, [G_materials]);
console.log('G_Material', G_materials)
  return (
    <Modal isVisible={isVisible} style={styles.modal} onBackdropPress={onClose}>
      <Appbar.Header
        mode="center-aligned"
        style={{
          backgroundColor: 'white',
          width: Dimensions.get('window').width,
        }}>
        <Appbar.Action icon={'close'} onPress={onClose} />
        <Appbar.Content
          title="วัสดุอุปกรณ์ที่ต้องการนำเสนอ"
          titleStyle={{fontSize: 16}}
        />
        {materials && materials?.length > 0 && (
          <Appbar.Action
            icon="plus-thick"
            onPress={() => setIsCreateMaterial(true)}
          />
        )}
      </Appbar.Header>
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator color="#047e6e" size={'large'} />
        </View>
      ) : (
        <View style={styles.container}>
          <FlatList
            data={materials}
            renderItem={({ item }) => (
              <MaterialItem
                item={item}
                onPress={() => handleSelectMaterial(item)}
                selectedMaterials={watch('materials') || []}
              />
            )}
            ListEmptyComponent={
              <View
                style={{
                  flex: 1,
                  justifyContent: 'center',
                  height: height * 0.5,
                  alignItems: 'center',
                }}>
                <Button
                  onPress={() => setIsCreateMaterial(true)}
                  mode="contained"
                  icon={'plus'}>
                  <Text style={{color: 'white', fontSize: 16}}>
                    เพิ่มวัสดุอุปกรณ์
                  </Text>
                </Button>
              </View>
            }
            keyExtractor={(item: IMaterials) =>
              item._id ? new Types.ObjectId(item._id).toHexString() : ''
            }
          />

          {watch('materials')?.length > 0 && (
            <Button
              style={{
                width: '80%',
                alignSelf: 'center',
              }}
              // buttonColor="#1b52a7"
              mode="contained"
              onPress={handleDonePress}>
              {`บันทึก ${watch('materials')?.length} รายการ`}{' '}
            </Button>
          )}
          <Modal
            isVisible={isCreateMaterial}
            style={styles.modal}
            onBackdropPress={() => setIsCreateMaterial(false)}>
            <CreateMaterial
              isVisible={isCreateMaterial}
              onClose={() => setIsCreateMaterial(false)}
            />
          </Modal>
        </View>
      )}
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#F7F7F7',
    width,
  },
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
  modalCreate: {
    justifyContent: 'flex-start',
    alignItems: 'center',
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
  modal: {
    margin: 0,
    justifyContent: 'flex-start',
    alignItems: 'center',
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
    backgroundColor: 'white',
    width,
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
  imageContainer: {
    width: imageContainerWidth,
    flexDirection: 'column',
    margin: 5,
    position: 'relative',
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

export default ExistingMaterials;
