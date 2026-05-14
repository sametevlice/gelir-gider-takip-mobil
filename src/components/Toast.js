import React, { useEffect, useRef } from 'react';
import { View, Text, Animated, StyleSheet } from 'react-native';
import { useStore } from '../store/useStore';
import { COLORS, RADIUS, FONT_SIZE } from '../constants/theme';

export default function Toast() {
  const toastMsg = useStore(state => state.toastMsg);
  const slideAnim = useRef(new Animated.Value(-100)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (toastMsg) {
      Animated.parallel([
        Animated.spring(slideAnim, { toValue: 50, useNativeDriver: true, tension: 80, friction: 10 }),
        Animated.timing(opacityAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
      ]).start();

      const timer = setTimeout(() => {
        Animated.parallel([
          Animated.timing(slideAnim, { toValue: -100, duration: 300, useNativeDriver: true }),
          Animated.timing(opacityAnim, { toValue: 0, duration: 300, useNativeDriver: true }),
        ]).start();
      }, 2500);

      return () => clearTimeout(timer);
    }
  }, [toastMsg]);

  if (!toastMsg) return null;

  const isSuccess = toastMsg.type === 'success';
  const isError = toastMsg.type === 'error';

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [{ translateY: slideAnim }],
          opacity: opacityAnim,
          backgroundColor: isSuccess ? '#D2F6F1' : isError ? '#FEE2E2' : COLORS.pastelIndigo,
          borderColor: isSuccess ? '#A7E8D8' : isError ? '#FECACA' : COLORS.border2,
        },
      ]}
    >
      <Text style={styles.emoji}>{isSuccess ? '✅' : isError ? '❌' : 'ℹ️'}</Text>
      <Text style={[
        styles.text,
        { color: isSuccess ? COLORS.green : isError ? COLORS.red : COLORS.primary },
      ]}>
        {toastMsg.msg}
      </Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 20,
    right: 20,
    zIndex: 9999,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderRadius: RADIUS.xl,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  emoji: {
    fontSize: 16,
    marginRight: 10,
  },
  text: {
    fontSize: FONT_SIZE.md,
    fontWeight: '700',
    flex: 1,
  },
});
