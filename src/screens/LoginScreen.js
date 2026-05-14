import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, StatusBar, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { COLORS, RADIUS, SPACING, FONT_SIZE } from '../constants/theme';
import { useStore } from '../store/useStore';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const login = useStore(state => state.login);
  const showToast = useStore(state => state.showToast);
  const isLoading = useStore(state => state.isLoading);

  const handleLogin = async () => {
    if (!email.trim() || password.length < 6) {
      return showToast('Lütfen geçerli bilgiler girin', 'error');
    }
    const result = await login(email, password);
    if (result.success) {
      showToast('Giriş başarılı!', 'success');
    } else {
      showToast(result.error || 'Giriş yapılamadı', 'error');
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <StatusBar barStyle="dark-content" />
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">

        {/* Back Button */}
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>

        {/* Header */}
        <View style={styles.header}>
          <View style={styles.logoIcon}>
            <Text style={styles.logoText}>F</Text>
          </View>
          <Text style={styles.title}>Tekrar Hoş Geldin</Text>
          <Text style={styles.subtitle}>Finansal kontrolünü eline al ve büyümeye başla.</Text>
        </View>

        {/* Form */}
        <View style={styles.form}>
          <View style={styles.field}>
            <Text style={styles.label}>E-POSTA ADRESİ</Text>
            <TextInput
              style={styles.input}
              placeholder="ornek@email.com"
              placeholderTextColor={COLORS.text3}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          <View style={styles.field}>
            <View style={styles.labelRow}>
              <Text style={styles.label}>ŞİFRE</Text>
              <TouchableOpacity>
                <Text style={styles.forgotText}>ŞİFREMİ UNUTTUM</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.passWrap}>
              <TextInput
                style={[styles.input, { paddingRight: 50 }]}
                placeholder="••••••••"
                placeholderTextColor={COLORS.text3}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPass}
              />
              <TouchableOpacity style={styles.eyeBtn} onPress={() => setShowPass(!showPass)}>
                <Text style={styles.eyeIcon}>{showPass ? '🙈' : '👁️'}</Text>
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity
            style={[styles.submitBtn, isLoading && styles.submitBtnDisabled]}
            onPress={handleLogin}
            disabled={isLoading}
            activeOpacity={0.85}
          >
            <Text style={styles.submitBtnText}>
              {isLoading ? 'Lütfen Bekleyin...' : 'GİRİŞ YAP →'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Divider */}
        <View style={styles.divider}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>YA DA</Text>
          <View style={styles.dividerLine} />
        </View>

        {/* Social Buttons */}
        <View style={styles.socialRow}>
          <TouchableOpacity style={styles.socialBtn}>
            <Text style={styles.socialIcon}>G</Text>
            <Text style={styles.socialLabel}>GOOGLE</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.socialBtn, styles.socialBtnDark]}>
            <Text style={[styles.socialIcon, { color: COLORS.white }]}>⌘</Text>
            <Text style={[styles.socialLabel, { color: COLORS.white }]}>APPLE</Text>
          </TouchableOpacity>
        </View>

        {/* Switch */}
        <View style={styles.switchRow}>
          <Text style={styles.switchText}>Henüz hesabın yok mu? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Register')}>
            <Text style={styles.switchLink}>Hemen Kayıt Ol</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  scroll: {
    flexGrow: 1,
    paddingHorizontal: 28,
    paddingTop: 60,
    paddingBottom: 40,
    justifyContent: 'center',
  },
  backBtn: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.white,
  },
  backIcon: {
    fontSize: 20,
    color: COLORS.text2,
  },
  header: {
    alignItems: 'center',
    marginBottom: 36,
    marginTop: 20,
  },
  logoIcon: {
    width: 56,
    height: 56,
    borderRadius: RADIUS.xl,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 8,
  },
  logoText: {
    fontSize: 24,
    fontWeight: '900',
    color: COLORS.white,
  },
  title: {
    fontSize: 30,
    fontWeight: '900',
    color: COLORS.text1,
    letterSpacing: -0.5,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: FONT_SIZE.base,
    fontWeight: '600',
    color: COLORS.text2,
    textAlign: 'center',
    lineHeight: 20,
  },
  form: {
    gap: 18,
    marginBottom: 28,
  },
  field: {},
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  label: {
    fontSize: 10,
    fontWeight: '900',
    color: COLORS.text3,
    letterSpacing: 1.5,
    marginBottom: 8,
  },
  forgotText: {
    fontSize: 9,
    fontWeight: '900',
    color: COLORS.indigo,
    letterSpacing: 1,
    marginBottom: 8,
  },
  input: {
    backgroundColor: COLORS.bg2,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.xl,
    paddingHorizontal: 20,
    paddingVertical: 16,
    fontSize: FONT_SIZE.base,
    fontWeight: '600',
    color: COLORS.text1,
  },
  passWrap: {
    position: 'relative',
  },
  eyeBtn: {
    position: 'absolute',
    right: 18,
    top: '50%',
    marginTop: -12,
  },
  eyeIcon: {
    fontSize: 18,
  },
  submitBtn: {
    backgroundColor: COLORS.primary,
    paddingVertical: 18,
    borderRadius: RADIUS.xl,
    alignItems: 'center',
    marginTop: 4,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
  submitBtnDisabled: {
    opacity: 0.6,
  },
  submitBtnText: {
    fontSize: FONT_SIZE.md,
    fontWeight: '900',
    color: COLORS.white,
    letterSpacing: 2,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.border,
  },
  dividerText: {
    fontSize: 9,
    fontWeight: '900',
    color: COLORS.text3,
    letterSpacing: 2,
    marginHorizontal: 16,
  },
  socialRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 28,
  },
  socialBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    borderRadius: RADIUS.xl,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  socialBtnDark: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  socialIcon: {
    fontSize: 18,
    fontWeight: '900',
    color: COLORS.text1,
  },
  socialLabel: {
    fontSize: 10,
    fontWeight: '900',
    color: COLORS.text1,
    letterSpacing: 1.5,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  switchText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.text3,
  },
  switchLink: {
    fontSize: 11,
    fontWeight: '900',
    color: COLORS.indigo,
  },
});