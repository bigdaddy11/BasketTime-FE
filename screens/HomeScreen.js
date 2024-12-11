import React, { useState, useEffect, useContext, useRef, useMemo } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity, RefreshControl, ActivityIndicator } from 'react-native';
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
  const listRef = useRef(null); // FlatList Ref

  const [posts, setPosts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [loading, setLoading] = useState(false); // 데이터 로딩 상태
  const [refreshing, setRefreshing] = useState(false); // 새로고침 상태
  const [page, setPage] = useState(1); // 현재 페이지
  const [hasMore, setHasMore] = useState(true); // 더 가져올 데이터가 있는지 여부

  useFocusEffect(
    React.useCallback(() => {
      if (route.params?.refresh) {
        setPosts([]);
        setPage(0);
        loadPosts(0, true);
        navigation.setParams({ refresh: false }); // refresh 플래그 초기화
      }
    }, [route.params?.refresh])
  );

  useEffect(() => {
    setPosts([]);
    setPage(0);
    loadPosts(0, true);
  }, [selectedCategory]);

  const loadPosts = async (pageToFetch = 0, refresh = false) => {
    if (!session || !session.id) {
      navigation.navigate('Login');
      return;
    }

    if (loading || (!refresh && !hasMore)) return; // 로딩 중이거나 더 가져올 데이터가 없으면 중단

    setLoading(true);
    try {
      const response = await api.get('/api/posts', {
        params: {
          categoryId: selectedCategory || null,
          userId: session.id,
          page: pageToFetch,
          size: 10, // 한 번에 가져올 데이터 수
        },
      });

      const fetchedPosts = response.data.content || [];
      setPosts((prevPosts) => (refresh ? fetchedPosts : [...prevPosts, ...fetchedPosts]));
      setHasMore(fetchedPosts.length === 10); // 10개 미만이면 더 이상 가져올 데이터가 없음
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setLoading(false);
      if (refresh) setRefreshing(false);
    }
  };

  const handleLoadMore = () => {
    if (!loading && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      loadPosts(nextPage);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    setPage(0);
    loadPosts(0, true);
  };

  const scrollToTop = () => {
    setPage(0); // 페이지 초기화
    listRef.current?.scrollToOffset({ animated: true, offset: 0 }); // 최상단으로 스크롤
  };

  // 메모이제이션된 헤더 컴포넌트
  const renderHeader = useMemo(() => {
    return (
      <View>
        <Category onSelectCategory={setSelectedCategory} />
        <Notice />
      </View>
    );
  }, [selectedCategory]);

  const renderFooter = () => {
    if (!loading) return null;
    return <ActivityIndicator style={{ margin: 20 }} />;
  };

  return (
    <View style={{ flex: 1 }}>
      <FlatList
        ref={listRef}
        data={posts}
        keyExtractor={(item, index) => item.id.toString()}
        renderItem={({ item }) => <ComponentCard message={item} />}
        onEndReached={handleLoadMore} // 스크롤 끝에 도달했을 때 호출
        onEndReachedThreshold={0.5} // 50% 지점에서 호출
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
        ListHeaderComponent={renderHeader} // 스크롤에 포함되는 헤더
        ListFooterComponent={renderFooter} // 로딩 상태 표시
        contentContainerStyle={styles.container}
      />

      {/* Floating Button to Scroll to Top */}
      <TouchableOpacity style={styles.scrollToTopButton} onPress={scrollToTop}>
        <MaterialIcons name="arrow-upward" size={24} color="#fff" />
      </TouchableOpacity>

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
    flexGrow: 1,
    backgroundColor: '#fff',
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
    elevation: 5,
  },
  scrollToTopButton: {
    position: 'absolute',
    bottom: 70,
    right: 20,
    backgroundColor: '#FFD73C',
    width: 40,
    height: 40,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
  },
});
