import messaging from '@react-native-firebase/messaging';

// ✅ 백그라운드 및 종료 상태에서 메시지 수신 처리
messaging().setBackgroundMessageHandler(async remoteMessage => {
    //console.log("📩 백그라운드/종료 상태에서 수신한 FCM 메시지:", remoteMessage);
});
