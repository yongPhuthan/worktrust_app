import React, { useState, useEffect } from 'react';
import { Image } from 'react-native';
import RNBlobUtil from 'react-native-blob-util';
import { ActivityIndicator, View } from 'react-native';

const CachedImage = ({ imageUrl, style } : { 
    imageUrl: string, 
    style: any
}) => {
  const [localPath, setLocalPath] = useState<string | null>(null);

  useEffect(() => {
    const fetchImage = async () => {
      // สร้างคีย์จาก URL โดยการแปลง URL เป็นชื่อไฟล์ที่ไม่ซ้ำกัน
      const imageKey = imageUrl.replace(/[^a-zA-Z0-9]/g, '');

      // สร้าง path สำหรับเก็บรูปภาพในระบบไฟล์
      const filePath = `${RNBlobUtil.fs.dirs.CacheDir}/${imageKey}.png`;

      // ตรวจสอบว่ารูปภาพถูกเก็บไว้ในระบบไฟล์หรือยัง
      const exists = await RNBlobUtil.fs.exists(filePath);

      if (exists) {
        // ถ้ารูปภาพมีอยู่แล้ว ให้ใช้ path นี้
        setLocalPath(filePath);
        console.log("CachedImage: ", filePath);
        
      } else {
        // ถ้าไม่มี ให้ดาวน์โหลดและเก็บในระบบไฟล์
        try {
          const res = await RNBlobUtil.config({
            fileCache: true,
            path: filePath,
          }).fetch('GET', imageUrl);

          setLocalPath(res.path());
          console.log("Download from server and CachedImage: ", res.path());
        } catch (error) {
          console.log('Error fetching image:', error);
        }
      }
    };

    fetchImage();
  }, [imageUrl]);

  if (!localPath) {
    return (
      <View style={[style, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator />
      </View>
    );
  }

  return <Image source={{ uri: 'file://' + localPath }} style={style} />;
};

export default CachedImage;