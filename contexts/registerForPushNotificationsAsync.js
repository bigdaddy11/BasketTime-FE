import { getMessaging, getToken, requestPermission, hasPermission } from '@react-native-firebase/messaging';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { showToast } from '../screens/common/toast';

export async function registerForPushNotificationsAsync() {
  let token;
  const isFCM = Constants.expoConfig.extra.useFCM;

  if (!Device.isDevice) {
    showToast({ type: 'error', text1: '푸쉬 알림은 실제 기기에서만 가능합니다.', position: 'bottom' });
    return;
  }

  try {
    if (!isFCM) {
      // ✅ FCM 사용 (운영 / Preview 빌드)
      const messaging = getMessaging();
      const permissionStatus = await hasPermission(messaging);

      if (permissionStatus === 0) { // 0: 권한 없음
        const requestStatus = await requestPermission(messaging);
        if (requestStatus !== 1) {
          showToast({ type: 'error', text1: '푸쉬 알림 권한이 거부되었습니다.', position: 'bottom' });
          return;
        }
      }

      token = await getToken(messaging);
      console.log("🔥 FCM 푸쉬 토큰:", token);
    } else {
      // ✅ Expo Push 사용 (개발 빌드)
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        showToast({ type: 'error', text1: '푸쉬 알림 권한이 거부되었습니다.', position: 'bottom' });
        return;
      }

      token = (await Notifications.getExpoPushTokenAsync()).data;
      console.log("🚀 Expo Push 토큰:", token);
    }
  } catch (error) {
    console.error("푸쉬 토큰 발급 오류:", error);
    showToast({ type: 'error', text1: '푸쉬 토큰 발급 실패: ' + error, position: 'bottom' });
  }

  return token;
}
