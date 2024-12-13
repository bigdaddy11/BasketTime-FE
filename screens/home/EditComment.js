import React, { useState, useEffect } from 'react';
import { View, TextInput, Button, StyleSheet, Alert, Text } from 'react-native';
import api from '../common/api';

export default function EditComment({ route, navigation}) {
  const { commentId, content, onEdit } = route.params;
  const [editedContent, setEditedContent] = useState(content);

  //댓글 수정 함수
  const handleEditComment = () => {
    console.log(commentId, editedContent);
    const id = commentId;
    Alert.alert(
      '댓글 수정',
      '이 댓글을 수정하시겠습니까?',
      [
        { text: '취소', style: 'cancel' },
        {
          text: '수정',
          onPress: async () => {
            try {
              await api.put(`/api/posts/comments/${id}`, { commentText: editedContent });
              Alert.alert('수정 완료', '댓글이 수정되었습니다.');
              navigation.goBack(); // 이전 화면으로 돌아가기
            } catch (error) {
              console.error('Error editing comment:', error);
              Alert.alert('수정 실패', '댓글 수정 중 문제가 발생했습니다.');
            }
          },
        },
      ],
      { cancelable: false }
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.headerText}>댓글 수정</Text>
      <TextInput
        style={styles.input}
        value={editedContent}
        onChangeText={setEditedContent}
        placeholder="댓글 내용을 수정하세요."
        multiline
      />
      <Button title="저장" onPress={handleEditComment} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 30,
    backgroundColor: 'white',
  },
  headerText: {
    //justifyContent: 'space-between',
    marginBottom: 10,
    fontSize: 18,
    fontWeight: "bold"

  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    marginBottom: 20,
    textAlignVertical: 'top',
    height: "40%"
  },
});
