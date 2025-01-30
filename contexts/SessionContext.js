import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Create a Context for the session
export const SessionContext = createContext();

// Create a Provider component
export const SessionProvider = ({ children }) => {
  const [session, setSession] = useState(null);

  useEffect(() => {
    const loadSession = async () => {
      try {
        const savedSession = await AsyncStorage.getItem('session');
        console.log('Saved session:', savedSession);
        if (savedSession) {
          //console.log("세션세팅을 할까?");
          setSession(JSON.parse(savedSession)); // Restore session
        }
      } catch (error) {
        console.error('Error loading session:', error);
      } finally {
        //console.log('Loading session:', session);
      }
    };

    loadSession();
  }, []);

  useEffect(() => {
    if (session) {
      console.log('Updated session:', session);
      
    }
  }, [session]);

  // Function to manually set session
  const login = async (user) => {
    try {
      await AsyncStorage.setItem('session', JSON.stringify(user)); // Save session data
      setSession(user);
    } catch (error) {
      console.error('Error saving session:', error);
    }
  };

  // Function to clear session
  const logout = async () => {
    try {
      await AsyncStorage.removeItem('session'); // Remove session data
      setSession(null);
    } catch (error) {
      console.error('Error clearing session:', error);
    }
  };

  return (
    <SessionContext.Provider value={{ session, login, logout }}>
      {children}
    </SessionContext.Provider>
  );
};
