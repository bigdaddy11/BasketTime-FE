import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import api from '../common/api';
import { showToast } from "../common/toast";

export default function CreateChatRoom() {
  const navigation = useNavigation();
  const [roomName, setRoomName] = useState('');
  const [description, setDescription] = useState('');
  const [maxMembers, setMaxMembers] = useState(4); // 기본값: 4명

  const createRoom = async () => {
    if (!roomName.trim()) {
        showToast({
            type: 'error',
            text1: '채팅방 이름을 입력하세요.',
            position: 'bottom'
        });
    }
    if (!description.trim()) {
        showToast({
            type: 'error',
            text1: '소개를 입력하세요.',
            position: 'bottom'
        });
    }

    try {
      const response = await api.post('/api/chatrooms', { 
        name: roomName, 
        description: description, 
        maxMembers: parseInt(maxMembers) 
      });
      showToast({
        type: 'success',
        text1: '채팅방 생성에 성공하였습니다.',
        position: 'bottom'
    });
      navigation.navigate('ChatRoom', { roomId: response.data.id, roomName: roomName, roomDesc: description });
    } catch (error) {
        showToast({
            type: 'error',
            text1: '채팅방 생성에 실패하였습니다.',
            position: 'bottom'
        });
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>이름</Text>
      <TextInput
        style={styles.input}
        placeholder="경기 매칭을 위한 채팅방 이름을 입력하세요 :)"
        value={roomName}
        onChangeText={setRoomName}
      />

      <Text style={styles.label}>소개</Text>
      <TextInput
        style={styles.input}
        placeholder="지역이나 경기 수준 등 간략한 정보를 입력해주세요 :)"
        maxLength={30}
        value={description}
        onChangeText={setDescription}
      />

      <Text style={styles.label}>인원 제한 수</Text>
      <View style={styles.radioGroup}>
        {[4, 6, 8, 10].map((num) => (
          <TouchableOpacity 
            key={num} 
            style={[styles.radioButton, maxMembers === num && styles.selectedRadioButton]} 
            onPress={() => setMaxMembers(num)}
          >
            <Text style={maxMembers === num ? styles.selectedText : styles.radioText}>
              {num}명
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Button title="채팅방 생성" onPress={createRoom} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingVertical: 100, paddingHorizontal: 20, backgroundColor: 'white' },
  label: { fontSize: 14, fontWeight: 'bold', marginBottom: 5 },
  input: { borderWidth: 1, borderColor: '#ccc', padding: 10, marginBottom: 20, borderRadius: 5 },

  radioGroup: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    marginBottom: 20 
  },
  radioButton: {
    flex: 1,
    paddingVertical: 10,
    marginHorizontal: 5,
    borderWidth: 1,
    borderColor: '#999',
    borderRadius: 5,
    alignItems: 'center',
  },
  selectedRadioButton: {
    backgroundColor: '#FFD73C',
    borderColor: '#999',
  },
  radioText: {
    fontSize: 14,
    color: '#333',
  },
  selectedText: {
    fontSize: 14,
    color: '#333',
    fontWeight: 'bold',
  },
});
