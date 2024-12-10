import React, { useState, useEffect, useContext } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';
import { Notice } from './home/Notice';
import { ComponentCard } from './home/ComponentCard';
import { Category } from './home/Category';
import api from './common/api';
import { SessionContext } from '../contexts/SessionContext';

export default function HomeScreen({ route }) {
  const navigation = useNavigation();
  const { session } = useContext(SessionContext); // 세션 정보 가져오기

  const [posts, setPosts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [loading, setLoading] = useState(false); // 로딩 상태

  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadPosts();
  }, [selectedCategory]);

  useEffect(() => {
    console.log(posts);
  }, [posts]);

  // 데이터 로드 함수
  const loadPosts = async () => {
    setLoading(true); // 로딩 시작

    // 세션 확인
    if (!session || !session.id) {
      setLoading(false); // 로딩 시작
      navigation.navigate('Login') // 로그인 페이지로 이동
      return;
    }

    try {
      const response = await api.get("/api/posts", {
         params: { 
                  categoryId : selectedCategory || null ,
                  userId: session.id
                 } 
        });
      
      setPosts(Array.isArray(response.data) ? response.data : []); // 데이터가 배열인지 확인 후 설정
      
    } catch (error) {
      console.error('Error fetching posts:', error);
      setPosts([]); // 에러 발생 시 빈 배열로 설정
    } finally {
      setLoading(false); // 로딩 완료
      setRefreshing(false);
    }
  };

  // 새로고침 트리거 (useFocusEffect)
  useFocusEffect(
    React.useCallback(() => {
      if (route.params?.refresh) {
        loadPosts();
        navigation.setParams({ refresh: false }); // refresh 플래그 초기화
      }
    }, [route.params?.refresh])
  );

  return (
    <View style={{ flex: 1 }}>
      <ScrollView 
        style={styles.container}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={loadPosts} />
        }
      >
          <Category onSelectCategory={setSelectedCategory}/>
          <Notice></Notice>

          {/* 로딩 상태 표시 */}
          {loading && <Text style={styles.loadingText}>Loading...</Text>}

          {/* 데이터가 없을 경우 기본 메시지 */}
          {!loading && posts.length === 0 && (
            <View style={styles.emptyStateContainer}>
              <Text style={styles.emptyStateText}>게시글이 없습니다.</Text>
            </View>
          )}

          {!loading &&
              posts.map((post) => (
                  <ComponentCard key={post.id} message={post}></ComponentCard>
              ))
          }
      </ScrollView>

      {/* Floating + 버튼 (고정 위치) */}
      <TouchableOpacity
        style={styles.floatingButton}
        onPress={() => navigation.navigate('CreateCommunity')} // 신규 글 작성 화면으로 이동
      >
        <MaterialIcons name="add" size={24} color="#fff" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    //justifyContent: 'center',
    //alignItems: 'center',
  },
  floatingButton: {
    position: 'absolute',
    bottom: 20, // 화면 아래에서 20px 떨어짐
    right: 20,  // 화면 오른쪽에서 20px 떨어짐
    backgroundColor: '#FFD73C', // 버튼 색상
    width: 40,
    height: 40,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000', // 그림자 효과
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5, // Android에서 그림자 효과
  },
});
