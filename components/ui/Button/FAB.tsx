import React from 'react';
import {Dimensions, StyleSheet, View} from 'react-native';
import {FAB} from 'react-native-paper';
type Props = {
  createNewFunction: () => void;
};

const FABButton = (props: Props) => {
  const {createNewFunction} = props;
  return (
    <View>
      <FAB
        variant="primary"
        mode="elevated"
        style={styles.fabStyle}
        icon="plus"
        onPress={() => createNewFunction()}
        color="white"
      />
    </View>
  );
};

export default FABButton;
const {height, width} = Dimensions.get('window');

const styles = StyleSheet.create({
  fabStyle: {
    bottom: height * 0.1,
    right: width * 0.05,
    position: 'absolute',
    backgroundColor: '#027f6f',
    // backgroundColor: '#1b52a7',
    // backgroundColor: '#00674a',
    // backgroundColor: '#009995',
  },
});
