import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, StatusBar } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, RADIUS, SPACING, FONT_SIZE } from '../constants/theme';

export default function WelcomeScreen({ navigation }) {
  return (
    <LinearGradient colors={['#11142D', '#1E2140', '#2C3142']} style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Decorative Orbs */}
      <View style={styles.orbContainer}>
        <View style={[styles.orb, styles.orb1]} />
        <View style={[styles.orb, styles.orb2]} />
        <View style={[styles.orb, styles.orb3]} />
      </View>

      {/* Logo */}
      <View style={styles.logoSection}>
        <View style={styles.logoIcon}>
          <Text style={styles.logoText}>F</Text>
        </View>
        <Text style={styles.brandName}>Fin<Text style={styles.brandAccent}>Tech</Text></Text>
      </View>

      {/* Hero */}
      <View style={styles.heroSection}>
        <Text style={styles.heroTitle}>Finansal{'\n'}Özgürlüğün{'\n'}Başlangıcı</Text>
        <Text style={styles.heroSub}>
          Gelir ve giderlerini akıllıca takip et,{'\n'}bütçeni yönet, hedeflerine ulaş.
        </Text>
      </View>

      {/* Stats */}
      <View style={styles.statsRow}>
        {[
          { value: '50K+', label: 'Kullanıcı' },
          { value: '₺2M+', label: 'Takip Edilen' },
          { value: '4.9★', label: 'Puan' },
        ].map((s, i) => (
          <View key={i} style={styles.statItem}>
            <Text style={styles.statValue}>{s.value}</Text>
            <Text style={styles.statLabel}>{s.label}</Text>
          </View>
        ))}
      </View>

      {/* Buttons */}
      <View style={styles.buttonSection}>
        <TouchableOpacity
          style={styles.primaryBtn}
          activeOpacity={0.85}
          onPress={() => navigation.navigate('Login')}
        >
          <Text style={styles.primaryBtnText}>GİRİŞ YAP</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.secondaryBtn}
          activeOpacity={0.85}
          onPress={() => navigation.navigate('Register')}
        >
          <Text style={styles.secondaryBtnText}>HESAP OLUŞTUR</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.terms}>
        Devam ederek Kullanım Koşullarını kabul etmiş olursun.
      </Text>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 28,
    justifyContent: 'center',
  },
  orbContainer: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
  },
  orb: {
    position: 'absolute',
    borderRadius: 9999,
  },
  orb1: {
    width: 300,
    height: 300,
    backgroundColor: 'rgba(67, 24, 255, 0.15)',
    top: -80,
    right: -60,
    borderRadius: 150,
  },
  orb2: {
    width: 200,
    height: 200,
    backgroundColor: 'rgba(99, 102, 241, 0.1)',
    bottom: 100,
    left: -50,
    borderRadius: 100,
  },
  orb3: {
    width: 150,
    height: 150,
    backgroundColor: 'rgba(16, 185, 129, 0.08)',
    top: '40%',
    right: -30,
    borderRadius: 75,
  },

  logoSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 40,
  },
  logoIcon: {
    width: 48,
    height: 48,
    borderRadius: RADIUS.lg,
    backgroundColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
    shadowColor: '#4318FF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  logoText: {
    fontSize: 22,
    fontWeight: '900',
    color: COLORS.primary,
  },
  brandName: {
    fontSize: 28,
    fontWeight: '800',
    color: COLORS.white,
    letterSpacing: -0.5,
  },
  brandAccent: {
    color: '#818CF8',
  },

  heroSection: {
    marginBottom: 36,
  },
  heroTitle: {
    fontSize: 38,
    fontWeight: '900',
    color: COLORS.white,
    lineHeight: 46,
    letterSpacing: -1,
    marginBottom: 16,
  },
  heroSub: {
    fontSize: 15,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.55)',
    lineHeight: 22,
  },

  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: RADIUS.xxl,
    padding: 20,
    marginBottom: 40,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.white,
    letterSpacing: -0.5,
  },
  statLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.4)',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginTop: 4,
  },

  buttonSection: {
    gap: 12,
    marginBottom: 24,
  },
  primaryBtn: {
    backgroundColor: COLORS.white,
    paddingVertical: 18,
    borderRadius: RADIUS.xl,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 8,
  },
  primaryBtnText: {
    fontSize: FONT_SIZE.md,
    fontWeight: '900',
    color: COLORS.primary,
    letterSpacing: 2,
  },
  secondaryBtn: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    paddingVertical: 18,
    borderRadius: RADIUS.xl,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  secondaryBtnText: {
    fontSize: FONT_SIZE.md,
    fontWeight: '900',
    color: COLORS.white,
    letterSpacing: 2,
  },

  terms: {
    fontSize: 11,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.25)',
    textAlign: 'center',
  },
});
