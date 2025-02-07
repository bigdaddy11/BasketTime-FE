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
  Keyboard,
  TouchableOpacity,
} from "react-native";
import api from "../common/api.js";
import { SessionContext } from "../../contexts/SessionContext";
import { showToast } from "../common/toast";

export default function BasketballCourtComments({ courtId }) {
  const { session } = useContext(SessionContext); // 세션 정보 가져오기
  const [comments, setComments] = useState([]); // 댓글 데이터
  const [newComment, setNewComment] = useState(""); // 새로운 댓글 입력값
  const [keyboardVisible, setKeyboardVisible] = useState(false);

  useEffect(() => {
    console.log(courtId);
    fetchComments(); // 농구장 ID 기반 댓글 조회
  }, [courtId]);

  useEffect(() => {
    const showListener = Keyboard.addListener("keyboardDidShow", () => {
      setKeyboardVisible(true);
    });

    const hideListener = Keyboard.addListener("keyboardDidHide", () => {
      setKeyboardVisible(false);
    });

    return () => {
      showListener.remove();
      hideListener.remove();
    };
  }, []);

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
      await api.post(`/api/courts/comments/${courtId}`, {
        commentText: newComment,
        type: "C",
        userId: session.id,
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
  const handleDeleteComment = (id) => {
    Alert.alert("댓글 삭제", "이 댓글을 삭제하시겠습니까?", [
      { text: "취소", style: "cancel" },
      {
        text: "삭제",
        onPress: async () => {
          try {
            await api.delete(`/api/courts/comments/${id}`);
            showToast({
              type: "success",
              text1: "댓글이 삭제되었습니다.",
              position: "bottom",
            });
            fetchComments(); // 댓글 목록 재조회
          } catch (error) {
            console.error("Error deleting comment:", error);
            showToast({
              type: "error",
              text1: "댓글 삭제 중 문제가 발생했습니다.",
              position: "bottom",
            });
          }
        },
      },
    ]);
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={keyboardVisible ? 80 : 0} // 키보드 동적 오프셋
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
            <Text style={styles.commentText}>{item.commentText}</Text>
            {session?.id === item.userId && (
              <TouchableOpacity onPress={() => handleDeleteComment(item.id)} style={styles.deleteButton}>
                <Text style={styles.deleteButtonText}>삭제</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>댓글이 없습니다. 첫 댓글을 남겨보세요!</Text>
          </View>
        }
      />

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
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  commentItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd"
  },
  commentHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 5,
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
    marginVertical: 40,
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
});
