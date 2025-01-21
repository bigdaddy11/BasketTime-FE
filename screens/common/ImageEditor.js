import React from 'react';
import { View, Image, StyleSheet, TouchableOpacity} from 'react-native';
import * as FileSystem from 'expo-file-system';
import * as MediaLibrary from 'expo-media-library';
import AntDesign from '@expo/vector-icons/AntDesign';
import { showToast } from './toast';

export default function ImageViewer({ route, navigation }) {
  const { imageUri } = route.params;

  const handleDownload = async () => {
    try {
      // 권한 요청
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== 'granted') {
        showToast({
          type: 'info',
          text1: '이미지를 저장하려면 권한이 필요합니다.',
          position: 'bottom'
        });
        return;
      }

      // 파일 다운로드 및 저장
      const fileName = imageUri.split('/').pop();
      const downloadResumable = FileSystem.createDownloadResumable(
        imageUri,
        FileSystem.documentDirectory + fileName
      );

      const { uri } = await downloadResumable.downloadAsync();
      const asset = await MediaLibrary.createAssetAsync(uri);
      await MediaLibrary.createAlbumAsync('Download', asset, false);
      showToast({
        type: 'success',
        text1: '이미지가 갤러리에 저장되었습니다.',
        position: 'bottom'
      });
    } catch (error) {
      console.error('Error downloading image:', error);
      showToast({
        type: 'error',
        text1: '이미지 저장 중 문제가 발생했습니다.',
        position: 'bottom'
      });
    }
  };

  return (
    <View style={styles.container}>
      <Image source={{ uri: imageUri }} style={styles.image} />
      <TouchableOpacity style={styles.downloadButton} onPress={handleDownload}>
        <AntDesign name="download" size={20} color="white" />
        {/* <Text style={styles.downloadText}>다운로드</Text> */}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
  },
  downloadButton: {
    position: 'absolute',
    bottom: 10,
    left: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingVertical: 5,
    paddingHorizontal: 5,
    borderRadius: 5,
  },
  downloadText: {
    color: '#fff',
    fontSize: 16,
  },
});
