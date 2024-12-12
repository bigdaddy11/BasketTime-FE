import React, {useState, useContext} from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Feather from '@expo/vector-icons/Feather';
import { SessionContext } from '../../contexts/SessionContext';

// 댓글 하나를 출력하는 컴포넌트
export function CommentItem({ nickName, timeAgo, content }) {
  const navigation = useNavigation();
  const { session } = useContext(SessionContext); // 세션 정보 가져오기

  const [isModalVisible, setIsModalVisible] = useState(false); // 모달 상태

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
      '이 댓글을 삭제하시겠습니까?',
      [
        { text: '취소', style: 'cancel' },
        {
          text: '삭제',
          onPress: async () => {
            try {
              await api.delete(`/api/posts/${post?.id}`);
              Alert.alert('삭제 완료', '댓글이 삭제되었습니다.');
              // navigation.navigate('Main', {
              //   screen: 'Home',
              //   params: { refresh: true },
              // });
            } catch (error) {
              console.error('Error deleting post:', error);
              Alert.alert('삭제 실패', '댓글 삭제 중 문제가 발생했습니다.');
            }
          },
        },
      ],
      { cancelable: false }
    );
  };

  return (
    <View style={styles.container}>
      {/* 닉네임과 작성 시간 */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.nickName}>{nickName || '익명'}</Text>
          <Text style={styles.timeAgo}>{timeAgo}</Text>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity onPress={handleMoreOptions} style={{ padding: 10, marginTop: -20 }}>
            <Feather name="more-horizontal" size={16} color="#999" />
          </TouchableOpacity>
        </View>
      </View>
      
      {/* 댓글 내용 */}
      <Text style={styles.content}>{content}</Text>

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
              <Text style={styles.modalButtonText}>수정하기</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.modalButton} onPress={handleDeletePost}>
              <Text style={styles.modalButtonText}>삭제하기</Text>
            </TouchableOpacity>
          </View>
        </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    
    padding: 15,
    backgroundColor: 'white',

    borderBottomWidth: 1,
    borderColor: '#ddd',
  },
  header: {
    flexDirection: 'row',
    //justifyContent: 'space-between',
    marginBottom: 5,
    flex: 1
  },
  headerLeft: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    flex: 1,
    alignItems: "center",
  },
  headerRight: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    flex: 1
  },
  nickName: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#333',
    marginRight: 15,
    
  },
  timeAgo: {
    fontSize: 11,
    color: '#999',
    top: -1
  },
  content: {
    fontSize: 14,
    color: '#444',
  },modalOverlay: {
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
