import React, { useContext, useEffect }  from 'react';
import { Image, View, Text, StatusBar, TouchableOpacity, Platform, SafeAreaView, StyleSheet } from 'react-native';

import * as SecureStore from 'expo-secure-store';

import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import Toast from 'react-native-toast-message'; // Import Toast

import SimpleLineIcons from '@expo/vector-icons/SimpleLineIcons';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useRoute } from '@react-navigation/native';
import { SessionProvider } from './contexts/SessionContext'; // Import the SessionProvider
import { SessionContext } from './contexts/SessionContext';

import HomeScreen from './screens/HomeScreen';
import BasketballScreen from './screens/BasketballScreen';
import BasketBallCourtScreen from './screens/BasketBallCourtScreen';
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
import ContactUs from './screens/mypage/ContactUs';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

import { LoadingProvider } from './contexts/LoadingContext'; // 컨텍스트 가져오기
import LoadingScreen from './contexts/LoadingScreen'
import OpenSourceLicenseScreen from './screens/mypage/OpenSourceLicenseScreen';

const GOOGLE_MAPS_API_KEY = "AIzaSyD5TbdDeXOaL2B5V7tPv7TNIEZo0V2pJtI";

// Stack Navigator for each tab
const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// Header Component
function CustomHeader({ navigation }) {
  const route = useRoute(); // 현재 활성화된 화면 정보 가져오기
  return (
    <SafeAreaView style={{ 
        flexDirection: 'row', 
        alignItems: 'center', 
        justifyContent: "space-between", 
        width: '100%',
      
      }}>
      <StatusBar barStyle="dark-content" backgroundColor="white" translucent={true} />
      <View>
        {/* <Text style={{ fontSize: 14}}>Basket Time</Text> */}
        <Image 
          source={require('./assets/main.png')} // main.png 파일을 불러옴
          style={{ width: 60, height: 60, resizeMode: 'contain', marginLeft: -10 }} // 적절한 크기로 조정
        />
      </View>
      {/* 현재 화면 이름이 'Home'일 때만 버튼 노출 */}
      {route.name === 'Main' && (
      <View>
        <TouchableOpacity onPress={() => navigation.navigate('MessageCompose')}>
          
          <MaterialCommunityIcons name="email-plus-outline" size={24} color="#FFD73C" />
          {/* <EvilIcons name="envelope" size={30} color="#aaa"/> */}
        </TouchableOpacity>
      </View>
      )}
    </SafeAreaView>
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
      <Tab.Screen name="Basketball" component={BasketBallCourtScreen} options={{ tabBarLabel: '우동농', headerShown: false  }} />
      <Tab.Screen name="Draw" component={DrawScreen} options={{ tabBarLabel: 'Draw', headerShown: false  }} />
      <Tab.Screen name="MyPage" component={MyPageScreen} options={{ tabBarLabel: '마이페이지', headerShown: false  }} />
    </Tab.Navigator>
  );
}

function RootNavigator() {
  return (
      <Stack.Navigator
        screenOptions={({ navigation }) => ({
          headerTitle: () => <CustomHeader navigation={navigation} />,
          headerStyle: {
            backgroundColor: 'white',
            height: 70,
          },
        })}
        initialRouteName="Loading" // 초기 화면을 로딩 스크린으로 설정
      >
        <Stack.Screen name="Main" component={MainTabs} />
        <Stack.Screen name="Login" component={Login} options={{ headerShown: false }}/>
        <Stack.Screen name="Loading" component={LoadingScreen} options={{ headerShown: false }}/>
        <Stack.Screen name="PlayerDetail" component={PlayerDetailScreen} options={{ title: '선수 상세 정보' }} />
        <Stack.Screen name="MatchCreateScreen" component={MatchCreateScreen} options={{ title: '경기매칭생성' }} />
        <Stack.Screen name="CreateCommunity" component={CreateCommunity} options={{ title: '글 작성' }} />
        <Stack.Screen name="SelectCommunity" component={SelectCommunity} options={{ title: '글 수정/조회' }} />
        <Stack.Screen name="EditComment" component={EditComment} options={{ title: '댓글 수정' }} />
        <Stack.Screen name="ImageEditor" component={ImageEditor} />
        <Stack.Screen name="MessageCompose" component={MessageCompose} options={{ title: '쪽지 쓰기' }} />
        <Stack.Screen name="MessageInbox" component={MessageInbox} options={{ title: '쪽지함' }} />
        <Stack.Screen name="ContactUs" component={ContactUs} options={{ title: '문의하기' }} />
        <Stack.Screen name="OpenSourceLicenseScreen" component={OpenSourceLicenseScreen} options={{ title: '오픈소스 라이선스' }} />
      </Stack.Navigator>
  );
}

export default function App() {

  useEffect(() => {
    const storeApiKey = async () => {
      try {
        const storedKey = await SecureStore.getItemAsync("GOOGLE_MAPS_API_KEY");
        
        if (!storedKey) {
          await SecureStore.setItemAsync("GOOGLE_MAPS_API_KEY", GOOGLE_MAPS_API_KEY);
          console.log("✅ API Key 저장 완료");
        } else {
          console.log("🔹 기존 API Key 존재");
        }

        // API 키 불러오기
        const key = await SecureStore.getItemAsync("GOOGLE_MAPS_API_KEY");
        setApiKey(key);
      } catch (error) {
        console.error("❌ API Key 저장 오류:", error);
      }
    };

    storeApiKey();
  }, []);
  
  return (
    <NavigationContainer>
      <SessionProvider>
        <LoadingProvider>
          <RootNavigator />
          <Toast/>
        </LoadingProvider>
      </SessionProvider>
    </NavigationContainer>
  );
}
