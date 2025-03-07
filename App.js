import React, { useContext, useEffect, useCallback, useState  }  from 'react';
import { Image, View, Text, StatusBar, TouchableOpacity, Platform, SafeAreaView, StyleSheet } from 'react-native';

import * as SecureStore from 'expo-secure-store';

import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import Toast from 'react-native-toast-message'; // Import Toast

import firebaseApp from './contexts/firebaseConfig'

import MaterialIcons from '@expo/vector-icons/MaterialIcons';

import { useRoute } from '@react-navigation/native';
import { SessionProvider, SessionContext } from './contexts/SessionContext'; // Import the SessionProvider
import { registerForPushNotificationsAsync } from './contexts/registerForPushNotificationsAsync';
import * as Notifications from 'expo-notifications';
import HomeScreen from './screens/HomeScreen';
import BasketBallCourtScreen from './screens/BasketBallCourtScreen';
import MyPageScreen from './screens/MyPageScreen';
import PlayerDetailScreen from './screens/basketball/PlayerDetailScreen';
import Login from './screens/mypage/Login';
import DrawScreen from './screens/DrawScreen';
import CreateCommunity from './screens/home/CreateCommunity';
import SelectCommunity from './screens/home/SelectCommunity'; 
import EditComment from './screens/home/EditComment';
import ImageEditor from './screens/common/ImageEditor';
import MessageCompose from './screens/mypage/MessageCompose';
import MessageInbox from './screens/mypage/MessageInbox';
import ContactUs from './screens/mypage/ContactUs';
import ReplyScreen from './screens/home/ReplyScreen';
import ChatRoom from './screens/chat/ChatRoom';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import ChatScreen from './screens/ChatScreen';
import CreateChatRoom from './screens/chat/CreateChatRoom';
import { LoadingProvider } from './contexts/LoadingContext'; // 컨텍스트 가져오기
import LoadingScreen from './contexts/LoadingScreen'
import OpenSourceLicenseScreen from './screens/mypage/OpenSourceLicenseScreen';

import * as SplashScreen from 'expo-splash-screen';

const GOOGLE_MAPS_API_KEY = "AIzaSyD5TbdDeXOaL2B5V7tPv7TNIEZo0V2pJtI";

SplashScreen.preventAutoHideAsync();

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
        {/* <Image 
          source={require('./assets/main.png')} // main.png 파일을 불러옴
          style={{ width: 60, height: 60, resizeMode: 'contain', marginLeft: -10 }} // 적절한 크기로 조정
        /> */}
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
        } else if (route.name === 'WeChat') {
          iconName = 'wechat';
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
      <Tab.Screen name="WeChat" component={ChatScreen} options={{ tabBarLabel: '시합하자', headerShown: false  }} />
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
        <Stack.Screen name="CreateCommunity" component={CreateCommunity} options={{ title: '글 작성' }} />
        <Stack.Screen name="SelectCommunity" component={SelectCommunity} options={{ title: '글 수정/조회' }} />
        <Stack.Screen name="EditComment" component={EditComment} options={{ title: '댓글 수정' }} />
        <Stack.Screen name="ImageEditor" component={ImageEditor} />
        <Stack.Screen name="MessageCompose" component={MessageCompose} options={{ title: '쪽지 쓰기' }} />
        <Stack.Screen name="MessageInbox" component={MessageInbox} options={{ title: '쪽지함' }} />
        <Stack.Screen name="ContactUs" component={ContactUs} options={{ title: '문의하기' }} />
        <Stack.Screen name="OpenSourceLicenseScreen" component={OpenSourceLicenseScreen} options={{ title: '오픈소스 라이선스' }} />
        <Stack.Screen name="ReplyScreen" component={ReplyScreen} options={{ title: '대댓글 작성' }} />
        <Stack.Screen name="CreateChatRoom" component={CreateChatRoom} options={{ title: '채팅방 생성' }} />
        <Stack.Screen name="ChatRoom" component={ChatRoom} options={{ title: '채팅하기' }} />
      </Stack.Navigator>
  );
}

export default function App() {
  const [appIsReady, setAppIsReady] = useState(false);

  // 앱 초기화 작업
  useEffect(() => {
    const notificationListener = Notifications.addNotificationReceivedListener(notification => {
      console.log("📩 푸쉬 알림 수신:", notification);
    });

    const responseListener = Notifications.addNotificationResponseReceivedListener(response => {
      console.log("📩 푸쉬 알림 클릭됨:", response);
    });

    async function prepare() {
      try {
        // 🎯 여기서 필요한 초기 로드 작업 (예: API 호출, 세션 확인 등)
        await new Promise(resolve => setTimeout(resolve, 1000)); // 1초 대기 (테스트용)
      } catch (e) {
        console.warn(e);
      } finally {
        setAppIsReady(true);
      }
    }

    prepare();

    registerForPushNotificationsAsync();

    return () => {
      Notifications.removeNotificationSubscription(notificationListener);
      Notifications.removeNotificationSubscription(responseListener);
    };
  }, []);

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
      } catch (error) {
        console.error("❌ API Key 저장 오류:", error);
      }
    };

    storeApiKey();
  }, [appIsReady]);

  // 스플래시 숨기기
  const onLayoutRootView = useCallback(async () => {
    if (appIsReady) {
      await SplashScreen.hideAsync(); // 스플래시 화면 숨김
    }
  }, [appIsReady]);

  if (!appIsReady) {
    return null; // 스플래시 상태 유지
  }

  return (
    <NavigationContainer>
      <SessionProvider>
        <LoadingProvider>
          <View style={{ flex: 1 }} onLayout={onLayoutRootView}>
            <RootNavigator />
            <Toast/>
          </View>
        </LoadingProvider>
      </SessionProvider>
    </NavigationContainer>
  );
}
