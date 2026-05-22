import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { Colors } from '../constants/Colors';
import { useAppStore } from '../store/useAppStore';
import { useReminders } from '../hooks/useReminders';
import { 
  useFonts, 
  Nunito_400Regular, 
  Nunito_700Bold, 
  Nunito_900Black 
} from '@expo-google-fonts/nunito';
import * as SplashScreen from 'expo-splash-screen';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const router = useRouter();
  const segments = useSegments();
  const { isAuthLoading, firebaseUser, user, initAuthListener } = useAppStore();

  const [fontsLoaded, fontError] = useFonts({
    Nunito_400Regular,
    Nunito_700Bold,
    Nunito_900Black,
  });

  // Initialize and sync push notifications
  useReminders();

  useEffect(() => {
    // Initialize Firebase Auth Listener exactly once
    initAuthListener();
  }, []);

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  useEffect(() => {
    if (isAuthLoading) return;
    
    const inAuthGroup = segments[0] === '(auth)' || segments[0] === 'index';
    const isAuthenticated = !!firebaseUser || !!user;
    
    if (!isAuthenticated && !inAuthGroup) {
      // Redirect to login if user is not authenticated
      router.replace('/(auth)/login');
    } else if (isAuthenticated && inAuthGroup) {
      // Redirect away from login if user is authenticated
      router.replace('/(tabs)');
    }
  }, [firebaseUser, user, isAuthLoading, segments]);

  if (isAuthLoading || (!fontsLoaded && !fontError)) {
    return (
      <View style={{ flex: 1, backgroundColor: Colors.background, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: Colors.background }}>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: Colors.background },
          animation: 'fade',
        }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(tabs)" />
      </Stack>
    </View>
  );
}
