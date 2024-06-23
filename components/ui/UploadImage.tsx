import React from 'react';
import { View, TouchableOpacity, Image, ActivityIndicator, Text } from 'react-native';
import { IconButton } from 'react-native-paper';
import { Controller, Control } from 'react-hook-form';

interface ImageUploadProps {
  control: Control<any>;
  name: string;
  isUploading: boolean;
  pickImage: () => void;
  label: string;
  width: number;
height: number;
}

const UploadImage: React.FC<ImageUploadProps> = ({ control, name, isUploading, pickImage, label, width, height }) => {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field: { onChange, value } }) => (
        <TouchableOpacity
          style={{
            alignItems: 'center',
            justifyContent: 'center',
          }}
          onPress={() => pickImage()}>
          {isUploading ? (
            <View
              style={{
                justifyContent: 'center',
                alignItems: 'center',
       
                borderColor: '#047e6e',
                borderWidth: 1,
                backgroundColor: '#f5f5f5',
                borderRadius: 5,
                borderStyle: 'dashed',
                padding: 10,
                height,
                width,
              }}>
              <ActivityIndicator size="small" color="#047e6e" />
            </View>
          ) : value ? (
            <Image
              source={{ uri: value }}
              style={{
                width,
                height,
                aspectRatio: 1,
              
              }}
              onError={e =>
                console.log('Failed to load image:', e.nativeEvent.error)
              }
            />
          ) : (
            <View
           >
              <TouchableOpacity
                style={{
                  justifyContent: 'center',
                  alignItems: 'center',
                  borderColor: '#047e6e',
                  borderWidth: 1,
                  backgroundColor: '#f5f5f5',
                  borderRadius: 5,
                  borderStyle: 'dashed',
                  padding: 10,
                  height,
                  width,
                }}
                onPress={() => pickImage()}>
                <IconButton
                  icon="image-plus"
                  iconColor={'#047e6e'}
                  size={40}
                  onPress={() => pickImage()}
                />
                <Text
                  style={{
                    textAlign: 'center',
                    color: '#047e6e',
                  }}>
                  {label}
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </TouchableOpacity>
      )}
    />
  );
};

export default UploadImage;
