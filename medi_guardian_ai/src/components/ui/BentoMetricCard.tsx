import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Colors } from '../../constants/Colors';
import { Typography } from './Typography';
import { LucideIcon } from 'lucide-react-native';

interface BentoMetricCardProps {
  title: string;
  value: string;
  icon: LucideIcon;
}

export function BentoMetricCard({ title, value, icon: Icon }: BentoMetricCardProps) {
  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        <Icon size={16} color={Colors.primary} />
      </View>
      <View style={styles.textContainer}>
        <Typography variant="label" color={Colors.textMuted}>
          {title}
        </Typography>
        <Typography variant="metric" color={Colors.text}>
          {value}
        </Typography>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 16,
    padding: 12,
    // Note: backdrop-filter is not fully supported in pure RN without expo-blur, 
    // but rgba background gives a similar effect.
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.shadowRed,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
});
