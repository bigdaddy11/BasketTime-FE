// src/screens/ChatRoom.js

import React, { useState, useEffect, useContext, useRef } from 'react';
import { View, Text, FlatList, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, StyleSheet, Keyboard, Modal, Image, Alert } from 'react-native';
import { useRoute } from '@react-navigation/native';
import useWebSocket from '../../contexts/useWebSocket';
import { useNavigation } from '@react-navigation/native';
import Feather from '@expo/vector-icons/Feather';
import Ionicons from '@expo/vector-icons/Ionicons';
import api from '../common/api';
import { showToast } from '../common/toast';
import { SessionContext } from '../../contexts/SessionContext';

export default function ChatRoom() {
  const route = useRoute();
  const navigation = useNavigation(); // 네비게이션 훅 추가

  const { roomId, roomName, roomDesc } = route.params;
  const { session } = useContext(SessionContext); // 세션 정보 가져오기
  
  const { messages, sendMessage, connected  } = useWebSocket(roomId);
  const [message, setMessage] = useState('');
  const [history, setHistory] = useState([]);  // 🔹 이전 채팅 기록을 저장하는 상태
  const flatListRef = useRef(null); // 🔹 FlatList 참조

  const [keyboardVisible, setKeyboardVisible] = useState(false);

  const [modalVisible, setModalVisible] = useState(false); // 🔹 모달 상태 추가
  const [participants, setParticipants] = useState([]); // 🔹 참여자 리스트 상태

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

    // useEffect(() => {
    //   console.log("participants:", JSON.stringify(participants || [], null, 2));
    // }, [participants]);
    

  useEffect(() => {
    const joinChatRoom = async () => {
      try {
        const response = await api.post(`/api/chatrooms/${roomId}/join/${session.id}`);

        if (response.status === 200) {
          showToast({
            type: "success",
            text1: response.data, // 서버에서 보낸 메시지 출력
            position: "bottom",
          });
        }
      } catch (error) {
        if (error.response) {
          // 서버 응답이 있는 경우 (HTTP 상태 코드 기반 예외 처리)
          if (error.response.status === 403) {
            showToast({
              type: "error",
              text1: "최대 인원을 초과하여 참여할 수 없습니다.",
              position: "bottom",
            });
            navigation.goBack();
          } else {
            showToast({
              type: "error",
              text1: "채팅방 입장에 실패했습니다.",
              position: "bottom",
            });
            navigation.goBack();
          }
        } else {
          showToast({
            type: "error",
            text1: "서버에 연결할 수 없습니다.",
            position: "bottom",
          });
          navigation.goBack();
        }
      }
    };

    joinChatRoom();
}, [roomId]);

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

  // 메시지 전송 함수 (완료 버튼 & 전송 버튼 클릭 시)
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

  // 🔹 채팅방 참여자 목록 가져오기
  const fetchParticipants = async () => {
    try {
      const response = await api.get(`/api/chatrooms/${roomId}/participants`);
      setParticipants(response.data);
    } catch (error) {
      showToast({
        type: "error",
        text1: "참여자 목록 불러오기 실패.",
        position: "bottom",
      });
    }
  };

  const leaveChatRoom = async () => {
    Alert.alert(
        "채팅방 나가기",
        "정말로 채팅방을 나가시겠습니까?",
        [
            {
                text: "취소",
                style: "cancel"
            },
            {
                text: "확인",
                onPress: async () => {
                    try {
                        const response = await api.delete(`/api/chatrooms/${roomId}/leave/${session.id}`);
                        
                        if (response.status === 200) {
                            showToast({
                                type: "success",
                                text1: "채팅방에서 나갔습니다.",
                                position: "bottom",
                            });

                            // 채팅방 목록으로 이동
                            navigation.goBack();
                        }
                    } catch (error) {
                        showToast({
                            type: "error",
                            text1: "채팅방 나가기에 실패했습니다.",
                            position: "bottom",
                        });
                    }
                }
            }
        ]
    );
};

  // 🔹 모달 열기
  const openModal = async () => {
    await fetchParticipants();
    setModalVisible(true);
  };

  // 🔹 모달 닫기
  const closeModal = () => {
    setModalVisible(false);
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={keyboardVisible ? 80 : 0} // 동적 오프셋 설정
    >
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.headerTitle}>{roomName}</Text>
          <Text style={styles.headerDesc}>{roomDesc}</Text>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity onPress={openModal} style={{marginRight: 10}}>
            <Ionicons name="people-circle" size={36} color="black" />
          </TouchableOpacity>
          <TouchableOpacity onPress={leaveChatRoom}>
            <Feather name="log-out" size={30} color="black" />
          </TouchableOpacity>
        </View>
      </View>

      <FlatList
        ref={flatListRef} // FlatList 참조 추가
        data={combinedMessages}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }) => (
            item.isSystemMessage ? (
              // ✅ 시스템 메시지 스타일
              <View style={styles.systemMessageContainer}>
                <Text style={styles.systemMessageText}>{item.message}</Text>
              </View>
            ) : (
            <View style={[styles.messageItem, item.sender === session.id ? styles.myMessage : styles.otherMessage]}>
                {item.sender !== session.id && (
                    <Text style={styles.messageNime}>{item.senderNickname}</Text>
                )}
                <Text style={styles.messageText}>{item.message}</Text> 
                <Text style={styles.messageTime}>{new Date(item.timestamp).toLocaleTimeString()}</Text>
            </View>
            )
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

      {/* 사용자 목록 모달 */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>참여자 목록</Text>
            <FlatList
              data={participants}
              keyExtractor={(item) => item.id.toString()}
              renderItem={({ item }) => (
                <View style={styles.participantItem}>
                  <Image source={{ uri: item.picture }} style={styles.profileImage} />
                  <Text style={styles.participantName}>{item.nickname}</Text>
                </View>
              )}
            />
            <TouchableOpacity style={styles.closeButton} onPress={closeModal}>
              <Text style={styles.closeButtonText}>닫기</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: {
    padding: 15,
    backgroundColor: '#FFD73C',
    alignItems: 'left',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    flexDirection: 'row',
    justifyContent: "space-between"
  },
  headerLeft: {
    flexDirection: "column"
  },
  headerRight: {
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
  },
  headerTitle: { fontSize: 18, fontWeight: 'bold' },
  headerDesc: { fontSize: 14,  color: '#999'},
  messageList: { flex: 1, paddingHorizontal: 10 },
  messageItem: {
    paddingHorizontal: 10,
    paddingVertical: 5,
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
  messageText: { fontSize: 13 },
  messageTime: { fontSize: 9, color: '#999', marginTop: 3, textAlign: "right" },
  messageNime: { fontSize: 10, color: '#999', textAlign: "left" },
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
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    padding: 20,
    //borderTopLeftRadius: 20,
    //borderTopRightRadius: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  participantItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
  },
  profileImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  participantName: {
    fontSize: 16,
  },
  closeButton: {
    marginTop: 10,
    backgroundColor: '#007AFF',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  systemMessageContainer: {
    alignSelf: 'center',
    //backgroundColor: '#ddd',
    padding: 8,
    borderRadius: 10,
    marginVertical: 5,
  },
  systemMessageText: {
    fontSize: 12,
    color: '#555',
    textAlign: 'center',
  },
});
