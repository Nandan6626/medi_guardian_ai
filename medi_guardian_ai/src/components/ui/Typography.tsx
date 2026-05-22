import React from 'react';
import { Text, TextProps, StyleSheet } from 'react-native';
import { Colors } from '../../constants/Colors';

interface TypographyProps extends TextProps {
  variant?: 'heading' | 'subheading' | 'label' | 'body' | 'metric';
  color?: string;
  align?: 'left' | 'center' | 'right';
}

export function Typography({
  variant = 'body',
  color = Colors.text,
  align = 'left',
  style,
  ...props
}: TypographyProps) {
  return (
    <Text
      style={[
        styles.base,
        styles[variant],
        { color, textAlign: align },
        style,
      ]}
      {...props}
    />
  );
}

const styles = StyleSheet.create({
  base: {
    fontFamily: 'Nunito_400Regular',
  },
  heading: {
    fontFamily: 'Nunito_900Black',
    fontSize: 32,
    lineHeight: 40,
  },
  subheading: {
    fontFamily: 'Nunito_900Black',
    fontSize: 20,
    lineHeight: 28,
  },
  label: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 10,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  metric: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 14,
  },
  body: {
    fontFamily: 'Nunito_400Regular',
    fontSize: 16,
    lineHeight: 24,
  },
});
