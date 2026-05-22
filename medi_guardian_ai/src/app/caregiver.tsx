import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Colors } from '../constants/Colors';
import { useAppStore } from '../store/useAppStore';
import { LinearGradient } from 'expo-linear-gradient';
import { HeartPulse, Phone, MessageSquare, MapPin, AlertTriangle, CheckCircle, Activity, Clock, ChevronLeft, Bell } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

export default function CaregiverScreen() {
  const router = useRouter();
  const { lovedOnes, activityFeed } = useAppStore();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return Colors.success;
      case 'warning': return Colors.warning;
      case 'offline': return Colors.textMuted;
      default: return Colors.success;
    }
  };

  const getFeedIcon = (type: string) => {
    switch (type) {
      case 'warning': return <AlertTriangle size={18} color={Colors.warning} />;
      case 'success': return <CheckCircle size={18} color={Colors.success} />;
      case 'vitals': return <Activity size={18} color={Colors.primary} />;
      case 'info': return <Clock size={18} color={Colors.secondary} />;
      default: return <Clock size={18} color={Colors.textMuted} />;
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ChevronLeft size={24} color={Colors.text} />
        </TouchableOpacity>
        
        <View style={styles.headerTitles}>
          <View style={styles.consoleLabel}>
            <HeartPulse size={12} color={Colors.primary} style={{ marginRight: 6 }} />
            <Text style={styles.consoleLabelText}>CAREGIVER CONSOLE</Text>
          </View>
          <Text style={styles.mainTitle}>
            {lovedOnes.length} loved ones, <Text style={styles.mainTitleHighlight}>in real time</Text>
          </Text>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        {/* Horizontal Scroll for Loved Ones */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false} 
          contentContainerStyle={styles.lovedOnesScroll}
        >
          {lovedOnes.map((person) => (
            <View key={person.id} style={styles.personCard}>
              <View style={styles.personHeader}>
                <LinearGradient
                  colors={person.avatarColors}
                  start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                  style={styles.avatar}
                >
                  <Text style={styles.avatarText}>{person.avatarInitials}</Text>
                </LinearGradient>
                <View style={styles.personInfo}>
                  <Text style={styles.personName}>{person.name}</Text>
                  <Text style={styles.personSub}>{person.relation} • {person.age}y</Text>
                </View>
                <View style={[styles.statusDot, { backgroundColor: getStatusColor(person.status) }]} />
              </View>

              <View style={styles.adherenceSection}>
                <View style={styles.adherenceRow}>
                  <Text style={styles.adherenceLabel}>Adherence</Text>
                  <Text style={styles.adherenceValue}>{person.adherence}%</Text>
                </View>
                <View style={styles.progressBarBg}>
                  <LinearGradient
                    colors={person.avatarColors}
                    start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                    style={[styles.progressBarFill, { width: `${person.adherence}%` }]}
                  />
                </View>
              </View>

              <View style={styles.statsRow}>
                <View style={styles.statBox}>
                  <Text style={styles.statValue}>{person.risk}</Text>
                  <Text style={styles.statLabel}>RISK</Text>
                </View>
                <View style={styles.statBox}>
                  <Text style={styles.statValue}>{person.lastSeen}</Text>
                  <Text style={styles.statLabel}>LAST SEEN</Text>
                </View>
              </View>

              <View style={styles.actionsRow}>
                <TouchableOpacity style={styles.actionBtn}>
                  <Phone size={16} color={Colors.textMuted} />
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionBtn}>
                  <MessageSquare size={16} color={Colors.textMuted} />
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionBtn}>
                  <MapPin size={16} color={Colors.textMuted} />
                </TouchableOpacity>
              </View>
              
              <TouchableOpacity style={styles.reminderBtn}>
                <Bell size={16} color={Colors.text} style={{ marginRight: 6 }} />
                <Text style={styles.reminderBtnText}>Adaptive Reminder</Text>
              </TouchableOpacity>
            </View>
          ))}
        </ScrollView>

        {/* Live Activity Feed */}
        <View style={styles.feedSection}>
          <View style={styles.feedHeader}>
            <Text style={styles.feedTitle}>Live activity feed</Text>
            <View style={styles.streamingIndicator}>
              <View style={styles.streamingDot} />
              <Text style={styles.streamingText}>Streaming</Text>
            </View>
          </View>

          <View style={styles.feedList}>
            {activityFeed.map((item, index) => (
              <View 
                key={item.id} 
                style={[
                  styles.feedItem, 
                  index === activityFeed.length - 1 && { borderBottomWidth: 0 }
                ]}
              >
                <Text style={styles.feedTime}>{item.time}</Text>
                <View style={styles.feedIconWrapper}>
                  {getFeedIcon(item.type)}
                </View>
                <View style={styles.feedContent}>
                  <Text style={styles.feedItemTitle}>{item.title}</Text>
                  <Text style={styles.feedItemSub}>{item.patientName}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

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
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
    alignItems: 'flex-start',
  },
  backButton: {
    paddingRight: 16,
    paddingTop: 4,
  },
  headerTitles: {
    flex: 1,
  },
  consoleLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  consoleLabelText: {
    color: Colors.primary,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 2,
  },
  mainTitle: {
    fontSize: 26,
    fontWeight: '700',
    color: Colors.text,
  },
  mainTitleHighlight: {
    color: '#8b9bb4', // Soft purple/gray
  },
  scrollContent: {
    paddingBottom: 40,
  },
  lovedOnesScroll: {
    paddingHorizontal: 20,
    gap: 16,
  },
  personCard: {
    width: 280,
    backgroundColor: Colors.surface,
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
  },
  personHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: Colors.background,
    fontWeight: '800',
    fontSize: 16,
  },
  personInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  personName: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 4,
  },
  personSub: {
    fontSize: 12,
    color: Colors.textMuted,
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginTop: 6,
  },
  adherenceSection: {
    marginBottom: 20,
  },
  adherenceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  adherenceLabel: {
    fontSize: 12,
    color: Colors.textMuted,
  },
  adherenceValue: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.text,
  },
  progressBarBg: {
    height: 6,
    backgroundColor: Colors.surfaceLight,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  statBox: {
    flex: 1,
    backgroundColor: Colors.surfaceLight,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 10,
    color: Colors.textMuted,
    letterSpacing: 1,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  actionBtn: {
    flex: 1,
    backgroundColor: Colors.surfaceLight,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  reminderBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 12,
  },
  reminderBtnText: {
    color: Colors.text,
    fontSize: 14,
    fontWeight: '600',
  },
  feedSection: {
    marginTop: 32,
    paddingHorizontal: 20,
  },
  feedHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  feedTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
  },
  streamingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  streamingDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.success,
    marginRight: 6,
  },
  streamingText: {
    fontSize: 12,
    color: Colors.textMuted,
  },
  feedList: {
    backgroundColor: Colors.surface,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
    overflow: 'hidden',
  },
  feedItem: {
    flexDirection: 'row',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.glassBorder,
    alignItems: 'center',
  },
  feedTime: {
    fontSize: 12,
    color: Colors.textMuted,
    width: 45,
  },
  feedIconWrapper: {
    width: 32,
    alignItems: 'center',
    marginRight: 12,
  },
  feedContent: {
    flex: 1,
  },
  feedItemTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 4,
  },
  feedItemSub: {
    fontSize: 12,
    color: Colors.textMuted,
  },
});
