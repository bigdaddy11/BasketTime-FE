// src/screens/ChatRoom.js

import React, { useState, useEffect, useContext, useRef } from 'react';
import { View, Text, FlatList, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, StyleSheet, Keyboard } from 'react-native';
import { useRoute } from '@react-navigation/native';
import useWebSocket from '../../contexts/useWebSocket';
import Feather from '@expo/vector-icons/Feather';
import api from '../common/api';
import { showToast } from '../common/toast';
import { SessionContext } from '../../contexts/SessionContext';

// Socket.IO 서버 URL
const SOCKET_SERVER_URL = api.defaults.baseURL+"/ws"

export default function ChatRoom() {
  const route = useRoute();
  const { roomId, roomName } = route.params;
  const { session } = useContext(SessionContext); // 세션 정보 가져오기
  
  const { messages, sendMessage, connected  } = useWebSocket(roomId);
  const [message, setMessage] = useState('');
  const [history, setHistory] = useState([]);  // 🔹 이전 채팅 기록을 저장하는 상태
  const flatListRef = useRef(null); // 🔹 FlatList 참조

  const [keyboardVisible, setKeyboardVisible] = useState(false);

  useEffect(() => {
      const showListener = Keyboard.addListener('keyboardDidShow', () => {
        setKeyboardVisible(true);
      });
  
      const hideListener = Keyboard.addListener('keyboardDidHide', () => {
        setKeyboardVisible(false);
      });
      return () => {
        
        showListener.remove();
        hideListener.remove();
      };
      
    }, []);

  useEffect(() => {
    // 🔹 서버에서 이전 채팅 메시지를 불러옴
    const fetchChatHistory = async () => {
      try {
        const response = await api.get(`/api/chatrooms/${roomId}/messages`);
        setHistory(response.data);  // 🔹 불러온 메시지를 상태에 저장
      } catch (error) {
        showToast({
                    type: "error",
                    text1: "채팅 기록 불러오기 실패.",
                    position: "bottom",
                });
      }
    };

    fetchChatHistory(); // 함수 호출
  }, [roomId]);

  // history + messages를 합쳐서 최신 메시지 순서대로 표시
  const combinedMessages = [...history, ...messages];

  useEffect(() => {
    if (flatListRef.current && combinedMessages.length > 0) {
      flatListRef.current.scrollToEnd({ animated: true });
    }
  }, [combinedMessages]);

  // 🔹 메시지 전송 함수 (완료 버튼 & 전송 버튼 클릭 시)
  const handleSendMessage = () => {
    if (!message.trim()) return; // 빈 메시지 방지
    sendMessage(message);
    setMessage(''); 
    Keyboard.dismiss(); 

    // 전송 후 가장 아래로 스크롤
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={keyboardVisible ? 80 : 0} // 동적 오프셋 설정
    >
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{roomName}</Text>
      </View>

      <FlatList
        ref={flatListRef} // FlatList 참조 추가
        data={combinedMessages}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }) => (
            <View style={[styles.messageItem, item.sender === session.nickName ? styles.myMessage : styles.otherMessage]}>
                <Text style={styles.messageText}>{item.message}</Text> 
                <Text style={styles.messageTime}>{new Date(item.timestamp).toLocaleTimeString()}</Text>
            </View>
        )}
        style={styles.messageList}
        contentContainerStyle={{ paddingVertical: 10 }}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })} //채팅방 입장 시 맨 아래로 이동
      />

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="메시지를 입력하세요..."
          value={message}
          onChangeText={setMessage}
          onSubmitEditing={handleSendMessage}
          returnKeyType="send"
        />
        <TouchableOpacity onPress={handleSendMessage} style={styles.sendButton}>
          <Feather name="send" size={24} color="white" />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: {
    padding: 15,
    backgroundColor: '#FFD73C',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  headerTitle: { fontSize: 18, fontWeight: 'bold' },
  messageList: { flex: 1, paddingHorizontal: 10 },
  messageItem: {
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
    maxWidth: '70%',
  },
  myMessage: {
    backgroundColor: '#DCF8C6',
    alignSelf: 'flex-end',
  },
  otherMessage: {
    backgroundColor: '#F1F0F0',
    alignSelf: 'flex-start',
  },
  messageText: { fontSize: 16 },
  messageTime: { fontSize: 10, color: '#999', marginTop: 3 },
  inputContainer: {
    flexDirection: 'row',
    padding: 7,
    borderTopWidth: 1,
    borderTopColor: '#ddd',
    backgroundColor: '#fff',
  },
  input: {
    flex: 1,
    padding: 7,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 2,
    marginRight: 7,
    marginRight: 5,
  },
  sendButton: {
    backgroundColor: '#007AFF',
    borderRadius: 20,
    padding: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
