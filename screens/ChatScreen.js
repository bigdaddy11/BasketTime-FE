import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, TextInput, TouchableOpacity, Image, StyleSheet, RefreshControl, ActivityIndicator, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Feather from '@expo/vector-icons/Feather';
import api from './common/api';
import { showToast } from './common/toast';

export default function ChatScreen() {
  const navigation = useNavigation();
  const [chatRooms, setChatRooms] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false); // 🔹 추가된 상태
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true); // 더 불러올 데이터가 있는지 여부

  
  useEffect(() => {
    fetchChatRooms(page, true);
  }, []);

  // 🔹 화면을 아래로 당길 때 실행되는 함수
  const onRefresh = async () => {
    setRefreshing(true);
    fetchChatRooms(0, true); // 첫 페이지부터 새로 불러오기
    setRefreshing(false);
  };

  // 🔹 스크롤이 끝에 도달했을 때 추가 데이터 로드
  const loadMore = () => {
    if (!loading && hasMore) {
      fetchChatRooms(page, false);
    }
  };

  const fetchChatRooms = useCallback(async (pageNumber = 0, isRefresh = false) => {
    if (loading || (!isRefresh && !hasMore)) return; // 이미 로딩 중이거나 더 불러올 데이터가 없으면 중단
    
    setLoading(true);
    try {
      

      const response = await api.get(`/api/chatrooms`, {
        params: { page: pageNumber, size: 10 } // 10개씩 불러오기
      });

      const newRooms = response.data.content;
      setHasMore(!response.data.last); // 마지막 페이지인지 체크

      if (isRefresh) {
        setChatRooms(newRooms);
        setPage(1); // 새로고침 시 페이지를 1로 초기화
      } else {
        setChatRooms(prevRooms => [...prevRooms, ...newRooms]);
        setPage(pageNumber + 1);
      }
      
    } catch (error) {
      showToast
      ({
        type: "error",
        text1: "채팅방 조회 시 문제가 발생했습니다.", // 서버에서 보낸 메시지 출력
        position: "bottom",
      });
      setHasMore(false); // 500 오류 발생 시 추가 요청 방지
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  },[hasMore]);

  // 검색 필터 적용
  const filteredRooms = chatRooms.filter(room =>
    room.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // 채팅방 클릭 시 먼저 확인창 띄우기
  const joinChatRoom = async (room) => {
    Alert.alert(
      '채팅방 입장',
      `입장하시겠습니까?`,
      [
        {
          text: '취소',
          style: 'cancel',
        },
        {
          text: '확인',
          onPress: async () => {
            try {
              //await api.post(`/api/chatrooms/${room.id}/join/${session.id}`);
              enterChatRoom(room);
            } catch (error) {
              showToast
              ({
                type: "error",
                text1: "채팅방 입장 중 문제가 발생했습니다.", 
                position: "bottom",
              });
            }
          },
        },
      ]
    );
  };

  // 채팅방 클릭 시 이동
  const enterChatRoom = (room) => {
    navigation.navigate('ChatRoom', { roomId: room.id, roomName: room.name, roomDesc: room.description });
  };

  return (
    <View style={styles.container}>
      {/* 헤더 */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>농구시합 하자!</Text>
      </View>
      <TouchableOpacity
        style={styles.floatingButton}
        onPress={() => navigation.navigate('CreateChatRoom')} // 신규 글 작성 화면으로 이동
      >
        <Feather name="plus" size={24} color="#fff" />
      </TouchableOpacity>

      {/* 검색 바 */}
      <TextInput
        style={styles.searchBar}
        placeholder="대화방 이름/소개 검색"
        value={searchQuery}
        onChangeText={setSearchQuery}
      />

      {/* 채팅방 목록 */}
      <FlatList
        data={filteredRooms}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.roomItem} onPress={() => joinChatRoom(item)}>
            <View style={styles.roomIcon}>
              <Feather name="message-circle" size={24} color="white" />
            </View>
            <View style={styles.roomInfo}>
              <Text style={styles.roomTitle}>{item.name}</Text>
              <Text style={styles.roomSubText}>{item.description || '설명 없음'}</Text>
            </View>
            <View style={styles.roomMeta}>
              <Text style={styles.memberCountText}>{item.userCount}/{item.maxMembers}</Text>
            </View>
          </TouchableOpacity>
        )}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} /> // 🔹 Pull-to-Refresh 추가
        }
        onEndReached={loadMore} // 🔹 리스트 끝까지 가면 추가 데이터 로드
        onEndReachedThreshold={0.5} // 스크롤이 50% 남았을 때 미리 로드
        ListFooterComponent={loading && <ActivityIndicator size="small" color="#000" />} // 로딩 표시
        ListEmptyComponent={<Text style={styles.emptyText}>채팅방이 없습니다.</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 10,
    paddingTop: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  memberCount: {
    fontSize: 14,
    marginVertical: 10,
    textAlign: 'center',
  },
  searchBar: {
    backgroundColor: '#F1F1F1',
    padding: 10,
    borderRadius: 8,
    marginVertical: 10,
    fontSize: 14,
  },
  roomItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderColor: '#ddd',
  },
  roomIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFD73C',
    alignItems: 'center',
    justifyContent: 'center',
  },
  roomInfo: {
    flex: 1,
    marginLeft: 10,
  },
  roomTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  roomSubText: {
    fontSize: 12,
    color: '#666',
  },
  roomMeta: {
    alignItems: 'flex-end',
  },
  memberCountText: {
    fontSize: 12,
    color: '#666',
  },
  emptyText: {
    textAlign: 'center',
    fontSize: 14,
    marginTop: 20,
    color: '#888',
  },
  floatingButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: '#FFD73C',
    width: 40,
    height: 40,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 10,
    zIndex: 999, // iOS에서 최상단으로 올리기
  },
});