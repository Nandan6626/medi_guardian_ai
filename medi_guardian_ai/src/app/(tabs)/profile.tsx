import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { User, Settings, Shield, Link2, LogOut, ChevronRight } from 'lucide-react-native';
import { Colors } from '../../constants/Colors';
import { useRouter } from 'expo-router';
import { useAppStore } from '../../store/useAppStore';

export default function ProfileScreen() {
  const router = useRouter();
  const { user, logout } = useAppStore();

  const handleLogout = () => {
    logout();
    router.replace('/(auth)/login');
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Profile</Text>
        <TouchableOpacity>
          <Settings size={24} color={Colors.text} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        <View style={styles.profileCard}>
          <View style={styles.avatarContainer}>
            <User size={40} color={Colors.background} />
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.name}>{user?.name || 'User'}</Text>
            <Text style={styles.patientId}>ID: {user?.patientId || '#MG-XXXXX'}</Text>
          </View>
          <TouchableOpacity style={styles.editBtn}>
            <Text style={styles.editBtnText}>Edit</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.statsContainer}>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{user?.adherenceScore || 0}%</Text>
            <Text style={styles.statLabel}>Adherence</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{user?.daysActive || 0}</Text>
            <Text style={styles.statLabel}>Days Active</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{user?.caregivers || 0}</Text>
            <Text style={styles.statLabel}>Caregivers</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Preferences</Text>

        <View style={styles.menuContainer}>
          <TouchableOpacity style={styles.menuItem}>
            <View style={[styles.menuIcon, { backgroundColor: 'rgba(0, 209, 255, 0.1)' }]}>
              <Shield size={22} color={Colors.primary} />
            </View>
            <Text style={styles.menuText}>Privacy & Security</Text>
            <ChevronRight size={20} color={Colors.textMuted} />
          </TouchableOpacity>
        </View>

        <TouchableOpacity 
          style={styles.caregiverBtn} 
          onPress={() => router.push('/caregiver')}
        >
          <View style={styles.caregiverBtnContent}>
            <Link2 size={24} color={Colors.secondary} />
            <Text style={styles.caregiverBtnText}>Caregiver Console</Text>
          </View>
          <ChevronRight size={20} color={Colors.textMuted} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <LogOut size={20} color={Colors.error} />
          <Text style={styles.logoutText}>End Session</Text>
        </TouchableOpacity>

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
    alignItems: 'center',
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
  scrollContent: {
    padding: 24,
    paddingBottom: 100,
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    padding: 20,
    borderRadius: 24,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  avatarContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  profileInfo: {
    flex: 1,
  },
  name: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 4,
  },
  patientId: {
    fontSize: 14,
    color: Colors.textMuted,
  },
  editBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: Colors.surfaceLight,
  },
  editBtnText: {
    color: Colors.text,
    fontWeight: '600',
    fontSize: 14,
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderRadius: 24,
    padding: 20,
    marginBottom: 32,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '800',
    color: Colors.primary,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.textMuted,
  },
  statDivider: {
    width: 1,
    backgroundColor: Colors.glassBorder,
    marginHorizontal: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 16,
  },
  menuContainer: {
    backgroundColor: Colors.surface,
    borderRadius: 24,
    padding: 8,
    marginBottom: 32,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 16,
  },
  menuIcon: {
    width: 44,
    height: 44,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  menuText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 61, 0, 0.1)',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 61, 0, 0.2)',
  },
  logoutText: {
    color: Colors.error,
    fontSize: 16,
    fontWeight: '700',
    marginLeft: 12,
  },
  caregiverBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(157, 0, 255, 0.1)',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(157, 0, 255, 0.2)',
    marginBottom: 16,
  },
  caregiverBtnContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  caregiverBtnText: {
    color: Colors.text,
    fontSize: 16,
    fontWeight: '700',
    marginLeft: 12,
  },
});
