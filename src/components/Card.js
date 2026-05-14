import React from 'react';
import { View, StyleSheet } from 'react-native';
import { COLORS, RADIUS, SHADOWS, SPACING } from '../constants/theme';

export default function Card({ children, style, variant = 'default' }) {
  return (
    <View style={[
      styles.card,
      variant === 'flat' && styles.flat,
      SHADOWS.sm,
      style,
    ]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.xxxl,
    padding: SPACING.xxl,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  flat: {
    borderWidth: 0,
    ...SHADOWS.sm,
  },
});
