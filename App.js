import React from 'react';
import { Image, View, Text, StatusBar } from 'react-native';

import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';

import MaterialIcons from '@expo/vector-icons/MaterialIcons';

import HomeScreen from './screens/HomeScreen';
import BasketballScreen from './screens/BasketballScreen';
import MatchScreen from './screens/MatchScreen';
import MyPageScreen from './screens/MyPageScreen';
import PlayerDetailScreen from './screens/basketball/PlayerDetailScreen';
import Login from './screens/mypage/Login';
import MatchCreateScreen from './screens/match/MatchCreateScreen';
import MapScreen from './screens/match/MapScreen';

// Stack Navigator for each tab
const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// Header Component
function CustomHeader() {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', width: "100%" }}>
      <Text style={{ fontSize: 16, width: "100%" }}>Basket Time</Text>
    </View>
  );
}

// Footer (Bottom Tabs)
function MainTabs() {
  return (
    <Tab.Navigator
    screenOptions={({route}) => ({ 
      tabBarIcon: ({ color, size }) => {
        let iconName;

        if (route.name === 'Home') {
          iconName = 'home';
        } else if (route.name === 'Basketball') {
          iconName = 'sports-basketball';
        } else if (route.name === 'Match') {
          iconName = 'search';
        } else if (route.name === 'MyPage') {
          iconName = 'emoji-people';
        }

        // return the MaterialIcons with the determined name
        return <MaterialIcons name={iconName} size={size} color={color} />;
      },
      tabBarActiveTintColor: '#FFD73C',  // 선택된 탭의 텍스트 
      tabBarLabelStyle: { fontSize: 10 },  // 라벨의 스타일 설정
    })}
    >
      <Tab.Screen name="Home" component={HomeScreen} options={{ tabBarLabel: '홈', headerShown: false }} />
      <Tab.Screen name="Basketball" component={BasketballScreen} options={{ tabBarLabel: '프로농구', headerShown: false  }} />
      <Tab.Screen name="Match" component={MapScreen} options={{ tabBarLabel: '경기매칭', headerShown: false  }} />
      <Tab.Screen name="MyPage" component={MyPageScreen} options={{ tabBarLabel: '마이페이지', headerShown: false  }} />
    </Tab.Navigator>
  );
}

export default function App() {
  return (
    <>
    <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent={true} />
    <NavigationContainer>
      <Stack.Navigator 
          screenOptions={{ 
          headerTitle: () => <CustomHeader /> ,
          headerStyle: {
            backgroundColor: '#FFD73C',  // 헤더 전체 배경색 설정
          },
        }}
      >
        <Stack.Screen name="Main" component={MainTabs} style={{  }}/>
        <Stack.Screen name="PlayerDetail" component={PlayerDetailScreen} options={{ title: '선수 상세 정보' }} />
        <Stack.Screen name="Login" component={Login} options={{ title: '로그인' }} />
        <Stack.Screen name="MatchCreateScreen" component={MatchCreateScreen} options={{ title: '경기매칭생성' }} />
      </Stack.Navigator>
    </NavigationContainer>
    </>
  );
}