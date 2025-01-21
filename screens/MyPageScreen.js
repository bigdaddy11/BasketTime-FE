import React, { useContext } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Image,} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { SessionContext } from '../contexts/SessionContext'; 
import Constants from 'expo-constants';
import { showToast } from './common/toast';

export default function MyPageScreen() {
  const navigation = useNavigation();
  const { session, logout } = useContext(SessionContext); // 세션 상태 가져오기
   // 앱 버전을 안전하게 가져오기
   const appVersion =
   Constants.expoConfig?.version || // Expo의 EAS 환경
   Constants.manifest?.version ||  // 로컬 개발 환경
   '버전 정보 없음';               // Fallback

    const userInfo = {
      name: "허재현",
      email: "zidir0070@naver.com"
    };
  
  const menuItems = [
    { id: '2', title: '쪽지함', routeName: "MessageInbox" },
    { id: '3', title: '문의하기', routeName: "ContactUs" },
    { id: '4', title: '앱버전', version: appVersion , routeName: "Version" },
    session
        ? { id: '5', title: '로그아웃', routeName: 'Logout' } // 세션이 있을 경우 로그아웃
        : { id: '1', title: '로그인', routeName: 'Login' }, // 세션이 없을 경우 로그인
  ];

  const handleMenuPress = (item) => {
    if (item.routeName === 'Logout') {
      // 로그아웃 처리
      logout(); // 세션 초기화
      showToast({
        type: 'success',
        text1: '로그아웃되었습니다.',
        position: 'bottom'
      });
      navigation.navigate('Login'); // 홈 화면으로 이동
      return;
    } else if (item.routeName === 'Version'){
      //console.log(Constants.manifest.version);
      return;
    }
    // 다른 메뉴로 이동
    navigation.navigate(item.routeName);
  };
  
  const renderItem = ({ item }) => (
    <TouchableOpacity style={styles.menuItem} onPress={() => handleMenuPress(item)}>
      <Text style={styles.menuText}>{item.title}</Text>
      {item.version && <Text style={styles.versionText}>{item.version}</Text>}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* 상단 유저 정보 */}
      <View style={styles.userInfoContainer}>
        {session ? (
          <>
            <Text style={styles.userName}>{session.nickName}</Text>
            <Text style={styles.userEmail}>{session.email}</Text>
          </>
        ) : (
          <Text style={styles.guestText}>로그인이 필요합니다.</Text>
        )}
      </View>

      {/* 메뉴 리스트 */}
      <FlatList
        data={menuItems}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        style={styles.menuList}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  userInfoContainer: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    backgroundColor: '#f8f8f8',
  },
  userName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  userEmail: {
    fontSize: 16,
    color: '#666',
  },
  menuList: {
    //marginTop: 20,
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  menuText: {
    fontSize: 16,
  },
  versionText: {
    fontSize: 14,
    color: '#999',
  },
});
