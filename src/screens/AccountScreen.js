import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, StyleSheet, StatusBar, Switch } from 'react-native';
import { COLORS, RADIUS, SHADOWS } from '../constants/theme';
import { useStore } from '../store/useStore';
import Card from '../components/Card';

export default function AccountScreen() {
  const user = useStore(s => s.user);
  const updateUser = useStore(s => s.updateUser);
  const logout = useStore(s => s.logout);
  const showToast = useStore(s => s.showToast);

  const [name, setName] = useState(user?.full_name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone_number || '');
  const [currency, setCurrency] = useState(user?.currency || 'TRY');
  const [notifs, setNotifs] = useState(true);

  const handleSave = () => {
    updateUser({ full_name: name, email, phone_number: phone, currency });
    showToast('Değişiklikler kaydedildi!', 'success');
  };

  const currencies = ['TRY', 'USD', 'EUR'];

  return (
    <View style={st.container}>
      <StatusBar barStyle="dark-content" />
      <ScrollView contentContainerStyle={st.scroll} showsVerticalScrollIndicator={false}>
        <Text style={st.title}>Hesap Ayarları</Text>
        <Text style={st.subtitle}>Profilini ve tercihlerini buradan yönet.</Text>

        {/* Profile Card */}
        <Card style={{ alignItems: 'center', marginBottom: 20 }}>
          <View style={st.avatar}>
            <Text style={st.avatarText}>{(user?.full_name || 'K')[0].toUpperCase()}</Text>
          </View>
          <Text style={st.userName}>{user?.full_name || 'Kullanıcı'}</Text>
          <Text style={st.userEmail}>{user?.email || ''}</Text>
        </Card>

        {/* Personal Info */}
        <Card style={{ marginBottom: 20 }}>
          <Text style={st.cardTitle}>Kişisel Bilgiler</Text>
          <View style={st.form}>
            <View>
              <Text style={st.label}>TAM İSİM</Text>
              <TextInput style={st.input} value={name} onChangeText={setName} placeholder="Adınız" placeholderTextColor={COLORS.text3} />
            </View>
            <View>
              <Text style={st.label}>E-POSTA ADRESİ</Text>
              <TextInput style={st.input} value={email} onChangeText={setEmail} placeholder="Email" placeholderTextColor={COLORS.text3} keyboardType="email-address" autoCapitalize="none" />
            </View>
            <View>
              <Text style={st.label}>TELEFON NUMARASI</Text>
              <TextInput style={st.input} value={phone} onChangeText={setPhone} placeholder="Telefon" placeholderTextColor={COLORS.text3} keyboardType="phone-pad" />
            </View>
            <View>
              <Text style={st.label}>PARA BİRİMİ</Text>
              <View style={st.currencyRow}>
                {currencies.map(c => (
                  <TouchableOpacity key={c} style={[st.currencyBtn, currency === c && st.currencyBtnSel]} onPress={() => setCurrency(c)}>
                    <Text style={[st.currencyText, currency === c && { color: COLORS.white }]}>{c}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>
        </Card>

        {/* Preferences */}
        <Card style={{ marginBottom: 20 }}>
          <Text style={st.cardTitle}>Tercihler</Text>
          <View style={st.prefRow}>
            <View style={{ flex: 1 }}>
              <Text style={st.prefTitle}>Bildirimler</Text>
              <Text style={st.prefSub}>Hesap aktivitelerin hakkında güncelleme al.</Text>
            </View>
            <Switch
              value={notifs}
              onValueChange={setNotifs}
              trackColor={{ false: COLORS.bg3, true: COLORS.primary }}
              thumbColor={COLORS.white}
            />
          </View>
        </Card>

        {/* Action Buttons */}
        <TouchableOpacity style={st.saveBtn} onPress={handleSave} activeOpacity={0.85}>
          <Text style={st.saveBtnText}>DEĞİŞİKLİKLERİ KAYDET</Text>
        </TouchableOpacity>

        <TouchableOpacity style={st.logoutBtn} onPress={logout} activeOpacity={0.85}>
          <Text style={st.logoutBtnText}>ÇIKIŞ YAP</Text>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const st = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  scroll: { paddingHorizontal: 20, paddingTop: 60, paddingBottom: 20 },
  title: { fontSize: 28, fontWeight: '800', color: COLORS.text1, marginBottom: 4 },
  subtitle: { fontSize: 12, fontWeight: '600', color: COLORS.text3, marginBottom: 20 },
  avatar: { width: 80, height: 80, borderRadius: 30, backgroundColor: COLORS.pastelIndigo, alignItems: 'center', justifyContent: 'center', marginBottom: 14, borderWidth: 3, borderColor: COLORS.white, ...SHADOWS.md },
  avatarText: { fontSize: 32, fontWeight: '800', color: COLORS.indigo },
  userName: { fontSize: 20, fontWeight: '800', color: COLORS.text1 },
  userEmail: { fontSize: 12, fontWeight: '600', color: COLORS.text3, marginTop: 4 },
  cardTitle: { fontSize: 18, fontWeight: '800', color: COLORS.text1, marginBottom: 16 },
  form: { gap: 16 },
  label: { fontSize: 10, fontWeight: '900', color: COLORS.text3, letterSpacing: 1.5, marginBottom: 8 },
  input: { backgroundColor: COLORS.bg2, borderWidth: 1, borderColor: COLORS.border, borderRadius: RADIUS.lg, paddingHorizontal: 18, paddingVertical: 16, fontSize: 14, fontWeight: '600', color: COLORS.text1 },
  currencyRow: { flexDirection: 'row', gap: 8 },
  currencyBtn: { flex: 1, paddingVertical: 14, borderRadius: RADIUS.lg, backgroundColor: COLORS.bg2, borderWidth: 1, borderColor: COLORS.border, alignItems: 'center' },
  currencyBtnSel: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  currencyText: { fontSize: 13, fontWeight: '800', color: COLORS.text1, letterSpacing: 1 },
  prefRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.bg, borderRadius: RADIUS.xl, padding: 18, borderWidth: 1, borderColor: COLORS.border },
  prefTitle: { fontSize: 14, fontWeight: '800', color: COLORS.text1 },
  prefSub: { fontSize: 11, fontWeight: '600', color: COLORS.text3, marginTop: 2 },
  saveBtn: { backgroundColor: COLORS.primary, paddingVertical: 18, borderRadius: RADIUS.xl, alignItems: 'center', marginBottom: 12, ...SHADOWS.lg },
  saveBtnText: { fontSize: 13, fontWeight: '900', color: COLORS.white, letterSpacing: 2 },
  logoutBtn: { backgroundColor: '#FEE2E2', paddingVertical: 18, borderRadius: RADIUS.xl, alignItems: 'center', borderWidth: 1, borderColor: '#FECACA' },
  logoutBtnText: { fontSize: 13, fontWeight: '900', color: COLORS.red, letterSpacing: 2 },
});
