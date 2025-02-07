import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  Modal,
  Image
} from "react-native";
import BasketballCourtComments from "./BasketballCourtComments";

const DEFAULT_IMAGE = require("../../assets/noImage.png"); // 기본 이미지 추가

const PlaceModal = ({ isVisible, place, onClose }) => {
  const [comments, setComments] = useState([]); // 댓글 리스트
  const [newComment, setNewComment] = useState(""); // 새 댓글 입력값

  const handleAddComment = () => {
    if (newComment.trim()) {
      setComments([...comments, { id: Date.now(), text: newComment }]);
      setNewComment("");
    }
  };

  return (
    <Modal
      visible={isVisible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
            <View style={{borderBottomWidth: 1, borderBottomColor: "#ddd", paddingVertical: 10}}>
                <Image
                    source={place?.image ? { uri: place.image } : DEFAULT_IMAGE}
                    style={styles.placeImage}
                    />
                <Text style={styles.modalTitle}>{place?.name}</Text>
                <Text style={styles.modalText}>📍 {place?.address}</Text>
                <Text style={styles.modalText}>⭐ 평점: {place?.rating}</Text>
            </View>

          {/* 댓글 컴포넌트 호출 (courtId 전달) */}
          <BasketballCourtComments courtId={place?.id} />

          {/* <View style={{flexDirection: "row", width: "100%", justifyContent: "flex-end",}}>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                <Text style={styles.closeButtonText}>닫기</Text>
            </TouchableOpacity>
          </View> */}
          
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
    modalContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: "rgba(0, 0, 0, 0.5)",
    },
    modalContent: {
      width: "90%",
      height: "90%",
      backgroundColor: "white",
      padding: 20,
      borderRadius: 8,
      alignItems: "left",
    },
    placeImage: {
      width: "100%",
      height: 200,
      borderRadius: 10,
      marginBottom: 10,
      borderWidth: 1,
      borderColor: "#ddd"
    },
    modalTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 10, marginLeft: 5 },
    modalText: { fontSize: 14, marginBottom: 5 , marginLeft: 5,},
    commentItem: { fontSize: 14, marginBottom: 5 },
    commentInput: {
      width: "100%",
      borderWidth: 1,
      borderColor: "#ddd",
      paddingVertical: 3,
      paddingHorizontal: 10,
      marginBottom: 10,
      borderRadius: 5,
    },
    addButton: {
      backgroundColor: "#007BFF",
      padding: 10,
      borderRadius: 5,
      
    },
    addButtonText: { color: "white", fontWeight: "bold" },
    closeButton: {
      backgroundColor: "#FF4C4C",
      padding: 10,
      borderRadius: 5,
    },
    closeButtonText: { color: "white", fontWeight: "bold" },
  });

export default PlaceModal;
