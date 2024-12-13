import React, { useState, useEffect, useContext } from 'react';
import { View, Text, StyleSheet, TextInput, Button, KeyboardAvoidingView, Platform, ScrollView, Keyboard, Image, FlatList, Alert } from 'react-native';
import api from '../common/api';
import { CommentItem } from '../home/CommentItem';
import { SessionContext } from '../../contexts/SessionContext';

export default function PlayerDetailScreen({ route }) {
  const { player, teamName } = route.params;
  const [comment, setComment] = useState('');
  const [comments, setComments] = useState([]);

  const [isModalVisible, setIsModalVisible] = useState(false); // 모달 상태

  const { session } = useContext(SessionContext); // 세션 정보 가져오기

  const fetchComments = async () => {
    try {
      const response = await api.get(`/api/comments/${player.id}/NBA`);
      setComments(response.data);
    } catch (error) {
      console.error('댓글 로딩 실패:', error);
    }
  };

  const handleAddComment = async () => {
    if (comment.trim() !== '') {
      try {
        const response = await api.post('/api/comments', {
          playerId: player.id,
          userId: session.id,
          type: "NBA",
          commentText: comment,
        });

        fetchComments();
        setComment('');
        //Keyboard.dismiss();  // 키보드 닫기
      } catch (error) {
        console.error('댓글 추가 실패:', error);
      } finally {
        Keyboard.dismiss();  // 키보드 닫기
      }
    }
  };

  useEffect(() => {
    fetchComments();
  }, []);

  useEffect(() => {
  }, [comments]);

  function convertHeightToMeters(height) {
    const [feet, inches] = height.split('-').map(Number);
    const meters = (feet * 0.3048) + (inches * 0.0254);
    return meters.toFixed(2);
  }

  function convertWeightToKg(weight) {
    const kilograms = weight * 0.453592;
    return kilograms.toFixed(1);
  }

  //댓글 삭제 함수
  const handleDeleteComment = (id) => {
    //setIsModalVisible(false); // 모달 닫기
    Alert.alert(
      '댓글 삭제',
      '이 댓글을 삭제하시겠습니까?',
      [
        { text: '취소', style: 'cancel' },
        {
          text: '삭제',
          onPress: async () => {
            try {
              await api.delete(`/api/comments/${id}/NBA`);
              Alert.alert('삭제 완료', '댓글이 삭제되었습니다.');
              fetchComments(); // 댓글 목록 재조회
            } catch (error) {
              console.error('Error deleting comment:', error);
              Alert.alert('삭제 실패', '댓글 삭제 중 문제가 발생했습니다.');
            }
          },
        },
      ],
      { cancelable: false }
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={80}
    >
      {/* <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}> */}
      <FlatList
        data={comments}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <CommentItem
            nickName={item.nickName}
            timeAgo={item.timeAgo}
            content={item.commentText}
            userId={item.userId}
            onDelete={() => handleDeleteComment(item.id)} // 댓글 삭제 핸들러에 ID 전달
          />
        )}
        ListHeaderComponent={
          <View style={styles.containerView}>
            <Image
                source={{ uri: "https://via.placeholder.com/100" }}
                style={styles.imageStyle}
            />
            {/* <Text style={styles.teamName}>{teamName}</Text> */}
            <Text style={styles.name}>{player.firstName} {player.lastName}</Text>
            <Text style={styles.textStyle}>LAST ATTENDED : {player.college || 'N/A'}</Text>
            <Text style={styles.textStyle}>COUNTRY : {player.country || 'N/A'}</Text>
            <Text style={styles.textStyle}>DRAFT : {player.draftYear + " " + player.draftRound + " Pick " + player.draftNumber || 'N/A'}</Text>
            <Text style={styles.textStyle}>POSITION : {player.position || 'N/A'}</Text>
            <Text style={styles.textStyle}>HEIGHT : {convertHeightToMeters(player.height) + "m" || 'N/A'}</Text>
            <Text style={styles.textStyle}>WEIGHT : {convertWeightToKg(player.weight) + "kg" || 'N/A'}</Text>
            <Text style={styles.textStyle}>NUMBER : {player.jerseyNumber || 'N/A'}</Text>
          </View>
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>댓글이 존재하지 않습니다.</Text>
            <Text style={styles.emptyText}>선수에게 응원의 메시지를 작성해보세요.</Text>
          </View>
        }
      />
      <View style={styles.inputSection}>
        <TextInput
          style={styles.input}
          value={comment}
          onChangeText={setComment}
          placeholder="선수에게 응원의 댓글을 남겨주세요."
        />
        <Button title="등록" onPress={handleAddComment} />
      </View>
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
    flex: 1, // 화면 전체 차지
    justifyContent: 'center', // 세로 중앙 정렬
    alignItems: 'center', // 가로 중앙 정렬
    backgroundColor: '#f9f9f9', // 배경색(필요 시 수정)
    padding: 20, // 전체 여백
    borderBottomWidth: 1, 
    borderBlockColor: "#ddd"
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10, // 이름과 다음 요소 간 여백
    textAlign: 'center', // 텍스트 가로 정렬
  },
  teamName: {
    fontSize: 18,
    //marginBottom: 10, // 이름과 다음 요소 간 여백
    textAlign: 'center', // 텍스트 가로 정렬
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
    //borderTopWidth: 1,
    borderTopColor: '#ccc',
    backgroundColor: '#fff',
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 5,
    marginRight: 5,
    borderRadius: 5,
  },
  imageStyle: {
    width: 100,
    height: 100,
    borderRadius: 50, // 둥근 이미지(원형)
    marginBottom: 10, // 이미지와 텍스트 사이 여백
    marginTop: 10,
  },
  textStyle: {
    fontSize: 13,
    color: '#333', // 텍스트 색상
    marginBottom: 8, // 각 텍스트 요소 간 여백
    textAlign: 'center', // 텍스트 가로 정렬
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
});
