import React from 'react';
import { View, StyleSheet, Image } from 'react-native';
import { Colors } from '../../constants/Colors';
import { Typography } from './Typography';

interface HeaderProps {
  greeting?: string;
  name?: string;
  avatarUrl?: string;
  notificationCount?: number;
}

export function Header({
  greeting = 'GOOD MORNING',
  name = 'Sarah',
  avatarUrl = 'https://i.pravatar.cc/150?img=47',
  notificationCount = 2,
}: HeaderProps) {
  return (
    <View style={styles.container}>
      <View style={styles.leftContent}>
        <Typography variant="label" color={Colors.textMuted} style={styles.greeting}>
          {greeting}
        </Typography>
        <Typography variant="heading" color={Colors.text} style={styles.name}>
          {name}
        </Typography>
      </View>

      <View style={styles.avatarContainer}>
        <Image source={{ uri: avatarUrl }} style={styles.avatar} />
        {notificationCount > 0 && (
          <View style={styles.badge}>
            <Typography variant="label" color={Colors.surface} style={styles.badgeText}>
              {notificationCount}
            </Typography>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 56, // As per spec
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  leftContent: {
    flex: 1,
  },
  greeting: {
    marginBottom: 4,
    fontSize: 12,
  },
  name: {
    fontSize: 30,
  },
  avatarContainer: {
    position: 'relative',
    width: 48,
    height: 48,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: Colors.surface,
  },
  badge: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.surface,
  },
  badgeText: {
    fontSize: 8,
    lineHeight: 10,
    marginTop: 1,
  },
});
