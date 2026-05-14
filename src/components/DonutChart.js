import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Path, Circle } from 'react-native-svg';
import { COLORS, FONT_SIZE } from '../constants/theme';
import { fmt } from '../store/useStore';

export default function DonutChart({ data, size = 200, centerLabel, centerValue }) {
  if (!data || data.length === 0) {
    return (
      <View style={[styles.emptyWrap, { width: size, height: size }]}>
        <Text style={styles.emptyIcon}>📊</Text>
        <Text style={styles.emptyText}>VERİ YOK</Text>
      </View>
    );
  }

  const total = data.reduce((s, d) => s + d.value, 0);
  const radius = size * 0.38;
  const innerRadius = size * 0.28;
  const cx = size / 2;
  const cy = size / 2;

  const getPath = (pct, startPct) => {
    const startAngle = (startPct / 100) * 360 - 90;
    const endAngle = ((startPct + pct) / 100) * 360 - 90;
    const x1 = cx + radius * Math.cos((startAngle * Math.PI) / 180);
    const y1 = cy + radius * Math.sin((startAngle * Math.PI) / 180);
    const x2 = cx + radius * Math.cos((endAngle * Math.PI) / 180);
    const y2 = cy + radius * Math.sin((endAngle * Math.PI) / 180);
    const ix1 = cx + innerRadius * Math.cos((endAngle * Math.PI) / 180);
    const iy1 = cy + innerRadius * Math.sin((endAngle * Math.PI) / 180);
    const ix2 = cx + innerRadius * Math.cos((startAngle * Math.PI) / 180);
    const iy2 = cy + innerRadius * Math.sin((startAngle * Math.PI) / 180);
    const largeArc = pct > 50 ? 1 : 0;
    return `M ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} L ${ix1} ${iy1} A ${innerRadius} ${innerRadius} 0 ${largeArc} 0 ${ix2} ${iy2} Z`;
  };

  let currentStart = 0;

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Svg width={size} height={size}>
        {data.map((d, i) => {
          const pct = total > 0 ? (d.value / total) * 100 : 0;
          const path = getPath(pct, currentStart);
          currentStart += pct;
          return (
            <Path key={i} d={path} fill={d.color} stroke={COLORS.white} strokeWidth={3} />
          );
        })}
      </Svg>
      <View style={styles.centerLabel}>
        <Text style={styles.centerValue}>{centerValue || fmt(total)}</Text>
        <Text style={styles.centerText}>{centerLabel || 'TOPLAM'}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerLabel: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerValue: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.text1,
    letterSpacing: -0.5,
  },
  centerText: {
    fontSize: 8,
    fontWeight: '800',
    color: COLORS.text3,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    marginTop: 2,
  },
  emptyWrap: {
    borderRadius: 9999,
    borderWidth: 3,
    borderStyle: 'dashed',
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.bg + '50',
  },
  emptyIcon: {
    fontSize: 28,
    opacity: 0.3,
    marginBottom: 6,
  },
  emptyText: {
    fontSize: 9,
    fontWeight: '800',
    color: COLORS.text3,
    letterSpacing: 1.5,
  },
});
