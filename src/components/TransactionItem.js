import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { COLORS, RADIUS, SPACING, FONT_SIZE } from '../constants/theme';
import { getCat, fmt, fmtShortDate } from '../store/useStore';

export default function TransactionItem({ item, onPress, onDelete }) {
  const cat = getCat(item.categoryId);
  const isIncome = item.type === 'INCOME';

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={[styles.iconWrap, { backgroundColor: cat.color + '18' }]}>
        <Text style={styles.icon}>{cat.icon}</Text>
      </View>

      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={1}>{item.description || 'Bilinmeyen'}</Text>
        <Text style={styles.meta}>{cat.name} · {fmtShortDate(item.date)}</Text>
      </View>

      <View style={styles.right}>
        <Text style={[styles.amount, isIncome ? styles.incomeText : styles.expenseText]}>
          {isIncome ? '+' : '-'}{fmt(item.amount)}
        </Text>
        <View style={[styles.badge, isIncome ? styles.incomeBadge : styles.expenseBadge]}>
          <Text style={[styles.badgeText, isIncome ? styles.incomeText : styles.expenseBadgeText]}>
            {isIncome ? 'Gelir' : 'Gider'}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: RADIUS.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  icon: {
    fontSize: 20,
  },
  info: {
    flex: 1,
    marginRight: SPACING.sm,
  },
  name: {
    fontSize: FONT_SIZE.base,
    fontWeight: '800',
    color: COLORS.text1,
    marginBottom: 2,
  },
  meta: {
    fontSize: FONT_SIZE.xs,
    fontWeight: '600',
    color: COLORS.text3,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  right: {
    alignItems: 'flex-end',
  },
  amount: {
    fontSize: 15,
    fontWeight: '800',
    marginBottom: 4,
  },
  incomeText: {
    color: COLORS.green,
  },
  expenseText: {
    color: COLORS.text1,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: RADIUS.full,
    borderWidth: 1,
  },
  incomeBadge: {
    backgroundColor: '#D2F6F1',
    borderColor: '#A7E8D8',
  },
  expenseBadge: {
    backgroundColor: COLORS.bg,
    borderColor: COLORS.border,
  },
  badgeText: {
    fontSize: 9,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  expenseBadgeText: {
    color: COLORS.text2,
  },
});
