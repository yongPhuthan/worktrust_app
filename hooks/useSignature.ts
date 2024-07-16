// useSignature.tsx
import { useState, useEffect } from 'react';
import { useWatch, useFormContext } from 'react-hook-form';
import {useModal} from './quotation/create/useModal';

const useSignature = (fieldName: string) => {
  const { openModal, closeModal, isVisible } = useModal();
  const methods = useFormContext();
  const [isLoadingWebP, setIsLoadingWebP] = useState(false);
  const [selectedSignature, setSelectedSignature] = useState<string | null>(null);

  const sellerSignature = useWatch({
    control: methods.control,
    name: fieldName,
  });

  const onCloseSignature = () => {
    closeModal();
  };

  const toggleSignature = () => {
    if (sellerSignature) {
      methods.setValue(fieldName, '', { shouldDirty: true });
      setSelectedSignature(null);
      onCloseSignature();
    } else {
      openModal();
    }
  };

  useEffect(() => {
    const interval = setInterval(async () => {
      if (sellerSignature && isLoadingWebP) {
        try {
          const response = await fetch(sellerSignature);
          if (response.ok) {
            setIsLoadingWebP(false);
          }
        } catch (error) {
          console.error('Error checking SignatureImage:', error);
        }
      }
    }, 1500);

    return () => clearInterval(interval);
  }, [sellerSignature, isLoadingWebP]);

  useEffect(() => {
    if (selectedSignature) {
      methods.setValue(fieldName, selectedSignature, {
        shouldDirty: true,
      });
    }
  }, [selectedSignature]);

  return {
    sellerSignature,
    isLoadingWebP,
    setIsLoadingWebP,
    selectedSignature,
    setSelectedSignature,
    toggleSignature,
    signatureModal: isVisible,
    onCloseSignature,
  };
};

export default useSignature;