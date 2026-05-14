import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { COLORS, FONT_SIZE } from '../constants/theme';

export default function HealthGauge({ score = 0, size = 160 }) {
  const normalizedScore = Math.max(0, Math.min(100, score));

  let scoreColor = '#05CD99';
  let scoreText = 'Harika';
  let scoreBg = '#D2F6F1';
  let scoreTextColor = '#059669';

  if (normalizedScore < 40) {
    scoreColor = '#E02424';
    scoreText = 'Kritik';
    scoreBg = '#FEE2E2';
    scoreTextColor = '#DC2626';
  } else if (normalizedScore < 70) {
    scoreColor = '#F97316';
    scoreText = 'Uyarı';
    scoreBg = '#FFF7ED';
    scoreTextColor = '#EA580C';
  } else if (normalizedScore < 85) {
    scoreColor = '#3B82F6';
    scoreText = 'İyi';
    scoreBg = '#EFF6FF';
    scoreTextColor = '#2563EB';
  }

  const halfWidth = size / 2;
  const strokeW = size * 0.07;
  const radius = halfWidth - strokeW;
  const circumference = Math.PI * radius;
  const dashOffset = circumference * (1 - normalizedScore / 100);

  // Arc path for half circle
  const startX = strokeW;
  const startY = halfWidth;
  const endX = size - strokeW;
  const endY = halfWidth;

  const bgPath = `M ${startX} ${startY} A ${radius} ${radius} 0 0 1 ${endX} ${endY}`;
  const fgPath = bgPath;

  return (
    <View style={[styles.container, { width: size, height: halfWidth + 20 }]}>
      <Svg width={size} height={halfWidth + 10}>
        {/* Background arc */}
        <Path
          d={bgPath}
          fill="none"
          stroke={COLORS.pastelIndigo}
          strokeWidth={strokeW}
          strokeLinecap="round"
        />
        {/* Foreground arc */}
        <Path
          d={fgPath}
          fill="none"
          stroke={scoreColor}
          strokeWidth={strokeW}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
        />
      </Svg>

      <View style={styles.scoreWrap}>
        <Text style={styles.scoreNumber}>{normalizedScore}</Text>
        <Text style={styles.scoreLabel}>SKOR</Text>
      </View>

      <View style={[styles.badge, { backgroundColor: scoreBg }]}>
        <Text style={[styles.badgeText, { color: scoreTextColor }]}>{scoreText}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  scoreWrap: {
    position: 'absolute',
    bottom: 30,
    alignItems: 'center',
  },
  scoreNumber: {
    fontSize: 32,
    fontWeight: '800',
    color: COLORS.text1,
    letterSpacing: -1,
  },
  scoreLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: COLORS.text3,
    letterSpacing: 2,
    marginTop: 2,
  },
  badge: {
    paddingHorizontal: 14,
    paddingVertical: 5,
    borderRadius: 9999,
    position: 'absolute',
    bottom: 0,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
});
