import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, Button, KeyboardAvoidingView, Platform, ScrollView, Keyboard, TouchableWithoutFeedback } from 'react-native';
import axios from 'axios';

export default function PlayerDetailScreen({ route }) {
  const { player, teamName } = route.params;
  const [comment, setComment] = useState('');
  const [comments, setComments] = useState([]);

  const fetchComments = async () => {
    try {
      const response = await axios.get(`http://192.168.0.11:8080/api/comments/${player.id}/NBA`);
      setComments(response.data);
    } catch (error) {
      console.error('댓글 로딩 실패:', error);
    }
  };

  const handleAddComment = async () => {
    if (comment.trim() !== '') {
      try {
        const response = await axios.post('http://192.168.0.11:8080/api/comments', {
          playerId: player.id,
          userId: "1",
          type: "NBA",
          commentText: comment,
        });

        fetchComments();
        setComment('');
        Keyboard.dismiss();  // 키보드 닫기
      } catch (error) {
        console.error('댓글 추가 실패:', error);
      }
    }
  };

  useEffect(() => {
    fetchComments();
  }, []);

  function convertHeightToMeters(height) {
    const [feet, inches] = height.split('-').map(Number);
    const meters = (feet * 0.3048) + (inches * 0.0254);
    return meters.toFixed(2);
  }

  function convertWeightToKg(weight) {
    const kilograms = weight * 0.453592;
    return kilograms.toFixed(1);
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={80}
    >
      {/* <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}> */}
        <View style={styles.inner}>
          <ScrollView 
            style={styles.commentsSection} 
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}  // 스크롤바 비활성화
            keyboardShouldPersistTaps="handled"  // 이 속성 추가
          >
            <View style={styles.containerView}>
              <Text style={styles.name}>{player.firstName} {player.lastName} {teamName}</Text>
              <Text>LAST ATTENDED : {player.college || 'N/A'}</Text>
              <Text>COUNTRY : {player.country || 'N/A'}</Text>
              <Text>DRAFT : {player.draftYear + " " + player.draftRound + " Pick " + player.draftNumber || 'N/A'}</Text>
              <Text>POSITION : {player.position || 'N/A'}</Text>
              <Text>HEIGHT : {convertHeightToMeters(player.height) + "m" || 'N/A'}</Text>
              <Text>WEIGHT : {convertWeightToKg(player.weight) + "kg" || 'N/A'}</Text>
              <Text>NUMBER : {player.jerseyNumber || 'N/A'}</Text>
            </View>

            {comments.map((item) => (
              <View key={item.id} style={styles.commentItem}>
                <Text>{item.commentText}</Text>
              </View>
            ))}
          </ScrollView>

          <View style={styles.inputSection}>
            <TextInput
              style={styles.input}
              value={comment}
              onChangeText={setComment}
              placeholder="선수에게 응원의 댓글을 남겨주세요."
            />
            <Button title="등록" onPress={handleAddComment} />
          </View>
        </View>
      {/* </TouchableWithoutFeedback> */}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  inner: {
    flex: 1,
    justifyContent: 'space-between',
  },
  scrollContent: {
    flexGrow: 1,
    //paddingBottom: 10
  },
  containerView: {
    margin: 20,
    //borderBottomWidth: 1,
    //borderColor: '#ccc',
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  commentsSection: {
    flex: 1,
    //marginTop: 30,
    //borderBottomWidth: 1,
    //borderColor: '#ccc',
  },
  commentItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  inputSection: {
    flexDirection: 'row',
    padding: 4,
    borderTopWidth: 1,
    borderTopColor: '#ccc',
    backgroundColor: '#fff',
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 5,
    marginRight: 10,
    borderRadius: 5,
  },
});
