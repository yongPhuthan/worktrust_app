import AsyncStorage from '@react-native-async-storage/async-storage';
import { useContext } from 'react';
import firebase from '../../../firebase';
import { useUser } from '../../../providers/UserContext';
import { Store } from '../../../redux/store';
import { QuotationValidationSchemaType } from 'modelse/validationSchema/quotations/create';

export interface QuotationActions {
  setQuotationServerId: (id: string) => void;
  setPdfUrl: (url: string) => void;
  openProjectModal: () => void;
}

const useCreateQuotation = (actions: QuotationActions) => {
  const { setQuotationServerId, setPdfUrl, openProjectModal } = actions;
  const user = useUser();
  const {
    dispatch,
    state: { companyId,G_company },
  } = useContext(Store);
  const { firestore } = firebase;

  if (!user || !user.uid) {
    console.error("User authentication failed: No user available");
    throw new Error('User is not authenticated');
  }

  const getCurrentMonthBatchId = () => {
    const now = new Date();
    return `batch${now.getFullYear()}_${(now.getMonth() + 1).toString().padStart(2, '0')}`;
  };

  const saveBatchToStorage = async (batchId: string, ) => {
    try {
      const company = await AsyncStorage.getItem('company');
      const companyData = company ? JSON.parse(company) : { quotationBatches: [] };
      if (!companyData.quotationBatches.includes(batchId)) {
        companyData.quotationBatches.push(batchId);
      }
      await AsyncStorage.setItem('company', JSON.stringify(companyData));
    } catch (error) {
      console.error('Error saving batch data to AsyncStorage:', error);
    }
  };

  const checkBatchInStorage = async (batchId: string) => {
    try {
      const company = await AsyncStorage.getItem('company');
      const companyData = company ? JSON.parse(company) : { quotationBatches: [] };
      return companyData.quotationBatches.includes(batchId);
    } catch (error) {
      console.error('Error checking batch data in AsyncStorage:', error);
      return false;
    }
  };

  const saveQuotationToStorage = async (quotation: QuotationValidationSchemaType) => {
    try {
      const batchId = getCurrentMonthBatchId();
      const batches = await AsyncStorage.getItem(`batch_${batchId}`);
      const batchesData = batches ? JSON.parse(batches) : { quotations: [] };
      batchesData.quotations.push(quotation);
      await AsyncStorage.setItem(`batch_${batchId}`, JSON.stringify(batchesData));
      const checkBatch = await AsyncStorage.getItem(`batch_${batchId}`);
    } catch (error) {
      console.error('Error saving quotation data to AsyncStorage:', error);
    }
  };

  const checkAndCreateBatch = async () => {
    const batchId = getCurrentMonthBatchId();
    const existsInStorage = await checkBatchInStorage(batchId);

    if (!existsInStorage) {
      const batchRef = firestore().collection('quotationBatches').doc(G_company?.code).collection(batchId).doc('batchesData');
      try {
        const batchDoc = await batchRef.get();
        if (!batchDoc.exists) {
          await batchRef.set({
            companyId: companyId,
            quotations: [],
            created: new Date(),  
            updated: new Date(),  
          });

          const companyRef = firestore().collection('companies').doc(companyId);
          await companyRef.update({
            quotationBatches: firestore.FieldValue.arrayUnion(batchId),
            updated: new Date(),  
          });

          await saveBatchToStorage(batchId);
          console.log(`Created new batch: ${batchId}`);
        } else {
          console.log(`Batch ${batchId} already exists in Firestore.`);
        }
      } catch (error) {
        console.error('Error checking or creating batch in Firestore:', error);
      }
    } else {
      console.log(`Batch ${batchId} already exists in AsyncStorage.`);
    }
  };

  const createQuotation = async (quotation: QuotationValidationSchemaType,) => {
    const batchId = getCurrentMonthBatchId();
    const batchRef = firestore().collection('quotationBatches').doc(G_company?.code).collection(batchId).doc('batchesData');

    const newQuotationRef = batchRef.collection('quotations').doc();
    const newQuotation = {
      ...quotation,
      id: newQuotationRef.id,
      created: new Date(),  
      updated: new Date(),  
    };

    try {
      console.log('Fetching batch document...');
      const batchDoc = await batchRef.get();
      console.log('Batch document fetched:', batchDoc.exists ? 'Exists' : 'Does not exist');

      if (!batchDoc.exists) {
        console.log('Batch document does not exist, creating new batch...');
        await batchRef.set({
          companyId: companyId,
          quotations: [newQuotation],
          created: new Date(),  
          updated: new Date(),  
        });

        const companyRef = firestore().collection('companies').doc(companyId);
        console.log('Updating company document with new batch...');
        await companyRef.update({
          quotationBatches: firestore.FieldValue.arrayUnion(batchId),
          updated: new Date(),  
        });
      } else {
        console.log('Batch document exists, updating batch with new quotation...');
        const batchData = batchDoc.data();
        console.log('Batch data:', batchData);

        // Append the new quotation to the existing array
        const updatedQuotations = [...(batchData.quotations || []), newQuotation];

        console.log('Updating batch document with new quotation...');
        await batchRef.update({
          quotations: updatedQuotations,
          updated: new Date(),  
        });
        console.log('Batch document updated successfully.');
      }

      console.log('Saving quotation to storage...');
      await saveQuotationToStorage(newQuotation);
      console.log('Quotation saved to storage.');

      setQuotationServerId(newQuotationRef.id);
      console.log('Set quotation server ID:', newQuotationRef.id);

      openProjectModal();
      console.log('Opened project modal.');

      return newQuotationRef.id;
    } catch (error) {
      console.error('Error creating quotation:', error);

      // Detailed error logging
      if (error as any) {
        console.error('FirestoreError code:', error.code);
        console.error('FirestoreError message:', error.message);
      } else {
        console.error('Unexpected error:', error);
      }

      throw error; // Ensure the error is still thrown after logging
    }
  };

  const createQuotationHandler = async (quotation: QuotationValidationSchemaType): Promise<boolean> => {
    try {
      await checkAndCreateBatch();
      await createQuotation(quotation);
      return true; // Return true on success
    } catch (error) {
      console.error('Error creating quotation:', error);
      return false; // Return false on error
    }
  };

  return { createQuotationHandler };
};

export default useCreateQuotation;
