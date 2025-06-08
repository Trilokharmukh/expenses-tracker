import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { User } from '../types';
// import * as WebBrowser from 'expo-web-browser';
// import * as Google from 'expo-auth-session/providers/google';

axios.defaults.baseURL = 'https://expenses-tracker-km9q.onrender.com';

export interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  // loginWithGoogle: () => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Configure Google OAuth
  // const [request, response, promptAsync] = Google.useAuthRequest({
  //   expoClientId: process.env.EXPO_GOOGLE_CLIENT_ID,
  //   iosClientId: process.env.IOS_GOOGLE_CLIENT_ID,
  //   androidClientId: process.env.ANDROID_GOOGLE_CLIENT_ID,
  //   webClientId: process.env.WEB_GOOGLE_CLIENT_ID,
  // });

  useEffect(() => {
    loadStoredAuth();
  }, []);

  // useEffect(() => {
  //   if (response?.type === 'success') {
  //     const { authentication } = response;
  //     handleGoogleSignIn(authentication?.accessToken);
  //   }
  // }, [response]);

  const loadStoredAuth = async () => {
    try {
      const storedUser = await AsyncStorage.getItem('user');
      const storedToken = await AsyncStorage.getItem('token');

      if (storedUser && storedToken) {
        setUser(JSON.parse(storedUser));
        setToken(storedToken);
        axios.defaults.headers.common[
          'Authorization'
        ] = `Bearer ${storedToken}`;
      }
    } catch (error) {
      console.error('Error loading auth data:', error);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const response = await axios.post('/api/auth/login', { email, password });
      const { user: userData, token: authToken } = response.data;

      await AsyncStorage.setItem('user', JSON.stringify(userData));
      await AsyncStorage.setItem('token', authToken);

      setUser(userData);
      setToken(authToken);
      axios.defaults.headers.common['Authorization'] = `Bearer ${authToken}`;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  // const loginWithGoogle = async () => {
  //   try {
  //     await promptAsync();
  //   } catch (error) {
  //     console.error('Error during Google sign in:', error);
  //     throw error;
  //   }
  // };

  // const handleGoogleSignIn = async (accessToken: string | undefined) => {
  //   if (!accessToken) return;

  //   try {
  //     const response = await axios.post('/api/auth/google', {
  //       accessToken,
  //     });
  //     const { token: authToken, user: userData } = response.data;

  //     await AsyncStorage.setItem('user', JSON.stringify(userData));
  //     await AsyncStorage.setItem('token', authToken);

  //     setUser(userData);
  //     setToken(authToken);
  //     axios.defaults.headers.common['Authorization'] = `Bearer ${authToken}`;
  //   } catch (error) {
  //     console.error('Error during Google sign in:', error);
  //     throw error;
  //   }
  // };

  const register = async (name: string, email: string, password: string) => {
    try {
      const response = await axios.post('/api/auth/register', {
        name,
        email,
        password,
      });
      const { user: userData, token: authToken } = response.data;

      await AsyncStorage.setItem('user', JSON.stringify(userData));
      await AsyncStorage.setItem('token', authToken);

      setUser(userData);
      setToken(authToken);
      axios.defaults.headers.common['Authorization'] = `Bearer ${authToken}`;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await AsyncStorage.removeItem('user');
      await AsyncStorage.removeItem('token');

      setUser(null);
      setToken(null);
      delete axios.defaults.headers.common['Authorization'];
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  };

  const resetPassword = async (email: string) => {
    try {
      await axios.post('/api/auth/reset-password', { email });
    } catch (error) {
      console.error('Reset password error:', error);
      throw error;
    }
  };

  const value = {
    user,
    token,
    loading,
    login,
    // loginWithGoogle,
    register,
    logout,
    resetPassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
