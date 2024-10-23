import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function KBLScreen() {
  return (
    <View style={styles.container}>
      <Text>KBL 리그 정보</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
