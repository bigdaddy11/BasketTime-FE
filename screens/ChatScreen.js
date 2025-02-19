import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TextInput, TouchableOpacity, Image, StyleSheet, RefreshControl, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Feather from '@expo/vector-icons/Feather';
import api from './common/api';

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

  const fetchChatRooms = async (pageNumber = 0, isRefresh = false) => {
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
      } else {
        setChatRooms(prevRooms => [...prevRooms, ...newRooms]);
      }
      setPage(pageNumber + 1);
    } catch (error) {
      console.error('Error fetching chat rooms:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // 검색 필터 적용
  const filteredRooms = chatRooms.filter(room =>
    room.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // 채팅방 클릭 시 이동
  const enterChatRoom = (room) => {
    navigation.navigate('ChatRoom', { roomId: room.id, roomName: room.name });
  };

  return (
    <View style={styles.container}>
      {/* 헤더 */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>농구경기 잡자</Text>
        <TouchableOpacity onPress={() => navigation.navigate('CreateChatRoom')}>
          <Feather name="plus" size={24} color="#FFD73C" />
        </TouchableOpacity>
      </View>

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
          <TouchableOpacity style={styles.roomItem} onPress={() => enterChatRoom(item)}>
            <View style={styles.roomIcon}>
              <Feather name="message-circle" size={24} color="white" />
            </View>
            <View style={styles.roomInfo}>
              <Text style={styles.roomTitle}>{item.name}</Text>
              <Text style={styles.roomSubText}>{item.description || '설명 없음'}</Text>
            </View>
            <View style={styles.roomMeta}>
              <Text style={styles.memberCountText}>{item.members}/{item.maxMembers}</Text>
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
    padding: 15,
    borderBottomWidth: 1,
    borderColor: '#ddd',
  },
  roomIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#007AFF',
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
});