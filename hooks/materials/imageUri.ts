import { IMaterials } from 'models/DefaultMaterials';
import React from 'react';

function useImageUri(item: IMaterials) {
  const [imageUri, setImageUri] = React.useState<string | undefined>(
    item.image.localPathUrl || item.image.thumbnailUrl
  );

  const handleImageError = React.useCallback(() => {
    // เมื่อเกิดข้อผิดพลาด ให้เปลี่ยนไปใช้ thumbnailUrl
    setImageUri(item.image.thumbnailUrl);
  }, [item.image.thumbnailUrl]);

  return { imageUri, handleImageError };
}

export default useImageUri;