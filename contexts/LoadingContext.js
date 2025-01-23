import React, { createContext, useState, useContext } from 'react';
import { View, ActivityIndicator, StyleSheet, Text } from 'react-native';

// Loading Context 생성
const LoadingContext = createContext();

// Context Provider 생성
export const LoadingProvider = ({ children }) => {
  const [isLoading, setIsLoading] = useState(false);

  const showLoading = () => setIsLoading(true);
  const hideLoading = () => setIsLoading(false);

  return (
    <LoadingContext.Provider value={{ showLoading, hideLoading }}>
        {React.Children.map(children, (child) => {
          // child가 null 또는 undefined인 경우 건너뜁니다.
          if (!child) return null;

          // child가 문자열인 경우 텍스트로 감쌉니다.
          if (typeof child === 'string') {
            return <Text>{child}</Text>;
          }

          // React element인 경우 그대로 반환합니다.
          if (React.isValidElement(child)) {
            return child;
          }

          // 알 수 없는 경우 null 반환
          return null;
        })}
        {isLoading && (
            <View style={styles.overlay}>
                <ActivityIndicator size="large" color="#FFD73C" />
            </View>
        )}
    </LoadingContext.Provider>
  );
};

// Hook for using the Loading Context
export const useLoading = () => {
    const context = useContext(LoadingContext);
    if (!context) {
      throw new Error('useLoading must be used within a LoadingProvider');
    }
    return context;
  };

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 1000,
  },
});
