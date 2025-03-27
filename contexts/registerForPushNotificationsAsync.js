import { getMessaging, getToken, requestPermission, hasPermission } from '@react-native-firebase/messaging';
import * as Notifications from 'expo-notifications';
import { Platform, PermissionsAndroid } from 'react-native';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { showToast } from '../screens/common/toast';

export async function registerForPushNotificationsAsync() {
  let token;
  const isFCM = Constants.expoConfig.extra.useFCM;
  const projectId = Constants.expoConfig.extra.eas.projectId;

  if (!Device.isDevice) {
    showToast({ type: 'error', text1: '푸쉬 알림은 실제 기기에서만 가능합니다.', position: 'bottom' });
    return null;
  }

  try {
    if (isFCM) {
      const messaging = getMessaging();
      const permissionStatus = await hasPermission(messaging);

      if (permissionStatus === 1) {
        token = await getToken(messaging);
        //console.log("🔥 FCM 푸쉬 토큰 (기존 권한):", token);
      } else if (permissionStatus === 0) {
        //console.log("🔕 푸쉬 알림 권한 거부됨 (FCM)");
        return null;
      } else {
        //console.log("⚠️ 알림 권한 상태 알 수 없음:", permissionStatus);
        return null;
      }
    } else {
      // ✅ Expo Push 사용 (개발 빌드)
      const { status: existingStatus } = await Notifications.getPermissionsAsync();

      // if (existingStatus !== 'granted') {
      //   const { status } = await Notifications.requestPermissionsAsync();
      //   finalStatus = status;
      // }

      if (existingStatus !== 'granted') {
        showToast({ type: 'error', text1: '푸쉬 알림 권한이 거부되었습니다.', position: 'bottom' });
        return null;
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
      //console.log("🚀 Expo Push 토큰:", token);
    }
  } catch (error) {
    console.error("푸쉬 토큰 발급 오류!:", error);
    showToast({ type: 'error', text1: '푸쉬 토큰 발급 실패: ' + error, position: 'bottom' });
  }

  return token;
}
