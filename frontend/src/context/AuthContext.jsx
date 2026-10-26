import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '../api/authApi';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('hiresense_token');
      if (token) {
        try {
          const res = await authApi.getMe();
          if (res.success && res.data) {
            setUser(res.data);
            localStorage.setItem('hiresense_user', JSON.stringify(res.data));
          }
        } catch (err) {
          console.error('Failed to restore session:', err);
          localStorage.removeItem('hiresense_token');
          localStorage.removeItem('hiresense_refresh_token');
          localStorage.removeItem('hiresense_user');
          setUser(null);
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (identifier, password) => {
    const res = await authApi.login({ email: identifier, password });
    if (res.success && res.data) {
      const { accessToken, refreshToken, user: userData } = res.data;
      localStorage.setItem('hiresense_token', accessToken);
      localStorage.setItem('hiresense_refresh_token', refreshToken);
      localStorage.setItem('hiresense_user', JSON.stringify(userData));
      setUser(userData);
      return userData;
    }
    throw new Error(res.message || 'Login failed');
  };

  const googleLogin = async (googlePayload) => {
    const res = await authApi.googleAuth(googlePayload);
    if (res.success && res.data) {
      const { accessToken, refreshToken, user: userData } = res.data;
      localStorage.setItem('hiresense_token', accessToken);
      localStorage.setItem('hiresense_refresh_token', refreshToken);
      localStorage.setItem('hiresense_user', JSON.stringify(userData));
      setUser(userData);
      return userData;
    }
    throw new Error(res.message || 'Google authentication failed');
  };

  const phoneSendOtp = async (phoneNumber) => {
    const res = await authApi.sendPhoneOtp(phoneNumber);
    if (res.success) {
      return res.data;
    }
    throw new Error(res.message || 'Failed to send OTP');
  };

  const phoneVerifyLogin = async (verifyPayload) => {
    const res = await authApi.verifyPhoneOtp(verifyPayload);
    if (res.success && res.data) {
      const { accessToken, refreshToken, user: userData } = res.data;
      localStorage.setItem('hiresense_token', accessToken);
      localStorage.setItem('hiresense_refresh_token', refreshToken);
      localStorage.setItem('hiresense_user', JSON.stringify(userData));
      setUser(userData);
      return userData;
    }
    throw new Error(res.message || 'OTP verification failed');
  };

  const register = async (data) => {
    const res = await authApi.register(data);
    if (res.success && res.data) {
      const { accessToken, refreshToken, user: userData } = res.data;
      localStorage.setItem('hiresense_token', accessToken);
      localStorage.setItem('hiresense_refresh_token', refreshToken);
      localStorage.setItem('hiresense_user', JSON.stringify(userData));
      setUser(userData);
      return userData;
    }
    throw new Error(res.message || 'Registration failed');
  };

  const logout = () => {
    localStorage.removeItem('hiresense_token');
    localStorage.removeItem('hiresense_refresh_token');
    localStorage.removeItem('hiresense_user');
    setUser(null);
  };

  const updateUserState = (updatedUser) => {
    setUser((prev) => {
      const merged = { ...prev, ...updatedUser };
      localStorage.setItem('hiresense_user', JSON.stringify(merged));
      return merged;
    });
  };

  const isAuthenticated = !!user;
  const isAdmin = user?.roles?.includes('ROLE_ADMIN');

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated,
        isAdmin,
        login,
        googleLogin,
        phoneSendOtp,
        phoneVerifyLogin,
        register,
        logout,
        updateUserState,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
