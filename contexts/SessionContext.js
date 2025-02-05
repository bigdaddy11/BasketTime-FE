import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';

// Create a Context for the session
export const SessionContext = createContext();

// Create a Provider component
export const SessionProvider = ({ children, navigation  }) => {
  const [session, setSession] = useState(null);
  const [isSessionLoaded, setIsSessionLoaded] = useState(false); // 세션 로드 상태
  //const navigation = useNavigation(); // ✅ 네비게이션 객체 추가

  useEffect(() => {
    const loadSession = async () => {
      try {
        const savedSession = await AsyncStorage.getItem('session');
        if (savedSession) {
          setSession(JSON.parse(savedSession)); // Restore session
        }
      } catch (error) {
        console.error('Error loading session:', error);
      } finally {
        setIsSessionLoaded(true); // ✅ 세션 로드가 완료되었음을 표시
      }
    };

    loadSession();
  }, []);

  // Function to manually set session
  const login = async (user) => {
    try {
      await AsyncStorage.setItem('session', JSON.stringify(user)); // Save session data
      setSession(user);
      return true; // ✅ 로그인 완료 후 true 반환
    } catch (error) {
      console.error('Error saving session:', error);
      return false;
    }
  };

  // Function to clear session
  const logout = async (navigation) => {
    try {
      await AsyncStorage.removeItem('session'); // Remove session data
      setSession(null);
      //navigation.replace('Login'); // 로그인 화면으로 이동
    } catch (error) {
      console.error('Error clearing session:', error);
    }
  };

  return (
    <SessionContext.Provider value={{ session, setSession, isSessionLoaded, login, logout }}>
      {children}
    </SessionContext.Provider>
  );
};
