import React, {useState, useContext, useEffect} from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, TextInput, FlatList } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import Feather from '@expo/vector-icons/Feather';
import { SessionContext } from '../../contexts/SessionContext';

// 댓글 하나를 출력하는 컴포넌트
export function CommentItem({ nickName, timeAgo, content, userId, onDelete, onEdit, commentId, depth, postId }) {
  const navigation = useNavigation();
  const { session } = useContext(SessionContext); // 세션 정보 가져오기
  const isAuthor = userId === session?.id; // 글쓴이 여부 확인
  const route = useRoute();  // 현재 화면 경로 확인

  const [isEditing, setIsEditing] = useState(false); // 수정 모드 상태
  const [editedText, setEditedText] = useState(content); // 수정 중인 텍스트

  const [isModalVisible, setIsModalVisible] = useState(false); // 모달 상태
  const [isModalEditVisible, setIsModalEditVisible] = useState(false); // 모달 상태

  const containerStyle = [styles.container, depth > 0 && { paddingLeft: 40 * depth, backgroundColor: `#eee` }];

  const isReplyScreen = route.name === 'ReplyScreen';  // 현재 화면이 ReplyScreen인지 확인

  const handleMoreOptions = () => {
    setIsModalVisible(true); // 옵션 모달 열기
  };

  const handleEditMoreOptions = () => {
    setIsModalVisible(false); // 기존 옵션 모달 닫기
    setIsModalEditVisible(true); // 수정 모달 열기
  };
  
  const handleSaveEdit = () => {
    onEdit(editedText); // 수정 핸들러 호출
    setIsModalEditVisible(false); // 수정 모달 닫기
  };

  const handleEdit = () => {
    setIsModalVisible(false); // 기존 옵션 모달 닫기
    navigation.navigate('EditComment', { commentId, content }); // 수정 화면으로 이동
  };

  const handleReply = () => {
    setIsModalVisible(false);
    navigation.navigate('ReplyScreen', { commentId, postId });  // ReplyScreen으로 이동
  };

  return (
    <View style={containerStyle}>
      {/* 닉네임과 작성 시간 */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.nickName}>{nickName || '익명'}</Text>
          <Text style={styles.timeAgo}>{timeAgo}</Text>
        </View>
        <View style={styles.headerRight}>
        
        {!isReplyScreen && isAuthor && (
        <TouchableOpacity onPress={handleMoreOptions} style={{ marginTop: -5 }}>
          <Feather name="more-horizontal" size={16} color="#999" />
        </TouchableOpacity>
        )}
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
            {depth === 0 && (
              <TouchableOpacity style={styles.modalButton} onPress={handleReply}>
                <Text style={styles.modalButtonText}>대댓글작성</Text>
              </TouchableOpacity>
            )}
            {isAuthor && (
            <>
              <TouchableOpacity style={styles.modalButton} onPress={handleEdit}>
                <Text style={styles.modalButtonText}>수정하기</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalButton} onPress={onDelete}>
                <Text style={styles.modalButtonText}>삭제하기</Text>
              </TouchableOpacity>
            </>
            )}
          </View>
        </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 15,
    paddingVertical: 15,
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
  modalEditContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalEditContent: {
    backgroundColor: 'white',
    padding: 15,
    //borderTopLeftRadius: 20,
    //borderTopRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5, // 안드로이드 그림자
    marginHorizontal: 10, // 화면 좌우 여백
  },
  modalEditHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  modalEditInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    //borderRadius: 5,
    padding: 10,
    marginBottom: 10,
    minHeight: 80,
    textAlignVertical: 'top', // 텍스트 상단 정렬
  },
  modalEditButtonRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  cancelEditButton: {
    backgroundColor: '#eee',
    padding: 10,
    //borderRadius: 5,
    marginRight: 10,
  },
  saveEditButton: {
    backgroundColor: '#FFD73C',
    padding: 10,
    //borderRadius: 5,
  },
});
