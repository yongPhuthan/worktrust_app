import {StackNavigationProp} from '@react-navigation/stack';
import React, {useContext, useEffect} from 'react';
import {FlatList, StyleSheet, View} from 'react-native';
import {Appbar, Avatar, Divider, List} from 'react-native-paper';
import {Store} from '../../redux/store';
import {ParamListBase} from '../../types/navigationType';
import {NotificationType, Notifications} from '@prisma/client';
import * as stateAction from '../../redux/actions';
import useFetchNotifications from '../../hooks/notfications/query';

interface NotificationScreenProps {
  navigation: StackNavigationProp<ParamListBase, 'NotificationScreen'>;
}

const NotificationScreen = ({navigation}: NotificationScreenProps) => {
  const {
    state: {notifications, quotations},
    dispatch,
  } = useContext(Store);

  const {data, isLoading, isError, error, refetch} = useFetchNotifications();

  const handlePress = (screen: any, docId: string, type: NotificationType) => {
    if (type === NotificationType.QuotationEvent) {
      const quotation = quotations?.find(q => q.id === docId);
      if (quotation) {
        dispatch(stateAction.get_edit_quotation(quotation));
        navigation.navigate(screen);
      }
    }
  };

  // useEffect(() => {
  //   if (data) {
  //     dispatch(stateAction.get_notification(data.notifications));
  //   }
  // }, [data]) ;

  const renderItem = ({item}: {item: Notifications}) => (
    <List.Item
      title={item.title}
      description={item.docId}
      style={{
        backgroundColor: !item.isRead ? 'white' : '#f0f0f0',
      }}

      left={props => (
        <Avatar.Icon
          size={30}
          
          style={{
            backgroundColor: item.isRead ? 'white' : '#f0f0f0',
            marginLeft: 10,
          }}
          icon={item.isRead ? 'bell-outline' : 'bell-badge'}
        />
      )}
      onPress={() => handlePress(item.screen, item.docId, item.type)}
    />
  );

  return (
    <>
      <Appbar.Header
        elevated
        mode="center-aligned"
        style={{
          backgroundColor: 'white',
        }}>
        <Appbar.BackAction
          onPress={() => {
            navigation.goBack();
          }}
        />
        <Appbar.Content
          title={'การแจ้งเตือน'}
          titleStyle={{
            fontSize: 18,
          }}
        />
      </Appbar.Header>
      <View style={styles.container}>
        <FlatList
          data={notifications}
          renderItem={renderItem}
          keyExtractor={item => item.id}
          ItemSeparatorComponent={() => <Divider />}
        />
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
});

export default NotificationScreen;
