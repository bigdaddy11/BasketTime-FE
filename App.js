import React from 'react';
import { Image, View, Text, StatusBar, TouchableOpacity } from 'react-native';

import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';

import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useRoute } from '@react-navigation/native';
import { SessionProvider } from './contexts/SessionContext'; // Import the SessionProvider

import HomeScreen from './screens/HomeScreen';
import BasketballScreen from './screens/BasketballScreen';
import MyPageScreen from './screens/MyPageScreen';
import PlayerDetailScreen from './screens/basketball/PlayerDetailScreen';
import Login from './screens/mypage/Login';
import MatchCreateScreen from './screens/match/MatchCreateScreen';
import MapScreen from './screens/match/MapScreen';
import DrawScreen from './screens/DrawScreen';
import CreateCommunity from './screens/home/CreateCommunity';
import SelectCommunity from './screens/home/SelectCommunity'; 
import EditComment from './screens/home/EditComment';
import ImageEditor from './screens/common/ImageEditor';
import MessageCompose from './screens/mypage/MessageCompose';
import MessageInbox from './screens/mypage/MessageInbox';

// Stack Navigator for each tab
const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// Header Component
function CustomHeader({ navigation }) {
  const route = useRoute(); // 현재 활성화된 화면 정보 가져오기
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: "space-between", width: '100%'}}>
      <View>
        <Text style={{ fontSize: 14}}>Basket Time</Text>
      </View>
      {/* 현재 화면 이름이 'Home'일 때만 버튼 노출 */}
      {route.name === 'Main' && (
      <View>
        <TouchableOpacity onPress={() => navigation.navigate('MessageCompose')}>
          <FontAwesome name="paper-plane" size={20} color="black"/>
        </TouchableOpacity>
      </View>
      )}
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
        } else if (route.name === 'Draw') {
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
      <Tab.Screen name="Draw" component={DrawScreen} options={{ tabBarLabel: 'Draw', headerShown: false  }} />
      <Tab.Screen name="MyPage" component={MyPageScreen} options={{ tabBarLabel: '마이페이지', headerShown: false  }} />
    </Tab.Navigator>
  );
}

export default function App() {
  return (
    <SessionProvider>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent={true} />
      <NavigationContainer>
        <Stack.Navigator
            screenOptions={({ navigation }) => ({
              headerTitle: () => <CustomHeader navigation={navigation} />, // navigation 전달
              headerStyle: {
                backgroundColor: '#FFD73C',
                height: 70,
              },
            })}
          >
          <Stack.Screen name="Main" component={MainTabs} style={{  }} options={{ headerLeft: () => null }} />
          <Stack.Screen name="PlayerDetail" component={PlayerDetailScreen} options={{ title: '선수 상세 정보' }} />
          <Stack.Screen name="Login" component={Login} options={{ title: '로그인', headerLeft: () => null }} />
          <Stack.Screen name="MatchCreateScreen" component={MatchCreateScreen} options={{ title: '경기매칭생성' }} />
          <Stack.Screen name="CreateCommunity" component={CreateCommunity} options={{ title: '글 작성' }} />
          <Stack.Screen name="SelectCommunity" component={SelectCommunity} options={{ title: '글 수정/조회' }} />
          <Stack.Screen name="EditComment" component={EditComment} options={{ title: '댓글 수정' }} />
          <Stack.Screen name="ImageEditor" component={ImageEditor} />
          <Stack.Screen name="MessageCompose" component={MessageCompose} options={{ title: '쪽지 쓰기' }} />
          <Stack.Screen name="MessageInbox" component={MessageInbox} options={{ title: '쪽지함' }} />
        </Stack.Navigator>
      </NavigationContainer>
    </SessionProvider>
  );
}