import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import React, { useEffect } from 'react';
import { AuthProvider, useAuth } from '../context/AuthContext';
import { View, ActivityIndicator } from 'react-native';
import { Slot } from 'expo-router';

function ProtectedRoute() {
  const { user, loading } = useAuth(); // Use loading from AuthContext
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      const inAuthGroup = segments[0] === '(auth)';

      if (!user && !inAuthGroup) {
        // Redirect to login if not authenticated
        router.replace('/login');
      } else if (user && inAuthGroup) {
        // Redirect to home if authenticated and trying to access auth pages
        router.replace('/(tabs)');
      }
    }
  }, [user, segments, loading]);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return <Slot />;
}

export default function RootLayout() {
  useFrameworkReady();

  return (
    <AuthProvider>
      <StatusBar style="auto" />
      <ProtectedRoute />
    </AuthProvider>
  );
}
