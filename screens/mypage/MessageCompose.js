import React, { useState, useEffect, useContext, useCallback } from 'react';
import {
  View,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
} from 'react-native';
import api from '../common/api';
import { SessionContext } from '../../contexts/SessionContext';
import { showToast } from '../common/toast';

export default function MessageCompose({ navigation, route }) {
  const [recipient, setRecipient] = useState('');
  const [message, setMessage] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedRecipient, setSelectedRecipient] = useState(null);
  const { session } = useContext(SessionContext);
  const { message: existingMessage } = route.params || {}; // 기존 메시지 파라미터

  useEffect(() => {
    if (existingMessage) {
      // 메시지 파라미터가 존재하면 내용을 설정
      setRecipient(existingMessage.nickName || '');
      setMessage(existingMessage.content || '');
      markMessageAsRead(existingMessage.id); // 메시지를 읽음 상태로 업데이트
    }
  }, [existingMessage]);

  const markMessageAsRead = async (messageId) => {
    if(!existingMessage.isRead){
      try {
        await api.put(`/api/paper-plan/${messageId}/read`); // 메시지를 읽음 상태로 업데이트
      } catch (error) {
        console.error('Error marking message as read:', error);
        showToast({
          type: 'error',
          text1: '메시지를 읽음 상태로 업데이트하는 중 문제가 발생했습니다.',
          position: 'bottom'
        });
      }
    }
  };

  useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity onPress={existingMessage ? null : handleSendMessage} style={styles.headerButton}>
          <Text style={styles.headerButtonText}>{existingMessage ? '' : '전송'}</Text>
        </TouchableOpacity>
      ),
    });
  }, [navigation, existingMessage, selectedRecipient, message]);

  const searchRecipients = async (query) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }
    try {
      const response = await api.get('/api/users/search', { params: { query } });
      setSearchResults(response.data);
    } catch (error) {
      console.error('Error searching recipients:', error);
      showToast({
        type: 'error',
        text1: '사용자 검색 중 문제가 발생했습니다.',
        position: 'bottom'
      });
    }
  };

  const handleSendMessage = useCallback(async () => {
    if (!session || !session.id) {
      navigation.navigate('Login');
      return;
    }
    if (!selectedRecipient || !message.trim()) {
      showToast({
        type: 'error',
        text1: '받는 사람과 쪽지 내용을 확인해주세요.',
        position: 'bottom'
      });
      return;
    }
    try {
      const response = await api.post('/api/paper-plan', {
        sUserId: session.id,
        rUserId: selectedRecipient.id,
        content: message,
      });
      if (response.status === 200) {
        showToast({
          type: 'success',
          text1: '쪽지가 성공적으로 전송되었습니다.',
          position: 'bottom'
        });
        navigation.goBack();
      } else {
        throw new Error('쪽지 전송 실패');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      showToast({
        type: 'error',
        text1: '쪽지 전송에 실패했습니다. 다시 시도해주세요.',
        position: 'bottom'
      });
    }
  }, [session, selectedRecipient, message]);

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.inputContainer}>
        <Text style={styles.label}>{existingMessage ? '' : '쪽지 보내기'}</Text>
        <TextInput
          style={styles.input}
          placeholder="받는 사람의 닉네임 입력"
          value={recipient}
          onChangeText={(text) => {
            setRecipient(text);
            searchRecipients(text);
          }}
          editable={!existingMessage} // 기존 메시지일 경우 수정 불가
        />
        {searchResults.length > 0 && (
          <FlatList
            data={searchResults}
            keyExtractor={(item, index) => index.toString()}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.resultItem}
                onPress={() => {
                  setSelectedRecipient(item);
                  setRecipient(item.nickName);
                  setSearchResults([]);
                }}
              >
                <Text style={styles.resultText}>{item.nickName}</Text>
              </TouchableOpacity>
            )}
            style={styles.resultsContainer}
          />
        )}
        {selectedRecipient && !existingMessage && (
          <Text style={styles.selectedRecipient}>
            받는 사람: {selectedRecipient.nickName}
          </Text>
        )}
        <TextInput
          style={styles.textArea}
          placeholder={'쪽지 내용을 입력해주세요.\n유저간 에티켓을 지켜주세요 :)'}
          value={message}
          onChangeText={setMessage}
          multiline
          editable={!existingMessage} // 기존 메시지일 경우 수정 불가
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
    // fontWeight: 'bold',
  },
  headerButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'black',
    marginRight: 20
  },
  selectedRecipient: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
    marginLeft: 10,
  },
  resultsContainer: {
    maxHeight: 100, // 검색 결과 최대 높이 설정
    marginLeft: 10,
    marginBottom: 10,
  },
  resultItem: {
    padding: 5,
    //borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  resultText: {
    fontSize: 14,
  },
});
