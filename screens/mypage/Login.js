import React, { useState, useEffect }  from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import AntDesign from '@expo/vector-icons/AntDesign'; // 구글 아이콘
import FontAwesome from 'react-native-vector-icons/FontAwesome'; // 네이버, 카카오 아이콘
import * as Google from 'expo-auth-session/providers/google';  // Google OAuth 라이브러리 사용
import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import api from '../common/api';

// WebBrowser를 세션 관리에 사용
WebBrowser.maybeCompleteAuthSession();

export default function LoginScreen() {
    const [accessToken, setAccessToken] = useState(null);

    // const [request, response, promptAsync] = Google.useAuthRequest({
    //     //94369390250-k2lmf9v5lakl7q8h65tb4rhs44rerqb0.apps.googleusercontent.com 안드로이드 ID
    //     //94369390250-qhr7ger2mipm39827emlfdsqacce3egc.apps.googleusercontent.com 클라이언트 ID
    //     clientId: "94369390250-qhr7ger2mipm39827emlfdsqacce3egc.apps.googleusercontent.com",
    //     redirectUri: AuthSession.makeRedirectUri({
    //         useProxy: true,  // Expo Go 앱을 사용할 때 필요한 옵션
    //     }),
    //     scopes: ['profile', 'email']
    // });

    // Google OAuth 요청을 설정
    const discovery = {
        authorizationEndpoint: "https://accounts.google.com/o/oauth2/auth",
        tokenEndpoint: "https://oauth2.googleapis.com/token",
        userInfoEndpoint: "https://openidconnect.googleapis.com/v1/userinfo"
    };

    const clientId = '94369390250-qhr7ger2mipm39827emlfdsqacce3egc.apps.googleusercontent.com';  // Google Cloud Console에서 생성한 클라이언트 ID

    const handleGoogleLogin = async () => {
      console.log("테스트");
        //const redirectUri = AuthSession.makeRedirectUri({ useProxy: true });
        const redirectUri = `https://auth.expo.io/@jaehyunheo/baskettime`;
        console.log(redirectUri);
        const authUrl = `${discovery.authorizationEndpoint}?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=token&scope=profile%20email`;
        console.log(authUrl);
        const result = await WebBrowser.openAuthSessionAsync(authUrl);
      
        if (result.type === 'success' && result.url) {
            const token = extractAccessToken(result.url);
            if (token) {
                setAccessToken(token);
                await sendTokenToServer(token);
            }
        } else {
            Alert.alert("로그인 실패", "Google 로그인이 취소되었습니다.");
        }
    };

    const extractAccessToken = (url) => {
      const matched = url.match(/access_token=([^&]+)/);
      return matched ? matched[1] : null;
    };

    const sendTokenToServer = async (token) => {
        try {
            const response = await api.post('/api/auth/google/google-token', { token });
            Alert.alert("서버 응답", `사용자 정보: ${JSON.stringify(response.data)}`);
        } catch (error) {
            console.error("서버로 토큰 전송 실패:", error);
            Alert.alert("오류", "서버로 토큰 전송에 실패했습니다.");
        }
    };

    const handleNaverLogin = () => {
        console.log('네이버 로그인 버튼 클릭됨');
    };

    const handleKakaoLogin = () => {
        console.log('카카오 로그인 버튼 클릭됨');
    };

    return (
        <View style={styles.container}>
        {/* 상단 로고 */}
        <Image 
            source={{uri: 'https://your-image-link.com/logo.png'}} // 로고 이미지 경로
            style={styles.logo}
        />

        {/* 설명 텍스트 */}
        <Text style={styles.description}>
            님. Basket Time 에 오신것을 환영합니다. 
        </Text>
        
        {/* 구글 로그인 버튼 */}
        <TouchableOpacity 
            style={[styles.loginButton, styles.googleButton]} 
            title="Login with Google"
            onPress={handleGoogleLogin}
        >
            <View style={styles.iconAndTextContainer}>
                <AntDesign name="google" size={24} color="#fff" style={styles.iconLayout}/>
                <Text style={styles.loginButtonText}>구글 아이디로 로그인</Text>
            </View>
        </TouchableOpacity>

        {/* 네이버 로그인 버튼 */}
        <TouchableOpacity style={[styles.loginButton, styles.naverButton]} onPress={handleNaverLogin}>
            <View style={styles.iconAndTextContainer}>
                <Text style={styles.naverIcon}>N</Text>
                <Text style={styles.loginButtonText}>네이버 아이디로 로그인</Text>
            </View>
        </TouchableOpacity>

        {/* 카카오 로그인 버튼 */}
        <TouchableOpacity style={[styles.loginButton, styles.kakaoButton]} onPress={handleKakaoLogin}>
            <View style={styles.iconAndTextContainer}>
                <FontAwesome name="comment" size={24} color="#fff" style={styles.iconLayout}/>
                <Text style={styles.loginButtonText}>카카오 계정으로 로그인</Text>
            </View>
        </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 20,
  },
  logo: {

    resizeMode: 'contain',
    //marginBottom: 30,
  },
  description: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 40,
    color: '#333',
  },
  loginButton: {
    width: '100%',
    paddingVertical: 15,
    borderRadius: 5,
    alignItems: 'center',
    marginVertical: 10,
    flexDirection: 'row',
    justifyContent: 'flex-start', // 아이콘과 텍스트가 중앙 정렬되도록 추가
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 16,
    //flex: 1
  },
  naverButton: {
    backgroundColor: '#03C75A', // 네이버 초록색
  },
  kakaoButton: {
    backgroundColor: '#FEE500', // 카카오 노란색
  },
  googleButton: {
    backgroundColor: '#4285F4', // 구글 파란색
  },
  iconAndTextContainer: {
    flexDirection: 'row', // 아이콘과 텍스트를 가로로 배치
    alignItems: 'center', // 아이콘과 텍스트를 수직 중앙 정렬
    justifyContent: 'center',     // 텍스트를 부모 컨테이너의 중앙에 위치
    width: '100%',                // 전체 너비 사용
  },
  iconLayout: {
    marginLeft: 10,
    marginRight: 10,              // 아이콘과 텍스트 사이의 간격
    justifyContent: "flex-start",
    //flex: 1
  },  
  naverIcon: {
    //backgroundColor: '#03C75A',  // 네이버 녹색 배경
    color: '#fff',               // 텍스트 색상 흰색
    fontWeight: 'bold',          // 텍스트 굵게
    fontSize: 24,                // 글자 크기
    width: 24,                   // 네모 크기
    textAlign: 'center',         // 가운데 정렬
    marginLeft: 10,
    marginRight: 10,              // 아이콘과 텍스트 사이의 간격
  },
});
