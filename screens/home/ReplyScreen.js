import React, { useState, useEffect, useContext } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, Button } from 'react-native';
import api from '../common/api';
import { SessionContext } from '../../contexts/SessionContext';
import { CommentItem } from './CommentItem';  // 기존 CommentItem 재사용

export default function ReplyScreen({ route, navigation }) {
  const { commentId, postId } = route.params;  // 부모 댓글 ID 전달받기
  const { session } = useContext(SessionContext);
  const [comments, setComments] = useState([]);
  const [newReply, setNewReply] = useState('');

  useEffect(() => {
    fetchReplies();
  }, []);

  useEffect(() => {
    
  }, [comments]);

  const fetchReplies = async () => {
    try {
      const response = await api.get(`/api/posts/comments/${commentId}/replies`);
      const allComments = [{ ...response.data.parentComment, depth: 0 }, ...response.data.replies.map(reply => ({ ...reply, depth: 1 }))];
      setComments(allComments);
    } catch (error) {
      console.error('Error fetching replies:', error);
    }
  };

  const handleReplySubmit = async () => {
    if (!newReply.trim()) return;
    try {
      await api.post(`/api/posts/comments`, {
        commentText: newReply,
        parentId: commentId,
        relationId: postId,
        userId: session.id,
        type: "P",
      });
      setNewReply('');
      fetchReplies();
    } catch (error) {
      console.error('Error submitting reply:', error);
    }
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={comments}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <CommentItem
            nickName={item.nickName}
            timeAgo={item.timeAgo}
            content={item.commentText}
            userId={item.userId}
            commentId={item.id}
            depth={item.depth}
          />
        )}
      />
      <View style={styles.inputSection}>
        <TextInput
          style={styles.input}
          placeholder="대댓글을 입력하세요."
          value={newReply}
          onChangeText={setNewReply}
        />
        <Button style={styles.buttonStyle} title="등록" onPress={handleReplySubmit} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  input: { flex: 1, borderWidth: 1, borderColor: '#ccc', borderRadius: 5, padding: 8, marginRight: 5,},
  
  buttonStyle: {
    
  },
  buttonText: { color: '#fff' },
  inputSection: {
    flexDirection: 'row',
    padding: 4,
    borderTopWidth: 1,
    borderTopColor: '#ccc',
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
