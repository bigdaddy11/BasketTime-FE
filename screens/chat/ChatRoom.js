// src/screens/ChatRoom.js

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, Text, FlatList, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, StyleSheet } from 'react-native';
import { useRoute } from '@react-navigation/native';
import { io } from 'socket.io-client';
import Feather from '@expo/vector-icons/Feather';
import api from '../common/api';

// Socket.IO 서버 URL
const SOCKET_SERVER_URL = api.defaults.baseURL

export default function ChatRoom() {
  const route = useRoute();
  const { roomId, roomName } = route.params;
  
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const socket = useRef(null);

  // Socket 연결 및 이벤트 처리
  useEffect(() => {
    socket.current = io(SOCKET_SERVER_URL, {
      transports: ['websocket'],
      query: { roomId }
    });

    // 메시지 수신
    socket.current.on('message', (message) => {
      setMessages((prevMessages) => [...prevMessages, message]);
    });

    return () => {
      socket.current.disconnect();
    };
  }, [roomId]);

  // 메시지 전송
  const sendMessage = useCallback(() => {
    if (!newMessage.trim()) return;

    const messageData = {
      roomId,
      text: newMessage,
      sender: '사용자명',  // 사용자명 또는 ID
      timestamp: new Date().toISOString()
    };

    socket.current.emit('sendMessage', messageData); // 서버에 전송
    setMessages((prevMessages) => [...prevMessages, messageData]); // 클라이언트에 반영
    setNewMessage('');
  }, [newMessage, roomId]);

  // FlatList 메시지 렌더링
  const renderMessage = ({ item }) => (
    <View style={[styles.messageItem, item.sender === '사용자명' ? styles.myMessage : styles.otherMessage]}>
      <Text style={styles.messageText}>{item.text}</Text>
      <Text style={styles.messageTime}>{new Date(item.timestamp).toLocaleTimeString()}</Text>
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{roomName}</Text>
      </View>

      <FlatList
        data={messages}
        keyExtractor={(item, index) => index.toString()}
        renderItem={renderMessage}
        style={styles.messageList}
        contentContainerStyle={{ paddingVertical: 10 }}
      />

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="메시지를 입력하세요..."
          value={newMessage}
          onChangeText={setNewMessage}
          onSubmitEditing={sendMessage}
        />
        <TouchableOpacity onPress={sendMessage} style={styles.sendButton}>
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
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: '#ddd',
    backgroundColor: '#fff',
  },
  input: {
    flex: 1,
    padding: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 20,
    marginRight: 10,
  },
  sendButton: {
    backgroundColor: '#007AFF',
    borderRadius: 20,
    padding: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
