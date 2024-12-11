import React, { useState, useEffect, useContext } from 'react';
import { View, TextInput, Button, StyleSheet, Alert, FlatList, Text, KeyboardAvoidingView, Platform, Keyboard, ScrollView, Image, TouchableOpacity, Modal } from 'react-native';
import api from '../common/api';
import { SessionContext } from '../../contexts/SessionContext';
import { CommentItem } from './CommentItem'; // 분리된 컴포넌트 불러오기

import Feather from '@expo/vector-icons/Feather';

export default function SelectCommunity({ route, navigation }) {
  const [isModalVisible, setIsModalVisible] = useState(false); // 모달 상태

  const { session } = useContext(SessionContext); // 세션 정보 가져오기
  const { postId } = route.params || {}; // 전달받은 게시물 ID
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  const [categoryName, setCategoryName] = useState();
  const [nickName, setNickName] = useState();
  const [imagePath, setImagePath] = useState();
  const [timeAgo, setTimeAgo] = useState();

  const [post, setPost] = useState(null); // 게시글 데이터
  const [comments, setComments] = useState([]); // 댓글 데이터
  const [newComment, setNewComment] = useState(''); // 새로운 댓글 입력값
  const isAuthor = post?.userId === session?.id; // 글쓴이 여부 확인

  // 게시글 및 카테고리 데이터를 가져오는 함수
  useEffect(() => {
    if (!postId) {
      Alert.alert('Error', '게시물 ID가 없습니다.');
      navigation.goBack();
      return;
    }
    fetchPost();
    fetchComments();
  }, [postId]);


  const fetchPost = async () => {
    try {
      const response = await api.get(`/api/posts/${postId}`);
      setPost(response.data);
      setTitle(response.data.title || '');
      setContent(response.data.content || '');
      setCategoryName(response.data.categoryName);
      setNickName(response.data.nickName);
      setImagePath(response.data.image);
      setTimeAgo(response.data.timeAgo);
    } catch (error) {
      console.error('Error fetching post:', error);
      Alert.alert('Error', '게시글을 불러오는 중 문제가 발생했습니다.');
    }
  };

  const handleMoreOptions = () => {
    setIsModalVisible(true); // 옵션 모달 열기
  };

  const handleEditPost = () => {
    setIsModalVisible(false); // 모달 닫기
    navigation.navigate('CreateCommunity', { postId: post?.id }); // 게시물 수정 화면으로 이동
  };

  const handleDeletePost = () => {
    setIsModalVisible(false); // 모달 닫기
    Alert.alert(
      '게시물 삭제',
      '이 게시물을 삭제하시겠습니까?',
      [
        { text: '취소', style: 'cancel' },
        {
          text: '삭제',
          onPress: async () => {
            try {
              await api.delete(`/api/posts/${post?.id}`);
              Alert.alert('삭제 완료', '게시물이 삭제되었습니다.');
              navigation.navigate('Main', {
                screen: 'Home',
                params: { refresh: true },
              });
            } catch (error) {
              console.error('Error deleting post:', error);
              Alert.alert('삭제 실패', '게시물 삭제 중 문제가 발생했습니다.');
            }
          },
        },
      ],
      { cancelable: false }
    );
  };

  const fetchComments = async () => {
    try {
      const response = await api.get(`/api/posts/${postId}/comments`);
      setComments(response.data || []);
    } catch (error) {
      console.error('Error fetching comments:', error);
      Alert.alert('Error', '댓글을 불러오는 중 문제가 발생했습니다.');
    }
  };

  // 댓글 작성 함수
  const handleCommentSubmit = async () => {
    if (!newComment.trim()) {
      Alert.alert('Error', '댓글 내용을 입력하세요.');
      return;
    }

    // 세션 확인
    if (!session || !session.id) {
      navigation.navigate('Login') // 로그인 페이지로 이동
      return;
    }

    try {
      await api.post(`/api/posts/${postId}/comments`, {
        commentText: newComment,
        userId: session.id,
      });
      setNewComment('');
      fetchComments(); // 댓글 목록 갱신
    } catch (error) {
      console.error('Error submitting comment:', error);
      Alert.alert('Error', '댓글을 작성하는 중 문제가 발생했습니다.');
    } finally {
      Keyboard.dismiss();  // 키보드 닫기
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={80}
    >
      <View style={{ flexGrow: 1.5, flexShrink: 0 }}>
        <View style={{ flexDirection: "row", alignItems: "center", marginTop: 5, justifyContent: "space-between" }}>
          {/* 이미지와 정보 */}
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Image source={{ uri: imagePath }} style={styles.imageStyle} />
            <View style={{ flexDirection: "column", justifyContent: "flex-start", alignItems: "flex-start" }}>
              <View style={{ flexDirection: "row", alignItems: "flex-start" }}>
                <Text style={styles.categoryinput}>{categoryName}</Text>
                <Text style={styles.timeAgo}>{timeAgo}</Text>
              </View>
              <Text style={styles.nickName}>{nickName}</Text>
            </View>
          </View>

          {/* 오른쪽 상단 ... 버튼 (작성자만 노출) */}
          {isAuthor && (
            <TouchableOpacity onPress={handleMoreOptions} style={{ padding: 10, marginTop: -20 }}>
              <Feather name="more-horizontal" size={20} color="black" />
            </TouchableOpacity>
          )}
        </View>

        {/* 제목과 내용 */}
        <Text style={styles.input} numberOfLines={1}>{title}</Text>
        <ScrollView style={{ flex: 1 }}>
          <Text style={styles.inputMain}>{content}</Text>
        </ScrollView>

        {/* 수정/삭제 모달 */}
        <Modal
          transparent={true}
          visible={isModalVisible}
          animationType="fade"
          onRequestClose={() => setIsModalVisible(false)} // 뒤로가기 버튼 동작
        >
          <TouchableOpacity
            style={styles.modalOverlay}
            activeOpacity={1}
            onPress={() => setIsModalVisible(false)} // 모달 닫기
          />
          <View style={styles.modalContent}>
            <TouchableOpacity style={styles.modalButton} onPress={handleEditPost}>
              <Text style={styles.modalButtonText}>게시물 수정하기</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.modalButton} onPress={handleDeletePost}>
              <Text style={styles.modalButtonText}>게시물 삭제하기</Text>
            </TouchableOpacity>
          </View>
        </Modal>
      </View>

      {/* 댓글 작성 영역 */}
      <View style={styles.commentSection}>
        {/* <Text style={styles.commentHeader}>댓글</Text> */}
        <FlatList
          data={comments}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <CommentItem
              nickName={item.nickName}
              timeAgo={item.timeAgo}
              content={item.commentText}
            />
          )}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>댓글이 존재하지 않습니다.</Text>
              <Text style={styles.emptyText}>최초로 댓글을 작성해보세요.</Text>
            </View>
          }
        />
      </View>
      <View style={styles.inputSection}>
        <TextInput
          style={styles.commentInput}
          placeholder="댓글을 남겨주세요."
          value={newComment}
          onChangeText={setNewComment}
        />
        <Button title="등록" onPress={handleCommentSubmit} />
      </View>
    </KeyboardAvoidingView>
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
    fontSize: 24,
    fontWeight: 600,
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
    flexWrap: 'wrap', // 텍스트 줄 바꿈 허용
  },
  commentSection: {
    flex:1,
    marginTop: 20,
    borderTopWidth: 10,
    borderColor: "whitesmoke"
  },
  commentHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  comment: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  commentAuthor: {
    fontWeight: 'bold',
    marginRight: 5,
  },
  commentContent: {
    flex: 1,
  },
  commentInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 5,
    marginRight: 5,
    borderRadius: 5,
  }, 
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 50,
    //paddingHorizontal: 10,
  },
  emptyText: {
    fontSize: 14,
    color: '#666', // 회색 텍스트
    textAlign: 'center',
    marginBottom: 5,
  },
  inputSection: {
    flexDirection: 'row',
    padding: 4,
    borderTopWidth: 1,
    borderTopColor: '#ccc',
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageStyle: {
    width: 40,
    height: 40,
    borderRadius: 30, // 이미지 둥글게
    margin: 10, // 텍스트와 이미지 간격
  },
  categoryinput: {
    marginBottom: 2,
    fontSize: 13,
    marginRight: 10,
    fontWeight: 'bold',
  },
  nickName: {
    fontSize: 13,
    color: '#333',
  },
  timeAgo: {
    marginTop: 1,
    fontSize: 11,
    color: '#999',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
    elevation: 5,
  },
  modalButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    marginVertical: 5,
    backgroundColor: '#007BFF',
    borderRadius: 5,
    width: 200,
  },
  modalButtonText: {
    color: 'white',
    fontSize: 16,
    textAlign: 'center',
  },
});
