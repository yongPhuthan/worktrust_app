import React, { useState } from 'react';
import { useUser } from '../../../providers/UserContext';
import firebase from '../../../firebase';
import { FirebaseFirestoreTypes } from '@react-native-firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { SubscriptionType } from '@prisma/client';
import { CompanyCreateSchemaType, UserCreateCompanySchemaType } from '../../../models/validationSchema/register/createCompanyScreen';

type Response = {
  isLoading: boolean;
  error: Error | null;
  createCompany: (data: ReqData) => Promise<boolean>;
};

type ReqData = {
  company: CompanyCreateSchemaType;
  seller: UserCreateCompanySchemaType;
};

export function useCreateCompany(): Response {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const user = useUser();
  const { firestore } = firebase;

  const getCurrentMonthBatchId = () => {
    const now = new Date();
    return `batch${now.getFullYear()}_${(now.getMonth() + 1).toString().padStart(2, '0')}`;
  };

  const createInitialBatch = async (
    transaction: FirebaseFirestoreTypes.Transaction,
    companyId: string,
  ) => {
    const batchId = getCurrentMonthBatchId();
    const batchRef = firestore().collection('quotationBatches').doc(batchId);

    const batchDoc = await batchRef.get();
    if (!batchDoc.exists) {
      transaction.set(batchRef, {
        companyId: companyId,
        quotations: [],
        created: firestore.FieldValue.serverTimestamp(),
        updated: firestore.FieldValue.serverTimestamp(),
      });

      const companyRef = firestore().collection('companies').doc(companyId);
      transaction.update(companyRef, {
        quotationBatches: firestore.FieldValue.arrayUnion(batchId),
        updated: firestore.FieldValue.serverTimestamp(),
      });

      console.log(`Created new batch: ${batchId}`);
    } else {
      console.log(`Batch ${batchId} already exists.`);
    }
  };

  const saveDataToAsyncStorage = async (company: CompanyCreateSchemaType, user: UserCreateCompanySchemaType) => {
    try {
      await AsyncStorage.setItem(`company`, JSON.stringify(company));
      await AsyncStorage.setItem(`user`, JSON.stringify(user));
      console.log('Data saved to AsyncStorage');
    } catch (e) {
      console.error('Failed to save data to AsyncStorage', e);
    }
  };

  const createCompany = async (data: ReqData): Promise<boolean> => {
    const { company, seller } = data;
    if (!user || !user.uid) {
      console.error('User or user uid is not available');
      setError(new Error('User or user uid is not available'));
      return false;
    }

    setIsLoading(true);
    setError(null);

    try {
      const userDocRef = firestore().collection('users').doc(user.uid);
      const companyDocRef = firestore().collection('companies').doc();
      const subscriptionDocRef = firestore().collection('subscriptions').doc();

      await firestore().runTransaction(
        async (transaction: FirebaseFirestoreTypes.Transaction) => {
          const newCompany = {
            ...company,
            userUids: [user.uid],
            quotationBatches: [], 
            isActive: true,
            created: firestore.FieldValue.serverTimestamp(),
            updated: firestore.FieldValue.serverTimestamp(),
          };

          transaction.set(companyDocRef, newCompany);

          const updatedUser = {
            ...seller,
            uid: user.uid,
            currentCompanyId: companyDocRef.id,
            currentSubscriptionId: subscriptionDocRef.id,
            updated: firestore.FieldValue.serverTimestamp(),
            created: firestore.FieldValue.serverTimestamp(),
          };

          transaction.update(userDocRef, updatedUser);

          const newSubscription: SubscriptionType = {
            id: subscriptionDocRef.id,
            userId: userDocRef.id,
            startDate: firestore.Timestamp.now(),
            endDate: firestore.Timestamp.fromDate(
              new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
            ), // Free trial for 30 days
            isActive: true,
            created: firestore.FieldValue.serverTimestamp(),
          };

          transaction.set(subscriptionDocRef, newSubscription);

          await createInitialBatch(transaction, companyDocRef.id);

          // Save to AsyncStorage
          await saveDataToAsyncStorage(newCompany, updatedUser);
        }
      );

      console.log('Company created successfully.');
      return true;
    } catch (err) {
      console.error('An error occurred:', err);
      setError(
        err instanceof Error
          ? err
          : new Error('An error occurred during company creation')
      );
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return { isLoading, error, createCompany };
}
