import React, { useEffect, useState, useMemo } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, ScrollView, Linking } from 'react-native';
// import FastImage from 'react-native-fast-image';
import api from '../common/api';

const DEFAULT_IMAGE = require("../../assets/noImage.png"); // 기본 이미지 추가

export default function DrawPreviewList() {
  const [drawData, setDrawData] = useState([]); // Draw 데이터 상태

  // 최신 Draw 데이터 가져오기
  const fetchLatestDraws = async () => {
    try {
      const response = await api.get('/api/draw/week');
      setDrawData(response.data || []);
    } catch (error) {
      //console.log('Error fetching latest draw data:', error);
    }
  };

  useEffect(() => {
    fetchLatestDraws();
  }, []);

  function getBrandName(type) {
    switch (type) {
      case 'N':
        return 'Nike';
      case 'NB':
        return 'Newbalance';
      case 'A':
        return 'Asics';
      default:
        return 'Unknown';
    }
  }

  const handleLinkPress = (url) => {
      if (url && url.trim()) {
        Linking.openURL(url).catch((err) => console.error('Error opening URL:', err));
      } else {
        showToast({
          type: 'error',
          text1: '유효하지 않은 링크입니다.',
          position: 'bottom'
        });
      }
    };
  
  const renderItem = useMemo(() => ({ item }) => (
    <TouchableOpacity key={item.id} style={styles.card} onPress={() => handleLinkPress(item.drawLink)}>
      {/* <FastImage
        source={{ uri: item.imagePath || DEFAULT_IMAGE }}
        style={styles.image}
        resizeMode={FastImage.resizeMode.cover}
      /> */}
      <Image
        source={{ uri: item.imagePath || DEFAULT_IMAGE }}
        style={styles.image}
        // resizeMode={FastImage.resizeMode.cover}
      />
      <View style={styles.cardContent}>
        <Text style={styles.drawSubName}>{getBrandName(item.type)}</Text>
        <Text style={styles.drawSubName}>{item.price}</Text>
        <Text style={styles.drawSubName}>{item.releaseTime}</Text>
        <Text style={styles.drawName} numberOfLines={1}>{item.drawName}</Text>
      </View>
    </TouchableOpacity>
  ), []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}> 곧 출시될 🔥 드로우</Text>
      <FlatList
        data={drawData}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        horizontal
        showsHorizontalScrollIndicator={false}
        initialNumToRender={5} // 최초 렌더링 개수 제한
        windowSize={3} // 화면 내에서 유지할 뷰 개수 제한
        removeClippedSubviews // 화면 밖의 요소 제거하여 성능 향상
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 5,
    //marginTop: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    marginLeft: 10
  },
  scrollContainer: {
    paddingHorizontal: 10,
  },
  card: {
    width: 200,
    height: 200,
    borderRadius: 10,
    overflow: 'hidden',
    marginRight: 10,
    backgroundColor: '#f9f9f9',
    //alignItems: 'center',
    justifyContent: 'center',
    shouldRasterizeIOS: true, // iOS 최적화
    renderToHardwareTextureAndroid: true, // Android 최적화
  },
  image: {
    width: '100%',
    height: '60%',
    resizeMode: 'cover',
  },
  cardContent: {
    flex: 1,
    alignItems: "flex-end",
    marginRight: 10,
    paddingVertical: 5,
  },
  drawName: {
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
    //marginTop: 5,
  },
  drawSubName: {
    fontSize: 12,
    color: '#aaa',
    //fontWeight: 'bold',
    textAlign: 'center',
    //marginTop: 5,
  },
});
