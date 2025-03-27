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
      const permission = await MediaLibrary.getPermissionsAsync();

      // ✅ 이미 권한이 있고, 재요청 불필요할 경우
      if (permission.granted) {
        console.log("🔓 저장 권한 이미 허용됨");
      } else if (!permission.granted && permission.canAskAgain) {
        // ✅ 권한이 없고 요청할 수 있다면 요청
        const request = await MediaLibrary.requestPermissionsAsync();

        if (!request.granted) {
          showToast({
            type: 'info',
            text1: '이미지를 저장하려면 권한이 필요합니다.',
            position: 'bottom'
          });
          return;
        }
      } else {
        // ❌ 권한 없고 재요청도 불가
        showToast({
          type: 'error',
          text1: '설정 > 앱 권한에서 미디어 권한을 허용해주세요.',
          position: 'bottom'
        });
        return;
      }

      if (permission.granted) {
        const fileName = imageUri.split('/').pop();
        const downloadResumable = FileSystem.createDownloadResumable(
          imageUri,
          FileSystem.documentDirectory + fileName
        );
      
        const { uri } = await downloadResumable.downloadAsync();
        if (!uri) {
          showToast({ type: 'error', text1: '이미지 다운로드 실패', position: 'bottom' });
          return;
        }
      
        // ✅ 다운로드 성공 후 저장
        const asset = await MediaLibrary.createAssetAsync(uri);
        //await MediaLibrary.createAlbumAsync('Download', asset, false);
        showToast({
          type: 'success',
          text1: '이미지가 갤러리에 저장되었습니다.',
          position: 'bottom'
        });
      }

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
