import React from 'react';
import {Button, Dialog, Portal, TextInput} from 'react-native-paper';
import {useForm, SubmitHandler, Controller} from 'react-hook-form';
import {View, Text} from 'react-native';
import {useUser} from '../providers/UserContext';
import {BACK_END_SERVER_URL} from '@env';

interface IFormInput {
  confirmationText: string;
}

interface ConfirmDeleteDialogProps {
  visible: boolean;
  hideDialog: () => void;
  company: string;
}
const ConfirmDeleteDialog: React.FC<ConfirmDeleteDialogProps> = ({
  visible,
  hideDialog,
  company,
}) => {
  const {
    control,
    handleSubmit,
    formState: {errors},
    watch,
  } = useForm<IFormInput>({
    defaultValues: {
      confirmationText: '',
    },
    mode: 'onChange',
  });

  const onConfirmDelete: SubmitHandler<IFormInput> = async data => {
    const user = useUser();

    if (!user) {
      throw new Error('User not authenticated');
    }

    const {email} = user;
    if (!email) {
      throw new Error('Email not found');
    }
    const token = await user.getIdToken(true);
    const response = await fetch(
      `${BACK_END_SERVER_URL}/api/company/deactivateUser?email=${encodeURIComponent(
        email,
      )}`,
      {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      },
    );

    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    hideDialog();
  };

  const confirmationText = watch('confirmationText');

  return (
    <Portal>
      <Dialog visible={visible} onDismiss={hideDialog}>
        <Dialog.Title>Delete Account</Dialog.Title>
        <Dialog.Content>
          <Text>พิมพ์ "ยืนยันลบบัญชี{company}"เพื่อยืนยันการลบบัญชีถาวร:</Text>
          <Controller
            control={control}
            render={({field: {onChange, value}}) => (
              <TextInput
                mode="outlined"
                label="Confirmation Text"
                value={value}
                onChangeText={onChange}
                error={!!errors.confirmationText}
              />
            )}
            name="confirmationText"
            rules={{required: 'This field is required.'}}
          />
          {errors.confirmationText && <Text>This field is required.</Text>}
        </Dialog.Content>
        <Dialog.Actions>
          <Button onPress={hideDialog}>ยกเลิก</Button>
          <Button
            onPress={handleSubmit(onConfirmDelete)}
            disabled={confirmationText !== `ยืนยันลบบัญชี${company}`}>
            ยืนยันลบบัญชี
          </Button>
        </Dialog.Actions>
      </Dialog>
    </Portal>
  );
};

export default ConfirmDeleteDialog;
