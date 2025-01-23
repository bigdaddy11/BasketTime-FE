import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import KBLScreen from './basketball/KBLScreen';
import NBAScreen from './basketball/NBAScreen';

export default function BasketballScreen() {
  const [activeScreen, setActiveScreen] = useState('NBA'); // 현재 활성 화면 상태

  // 화면 전환 핸들러
  const handleScreenChange = (screen) => {
    setActiveScreen(screen);
  };

  return (
    <View style={styles.container}>
      {/* 버튼으로 화면 전환 */}
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[
            styles.tabButton,
            activeScreen === 'NBA' && styles.activeTab,
          ]}
          onPress={() => handleScreenChange('NBA')}
        >
          <Text style={[styles.tabText, activeScreen === 'NBA' && styles.activeTabText]}>NBA</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.tabButton,
            activeScreen === 'KBL' && styles.activeTab,
          ]}
          onPress={() => handleScreenChange('KBL')}
        >
          <Text style={[styles.tabText, activeScreen === 'KBL' && styles.activeTabText]}>KBL</Text>
        </TouchableOpacity>
      </View>

      {/* 화면 렌더링 */}
      <View style={styles.screenContainer}>
        {activeScreen === 'NBA' && <NBAScreen />}
        {activeScreen === 'KBL' && <KBLScreen />}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  tabBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#DDD',
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#FFD73C',
  },
  tabText: {
    fontSize: 16,
    color: '#888',
    fontWeight: 'bold',
  },
  activeTabText: {
    color: '#FFD73C',
  },
  screenContainer: {
    flex: 1,
  },
});
