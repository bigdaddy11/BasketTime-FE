import React from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const userInfo = {
  name: "허재현",
  email: "zidir0070@naver.com"
};

const menuItems = [
  { id: '1', title: '로그인', routeName: "Login" },
  { id: '2', title: '쪽지함', routeName: "MessageInbox" },
  { id: '3', title: '문의하기', routeName: "Ask" },
  { id: '4', title: '앱버전', version: 'v3.0.8', routeName: "Version" },

];

export default function MyPageScreen() {
  const navigation = useNavigation();

  const handleLoginPress = (routeName) => {
    // 로그인 화면으로 이동
    navigation.navigate(routeName);
  };
  
  const renderItem = ({ item }) => (
    <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate(item.routeName)}>
      <Text style={styles.menuText}>{item.title}</Text>
      {item.version && <Text style={styles.versionText}>{item.version}</Text>}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* 상단 유저 정보 */}
      <View style={styles.userInfoContainer}>
        <Text style={styles.userName}>{userInfo.name}</Text>
        <Text style={styles.userEmail}>{userInfo.email}</Text>
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
