import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { BellRing, Activity, AlertTriangle, Pill } from 'lucide-react-native';
import { Colors } from '../../constants/Colors';
import { useAppStore } from '../../store/useAppStore';

export default function NotificationsScreen() {
  const { notifications, markNotificationsRead } = useAppStore();
  return (
    <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Notifications</Text>
          <TouchableOpacity style={styles.markAllRead} onPress={markNotificationsRead}>
            <Text style={styles.markAllReadText}>Mark all as read</Text>
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {notifications.map((notif) => (
            <View key={notif.id} style={[styles.notificationCard, !notif.read && styles.unreadCard]}>
              <View style={[
                styles.iconContainer, 
                notif.type === 'info' && { backgroundColor: 'rgba(0, 209, 255, 0.1)' },
                notif.type === 'success' && { backgroundColor: 'rgba(0, 230, 118, 0.1)' },
                notif.type === 'error' && { backgroundColor: 'rgba(255, 61, 0, 0.1)' }
              ]}>
                {notif.type === 'info' && <Pill size={24} color={Colors.primary} />}
                {notif.type === 'success' && <Activity size={24} color={Colors.success} />}
                {notif.type === 'error' && <AlertTriangle size={24} color={Colors.error} />}
              </View>
              <View style={styles.content}>
                <Text style={styles.notificationTitle}>{notif.title}</Text>
                <Text style={styles.notificationMessage}>{notif.message}</Text>
                <Text style={styles.timeText}>{notif.time}</Text>
              </View>
              {!notif.read && <View style={styles.unreadDot} />}
            </View>
          ))}

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.glassBorder,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: Colors.text,
  },
  markAllRead: {
  },
  markAllReadText: {
    color: Colors.primary,
    fontSize: 14,
    fontWeight: '600',
  },
  scrollContent: {
    padding: 24,
    paddingBottom: 100,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textMuted,
    marginBottom: 16,
    marginTop: 8,
  },
  notificationCard: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    padding: 16,
    borderRadius: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  unreadCard: {
    borderColor: Colors.glassBorder,
    backgroundColor: Colors.surfaceLight,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  content: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 4,
  },
  notificationMessage: {
    fontSize: 14,
    color: Colors.textMuted,
    lineHeight: 20,
    marginBottom: 8,
  },
  timeText: {
    fontSize: 12,
    color: Colors.primary,
    fontWeight: '500',
  },
  unreadDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.primary,
    position: 'absolute',
    top: 16,
    right: 16,
  },
});
