import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, StyleSheet, StatusBar, Modal } from 'react-native';
import { COLORS, RADIUS, SHADOWS } from '../constants/theme';
import { useStore, fmt, BRAND_LOGOS } from '../store/useStore';
import Card from '../components/Card';
import EmptyState from '../components/EmptyState';

export default function PaymentsScreen({ navigation }) {
  const payments = useStore(s => s.payments);
  const transactions = useStore(s => s.transactions);
  const addPayment = useStore(s => s.addPayment);
  const deletePayment = useStore(s => s.deletePayment);
  const markAsPaid = useStore(s => s.markAsPaid);
  const showToast = useStore(s => s.showToast);

  const [showAdd, setShowAdd] = useState(false);
  const [brand, setBrand] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [selBrand, setSelBrand] = useState(null);

  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];

  const paymentList = useMemo(() => {
    return payments.map(p => {
      const isPaid = transactions.some(t => t.description?.toLowerCase().includes(p.brand?.toLowerCase()) && t.type === 'EXPENSE');
      const isOverdue = !isPaid && p.date < todayStr;
      return { ...p, isPaid, isOverdue };
    }).sort((a, b) => a.isPaid - b.isPaid || new Date(a.date) - new Date(b.date));
  }, [payments, transactions]);

  const totalMonthly = payments.reduce((s, p) => s + p.amount, 0);
  const totalAnnual = totalMonthly * 12;

  const handleAdd = () => {
    if (!brand || !amount || !date) return showToast('Alanları doldurun', 'error');
    addPayment({ brand, amount: parseFloat(amount), date, categoryId: selBrand?.categoryId || 'cat10', domain: selBrand?.domain || 'generic', color: selBrand?.color || '#4318FF' });
    setBrand(''); setAmount(''); setSelBrand(null); setShowAdd(false);
    showToast('Ödeme eklendi!', 'success');
  };

  return (
    <View style={st.container}>
      <StatusBar barStyle="dark-content" />
      <ScrollView contentContainerStyle={st.scroll} showsVerticalScrollIndicator={false}>
        <View style={st.headerRow}>
          <TouchableOpacity style={st.backBtn} onPress={() => navigation.goBack()}><Text style={st.backIcon}>←</Text></TouchableOpacity>
          <Text style={st.title}>Ödeme Takvimi</Text>
        </View>
        <Text style={st.subtitle}>Gelecek ödemelerini planla ve takip et.</Text>

        {/* Summary */}
        <View style={st.summaryRow}>
          <View style={[st.summaryCard, { backgroundColor: COLORS.pastelIndigo }]}>
            <Text style={st.summaryLabel}>AYLIK</Text>
            <Text style={st.summaryValue}>{fmt(totalMonthly)}</Text>
          </View>
          <View style={[st.summaryCard, { backgroundColor: COLORS.pastelPurple }]}>
            <Text style={st.summaryLabel}>YILLIK</Text>
            <Text style={st.summaryValue}>{fmt(totalAnnual)}</Text>
          </View>
        </View>

        <TouchableOpacity style={st.addPlanBtn} onPress={() => setShowAdd(true)} activeOpacity={0.85}>
          <Text style={st.addPlanText}>+ ÖDEME PLANLA</Text>
        </TouchableOpacity>

        {/* Payment List */}
        {paymentList.length === 0 ? (
          <Card><EmptyState icon="📅" title="Ödeme planı yok" message="Ödeme ekleyerek başla" /></Card>
        ) : (
          paymentList.map(p => (
            <Card key={p.id} style={{ marginBottom: 12 }}>
              <View style={st.payRow}>
                <View style={[st.payIcon, { backgroundColor: (p.color || COLORS.indigo) + '20' }]}>
                  <Text style={{ fontSize: 22 }}>💳</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[st.payBrand, p.isPaid && { textDecorationLine: 'line-through', opacity: 0.5 }]}>{p.brand}</Text>
                  <Text style={st.payDate}>{new Date(p.date).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long' })}</Text>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={st.payAmount}>{fmt(p.amount)}</Text>
                  <View style={[st.payStatus, p.isPaid ? st.paidBadge : p.isOverdue ? st.overdueBadge : st.pendingBadge]}>
                    <Text style={[st.payStatusText, p.isPaid ? { color: COLORS.green } : p.isOverdue ? { color: COLORS.red } : { color: COLORS.indigo }]}>
                      {p.isPaid ? 'ÖDENDİ' : p.isOverdue ? 'GECİKMİŞ' : 'PLANLANDI'}
                    </Text>
                  </View>
                </View>
              </View>
              {!p.isPaid && (
                <View style={st.payActions}>
                  <TouchableOpacity style={st.paidBtn} onPress={() => { markAsPaid(p.id, p.date); showToast('Ödeme kaydedildi', 'success'); }}>
                    <Text style={st.paidBtnText}>✓ ÖDENDİ</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={st.delBtn} onPress={() => deletePayment(p.id)}>
                    <Text style={st.delBtnText}>İPTAL</Text>
                  </TouchableOpacity>
                </View>
              )}
            </Card>
          ))
        )}

        {/* Smart Tip */}
        <Card style={{ marginTop: 8, backgroundColor: COLORS.pastelIndigo }}>
          <View style={st.tipRow}>
            <Text style={{ fontSize: 22 }}>💡</Text>
            <View style={{ flex: 1 }}>
              <Text style={st.tipLabel}>AKILLI İPUCU</Text>
              <Text style={st.tipText}>Aboneliklerini yıllık plana taşıyarak ortalama ₺1.200 tasarruf edebilirsin.</Text>
            </View>
          </View>
        </Card>
        <View style={{ height: 30 }} />
      </ScrollView>

      {/* Add Modal */}
      <Modal visible={showAdd} transparent animationType="slide">
        <View style={st.modalBg}>
          <View style={st.modalContent}>
            <View style={st.modalHeader}>
              <Text style={st.modalTitle}>Yeni Ödeme Planla</Text>
              <TouchableOpacity onPress={() => setShowAdd(false)}><Text style={st.closeIcon}>✕</Text></TouchableOpacity>
            </View>
            <Text style={st.modalLabel}>MARKA / HİZMET</Text>
            <TextInput style={st.modalInput} placeholder="Örn: Netflix" placeholderTextColor={COLORS.text3} value={brand} onChangeText={setBrand} />
            <View style={st.brandPicker}>
              {BRAND_LOGOS.slice(0, 8).map((b, i) => (
                <TouchableOpacity key={i} style={[st.brandBtn, selBrand?.brand === b.brand && st.brandBtnSel]} onPress={() => { setSelBrand(b); setBrand(b.brand); }}>
                  <Text style={st.brandBtnText}>{b.brand.substring(0, 3)}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <View style={st.modalRow}>
              <View style={{ flex: 1 }}>
                <Text style={st.modalLabel}>TUTAR (₺)</Text>
                <TextInput style={st.modalInput} placeholder="0" placeholderTextColor={COLORS.text3} value={amount} onChangeText={setAmount} keyboardType="numeric" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={st.modalLabel}>TARİH</Text>
                <TextInput style={st.modalInput} placeholder="YYYY-MM-DD" placeholderTextColor={COLORS.text3} value={date} onChangeText={setDate} />
              </View>
            </View>
            <TouchableOpacity style={st.modalSubmit} onPress={handleAdd}><Text style={st.modalSubmitText}>PLANI KAYDET</Text></TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const st = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  scroll: { paddingHorizontal: 20, paddingTop: 60, paddingBottom: 20 },
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 4 },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: COLORS.white, borderWidth: 1, borderColor: COLORS.border, alignItems: 'center', justifyContent: 'center' },
  backIcon: { fontSize: 18, color: COLORS.text2 },
  title: { fontSize: 24, fontWeight: '800', color: COLORS.text1 },
  subtitle: { fontSize: 12, fontWeight: '600', color: COLORS.text3, marginBottom: 20 },
  summaryRow: { flexDirection: 'row', gap: 12, marginBottom: 16 },
  summaryCard: { flex: 1, borderRadius: RADIUS.xxl, padding: 18, ...SHADOWS.sm },
  summaryLabel: { fontSize: 9, fontWeight: '800', color: COLORS.text1 + '66', letterSpacing: 1 },
  summaryValue: { fontSize: 20, fontWeight: '800', color: COLORS.text1, marginTop: 6 },
  addPlanBtn: { backgroundColor: COLORS.primary, paddingVertical: 16, borderRadius: RADIUS.xl, alignItems: 'center', marginBottom: 20, ...SHADOWS.lg },
  addPlanText: { fontSize: 12, fontWeight: '800', color: COLORS.white, letterSpacing: 1.5 },
  payRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  payIcon: { width: 48, height: 48, borderRadius: RADIUS.lg, alignItems: 'center', justifyContent: 'center' },
  payBrand: { fontSize: 15, fontWeight: '800', color: COLORS.text1, marginBottom: 2 },
  payDate: { fontSize: 11, fontWeight: '600', color: COLORS.text3 },
  payAmount: { fontSize: 16, fontWeight: '800', color: COLORS.text1, marginBottom: 4 },
  payStatus: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: RADIUS.full, borderWidth: 1 },
  paidBadge: { backgroundColor: '#D2F6F1', borderColor: '#A7E8D8' },
  overdueBadge: { backgroundColor: '#FEE2E2', borderColor: '#FECACA' },
  pendingBadge: { backgroundColor: COLORS.pastelIndigo, borderColor: '#C7D2FE' },
  payStatusText: { fontSize: 8, fontWeight: '800', letterSpacing: 1 },
  payActions: { flexDirection: 'row', gap: 8, marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: COLORS.border },
  paidBtn: { flex: 1, backgroundColor: '#D2F6F1', paddingVertical: 10, borderRadius: RADIUS.md, alignItems: 'center' },
  paidBtnText: { fontSize: 11, fontWeight: '800', color: COLORS.green, letterSpacing: 0.5 },
  delBtn: { flex: 1, backgroundColor: '#FEE2E2', paddingVertical: 10, borderRadius: RADIUS.md, alignItems: 'center' },
  delBtnText: { fontSize: 11, fontWeight: '800', color: COLORS.red, letterSpacing: 0.5 },
  tipRow: { flexDirection: 'row', gap: 12, alignItems: 'flex-start' },
  tipLabel: { fontSize: 10, fontWeight: '800', color: COLORS.indigo, letterSpacing: 1, marginBottom: 4 },
  tipText: { fontSize: 12, fontWeight: '600', color: COLORS.text2, lineHeight: 18 },
  modalBg: { flex: 1, backgroundColor: 'rgba(17,20,45,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: COLORS.white, borderTopLeftRadius: RADIUS.xxxl, borderTopRightRadius: RADIUS.xxxl, padding: 24, paddingBottom: 40 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitle: { fontSize: 20, fontWeight: '800', color: COLORS.text1 },
  closeIcon: { fontSize: 18, color: COLORS.text2 },
  modalLabel: { fontSize: 10, fontWeight: '800', color: COLORS.text3, letterSpacing: 1, marginBottom: 6, marginTop: 12 },
  modalInput: { backgroundColor: COLORS.bg2, borderWidth: 1, borderColor: COLORS.border, borderRadius: RADIUS.md, paddingHorizontal: 16, paddingVertical: 14, fontSize: 14, fontWeight: '600', color: COLORS.text1 },
  brandPicker: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 8 },
  brandBtn: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: RADIUS.full, backgroundColor: COLORS.bg2, borderWidth: 1, borderColor: COLORS.border },
  brandBtnSel: { backgroundColor: COLORS.pastelIndigo, borderColor: COLORS.indigo },
  brandBtnText: { fontSize: 10, fontWeight: '800', color: COLORS.text1 },
  modalRow: { flexDirection: 'row', gap: 12 },
  modalSubmit: { backgroundColor: COLORS.primary, paddingVertical: 16, borderRadius: RADIUS.xl, alignItems: 'center', marginTop: 20, ...SHADOWS.lg },
  modalSubmitText: { fontSize: 13, fontWeight: '800', color: COLORS.white, letterSpacing: 1.5 },
});
