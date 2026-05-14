import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, RADIUS, FONT_SIZE } from '../constants/theme';
import { getCat, fmt } from '../store/useStore';

export default function BudgetBar({ catId, spent, limit }) {
  const cat = getCat(catId);
  const pct = limit > 0 ? Math.min((spent / limit) * 100, 100) : 0;
  const isDanger = pct >= 90;
  const isWarning = pct >= 70 && pct < 90;
  const barColor = isDanger ? COLORS.red : isWarning ? COLORS.orange : COLORS.indigo;
  const textColor = isDanger ? COLORS.red : isWarning ? COLORS.orange : COLORS.text1;

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <View style={styles.catInfo}>
          <View style={[styles.iconWrap, { backgroundColor: cat.color + '18' }]}>
            <Text style={styles.icon}>{cat.icon}</Text>
          </View>
          <Text style={styles.catName}>{cat.name}</Text>
        </View>
        <View style={styles.amounts}>
          <Text style={[styles.spent, { color: textColor }]}>{fmt(spent)}</Text>
          <Text style={styles.separator}> / </Text>
          <Text style={styles.limit}>{fmt(limit)}</Text>
        </View>
      </View>
      <View style={styles.barWrap}>
        <View style={[styles.barFill, { width: `${pct}%`, backgroundColor: barColor }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 18,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  catInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconWrap: {
    width: 30,
    height: 30,
    borderRadius: RADIUS.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    fontSize: 14,
  },
  catName: {
    fontSize: FONT_SIZE.md,
    fontWeight: '800',
    color: COLORS.text1,
  },
  amounts: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  spent: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '800',
  },
  separator: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.text3,
  },
  limit: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '600',
    color: COLORS.text3,
  },
  barWrap: {
    height: 8,
    backgroundColor: COLORS.bg,
    borderRadius: 4,
    overflow: 'hidden',
    borderWidth: 0.5,
    borderColor: COLORS.border,
  },
  barFill: {
    height: '100%',
    borderRadius: 4,
  },
});
