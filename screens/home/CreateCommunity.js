import React, { useState, useEffect, useContext } from 'react';
import {
  View,
  TextInput,
  Button,
  StyleSheet,
  Alert,
  Text,
  TouchableOpacity,
  Image,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  SafeAreaView,
  Keyboard,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker'; // 이미지 선택 라이브러리
import * as Permissions from 'expo-permissions';
import api from '../common/api';
import { Picker } from '@react-native-picker/picker';
import { SessionContext } from '../../contexts/SessionContext';
import EvilIcons from '@expo/vector-icons/EvilIcons';

export default function CreateCommunity({ route, navigation }) {
  const { postId } = route.params || {}; // postId를 받아옴

  const [title, setTitle] = useState('');
  const [content, setContent] = useState(''); // HTML 형식으로 저장
  const [SelectedCategory, setSelectedCategory] = useState('1');
  const [categories, setCategories] = useState([]); // 카테고리 목록 상태
  const [images, setImages] = useState([]); // 업로드할 이미지 목록

  const [keyboardVisible, setKeyboardVisible] = useState(false); // 키보드 상태

  // useContext로 세션 정보 가져오기
  const { session } = useContext(SessionContext);

  const requestPermission = async () => {
    const { status } = await Permissions.askAsync(Permissions.MEDIA_LIBRARY);
    if (status !== 'granted') {
      alert('이미지 권한이 필요합니다.');
    }
  };

  // 서버에서 카테고리 목록 가져오기
  useEffect(() => {
    const showSubscription = Keyboard.addListener('keyboardDidShow', () => {
      setKeyboardVisible(true); // 키보드가 열리면 버튼 표시
    });

    const hideSubscription = Keyboard.addListener('keyboardDidHide', () => {
      setKeyboardVisible(false); // 키보드가 닫히면 버튼 숨기기
    });

    const fetchCategories = async () => {
      try {
        const response = await api.get('/api/category'); // 카테고리 데이터 가져오기
        setCategories(response.data); // 데이터 상태로 저장
      } catch (error) {
        console.error('Error fetching categories:', error);
        Alert.alert('Error', '카테고리를 불러오는 중 문제가 발생했습니다.');
      }
    };

    const fetchPostDetails = async () => {
      if (postId) {
        try {
          const response = await api.get(`/api/posts/${postId}`);
          setTitle(response.data.title);
          setContent(response.data.content);
          setSelectedCategory(response.data.categoryId);
          setImages(response.data.imageMainPath || []); // 이미지 경로 배열 설정
        } catch (error) {
          console.error('Error fetching post details:', error);
          Alert.alert('Error', '게시글 정보를 불러오는 중 문제가 발생했습니다.');
        }
      }
    };

    requestPermission();
    fetchCategories();
    fetchPostDetails(); // postId가 있을 때만 실행

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
    
  }, []);

  useEffect(() => {
    console.log("image : " + images);
  }, [images]);
  

  const handleImagePick = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images, // 이미지만 선택
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled) {
      setImages([...images, result.assets[0]]); // 선택한 이미지를 목록에 추가
    }
  };

  const handleSave = async () => {
    if (!session || !session.id) {
      navigation.navigate('Login');
      return;
    }

    if (!title || !content) {
      Alert.alert('Error', '제목과 내용을 입력하세요.');
      return;
    }

    try {
      let formData = new FormData();
      formData.append('title', title);
      formData.append('content', content);
      formData.append('categoryId', SelectedCategory);
      formData.append('userId', session.id);

      // 다중 이미지 추가
      images.forEach((image, index) => {
        formData.append('images', {
          uri: image.uri,
          type: 'image/jpeg',
          name: `image_${index}.jpg`,
        });
      });

      let response;
      if (postId) {
        response = await api.put(`/api/posts/${postId}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      } else {
        response = await api.post('/api/posts', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      }

      if (response.status === 201 || response.status === 200) {
        Alert.alert('Success', '게시글이 저장되었습니다.');
        navigation.navigate('Main', { screen: 'Home', params: { refresh: true } });
      } else {
        Alert.alert('Error', '게시글 저장에 실패했습니다.');
      }
    } catch (error) {
      console.error('Error saving post:', error);
      Alert.alert('Error', '서버와의 연결에 실패했습니다.');
    }
  };

  return (
    <KeyboardAvoidingView
      style={ styles.scrollContainer }
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 80 : 0} // iOS용 키보드 오프셋 조정
    >
       <FlatList
          data={images}
          keyboardShouldPersistTaps="handled"
          keyExtractor={(item, index) => index.toString()}
          renderItem={({ item, index }) => (
            <View style={styles.imageWrapper}>
              <Image source={{ uri: item.uri }} style={styles.image} />
              <TouchableOpacity
                style={styles.removeButton}
                onPress={() => setImages(images.filter((_, i) => i !== index))}
              >
                <Text style={styles.removeText}>X</Text>
              </TouchableOpacity>
            </View>
          )}
          ListHeaderComponent={
            <>
              <Picker
                selectedValue={SelectedCategory}
                style={styles.picker}
                onValueChange={(itemValue) => setSelectedCategory(itemValue)}
              >
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
            </>
          }
          ListFooterComponent={
            <TextInput
              style={styles.inputMain}
              placeholder="내용을 입력하세요"
              value={content}
              onChangeText={setContent}
              multiline
              numberOfLines={20}
            />
          }
        />
      {keyboardVisible && (
        <View style={styles.footer}>
            <TouchableOpacity style={styles.imageButton} onPress={handleImagePick}>
              <EvilIcons name="image" size={30} color="#aaa" styles={styles.imageButton}/>
            </TouchableOpacity>
          <Button style={styles.button} title="저장" onPress={handleSave} />
        </View>
      )}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    flex: 1,
    padding: 10,
    backgroundColor: '#fff',
    flexGrow: 1
  },
  input: {
    //borderRadius: 5,
    padding: 10,
    marginBottom: 10,
    fontSize: 18,
    fontWeight: '600',
    borderBottomWidth: 1,
    borderColor: '#ccc',
  },
  inputMain: {
    //borderRadius: 5,
    padding: 10,
    marginBottom: 10,
    height: "100%",
    flex: 1,
    textAlignVertical: 'top',
    fontSize: 14,
    //borderWidth: 1,
    borderColor: '#ccc',
  },
  picker: {
    //marginBottom: 10,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  imageButton: {
    //backgroundColor: '#FFD73C',
    marginTop: -5,
    padding: 5,
    alignItems: 'baseline',
    justifyContent: "flex-end",
    marginBottom: 5,
    //marginVertical: 10,
    //borderRadius: 8,
  },
  imageButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  imageContainer: {
    flexDirection: 'column',
    marginBottom: 10,
  },
  imageWrapper: {
    position: 'relative',
    padding: 10,
    marginBottom: 10,
  },
  image: {
    width: '100%',
    height: 200,
    //borderRadius: 5,
  },
  removeButton: {
    position: 'absolute',
    top: 5,
    right: 5,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    //borderRadius: 50,
    padding: 5,
  },
  removeText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  footer: {
    paddingVertical: 5,
    borderTopWidth: 1,
    borderColor: '#ccc',
    backgroundColor: '#fff',
    flexDirection: "row",
    justifyContent: "space-between"
  },
  button: {
    width: 50
  }
});
