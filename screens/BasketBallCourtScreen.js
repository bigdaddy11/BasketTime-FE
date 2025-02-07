import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import GoogleMapScreen from './basketballcourt/GoogleMapScreen';

export default function BasketBallCourtScreen() {

  return (
    <View style={styles.container}>
        <GoogleMapScreen />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
  }
});
