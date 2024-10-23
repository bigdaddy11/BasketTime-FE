import React from 'react';
import { StyleSheet } from 'react-native';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import KBLScreen from './basketball/KBLScreen';
import NBAScreen from './basketball/NBAScreen';

const Tab = createMaterialTopTabNavigator();

export default function BasketballScreen() {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: '#FFD73C',  // 선택된 탭 텍스트 색
        tabBarInactiveTintColor: '#888',   // 선택되지 않은 탭 텍스트 색
        tabBarLabelStyle: { fontSize: 16, fontWeight: 'bold' },  // 탭 라벨 스타일
        tabBarStyle: { backgroundColor: '#FFF' },  // 탭 바 배경색
        tabBarIndicatorStyle: { backgroundColor: '#FFD73C', height: 2 },  // 탭 아래 강조선 스타일
      }}
    >
    <Tab.Screen name="NBA" component={NBAScreen} />
    <Tab.Screen name="KBL" component={KBLScreen} />
      
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
