import { Tabs } from 'expo-router';
import { Home, Scan, Bell, User, Bot } from 'lucide-react-native';
import React from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { Colors } from '../../constants/Colors';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: Colors.surface,
        tabBarInactiveTintColor: Colors.border,
        tabBarShowLabel: false,
      }}>
      <Tabs.Screen
        name="index"
        options={{
          tabBarIcon: ({ color }) => (
            <View style={styles.iconTouchTarget}>
              <Home size={24} color={color} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="notifications"
        options={{
          tabBarIcon: ({ color }) => (
            <View style={styles.iconTouchTarget}>
              <Bell size={24} color={color} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="scanner"
        options={{
          tabBarIcon: () => (
            <View style={styles.scanButtonContainer}>
              <View style={styles.scanButton}>
                <Scan size={24} color={Colors.surface} />
              </View>
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="chatbot"
        options={{
          tabBarIcon: ({ color }) => (
            <View style={styles.iconTouchTarget}>
              <Bot size={24} color={color} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          tabBarIcon: ({ color }) => (
            <View style={styles.iconTouchTarget}>
              <User size={24} color={color} />
            </View>
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: Colors.text, // Charcoal #171e19
    height: 64,
    borderRadius: 32,
    position: 'absolute',
    bottom: 8,
    left: 16,
    right: 16,
    borderTopWidth: 0,
    elevation: 0,
    paddingBottom: 0,
    paddingTop: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
  },
  iconTouchTarget: {
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanButtonContainer: {
    width: 56,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: -32, // Offset vertically by half its height
  },
  scanButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.primary, // Red #ca0013
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: Colors.background, // Off-white #eeebe3
    shadowColor: Colors.shadowRed,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 16,
    elevation: 8,
  },
});
