import React, { useState, useEffect, useContext, useCallback } from 'react';
import {
  View,
  TextInput,
  StyleSheet,
  Text,
  TouchableOpacity,
  Image,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  TouchableWithoutFeedback,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import api from '../common/api.js';
import { Picker } from '@react-native-picker/picker';
import { SessionContext } from '../../contexts/SessionContext';
import EvilIcons from '@expo/vector-icons/EvilIcons';
import { useLoading } from '../../contexts/LoadingContext'; 
import { showToast } from '../common/toast';

export default function CreateCommunity({ route, navigation }) {
  const { postId } = route.params || {}; // postId를 받아옴

  const [title, setTitle] = useState('');
  const [content, setContent] = useState(''); // HTML 형식으로 저장
  const [SelectedCategory, setSelectedCategory] = useState('1');
  const [categories, setCategories] = useState([]); // 카테고리 목록 상태
  const [images, setImages] = useState([]); // 업로드할 이미지 목록

  const [keyboardVisible, setKeyboardVisible] = useState(false); // 키보드 상태
  const { showLoading, hideLoading } = useLoading(); // 로딩 상태 함수 가져오기

  // useContext로 세션 정보 가져오기
  const { session } = useContext(SessionContext);

  const fetchPostDetails = async () => {
      try {
        const response = await api.get(`/api/posts/${postId}`);
        
        // baseURL 가져오기
        const baseURL = api.defaults.baseURL;
        //console.log(response.data);

         // imagePaths를 정상적으로 처리하여 URI 목록으로 변환
        const normalizedImages = (response.data.imagePaths || []).map((path) => ({
          uri: `${baseURL}/${path.imagePaths}`, // 각 이미지 경로에 baseURL 추가
        }));

        setTitle(response.data.title || '');
        setContent(response.data.content || '');
        setSelectedCategory(response.data.categoryId);
        setImages(normalizedImages); // 치환된 이미지 경로 설정
      } catch (error) {
        console.error('Error fetching post details:', error);
        showToast({
          type: 'error',
          text1: '게시글 정보를 불러오는 중 문제가 발생했습니다.',
          position: 'bottom'
        });
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
        showToast({
          type: 'error',
          text1: '카테고리를 불러오는 중 문제가 발생했습니다.',
          position: 'bottom'
        });
        console.error('Error fetching categories:', error);
      }
    };
    fetchCategories();

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
    
  }, []);

  useEffect(() => {
    if (postId) {
      fetchPostDetails();
    }
  }, [postId]);

  useEffect(() => {
    // 헤더 옵션 설정
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity onPress={handleSave} style={styles.headerButton}>
          <Text style={styles.headerButtonText}>저장</Text>
        </TouchableOpacity>
      ),
    });
  }, [navigation, handleSave, title, content, images]);

  const handleImagePick = async () => {
    try {
      if (images.length >= 3) {
        showToast({
          type: 'error',
          text1: '이미지는 최대 3장까지 업로드 가능합니다.',
          position: 'bottom'
        });
        return; // 이미지 추가 방지
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images, // 이미지만 선택
        allowsEditing: true, // 선택한 이미지 편집 가능
        quality: 1, // 이미지 품질
      });
  
      if (!result.canceled) {
        // 새로운 이미지 추가
        setImages((prevImages) => [...prevImages, result.assets[0]]);
      }

    } catch (error) {
      console.error('Error picking images:', error);
    }
  };

  const handleSave = useCallback(async () => {
    if (!session || !session.id) {
      navigation.navigate('Login');
      return;
    }
    if (!title.trim() || !content.trim()) {
      showToast({
        type: 'error',
        text1: '제목과 내용을 입력하세요.',
        position: 'bottom'
      });
      return;
    }

    showLoading(); // 로딩 시작

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
        showToast({
          type: 'success',
          text1: '게시글이 저장되었습니다.',
          position: 'bottom'
        });
        navigation.navigate('Main', { screen: 'Home', params: { refresh: true } });
      } else {
        showToast({
          type: 'error',
          text1: '게시글 저장에 실패했습니다.',
          position: 'bottom'
        });
      }
    } catch (error) {
      console.error('Error saving post:', error);
      showToast({
        type: 'error',
        text1: '서버와의 연결에 실패했습니다.',
        position: 'bottom'
      });
    } finally {
      hideLoading(); // 로딩 종료
    }
  });

  return (
    <KeyboardAvoidingView
      style={ styles.scrollContainer }
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 80 : 0} // iOS용 키보드 오프셋 조정
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.container}>
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
        
        <FlatList
            data={images}
            horizontal={true} // 가로 스크롤 설정
            contentContainerStyle={styles.imageListContainer} // 이미지 리스트에 대한 스타일
            keyboardShouldPersistTaps="handled"
            keyExtractor={(item, index) => index.toString()}
            renderItem={({ item, index }) => (
              <View style={styles.imageWrapper}>
                <Image source={{ uri: item.uri }} style={styles.image} />
                <TouchableOpacity
                  style={styles.removeButton}
                  onPress={() => setImages(images.filter((_, i) => i !== index))}
                >
                  <Text style={styles.removeText}>  X  </Text>
                </TouchableOpacity>
              </View>
            )}
          />
          <TextInput
            style={styles.inputMain}
            placeholder={'내용을 입력해주세요.\n이미지는 최대 3장까지 업로드 가능합니다.\n이미지 사이즈는 최대 10MB입니다.'}
            value={content}
            onChangeText={setContent}
            multiline
            numberOfLines={20}
          />
        </View>
      </TouchableWithoutFeedback>
      {keyboardVisible && (
        <View style={styles.footer}>
            <TouchableOpacity style={styles.imageButton} onPress={handleImagePick}>
              <EvilIcons name="image" size={30} color="#aaa" styles={styles.imageButton}/>
            </TouchableOpacity>
          {/* <Button style={styles.button} title="저장" onPress={handleSave} /> */}
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
    //flexDirection: "column"
    //flexGrow: 1
  },
  container: {
    flex: 1,
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
    minHeight: "auto",
    flex: 20,
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
    marginBottom: 10,
    
  },
  imageWrapper: {
    position: 'relative',
    //padding: 10,
    marginRight: 10,
    marginBottom: 10,
  },
  image: {
    width: '100',
    height: '100',
    //borderRadius: 5,
  },
  removeButton: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: 'black',
    //borderRadius: 5,
    padding: 2,

  },
  removeText: {
    color: '#fff',
    fontWeight: '100',
  },
  footer: {
    paddingVertical: 5,
    borderTopWidth: 1,
    borderColor: '#ccc',
    backgroundColor: '#fff',
    flexDirection: "row",
    justifyContent: "space-between",
    //flex: 1
  },
  button: {
    width: 50
  },
  imageListContainer: {
    //flexDirection: 'row', // 이미지 리스트를 가로로 배치
    //marginVertical: 10,
    //alignItems: ""
  },
  headerButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'black',
    marginRight: 20
  },
});
