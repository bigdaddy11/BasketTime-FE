import React, { createContext, useState } from 'react';

// Create a Context for the session
export const SessionContext = createContext();

// Create a Provider component
export const SessionProvider = ({ children }) => {
  const [session, setSession] = useState(null);

  // Function to manually set session
  const login = (user) => {
    setSession(user);
  };

  // Function to clear session
  const logout = () => {
    setSession(null);
  };

  return (
    <SessionContext.Provider value={{ session, login, logout }}>
      {children}
    </SessionContext.Provider>
  );
};
