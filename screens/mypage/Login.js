import React, { useState, useEffect, useContext }  from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, Alert, BackHandler } from 'react-native';
import AntDesign from '@expo/vector-icons/AntDesign'; // 구글 아이콘
import FontAwesome from 'react-native-vector-icons/FontAwesome'; // 네이버, 카카오 아이콘
import * as Google from 'expo-auth-session/providers/google';  // Google OAuth 라이브러리 사용
import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import api from '../common/api';
import { SessionContext } from '../../contexts/SessionContext';
import { useFocusEffect } from '@react-navigation/native';

// WebBrowser를 세션 관리에 사용
WebBrowser.maybeCompleteAuthSession();

export default function LoginScreen({ navigation }) {
    const { login } = useContext(SessionContext);

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
    
    const handleGoogleLogin = async () => {
      const user = { id: 1, name: 'John Doe', nickName: "휴직맨", role: 'user', email : "zidir0070@gmail.com" };
      login(user); // Set the session
      navigation.navigate('Main'); // Redirect to Main
    };

    const handleNaverLogin = () => {
      const user = { id: 2, name: 'NaverMan', nickName: "네이버맨", role: 'user', email : "zidir0070@naver.com"  };
      login(user); // Set the session
      navigation.navigate('Main'); // Redirect to Main
    };

    const handleKakaoLogin = () => {
      const user = { id: 3, name: 'KaKaoMan', nickName: "카카오맨", role: 'user', email : "zidir0070@kakao.com"  };
      login(user); // Set the session
      navigation.navigate('Main'); // Redirect to Main
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
