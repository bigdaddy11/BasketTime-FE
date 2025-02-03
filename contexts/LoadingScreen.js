import React, { useContext, useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { SessionContext } from './SessionContext';

export default function LoadingScreen({ navigation }) {
  const { session, isSessionLoaded } = useContext(SessionContext);

  useEffect(() => {
    if (isSessionLoaded) { // ✅ 세션이 로드되었을 때만 실행
      if (session) {
        navigation.replace('Main'); // 세션이 있으면 메인화면으로 이동
      } else {
        navigation.replace('Login'); // 없으면 로그인 화면으로 이동
      }
    }
  }, [session, isSessionLoaded]);

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <ActivityIndicator size="large" color="#FFD73C" />
    </View>
  );
}
