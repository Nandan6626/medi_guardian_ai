import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { Colors } from '../../constants/Colors';
import { Typography } from './Typography';
import { BentoMetricCard } from './BentoMetricCard';
import { PieChart, Utensils, Info } from 'lucide-react-native';

export function HeroFeatureCard() {
  return (
    <View style={styles.container}>
      {/* Decorative Blob */}
      <View style={styles.blob} />

      {/* Header section with Icon and Title */}
      <View style={styles.header}>
        <View style={styles.iconHolder}>
          <Text style={styles.emoji}>🥑</Text>
        </View>
        <View style={styles.titleContainer}>
          <Typography variant="label" color={Colors.textMuted}>
            NEXT MEAL
          </Typography>
          <Typography variant="subheading" color={Colors.text}>
            Avocado Mash
          </Typography>
        </View>
      </View>

      {/* Metrics Grid */}
      <View style={styles.metricsGrid}>
        <BentoMetricCard title="PORTION" value="1/2 Cup" icon={PieChart} />
        <View style={{ width: 12 }} />
        <BentoMetricCard title="TEXTURE" value="Mashed" icon={Utensils} />
      </View>

      {/* Alert / Info Box */}
      <View style={styles.infoBox}>
        <Info size={20} color={Colors.primary} style={styles.infoIcon} />
        <Typography variant="body" color={Colors.text} style={styles.infoText}>
          Perfect for practicing fine motor skills. Let them try self-feeding!
        </Typography>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.surface,
    borderRadius: 40,
    padding: 24,
    marginHorizontal: 24,
    marginBottom: 24,
    overflow: 'hidden',
    // Subtle large-spread shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.08,
    shadowRadius: 50,
    elevation: 10,
    position: 'relative',
  },
  blob: {
    position: 'absolute',
    top: -40,
    right: -40,
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: Colors.glassBorder,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  iconHolder: {
    width: 64,
    height: 64,
    borderRadius: 16,
    backgroundColor: Colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  emoji: {
    fontSize: 32,
  },
  titleContainer: {
    marginLeft: 16,
  },
  metricsGrid: {
    flexDirection: 'row',
    marginBottom: 24,
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: Colors.glassBorder,
    borderRadius: 20,
    padding: 16,
    alignItems: 'center',
  },
  infoIcon: {
    marginRight: 12,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
  },
});
