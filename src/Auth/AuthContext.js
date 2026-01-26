import React, { createContext, useEffect, useState } from "react";
import { getAuth, onAuthStateChanged } from "@react-native-firebase/auth";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  // Added global call state
  const [activeCall, setActiveCall] = useState(null);

  useEffect(() => {
    const auth = getAuth(); 
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  return (
    <AuthContext.Provider value={{ user, setUser, loading, activeCall, setActiveCall }}>
      {children}
    </AuthContext.Provider>
  );
};