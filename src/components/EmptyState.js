import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, FONT_SIZE } from '../constants/theme';

export default function EmptyState({ icon = '📂', title = 'Veri Bulunamadı', message = '' }) {
  return (
    <View style={styles.container}>
      <Text style={styles.icon}>{icon}</Text>
      <Text style={styles.title}>{title}</Text>
      {message ? <Text style={styles.message}>{message}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 50,
    paddingHorizontal: 30,
  },
  icon: {
    fontSize: 42,
    marginBottom: 14,
    opacity: 0.4,
  },
  title: {
    fontSize: FONT_SIZE.base,
    fontWeight: '800',
    color: COLORS.text2,
    marginBottom: 6,
    textAlign: 'center',
  },
  message: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '600',
    color: COLORS.text3,
    textAlign: 'center',
    lineHeight: 18,
  },
});
