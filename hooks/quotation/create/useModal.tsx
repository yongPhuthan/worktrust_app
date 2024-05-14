import {useState} from 'react';


export function useModal(defaultVisible = false) {
    const [isVisible, setIsVisible] = useState(defaultVisible);
  
    const toggleModal = () => setIsVisible(!isVisible);
    const openModal = () => setIsVisible(true);
    const closeModal = () => setIsVisible(false);
  
    return { isVisible, toggleModal, openModal, closeModal };
  }
  