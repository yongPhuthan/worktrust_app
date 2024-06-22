import React, {useState} from 'react';
import {
  FlatList,
  StyleSheet,
  View,
  Dimensions,
  SafeAreaView,
} from 'react-native';
import Modal from 'react-native-modal';
import {Chip, Appbar, Button} from 'react-native-paper';

type Props = {
  isVisible: boolean;
  onClose: () => void;
  tags: Tag[];
  selectedTags: string[];
  handleSelectTag : (tag: string) => void;
};
interface Tag {
    id: string;
    name: string;
  }
  
const FilterModal = (props: Props) => {
  const {isVisible, onClose, tags, selectedTags, handleSelectTag} = props;



  const renderItem = ({item}: {item: Tag}) => (
    <Chip
      style={styles.chip}
      mode="outlined"
      //   selectedColor='#047e6e'
      selected={selectedTags.includes(item.name)}
      onPress={() => handleSelectTag(item.id)}>
      {item.name}
    </Chip>
  );

  return (
    <Modal isVisible={isVisible} style={styles.modal} onBackdropPress={onClose}>
      <Appbar.Header elevated style={styles.appbar}>
        <Appbar.Content title="เลือกหมวดหมู่" titleStyle={styles.appbarTitle} />
        <Appbar.Action icon="close" onPress={onClose} />
      </Appbar.Header>
      <SafeAreaView style={styles.container}>
        <FlatList
          data={tags}
          numColumns={4}
          renderItem={renderItem}
          keyExtractor={(item, index) => index.toString()}
          contentContainerStyle={styles.listContainer}
        />
        <View
          style={{
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            flex: 0.5,
          }}>
          <Button
            mode="contained"
            style={{
              width: '80%',
            }}
            onPress={() => {
              onClose();
            }}
            disabled={selectedTags.length === 0}>
            ตกลง
          </Button>
        </View>
      </SafeAreaView>
    </Modal>
  );
};

export default FilterModal;

const {width} = Dimensions.get('window');

const styles = StyleSheet.create({
  modal: {
    margin: 0,
    justifyContent: 'flex-start',
    alignItems: 'center',
    marginTop: 100,
  },
  appbar: {
    backgroundColor: 'white',
    width,
    marginTop: -30,
  },
  appbarTitle: {
    fontSize: 16,
  },
  container: {
    flex: 1,
    width,
    backgroundColor: '#fff',
  },
  listContainer: {
    padding: 20,
  },
  chip: {
    margin: 5,
  },
});
