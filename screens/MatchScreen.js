import React from 'react';
import { StyleSheet } from 'react-native';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

import MapScreen from './match/MapScreen';
import ListScreen from './match/ListScreen';

const Tab = createMaterialTopTabNavigator();

export default function MatchScreen() {
  return (
    <Tab.Navigator
      screenOptions={({route}) => ({ 
        tabBarIcon: ({ color }) => {
          let iconName;
  
          if (route.name === 'Map') {
            iconName = 'location-on';
          } else if (route.name === 'List') {
            iconName = 'list';
          } 
          // return the MaterialIcons with the determined name
          return <MaterialIcons name={iconName} size={20} color={color} />;
        },
        tabBarShowLabel: false,  // 라벨 숨기기
        tabBarActiveTintColor: '#FFD73C',  // 선택된 탭 텍스트 색
        tabBarInactiveTintColor: '#888',   // 선택되지 않은 탭 텍스트 색
        tabBarIndicatorStyle: { backgroundColor: '#FFD73C', height: 2 },  // 탭 아래 강조선 스타일
        
      })}
    >
    <Tab.Screen name="Map" component={MapScreen} options={{tabBarButton: () => null}}/>
    {/* <Tab.Screen name="List" component={ListScreen} /> */}
      
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
