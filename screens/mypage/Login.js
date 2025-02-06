import React, { useState, useEffect, useContext }  from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, BackHandler, Platform } from 'react-native';
import AntDesign from '@expo/vector-icons/AntDesign'; // 구글 아이콘
import FontAwesome from 'react-native-vector-icons/FontAwesome'; // 네이버, 카카오 아이콘
import * as Google from 'expo-auth-session/providers/google';  // Google OAuth 라이브러리 사용
import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import api from '../common/api.js';
import { SessionContext } from '../../contexts/SessionContext';
import { useFocusEffect } from '@react-navigation/native';
import { showToast } from '../common/toast';
import { login, logout, getProfile } from "@react-native-seoul/kakao-login";

// WebBrowser를 세션 관리에 사용
WebBrowser.maybeCompleteAuthSession();

export default function LoginScreen({ navigation }) {
    const { login: sessionLogin } = useContext(SessionContext);

    const [request, response, promptAsync] = Google.useAuthRequest({
      androidClientId: '94369390250-0gtlruhqq1g5diosdi4v3uqjq5c5tvs5.apps.googleusercontent.com',
      redirectUri: AuthSession.makeRedirectUri({
        native: 'com.jaehyunheo.baskettime:/oauth2redirect',
        useProxy: Platform.OS !== 'android', // Expo Go에서는 Proxy 사용
      }),
      scopes: ['profile', 'email'], // 권한 범위
    });

    useEffect(() => {
      if (response?.type === 'success') {
        const { access_token } = response.params;
        // Google API로 사용자 정보 가져오기
        fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: { Authorization: `Bearer ${access_token}` },
        })
          .then((res) => res.json())
          .then(async (user) => {
            if (user && user.sub) {
              // 서버에 로그인 요청
              api.post('/api/auth/login', {
                  subId: user.sub,
                  name: user.name,
                  email: user.email,
                  picture: user.picture,
                  type: "G",
              })
              .then((response) => {
                sessionLogin({
                      id: response.data.id,
                      nickName: response.data.nickName,
                      email: response.data.email,
                      picture: response.data.picture,
                      editIs: response.data.editIs
                    }).then((isSuccess) => {
                      if (isSuccess) {
                        showToast({
                          type: 'success',
                          text1: '로그인에 성공하였습니다.',
                          position: 'bottom',
                        });
                        navigation.replace('Loading');
                      }
                    });
              })
              .catch((error) => {
                showToast({
                        type: 'error',
                        text1: '인증서버 요청이 실패하였습니다.',
                        position: 'bottom'
                      });
                console.error('인증서버 요청이 실패하였습니다.', error);
              });
              ;
            } else {
              showToast({
                type: 'error',
                text1: 'User info is incomplete or invalid',
                position: 'bottom'
              });
              console.error('User info is incomplete or invalid');
            }
          })
          .catch((error) => {
            showToast({
              type: 'error',
              text1: 'Error fetching user info',
              position: 'bottom'
            });
            console.error('Error fetching user info:', error);
          });
      }
    }, [response]);

    const handleOauthKakaoLogin = async () => {
      try {
        const token = await login(); // 카카오 로그인
  
        const profile = await getProfile(); // 사용자 정보 가져오기
        //서버로 사용자 정보 전달
        await loginToServer(profile);
      } catch (err) {
        console.error("Kakao Login Error:", err);
        Alert.alert("로그인 실패", "카카오 로그인을 실패했습니다.");
      }
    };

    const loginToServer = async (profile) => {
      if (!profile || !profile.id) {
        console.error("❌ 사용자 정보가 올바르지 않습니다.");
        showToast({
          type: 'error',
          text1: '사용자 정보를 가져올 수 없습니다.',
          position: 'bottom'
        });
        return;
      }
    
      try {
        // ✅ 서버에 로그인 요청
        const response = await api.post('/api/auth/login', {
          subId: profile.id,
          name: profile.nickname || "No Name",
          email: profile.email || "No Email",
          picture: profile.profileImageUrl || "",
          type: "K", // 카카오 로그인
        });
    
        if (response.status === 200) {
          const userData = response.data;
    
          // ✅ 세션 업데이트
          sessionLogin({
            id: userData.id,
            nickName: userData.nickName,
            email: userData.email,
            picture: userData.picture,
            editIs: userData.editIs,
          }).then((isSuccess) => {
            if (isSuccess) {
              // ✅ 로그인 성공 메시지 표시
              showToast({
                type: 'success',
                text1: '로그인에 성공하였습니다.',
                position: 'bottom',
              });
    
              // ✅ 로그인 후 `Loading` 화면으로 이동
              navigation.replace('Loading');
            }
          });
        } else {
          console.error("❌ 서버 응답 오류:", response);
          showToast({
            type: 'error',
            text1: '서버 응답 오류 발생',
            position: 'bottom'
          });
        }
      } catch (err) {
        console.error("❌ Login to Server Error:", err);
        showToast({
          type: 'error',
          text1: '인증서버 요청이 실패하였습니다.',
          position: 'bottom'
        });
      }
    };
    
    

    // 뒤로가기 동작 막기
    useFocusEffect(
      React.useCallback(() => {
        const onBackPress = () => {
          return true; // 뒤로가기를 차단
        };

          BackHandler.addEventListener('hardwareBackPress', onBackPress);

        return () => {
          BackHandler.removeEventListener('hardwareBackPress', onBackPress);
        };
      }, [])
    );
    const handleGoogleOauth2 = async () => {
      if (request) {
        await promptAsync();
      } else {
        Alert.alert('Error', 'Google OAuth 요청이 초기화되지 않았습니다.');
      }
    };

    const handleGoogleLogin = async () => {
      const user = { id: 1, name: 'John Doe', nickName: "휴직맨", role: 'user', email : "zidir0070@gmail.com" };
      sessionLogin(user); // Set the session
      navigation.replace('Loading'); // Redirect to Main
    };

    const handleNaverLogin = () => {
      const user = { id: 2, name: 'NaverMan', nickName: "네이버맨", role: 'user', email : "zidir0070@naver.com"  };
      sessionLogin(user); // Set the session
      navigation.replace('Loading'); // Redirect to Main
    };

    const handleKakaoLogin = () => {
      const user = { id: 3, name: 'KaKaoMan', nickName: "카카오맨", role: 'user', email : "zidir0070@kakao.com"  };
      sessionLogin(user); // Set the session
      navigation.replace('Loading'); // Redirect to Main
    };

    return (
        <View style={styles.container}>
        {/* 상단 로고 */}
        <Image 
            source={{uri: 'https://your-image-link.com/logo.png'}} // 로고 이미지 경로
            style={styles.logo}
        />

        {/* 설명 텍스트 */}
        <Text style={styles.description}>Basket Time 에 오신것을 환영합니다</Text>

        {/* 구글 Oauth2 버튼 */}
        <TouchableOpacity 
            style={[styles.loginButton, styles.googleButton]} 
            title="Login with Google"
            onPress={handleGoogleOauth2}
        >
            <View style={styles.iconAndTextContainer}>
                <AntDesign name="google" size={24} color="#fff" style={styles.iconLayout}/>
                <Text style={styles.loginButtonText}>구글 아이디 로그인</Text>
            </View>
        </TouchableOpacity>
        {/* 구글 로그인 버튼 */}

        {/* 카카오오 OAuth2 버튼 */}
        <TouchableOpacity style={[styles.loginButton, styles.kakaoButton]} onPress={handleOauthKakaoLogin}>
            <View style={styles.iconAndTextContainer}>
                <FontAwesome name="comment" size={24} color="black" style={styles.iconLayout}/>
                <Text style={styles.loginButtonKakaoText }>카카오 아이디 로그인</Text>
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
    paddingHorizontal: 30,
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
    fontSize: 14,
    fontWeight: 600
    //flex: 1
  },
  loginButtonKakaoText: {
    color: 'black',
    fontSize: 14,
    fontWeight: 600
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
    //width: '100%',                // 전체 너비 사용
    //padding: 5
    paddingHorizontal: 20
  },
  iconLayout: {
    paddingHorizontal: 10,
    //marginLeft: 10,
    //marginRight: 10,              // 아이콘과 텍스트 사이의 간격
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
