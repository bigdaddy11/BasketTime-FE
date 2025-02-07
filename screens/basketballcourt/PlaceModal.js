import React, { useState, useEffect, useContext } from "react";
import { View, Text, StyleSheet, TextInput, Button, Keyboard, Image, FlatList, Alert, Modal, TouchableOpacity } from 'react-native';
import api from "../common/api.js";
import { ScrollView } from "react-native-gesture-handler";
import { SessionContext } from '../../contexts/SessionContext';
import { showToast } from "../common/toast";
import Ionicons from '@expo/vector-icons/Ionicons';

const DEFAULT_IMAGE = require("../../assets/noImage.png"); // 기본 이미지 추가

const PlaceModal = ({ isVisible, place, onClose }) => {
    const { session } = useContext(SessionContext); // 세션 정보 가져오기
    const [comments, setComments] = useState([]); // 댓글 데이터
    const [newComment, setNewComment] = useState(""); // 새로운 댓글 입력값
    const [keyboardVisible, setKeyboardVisible] = useState(false);

    useEffect(() => {
        fetchComments(); // 농구장 ID 기반 댓글 조회
    }, [place]);

    // **농구장 댓글 조회**
    const fetchComments = async () => {
        try {
        const response = await api.get(`/api/courts/comments/${place?.id}`, {
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
        courtId: place?.id
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
    <Modal
        visible={isVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={onClose}
        >
        <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
                <FlatList
                    data={comments}
                    keyExtractor={(item) => item.id.toString()}
                    showsVerticalScrollIndicator={false} // 스크롤바 숨기기
                    renderItem={({ item }) => (
                    <View style={styles.commentItem}>
                        <View style={styles.commentHeader}>
                            {/* <Text style={styles.commentAuthor}>{item.nickName}</Text>
                            <Text style={styles.commentTime}>{item.timeAgo}</Text> */}
                            <Text style={styles.commentAuthor}>휴직맨</Text>
                            <Text style={styles.commentTime}>1시간전</Text>
                        </View>
                        <View style={styles.headerRight}>
                        {session?.id === item.userId && (
                            <TouchableOpacity
                            onPress={() => handleDeleteComment(item.id)}
                            style={{ padding: 0, marginTop: -20 }}
                            >
                            <Ionicons name="trash-outline" size={16} color="#999" />
                            </TouchableOpacity>
                        )}
                        </View>
                        <Text style={styles.commentText}>{item.content} </Text>
                    </View>
                    )}
                    ListHeaderComponent={
                    <View style={styles.modalHeader}>
                        <Image
                        source={place?.image ? { uri: place.image } : DEFAULT_IMAGE}
                        style={styles.placeImage}
                        />
                        <View style={styles.textAlign}>
                            <Text style={styles.modalTitle}>{place?.name}</Text>
                            <Text style={styles.modalText}>📍 {place?.address}</Text>
                            <Text style={styles.modalText}>⭐ 평점: {place?.rating}</Text>
                        </View>    
                    </View>
                    }
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <Text style={styles.emptyText}>댓글이 없습니다. </Text>
                            <Text style={styles.emptyText}>최초로 댓글을 남겨보세요!</Text>
                        </View>
                    }
                />
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
        </View>
        </Modal>
  );
};

const styles = StyleSheet.create({
    modalOverlay: {
      flex: 1,
      justifyContent: "flex-end", // 화면 하단에 모달 배치
      backgroundColor: "rgba(0, 0, 0, 0.5)", // 반투명 배경
    },
    commentAuthor: {
        fontWeight: "bold",
        fontSize: 13,
        color: '#333',
        marginRight: 15,
        top: -1
      },
    commentTime: {
        fontSize: 11,
        color: '#999',
    },
    commentHeader: {
        flexDirection: "row",
        justifyContent: "flex-start",
        flex: 1,
        marginBottom: 5,
    },
    commentText: {
        fontSize: 14,
      },
    textAlign: {
        paddingVertical: 10,
        paddingHorizontal: 5
    },
    headerRight: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        flex: 1
    },
    emptyContainer: {
        alignItems: "center",
        justifyContent: "center",
        height: 150
    },
    emptyText: {
        fontSize: 14,
        color: "#666",
        textAlign: "center", // 텍스트 중앙 정렬
        marginBottom: 5,
    },
    modalContent: {
      backgroundColor: "white",
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      paddingHorizontal: 20,
      paddingVertical: 10,
      maxHeight: "80%", // 최대 높이 제한
      minHeight: "80%"
    },
    modalHeader: {
      alignItems: "left",
      //marginBottom: 10,
      borderBottomColor: "#ddd",
      borderBottomWidth: 1,
      paddingVertical: 10,
      paddingHorizontal: 5,
    },
    placeImage: {
      width: "100%",
      height: 200,
      marginBottom: 10,
      borderWidth: 1,
      borderColor: "#ddd",
    },
    modalTitle: {
      fontSize: 18,
      fontWeight: "bold",
      marginBottom: 10,
    },
    modalText: {
      fontSize: 14,
      marginBottom: 5,
      textAlign: "left",
    },
    commentItem: {
      padding: 10,
      borderBottomWidth: 1,
      borderBottomColor: "#ddd",
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
    inputSection: {
      flexDirection: "row",
      alignItems: "center",
      marginTop: 10,
    },
    closeButton: {
      alignSelf: "center",
      marginTop: 10,
      padding: 10,
      backgroundColor: "#FF4C4C",
      borderRadius: 5,
    },
    closeButtonText: {
      color: "white",
      fontWeight: "bold",
    },
  });

export default PlaceModal;
