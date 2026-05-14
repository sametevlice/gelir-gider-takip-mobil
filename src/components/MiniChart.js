import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Rect } from 'react-native-svg';
import { COLORS, FONT_SIZE } from '../constants/theme';

// Segmented bar chart (Dashboard gelir grafiği — web'deki SegmentedBar'ın mobil versiyonu)
export default function MiniChart({ data, height = 140, barWidth = 28 }) {
  if (!data || data.length === 0) return null;

  const maxVal = Math.max(...data.map(d => d.amount), 1);
  const chartWidth = data.length * (barWidth + 14);
  const segmentH = 5;
  const gap = 2.5;

  return (
    <View style={[styles.container, { height }]}>
      <View style={styles.chartRow}>
        {data.map((item, idx) => {
          const barH = Math.max(6, (item.amount / maxVal) * (height - 30));
          const segCount = Math.floor(barH / (segmentH + gap));

          return (
            <View key={idx} style={styles.barCol}>
              <View style={[styles.barContainer, { height: height - 30 }]}>
                <Svg width={barWidth} height={barH} style={{ position: 'absolute', bottom: 0 }}>
                  {Array.from({ length: segCount }).map((_, i) => {
                    const ratio = segCount > 1 ? i / (segCount - 1) : 0;
                    const hue = 200 + 30 * ratio;
                    const light = 60 - 20 * ratio;
                    return (
                      <Rect
                        key={i}
                        x={0}
                        y={i * (segmentH + gap)}
                        width={barWidth}
                        height={segmentH}
                        rx={2.5}
                        fill={`hsl(${hue}, 95%, ${light}%)`}
                      />
                    );
                  })}
                </Svg>
              </View>
              <Text style={styles.label}>{item.label}</Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  chartRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    flex: 1,
  },
  barCol: {
    alignItems: 'center',
  },
  barContainer: {
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  label: {
    fontSize: 9,
    fontWeight: '700',
    color: COLORS.text3,
    marginTop: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
});
