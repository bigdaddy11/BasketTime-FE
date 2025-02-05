import React, { useContext, useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Image, Modal, TextInput, Button} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { SessionContext } from '../contexts/SessionContext'; 
import Constants from 'expo-constants';
import { showToast } from './common/toast';
import AntDesign from '@expo/vector-icons/AntDesign';
import api from './common/api';

export default function MyPageScreen() {
  const navigation = useNavigation();
  const { session, setSession, logout } = useContext(SessionContext); // 세션 상태 가져오기
  const [nickname, setNickname] = useState(session?.nickName || 'NoName');
  const [isModalVisible, setModalVisible] = useState(false);

  const defaultSession = { nickName: "", editIs: true };
  const currentSession = session || defaultSession;

   // 앱 버전을 안전하게 가져오기
   const appVersion =
   Constants.expoConfig?.version || // Expo의 EAS 환경
   Constants.manifest?.version ||  // 로컬 개발 환경
   '버전 정보 없음';               // Fallback

  const menuItems = [
    { id: '2', title: '쪽지함', routeName: "MessageInbox" },
    { id: '3', title: '문의하기', routeName: "ContactUs" },
    { id: '4', title: '앱버전', version: appVersion , routeName: "Version" },
    session
        ? { id: '5', title: '로그아웃', routeName: 'Logout' } // 세션이 있을 경우 로그아웃
        : { id: '1', title: '로그인', routeName: 'Login' }, // 세션이 없을 경우 로그인
  ];

  useEffect(() => {
      if (currentSession && !currentSession.editIs) {
          setModalVisible(false); // 닉네임 수정 Modal 표시
      }
  }, [session]);

  const updateNickname = async () => {
    try {
        // 닉네임 유효성 검사
        const specialCharRegex = /[^ㄱ-ㅎ가-힣a-zA-Z0-9]/; // 한글, 영어, 숫자만 허용
        if (specialCharRegex.test(nickname)) {
            showToast({
                type: 'error',
                text1: '닉네임에는 한글, 영어, 숫자만 사용할 수 있습니다.',
                position: 'bottom',
            });
            return; // 요청 중단
        }
        const response = await api.put(`/api/auth/${currentSession.id}/nickname?nickname=${nickname}`);
        if (response.status === 200) {
            setSession({ ...currentSession, nickName: nickname, editIs: true }); // 세션 업데이트
            showToast({
              type: 'success',
              text1: '닉네임이 성공적으로 변경되었습니다.',
              position: 'bottom',
            });
            setModalVisible(false); // Modal 닫기
        } else {
            console.error('닉네임 변경 실패 :', response.data);
            showToast({
                type: 'error',
                text1: response.data || '알 수 없는 오류가 발생했습니다.',
                position: 'bottom',
            });
        }
    } catch (error) {
        //console.error('Error updating nickname:', error);
        showToast({
          type: 'error',
          text1: error.response?.data || '서버 오류가 발생했습니다.',
          position: 'bottom',
      });
    } finally {
      setModalVisible(false); // 모달 닫기
    }
  };

  const handleEditClick = () => {
    setModalVisible(true); // 모달 보이기
  };

  const handleMenuPress = (item) => {
    if (item.routeName === 'Logout') {
      // 로그아웃 처리
      logout(); // 세션 초기화
      showToast({
        type: 'success',
        text1: '로그아웃되었습니다.',
        position: 'bottom'
      });
      navigation.replace('Login'); // 홈 화면으로 이동
      return;
    } else if (item.routeName === 'Version'){
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
        {currentSession ? (
          <>
            <Image 
              source={
                currentSession.picture 
                  ? { uri: currentSession.picture } 
                  : require('../assets/default-user.jpg') // 로컬 디폴트 이미지 경로
              }
              style={styles.picture}
              />
            <View style={{flexDirection: "row", alignItems: "center"}}>
              <Text style={styles.userName}>{currentSession.nickName || ''}</Text>
              {!currentSession.editIs && (
                <TouchableOpacity onPress={handleEditClick}>
                  <AntDesign name="edit" size={16} color="#bbb" style={styles.editIcon} />
                </TouchableOpacity>
              )}
            </View>
            {/* <Text style={styles.userEmail}>{session.email}</Text> */}
          </>
        ) : (
          <Text style={styles.guestText}>로그인이 필요합니다.</Text>
        )}
      </View>

      {/* 닉네임 변경 모달 */}
      <Modal
          visible={isModalVisible}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>닉네임 변경</Text>
              <Text style={styles.modaSubTitle}>닉네임은 최초 1회만 변경 가능합니다.</Text>
              <TextInput
                style={styles.input}
                //value={nickname}
                onChangeText={setNickname}
                placeholder="새 닉네임 입력 (최대 8글자)"
                maxLength={8}
              />
              <View style={styles.buttonContainer}>
                <View style={styles.buttonWrapper}>
                  <Button title="취소" onPress={() => setModalVisible(false)} color="#888" style={styles.Button}/>
                </View>
                <View style={styles.buttonWrapper}>
                  <Button title="저장" onPress={updateNickname} color="#FFD73C" />
                </View>
              </View>
            </View>
          </View>
        </Modal>

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
    minHeight: 250,
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    backgroundColor: 'white',
    justifyContent: "center",
    alignItems: "center"
  },
  userName: {
    fontSize: 18,
    fontWeight: 'bold',
    padding: 2,
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
  picture: {
    width: 100,
    height: 100,
    borderRadius: 100,
    marginBottom: 15
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '80%',
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 10,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
    padding: 5,
  },
  modaSubTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: 'blue',
    marginBottom: 5,
    padding: 5,
  },
  buttonContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    //marginRight: 5,
    marginLeft: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 5,
    marginBottom: 5,
  },
  buttonWrapper: {
    //flex: 1, // 버튼 간의 균등 배치
    marginLeft: 5, // 버튼 간 간격 설정
  },
});
