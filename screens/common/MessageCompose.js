import React, { useState, useEffect, useContext, useCallback } from 'react';
import {
  View,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
} from 'react-native';
import api from '../common/api';
import { SessionContext } from '../../contexts/SessionContext';

export default function MessageCompose({ navigation }) {
  const [recipient, setRecipient] = useState('');
  const [message, setMessage] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedRecipient, setSelectedRecipient] = useState(null);
  const { session } = useContext(SessionContext);

  useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity onPress={handleSendMessage} style={styles.headerButton}>
          <Text style={styles.headerButtonText}>전송</Text>
        </TouchableOpacity>
      ),
    });
  }, [navigation, selectedRecipient, message]);

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
      Alert.alert('Error', '사용자 검색 중 문제가 발생했습니다.');
    }
  };

  const handleSendMessage = useCallback(async () => {
    if (!session || !session.id) {
      navigation.navigate('Login');
      return;
    }
    if (!selectedRecipient || !message.trim()) {
      Alert.alert('Error', '받는 사람과 쪽지 내용을 확인해주세요.');
      return;
    }
    try {
      const response = await api.post('/api/paper-plan', {
        sUserId: session.id,
        rUserId: selectedRecipient.id,
        content: message,
      });
      if (response.status === 200) {
        Alert.alert('Success', '쪽지가 성공적으로 전송되었습니다.');
        navigation.goBack();
      } else {
        throw new Error('쪽지 전송 실패');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      Alert.alert('Error', '쪽지 전송에 실패했습니다. 다시 시도해주세요.');
    }
  }, [session, selectedRecipient, message]);

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
          onChangeText={(text) => {
            setRecipient(text);
            searchRecipients(text);
          }}
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
        {selectedRecipient && (
          <Text style={styles.selectedRecipient}>받는 사람: {selectedRecipient.nickName}</Text>
        )}
        <TextInput
          style={styles.textArea}
          placeholder={'쪽지 내용을 입력해주세요.\n유저간 에티켓을 지켜주세요 :)'}
          value={message}
          onChangeText={setMessage}
          multiline
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
