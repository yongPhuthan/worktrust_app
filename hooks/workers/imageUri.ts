import React from 'react';
import { IWorkerEmbed } from 'types/interfaces/WorkerEmbed';

function useWorkerImageUri(item: IWorkerEmbed) {
  const [imageUri, setImageUri] = React.useState<string | undefined>(
    item.image.localPathUrl || item.image.thumbnailUrl
  );

  const handleImageError = React.useCallback(() => {
    // เมื่อเกิดข้อผิดพลาด ให้เปลี่ยนไปใช้ thumbnailUrl
    setImageUri(item.image.thumbnailUrl);
  }, [item.image.thumbnailUrl]);

  return { imageUri, handleImageError };
}

export default useWorkerImageUri;