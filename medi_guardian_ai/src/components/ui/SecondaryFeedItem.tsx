import React, { useState } from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { Colors } from '../../constants/Colors';
import { Typography } from './Typography';
import { Check, LucideIcon } from 'lucide-react-native';

interface SecondaryFeedItemProps {
  title: string;
  subtitle: string;
  icon: LucideIcon;
  iconColor: string;
}

export function SecondaryFeedItem({ title, subtitle, icon: Icon, iconColor }: SecondaryFeedItemProps) {
  const [isChecked, setIsChecked] = useState(false);
  const [isPressed, setIsPressed] = useState(false);

  return (
    <View style={styles.container}>
      {/* Icon Container */}
      <View style={[styles.iconContainer, { backgroundColor: `${iconColor}20` }]}>
        <Icon size={24} color={iconColor} />
      </View>

      {/* Text Content */}
      <View style={styles.textContainer}>
        <Typography variant="body" style={styles.title}>
          {title}
        </Typography>
        <Typography variant="label" color={Colors.textMuted}>
          {subtitle}
        </Typography>
      </View>

      {/* Trailing Checkbox */}
      <Pressable
        onPressIn={() => setIsPressed(true)}
        onPressOut={() => setIsPressed(false)}
        onPress={() => setIsChecked(!isChecked)}
        style={[
          styles.checkbox,
          (isChecked || isPressed) && styles.checkboxActive,
        ]}
      >
        {(isChecked || isPressed) && <Check size={20} color={Colors.surface} />}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 24,
    padding: 16,
    marginHorizontal: 24,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textContainer: {
    flex: 1,
    marginLeft: 16,
    marginRight: 16,
  },
  title: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 18,
    marginBottom: 4,
    color: Colors.text,
  },
  checkbox: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: Colors.border,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.surface,
  },
  checkboxActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
});
