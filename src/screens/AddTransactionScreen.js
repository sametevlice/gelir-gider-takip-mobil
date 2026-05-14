import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { COLORS, RADIUS, SHADOWS } from '../constants/theme';
import { useStore, CATEGORIES } from '../store/useStore';

export default function AddTransactionScreen({ navigation }) {
  const addTransaction = useStore(s => s.addTransaction);
  const showToast = useStore(s => s.showToast);
  const [type, setType] = useState('EXPENSE');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('cat1');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  const handleSubmit = async () => {
    if (!amount || !description) return showToast('Tüm alanları doldurun', 'error');
    const result = await addTransaction({ type, amount: parseFloat(amount), description, categoryId, date });
    if (result?.success) { showToast('İşlem eklendi!', 'success'); navigation.goBack(); }
    else showToast(result?.error || 'Hata oluştu', 'error');
  };

  return (
    <KeyboardAvoidingView style={s.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <View style={s.header}>
          <TouchableOpacity style={s.closeBtn} onPress={() => navigation.goBack()}><Text style={s.closeIcon}>✕</Text></TouchableOpacity>
          <Text style={s.title}>Yeni İşlem</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={s.typeToggle}>
          <TouchableOpacity style={[s.typeBtn, type === 'INCOME' && { backgroundColor: '#D2F6F1' }]} onPress={() => setType('INCOME')}>
            <Text style={[s.typeText, type === 'INCOME' && { color: COLORS.green }]}>💰 GELİR</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[s.typeBtn, type === 'EXPENSE' && { backgroundColor: '#FEE2E2' }]} onPress={() => setType('EXPENSE')}>
            <Text style={[s.typeText, type === 'EXPENSE' && { color: COLORS.red }]}>💸 GİDER</Text>
          </TouchableOpacity>
        </View>
        <Text style={s.label}>TUTAR</Text>
        <View style={s.amountWrap}>
          <Text style={s.currency}>₺</Text>
          <TextInput style={s.amountInput} placeholder="0" placeholderTextColor={COLORS.text3} value={amount} onChangeText={setAmount} keyboardType="numeric" />
        </View>
        <Text style={s.label}>AÇIKLAMA</Text>
        <TextInput style={s.input} placeholder="Örn: Market alışverişi" placeholderTextColor={COLORS.text3} value={description} onChangeText={setDescription} />
        <Text style={s.label}>TARİH</Text>
        <TextInput style={s.input} placeholder="YYYY-MM-DD" placeholderTextColor={COLORS.text3} value={date} onChangeText={setDate} />
        <Text style={s.label}>KATEGORİ</Text>
        <View style={s.catGrid}>
          {CATEGORIES.map(c => (
            <TouchableOpacity key={c.id} style={[s.catBtn, categoryId === c.id && s.catSel]} onPress={() => setCategoryId(c.id)}>
              <Text style={{ fontSize: 20, marginBottom: 4 }}>{c.icon}</Text>
              <Text style={[s.catName, categoryId === c.id && { color: COLORS.indigo }]}>{c.name}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <TouchableOpacity style={s.submitBtn} onPress={handleSubmit} activeOpacity={0.85}>
          <Text style={s.submitText}>İŞLEMİ KAYDET</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  scroll: { paddingHorizontal: 20, paddingTop: 60, paddingBottom: 40 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 },
  closeBtn: { width: 40, height: 40, borderRadius: RADIUS.md, backgroundColor: COLORS.bg2, borderWidth: 1, borderColor: COLORS.border, alignItems: 'center', justifyContent: 'center' },
  closeIcon: { fontSize: 16, color: COLORS.text2 },
  title: { fontSize: 20, fontWeight: '800', color: COLORS.text1 },
  typeToggle: { flexDirection: 'row', backgroundColor: COLORS.bg3, borderRadius: RADIUS.lg, padding: 4, gap: 4, marginBottom: 24 },
  typeBtn: { flex: 1, paddingVertical: 14, borderRadius: RADIUS.md, alignItems: 'center' },
  typeText: { fontSize: 13, fontWeight: '800', color: COLORS.text3, letterSpacing: 0.5 },
  label: { fontSize: 10, fontWeight: '900', color: COLORS.text3, letterSpacing: 1.5, marginBottom: 8, marginTop: 12 },
  input: { backgroundColor: COLORS.bg2, borderWidth: 1, borderColor: COLORS.border, borderRadius: RADIUS.lg, paddingHorizontal: 18, paddingVertical: 16, fontSize: 14, fontWeight: '600', color: COLORS.text1 },
  amountWrap: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.bg2, borderWidth: 1, borderColor: COLORS.border, borderRadius: RADIUS.lg, paddingHorizontal: 18 },
  currency: { fontSize: 22, fontWeight: '800', color: COLORS.indigo, marginRight: 8 },
  amountInput: { flex: 1, paddingVertical: 16, fontSize: 24, fontWeight: '800', color: COLORS.text1 },
  catGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  catBtn: { width: '23%', paddingVertical: 12, borderRadius: RADIUS.lg, backgroundColor: COLORS.bg2, borderWidth: 1, borderColor: COLORS.border, alignItems: 'center' },
  catSel: { backgroundColor: COLORS.pastelIndigo, borderColor: COLORS.indigo },
  catName: { fontSize: 9, fontWeight: '700', color: COLORS.text3, textAlign: 'center' },
  submitBtn: { backgroundColor: COLORS.primary, paddingVertical: 18, borderRadius: RADIUS.xl, alignItems: 'center', marginTop: 24, ...SHADOWS.lg },
  submitText: { fontSize: 14, fontWeight: '900', color: COLORS.white, letterSpacing: 2 },
});
