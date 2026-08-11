import React, { createContext, useContext, useState, useEffect } from "react";
import { 
  loginWithEmail, 
  registerWithEmail, 
  loginWithGoogle, 
  logoutUser, 
  subscribeToAuth 
} from "../firebase/auth";
import { verifyUserIdentity } from "../firebase/firestore";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const unsubscribe = subscribeToAuth((user) => {
      setCurrentUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (email, password) => {
    setError(null);
    try {
      const user = await loginWithEmail(email, password);
      setCurrentUser(user);
      return user;
    } catch (err) {
      setError(err.message || "Failed to log in.");
      throw err;
    }
  };

  const register = async (email, password, additionalInfo) => {
    setError(null);
    try {
      const user = await registerWithEmail(email, password, additionalInfo);
      setCurrentUser(user);
      return user;
    } catch (err) {
      setError(err.message || "Failed to register.");
      throw err;
    }
  };

  const signInWithGoogle = async () => {
    setError(null);
    try {
      const user = await loginWithGoogle();
      setCurrentUser(user);
      return user;
    } catch (err) {
      setError(err.message || "Failed Google login.");
      throw err;
    }
  };

  const logout = async () => {
    setError(null);
    try {
      await logoutUser();
      setCurrentUser(null);
    } catch (err) {
      setError(err.message || "Failed to sign out.");
      throw err;
    }
  };

  const verifyIdentity = async (aadhaarNumber) => {
    if (!currentUser) throw new Error("Authentication required.");
    try {
      await verifyUserIdentity(currentUser.uid, aadhaarNumber);
      
      // Update local state instance
      setCurrentUser(prev => ({
        ...prev,
        isVerified: true,
        identityVerification: {
          status: "verified",
          verifiedAt: new Date().toISOString(),
          providerReference: `aadhaar-verified-${aadhaarNumber.substr(-4)}`
        }
      }));
    } catch (err) {
      throw new Error(err.message || "Failed to verify identity.");
    }
  };

  const value = {
    currentUser,
    loading,
    error,
    login,
    register,
    signInWithGoogle,
    logout,
    verifyIdentity
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuthContext = () => useContext(AuthContext);
