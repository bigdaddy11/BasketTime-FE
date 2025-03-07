import { getMessaging, getToken } from '@react-native-firebase/messaging';
import { firebaseApp } from './firebaseConfig';
import * as Device from 'expo-device';
import { showToast } from '../screens/common/toast';

export async function registerForPushNotificationsAsync() {
  let token;

  if (!Device.isDevice) {
    showToast({
      type: 'error',
      text1: '푸쉬 알림은 실제 기기에서만 가능합니다.',
      position: 'bottom'
    });
    return;
  }

  try {
    console.log("시작");
    // ✅ 푸쉬 알림 권한 요청
    const messaging = getMessaging(firebaseApp);
    console.log("messaging : " + messaging);
    
  } catch (error) {
    console.error("FCM 푸쉬 토큰 발급 오류:", error);
    showToast({
      type: 'error',
      text1: '푸쉬 토큰 발급 실패: ' + error,
      position: 'bottom'
    });
  }

  return token;
}
