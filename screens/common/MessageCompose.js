import React, { useState, useEffect, useContext } from 'react';
import {
  View,
  TextInput,
  Button,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Text,
  TouchableOpacity,
} from 'react-native';
import api from '../common/api'; // 서버 요청을 위한 axios 인스턴스
import { SessionContext } from '../../contexts/SessionContext';

export default function MessageCompose({ navigation }) {
  const [recipient, setRecipient] = useState(''); // 받는 사람
  const [message, setMessage] = useState(''); // 쪽지 내용
  const { session } = useContext(SessionContext); // 세션 정보 가져오기

  useEffect(() => {
      // 헤더 옵션 설정
      navigation.setOptions({
        headerRight: () => (
          <TouchableOpacity onPress={handleSendMessage} style={styles.headerButton}>
            <Text style={styles.headerButtonText}>전송</Text>
          </TouchableOpacity>
        ),
      });
    }, [navigation, handleSendMessage, recipient, message]);

    const handleSendMessage = async () => {
        
         // 세션 확인
        if (!session || !session.id) {
            navigation.navigate('Login') // 로그인 페이지로 이동
            return;
        }

        if (!recipient.trim() || !message.trim()) {
          Alert.alert('Error', '받는 사람과 내용을 입력해주세요.');
          return;
        }
    
        try {
          // 서버로 쪽지 전송
          const response = await api.post('/api/paper-plan', {
            sUserId: session.id, // 현재 로그인한 유저의 ID (임시로 설정)
            rUserId: recipient, // 받는 사람 ID 또는 닉네임
            content: message,
          });
    
          if (response.status === 200) {
            Alert.alert('Success', '쪽지가 성공적으로 전송되었습니다.');
            navigation.goBack(); // 전송 후 이전 화면으로 돌아가기
          } else {
            throw new Error('쪽지 전송 실패');
          }
        } catch (error) {
          console.error('Error sending message:', error);
          Alert.alert('Error', '쪽지 전송에 실패했습니다. 다시 시도해주세요.');
        }
      };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.inputContainer}>
        <Text style={styles.label}>쪽지 보내기</Text>
        <TextInput
          style={styles.input}
          placeholder="받는 사람의 닉네임 입력"
          value={recipient}
          onChangeText={setRecipient}
        />
        <TextInput
          style={styles.textArea}
          placeholder={'쪽지 내용을 입력해주세요.\n유저간 에티켓을 지켜주세요 :)'}
          value={message}
          numberOfLines={20}
          onChangeText={setMessage}
          multiline={true}
        />
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  inputContainer: {
    flex: 1,
    justifyContent: 'top',
  },
  label: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    padding: 10,
  },
  input: {
    borderBottomWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    marginBottom: 15,
    fontSize: 14,
    fontWeight: 'bold',
  },
  textArea: {
    //borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    minHeight: 100,
    textAlignVertical: 'top',
    marginBottom: 20,
    fontSize: 14,
    fontWeight: 'bold',
  },
  headerButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'black',
    marginRight: 20
  },
});
