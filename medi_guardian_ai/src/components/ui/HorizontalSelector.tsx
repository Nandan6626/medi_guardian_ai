import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Pressable, Animated } from 'react-native';
import { Colors } from '../../constants/Colors';
import { Typography } from './Typography';
import { Droplet, Activity, Coffee, Moon } from 'lucide-react-native';

const CATEGORIES = [
  { id: '1', icon: Droplet, label: 'Water', value: '0.5L' },
  { id: '2', icon: Activity, label: 'Vitals', value: '98bpm' },
  { id: '3', icon: Coffee, label: 'Diet', value: '450cal' },
  { id: '4', icon: Moon, label: 'Sleep', value: '7h' },
];

export function HorizontalSelector() {
  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        snapToInterval={176} // 160 + 16 padding
        decelerationRate="fast"
      >
        {CATEGORIES.map((cat, index) => {
          const isActive = index === activeIndex;
          const Icon = cat.icon;
          return (
            <Pressable
              key={cat.id}
              style={[
                styles.item,
                isActive ? styles.itemActive : styles.itemInactive,
              ]}
              onPress={() => setActiveIndex(index)}
            >
              {isActive ? (
                <>
                  <View style={styles.activeIconContainer}>
                    <Icon size={20} color={Colors.surface} />
                  </View>
                  <View style={styles.activeTextContainer}>
                    <Typography variant="label" color={Colors.surface} style={{ opacity: 0.8 }}>
                      {cat.label}
                    </Typography>
                    <Typography variant="metric" color={Colors.surface}>
                      {cat.value}
                    </Typography>
                  </View>
                </>
              ) : (
                <Icon size={24} color={Colors.border} />
              )}
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 60,
    marginBottom: 24,
  },
  scrollContent: {
    paddingHorizontal: 24,
    alignItems: 'center',
    gap: 16,
  },
  item: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemInactive: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
  },
  itemActive: {
    flexDirection: 'row',
    width: 160,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.text,
    padding: 8,
    alignItems: 'center',
  },
  activeIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  activeTextContainer: {
    marginLeft: 12,
    justifyContent: 'center',
  },
});
