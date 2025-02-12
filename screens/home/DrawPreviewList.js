import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, ScrollView, Linking } from 'react-native';
import api from '../common/api.js';

const DEFAULT_IMAGE = require("../../assets/noImage.png"); // 기본 이미지 추가

export default function DrawPreviewList() {
  const [drawData, setDrawData] = useState([]); // Draw 데이터 상태

  // 최신 Draw 데이터 가져오기
  const fetchLatestDraws = async () => {
    try {
      const response = await api.get('/api/draw/week');
      setDrawData(response.data || []);
    } catch (error) {
      console.log('Error fetching latest draw data:', error);
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

  return (
    <View style={styles.container}>
      <Text style={styles.title}> 곧 출시될 🔥 드로우</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.scrollContainer}>
        {drawData.map((item) => (
          <TouchableOpacity key={item.id} style={styles.card} onPress={() => handleLinkPress(item.drawLink)}>
            <Image source={{ uri: item.imagePath || DEFAULT_IMAGE }} style={styles.image} />
            <View style={{flex: 1, alignItems: "flex-end", marginRight: 10, paddingVertical: 5}}>
                <Text style={styles.drawSubName} >{getBrandName(item.type)}</Text>
                <Text style={styles.drawSubName} >{item.price}</Text>
                <Text style={styles.drawSubName} >{item.releaseTime}</Text>
                <Text style={styles.drawName} numberOfLines={1}>{item.drawName}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
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
  },
  image: {
    width: '100%',
    height: '60%',
    resizeMode: 'cover',
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
