import React, { useState, useEffect, useContext } from 'react';
import { View, TextInput, Button, StyleSheet, Alert } from 'react-native';
import api from '../common/api';
import { Picker } from '@react-native-picker/picker';
import { SessionContext } from '../../contexts/SessionContext';

export default function UpdateCommunity({ navigation }) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [SelectedCategory, setSelectedCategory] = useState('1');
  const [categories, setCategories] = useState([]); // 카테고리 목록 상태

  // useContext로 세션 정보 가져오기
  const { session } = useContext(SessionContext);

  // 서버에서 카테고리 목록 가져오기
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await api.get('/api/category'); // 카테고리 데이터 가져오기
        setCategories(response.data); // 데이터 상태로 저장
      } catch (error) {
        console.error('Error fetching categories:', error);
        Alert.alert('Error', '카테고리를 불러오는 중 문제가 발생했습니다.');
      }
    };

    fetchCategories();
  }, []);

  const handleSave = async () => {
    // 세션 확인
    if (!session || !session.id) {
      navigation.navigate('Login') // 로그인 페이지로 이동
      return;
    }

    if (!title || !content) {
      Alert.alert('Error', '제목과 내용을 입력하세요.');
      return;
    }

    try {
      
      // 서버로 POST 요청
      const response = await api.post('/api/posts', {
        title: title,
        content: content,
        categoryId: SelectedCategory, // 임의로 설정된 카테고리 ID
        userId: session.id,
      });

      // 서버 응답 확인
      if (response.status === 201 || response.status === 200) {
        Alert.alert('Success', '게시글이 저장되었습니다.');
        navigation.navigate('Main', {
          screen: 'Home',
          params: { refresh: true },
        });
      } else {
        Alert.alert('Error', '게시글 저장에 실패했습니다.');
      }
    } catch (error) {
      console.error('Error saving post:', error);
      Alert.alert('Error', '서버와의 연결에 실패했습니다.');
    }
  };

  return (
    <View style={styles.container}>
      <Picker
          selectedValue={SelectedCategory}
          style={styles.picker}
          onValueChange={(itemValue) => setSelectedCategory(itemValue)}
          // enabled={isEditable} // 수정 모드일 때만 활성화
      >
          {/* Picker의 기본값 */}
          {/* <Picker.Item label="카테고리를 선택하세요" value="" style={styles.pickerItem} /> */}
          {/* 서버에서 가져온 카테고리 목록 */}
          {categories.map((category) => (
            <Picker.Item key={category.id} label={category.name} value={category.id} />
          ))}
      </Picker>
      <TextInput
        style={styles.input}
        placeholder="제목을 입력하세요"
        value={title}
        onChangeText={setTitle}
      />
      <TextInput
        style={styles.inputMain}
        placeholder="내용을 입력하세요"
        value={content}
        onChangeText={setContent}
        multiline
        numberOfLines={4}
      />
      <Button title="저장" onPress={handleSave} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 0,
    backgroundColor: '#fff',
  },
  input: {
    borderRadius: 5,
    paddingTop: 10,
    paddingBottom: 10,
    paddingLeft: 10,
    marginBottom: 2,
    fontSize: 14,
  },
  inputMain: {
    borderRadius: 5,
    paddingTop: 10,
    paddingBottom: 10,
    paddingLeft: 10,
    marginBottom: 2,
    height: "50%",
    flex: 1,
    textAlignVertical: 'top',  // 텍스트 상단 정렬
    fontSize: 12,
  },
  picker: {
    height: 'auto',
    width: '100%',
    borderBottomWidth: 1,
    borderColor: '#ccc',
  },
});
