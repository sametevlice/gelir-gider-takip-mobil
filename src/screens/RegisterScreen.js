import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, StatusBar } from 'react-native';
import { COLORS, RADIUS, FONT_SIZE } from '../constants/theme';
import { useStore } from '../store/useStore';

export default function RegisterScreen({ navigation }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const register = useStore(state => state.register);
  const showToast = useStore(state => state.showToast);
  const isLoading = useStore(state => state.isLoading);

  const handleRegister = async () => {
    if (!name.trim() || !email.trim() || password.length < 8) {
      return showToast('Tüm alanları doldurun (şifre min. 8)', 'error');
    }
    if (password !== confirmPass) {
      return showToast('Şifreler uyuşmuyor', 'error');
    }
    const result = await register(name, email, password);
    if (result.success) {
      showToast('Kayıt başarılı! Giriş yapabilirsiniz.', 'success');
      navigation.navigate('Login');
    } else {
      showToast(result.error || 'Kayıt yapılamadı', 'error');
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <StatusBar barStyle="dark-content" />
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">

        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>

        <View style={styles.header}>
          <View style={styles.logoIcon}>
            <Text style={styles.logoText}>F</Text>
          </View>
          <Text style={styles.title}>Hesap Oluştur</Text>
          <Text style={styles.subtitle}>Finansal özgürlüğüne giden yolda ilk adımı at.</Text>
        </View>

        <View style={styles.form}>
          <View>
            <Text style={styles.label}>AD SOYAD</Text>
            <TextInput style={styles.input} placeholder="Adınız Soyadınız" placeholderTextColor={COLORS.text3} value={name} onChangeText={setName} />
          </View>

          <View>
            <Text style={styles.label}>E-POSTA ADRESİ</Text>
            <TextInput style={styles.input} placeholder="ornek@email.com" placeholderTextColor={COLORS.text3} value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
          </View>

          <View>
            <Text style={styles.label}>ŞİFRE</Text>
            <TextInput style={styles.input} placeholder="••••••••" placeholderTextColor={COLORS.text3} value={password} onChangeText={setPassword} secureTextEntry />
          </View>

          <View>
            <Text style={styles.label}>ŞİFRE ONAY</Text>
            <TextInput style={styles.input} placeholder="••••••••" placeholderTextColor={COLORS.text3} value={confirmPass} onChangeText={setConfirmPass} secureTextEntry />
          </View>

          <TouchableOpacity style={[styles.submitBtn, isLoading && { opacity: 0.6 }]} onPress={handleRegister} disabled={isLoading} activeOpacity={0.85}>
            <Text style={styles.submitBtnText}>{isLoading ? 'Lütfen Bekleyin...' : 'HESAP OLUŞTUR →'}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.switchRow}>
          <Text style={styles.switchText}>Zaten hesabın var mı? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text style={styles.switchLink}>Giriş Yap</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  scroll: { flexGrow: 1, paddingHorizontal: 28, paddingTop: 60, paddingBottom: 40, justifyContent: 'center' },
  backBtn: { position: 'absolute', top: 0, left: 0, width: 44, height: 44, borderRadius: 22, borderWidth: 1, borderColor: COLORS.border, alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.white },
  backIcon: { fontSize: 20, color: COLORS.text2 },
  header: { alignItems: 'center', marginBottom: 32, marginTop: 20 },
  logoIcon: { width: 56, height: 56, borderRadius: RADIUS.xl, backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center', marginBottom: 24, shadowColor: COLORS.primary, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.25, shadowRadius: 16, elevation: 8 },
  logoText: { fontSize: 24, fontWeight: '900', color: COLORS.white },
  title: { fontSize: 28, fontWeight: '900', color: COLORS.text1, letterSpacing: -0.5, marginBottom: 8 },
  subtitle: { fontSize: 14, fontWeight: '600', color: COLORS.text2, textAlign: 'center' },
  form: { gap: 16, marginBottom: 28 },
  label: { fontSize: 10, fontWeight: '900', color: COLORS.text3, letterSpacing: 1.5, marginBottom: 8 },
  input: { backgroundColor: COLORS.bg2, borderWidth: 1, borderColor: COLORS.border, borderRadius: RADIUS.xl, paddingHorizontal: 20, paddingVertical: 16, fontSize: 14, fontWeight: '600', color: COLORS.text1 },
  submitBtn: { backgroundColor: COLORS.primary, paddingVertical: 18, borderRadius: RADIUS.xl, alignItems: 'center', marginTop: 4, shadowColor: COLORS.primary, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.2, shadowRadius: 16, elevation: 8 },
  submitBtnText: { fontSize: 13, fontWeight: '900', color: COLORS.white, letterSpacing: 2 },
  switchRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
  switchText: { fontSize: 11, fontWeight: '700', color: COLORS.text3 },
  switchLink: { fontSize: 11, fontWeight: '900', color: COLORS.indigo },
});
