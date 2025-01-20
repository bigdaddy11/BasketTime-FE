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
            if (typeof child === 'string') {
            return <Text>{child}</Text>;
            }
            return child;
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
