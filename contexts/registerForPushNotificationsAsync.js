import { getMessaging, getToken, requestPermission, hasPermission } from '@react-native-firebase/messaging';
import * as Notifications from 'expo-notifications';
import { Platform, PermissionsAndroid } from 'react-native';
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
    if (isFCM) {
      // ✅ FCM 사용 (운영 / Preview 빌드)
      if (Platform.OS === 'android') {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS
        );
    
        if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
          console.log("🔴 Android 푸쉬 알림 권한 거부됨");
          return;
        }
    
        console.log("✅ Android 푸쉬 알림 권한 허용됨");
      }

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
      console.log("existingStatus : " + existingStatus);

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        showToast({ type: 'error', text1: '푸쉬 알림 권한이 거부되었습니다.', position: 'bottom' });
        return;
      }


      try {
        token = (await Notifications.getExpoPushTokenAsync(
          projectId
        )).data;
        if (!token) throw new Error("Expo Push 토큰을 가져올 수 없습니다.");
      } catch (error) {
        console.error("❌ Expo Push Token 발급 실패:", error);
        return;
      }
      console.log("🚀 Expo Push 토큰:", token);
    }
  } catch (error) {
    console.error("푸쉬 토큰 발급 오류!:", error);
    showToast({ type: 'error', text1: '푸쉬 토큰 발급 실패: ' + error, position: 'bottom' });
  }

  return token;
}
