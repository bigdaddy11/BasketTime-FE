import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, RefreshControl, Alert, Linking } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import Feather from '@expo/vector-icons/Feather'; // Feather 아이콘 임포트
import api from './common/api';

export default function DrawScreen() {
  const [drawData, setDrawData] = useState([]); // Draw 테이블 데이터
  const [selectedDate, setSelectedDate] = useState(new Date()); // 선택된 날짜
  const [showDatePicker, setShowDatePicker] = useState(false); // 날짜 선택기 표시 상태
  const [refreshing, setRefreshing] = useState(false); // 새로고침 상태

  // 데이터 가져오는 함수
  const fetchDrawData = async (date) => {
    try {
      const formattedDate = date.toISOString().split('T')[0]; // yyyy-MM-dd 형식으로 변환
      const response = await api.get(`/api/draw?date=${formattedDate}`);
      setDrawData(response.data || []);
    } catch (error) {
      console.error('Error fetching draw data:', error);
      Alert.alert('Error', '데이터를 가져오는 중 문제가 발생했습니다.');
    }
  };

  // 날짜 선택 시 호출
  const handleDateChange = (event, date) => {
    if (date) {
      setSelectedDate(date);
      setShowDatePicker(false); // 날짜 선택 후 달력 닫기
      fetchDrawData(date);
    } else {
      setShowDatePicker(false); // 취소 시 달력 닫기
    }
  };

  useEffect(() => {
    fetchDrawData(selectedDate); // 화면 로드 시 초기 데이터 가져오기
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchDrawData(selectedDate);
    setTimeout(() => setRefreshing(false), 500);
  };

  const handleLinkPress = (url) => {
    if (url && url.trim()) {
      Linking.openURL(url).catch((err) => console.error('Error opening URL:', err));
    } else {
      Alert.alert('오류', '유효하지 않은 링크입니다.');
    }
  };

  function getBrandName(type) {
    switch (type) {
      case 'N':
        return 'Nike';
      case 'NB':
        return 'Newbalance';
      default:
        return 'Unknown';
    }
  }

  return (
    <View style={styles.container}>
      {/* 날짜 선택기 */}
      <View style={styles.datePickerContainer}>
        <TouchableOpacity
          style={styles.dateButton}
          onPress={() => setShowDatePicker(true)}
          activeOpacity={0.7}
        >
          <Feather name="calendar" size={20} color="white" style={styles.icon} />
          <Text style={styles.dateText}>{selectedDate.toISOString().split('T')[0]}</Text>
        </TouchableOpacity>
        {showDatePicker && (
          <DateTimePicker
            value={selectedDate}
            mode="date"
            display="default"
            onChange={handleDateChange}
          />
        )}
      </View>

      {/* Draw 데이터 목록 */}
      <FlatList
        data={drawData}
        keyExtractor={(item) => item.id?.toString() || `${Math.random()}`} // 안전하게 키 설정
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.card} onPress={() => handleLinkPress(item.drawLink)}>
            <Image source={{ uri: item.imagePath || 'https://via.placeholder.com/80' }} style={styles.image} />
            <View style={styles.cardContent}>
              <Text style={styles.cardSubTitle}>{getBrandName(item.type)}</Text>
              <Text style={styles.cardTitle}>{item.drawName}</Text>
              <Text style={styles.cardSubTitle}>{item.price}</Text>
            </View>
          </TouchableOpacity>
        )}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.placeholderText}>선택한 날짜에 Draw 일정이 없습니다.</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 10,
  },
  datePickerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  dateButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    //borderWidth: 1,
    borderColor: '#ddd',
    //borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    backgroundColor: '#1478CD',
  },
  icon: {
    marginRight: 8,
  },
  dateText: {
    fontSize: 20,
    color: "white"
  },
  card: {
    flexDirection: 'row',
    backgroundColor: '#f9f9f9',
    marginBottom: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    overflow: 'hidden',
  },
  image: {
    width: 80,
    height: 80,
    resizeMode: 'cover',
  },
  cardContent: {
    flex: 1,
    padding: 10,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  cardSubTitle: {
    fontSize: 12,
    color: '#555',
  },
  placeholderText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#888',
    marginTop: 20,
  },
});
