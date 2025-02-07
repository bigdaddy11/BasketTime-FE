import React, { useState, useEffect, useContext } from "react";
import {
  View,
  TextInput,
  Button,
  StyleSheet,
  Alert,
  FlatList,
  Text,
  KeyboardAvoidingView,
  Platform,
  Modal,
  Keyboard,
  TouchableOpacity,
} from "react-native";
import api from "../common/api.js";
import { SessionContext } from "../../contexts/SessionContext";
import { showToast } from "../common/toast";
import { useNavigation } from '@react-navigation/native';
import Ionicons from '@expo/vector-icons/Ionicons';

export default function BasketballCourtComments({ courtId }) {
  const { session } = useContext(SessionContext); // 세션 정보 가져오기
  const [comments, setComments] = useState([]); // 댓글 데이터
  const [newComment, setNewComment] = useState(""); // 새로운 댓글 입력값
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false); // 모달 상태
  const [selectedCommentId, setSelectedCommentId] = useState(null); // 선택된 댓글 ID
  const [selectedComment, setSelectedComment] = useState(null); // 선택된 댓글 내용용
  const navigation = useNavigation();

  useEffect(() => {
    fetchComments(); // 농구장 ID 기반 댓글 조회
  }, [courtId]);

  // **농구장 댓글 조회**
  const fetchComments = async () => {
    try {
      const response = await api.get(`/api/courts/comments/${courtId}`, {
        params: { type: "C" }, // C = Court
      });
      setComments(response.data || []);
    } catch (error) {
      console.error("Error fetching comments:", error);
      showToast({
        type: "error",
        text1: "댓글을 불러오는 중 문제가 발생했습니다.",
        position: "bottom",
      });
    }
  };

  // **댓글 작성**
  const handleCommentSubmit = async () => {
    if (!newComment.trim()) {
      showToast({
        type: "error",
        text1: "댓글 내용을 입력하세요.",
        position: "bottom",
      });
      return;
    }

    // 세션 확인
    if (!session || !session.id) {
      showToast({
        type: "error",
        text1: "로그인이 필요합니다.",
        position: "bottom",
      });
      return;
    }

    try {
      await api.post(`/api/courts/comments`, {
        content: newComment,
        type: "C",
        userId: session.id,
        courtId: courtId
      });
      setNewComment("");
      fetchComments(); // 댓글 목록 갱신
    } catch (error) {
      console.error("Error submitting comment:", error);
      showToast({
        type: "error",
        text1: "댓글을 작성하는 중 문제가 발생했습니다.",
        position: "bottom",
      });
    } finally {
      Keyboard.dismiss();
    }
  };

  // **댓글 삭제**
  const handleDeleteComment = async (id) => {

    Alert.alert(
        '댓글 삭제',
        '이 댓글을 삭제하시겠습니까?',
        [
          { text: '취소', style: 'cancel' },
          {
            text: '삭제',
            onPress: async () => {
              try {
                await api.delete(`/api/courts/comments/${id}`);
                showToast({
                  type: 'success',
                  text1: '댓글이 삭제제되었습니다.',
                  position: 'bottom'
                });
                
                fetchComments()
              } catch (error) {
                console.error('Error deleting comment:', error);
                showToast({
                  type: 'error',
                  text1: '댓글 삭제제 중 문제가 발생했습니다.',
                  position: 'bottom'
                });
              }
            },
          },
        ],
        { cancelable: false }
      );
  };

  return (
    <View
      style={styles.container}
    >
      {/* 댓글 리스트 */}
      <FlatList
        data={comments}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.commentItem}>
            <View style={styles.commentHeader}>
              <Text style={styles.commentAuthor}>{item.nickName}</Text>
              <Text style={styles.commentTime}>{item.timeAgo}</Text>
            </View>
            <View style={styles.headerRight}>
                {session?.id === item.userId && (
                <TouchableOpacity onPress={() => handleDeleteComment(item.id)} style={{ padding: 0, marginTop: -20 }}>
                    <Ionicons name="trash-outline" size={16} color="#999" />
                </TouchableOpacity>
                )}
            </View>
            <TextInput 
                style={styles.commentText} 
                value={item.content} />
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>댓글이 없습니다. </Text>
            <Text style={styles.emptyText}>최초로 댓글을 남겨보세요!</Text>
          </View>
        }
      />

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
                <TouchableOpacity style={styles.modalButton} onPress={handleDeleteComment}>
                    <Text style={styles.modalButtonText}>삭제하기</Text>
                </TouchableOpacity>
            </View>
        </Modal>

      {/* 댓글 입력창 */}
      <View style={styles.inputSection}>
        <TextInput
          style={styles.commentInput}
          placeholder="댓글을 입력하세요."
          value={newComment}
          onChangeText={setNewComment}
        />
        <Button title="등록" onPress={handleCommentSubmit} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    //flex: 1,
    justifyContent: "flex-end", // 모달을 화면 하단에 고정
    backgroundColor: "#fff",
  },
  commentItem: {
    padding: 10,
    borderTopWidth: 1,
    borderColor: "#ddd"
  },
  commentHeader: {
    flexDirection: "row",
    justifyContent: "flex-start",
    flex: 1,
    marginBottom: 5,
  },
  headerRight: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    flex: 1
  },
  commentAuthor: {
    fontWeight: "bold",
  },
  commentTime: {
    fontSize: 12,
    color: "#999",
  },
  commentText: {
    fontSize: 14,
  },
  deleteButton: {
    marginTop: 5,
    alignSelf: "flex-end",
  },
  deleteButtonText: {
    color: "red",
    fontSize: 12,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    
    borderTopWidth: 1,

    //lex: 1
    //marginVertical: 20,
  },
  emptyText: {
    fontSize: 14,
    color: "#666",
    textAlign: "center", // 텍스트 중앙 정렬
    marginBottom: 5,
  },
  inputSection: {
    flexDirection: "row",
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: "#ddd",
    backgroundColor: "#fff",
    alignItems: "center",
  },
  commentInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ccc",
    paddingVertical: 3,
    paddingHorizontal: 10,
    borderRadius: 5,
    marginRight: 10,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    //padding: 20,
    //borderRadius: 10,
    alignItems: 'baseline',
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
    backgroundColor: 'white',
    //borderRadius: 5,
    //width: 200,
  },
  modalButtonText: {
    color: 'black',
    fontSize: 14,
    textAlign: 'left',
  },
});
