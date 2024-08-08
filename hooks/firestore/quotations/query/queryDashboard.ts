import {Company, Quotation, QuotationBatch, User} from 'models/schema';
import firebase from '../../../../firebase';
import {Dispatch, useContext} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {StackNavigationProp} from '@react-navigation/stack';
import {RootStackParamList} from '../../../../types/navigationType';
import * as stateAction from '../../../../redux/actions';

const fetchQuotations = async (
  userId: string,
  navigation: StackNavigationProp<RootStackParamList>,
  dispatch: Dispatch<any>,
  state: any,
): Promise<Quotation[]> => {
  console.log('fetchQuotations');
  const firestore = firebase.firestore();

  // Check if user data is cached in AsyncStorage
  const cachedUser = await AsyncStorage.getItem(`user`);
  let userData: User;

  if (cachedUser) {
    userData = JSON.parse(cachedUser);
    dispatch(stateAction.get_user(userData));
  } else {
    // Fetch user data from Firestore
    console.log('cachedUser');

    const userDoc = await firestore.collection('users').doc(userId).get();
    if (!userDoc.exists) {
      navigation.navigate('FirstAppScreen');
      throw new Error('User not found');
    }

    userData = userDoc.data() as User;
    await AsyncStorage.setItem(`user`, JSON.stringify(userData));
    console.log('userData', userData);
  }

  const companyId = userData.currentCompanyId;
  if (!companyId) {
    navigation.navigate('CreateCompanyScreen');
    throw new Error('Company ID not found for user');
  }

  // Check if company data is cached in AsyncStorage
  const cachedCompany = await AsyncStorage.getItem(`company`);
  console.log('cachedCompany ' + cachedCompany);
  let companyData: Company;

  if (cachedCompany) {
    companyData = JSON.parse(cachedCompany);
    dispatch(stateAction.get_company_state(companyData));

    dispatch(stateAction.code_company(companyData.code));
    dispatch(stateAction.get_logo(companyData.logo || ''));
  } else {
    // Fetch company data from Firestore
    console.log('companyData');

    const companyDoc = await firestore
      .collection('companies')
      .doc(companyId)
      .get();
    if (!companyDoc.exists) {
      navigation.navigate('CreateCompanyScreen');
      throw new Error('Company not found');
    }

    companyData = companyDoc.data() as Company;
    console.log('companyData', companyData);
    await AsyncStorage.setItem(
      `company`,
      JSON.stringify(companyData),
    );
    dispatch(stateAction.code_company(companyData.code));
    dispatch(stateAction.get_logo(companyData.logo || ''));
  }

  const code = companyData.code;
  if (!code) {
    throw new Error('Company code not found');
  }

  // Fetch quotation batches
  let allQuotations: Quotation[] = [];
  for (const batchId of companyData.quotationBatches) {
    // Check if batch data is cached in AsyncStorage
    const cachedBatch = await AsyncStorage.getItem(`batch_${batchId}`);
    if (cachedBatch) {
      console.log('Cache batch found');
      const batchData = JSON.parse(cachedBatch) as QuotationBatch;
      allQuotations = allQuotations.concat(batchData.quotations);
    } else {
      // Fetch batch data from Firestore
      console.log(`Fetching batch ${batchId} from Firestore`);
      const batchDoc = await firestore
        .collection('quotationBatches')
        .doc(code)
        .collection(batchId)
        .doc('batchesData')
        .get();
      if (!batchDoc.exists) {
        throw new Error(`Batch ${batchId} not found`);
      }

      const batchData = batchDoc.data() as QuotationBatch;
      allQuotations = allQuotations.concat(batchData.quotations);
      await AsyncStorage.setItem(`batch_${batchId}`, JSON.stringify(batchData));
    }
  }

  console.log('All quotations fetched:', allQuotations);
  return allQuotations;
};

export default fetchQuotations;
