import React, { useState, useMemo } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, TextInput,
  StyleSheet, StatusBar, Modal, Dimensions,
} from 'react-native';
import { COLORS, RADIUS, SHADOWS } from '../constants/theme';
import { useStore, fmt, BRAND_LOGOS } from '../store/useStore';
import Card from '../components/Card';

const SCREEN_W = Dimensions.get('window').width;
const DAY_NAMES = ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'];
const CELL_W = (SCREEN_W - 40 - 6) / 7; // 20px padding each side, 6px gaps

export default function PaymentsScreen({ navigation }) {
  const payments = useStore(s => s.payments);
  const transactions = useStore(s => s.transactions);
  const addPayment = useStore(s => s.addPayment);
  const deletePayment = useStore(s => s.deletePayment);
  const markAsPaid = useStore(s => s.markAsPaid);
  const showToast = useStore(s => s.showToast);

  const now = new Date();
  const [selectedMonth, setSelectedMonth] = useState(new Date(now.getFullYear(), now.getMonth(), 1));
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [showAdd, setShowAdd] = useState(false);
  const [brand, setBrand] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(now.toISOString().split('T')[0]);
  const [selBrand, setSelBrand] = useState(null);

  const todayStr = now.toISOString().split('T')[0];

  // Instances for selected month (recurring support)
  const instancesInMonth = useMemo(() => {
    const year = selectedMonth.getFullYear();
    const month = selectedMonth.getMonth();
    const startDate = new Date(year, month, 1);
    const endDate = new Date(year, month + 1, 0);
    const instances = [];
    payments.forEach(p => {
      const pDate = new Date(p.date);
      if (!p.isRecurring) {
        if (pDate >= startDate && pDate <= endDate) {
          instances.push({ ...p, instanceDate: p.date });
        }
      } else {
        const dayOfMonth = pDate.getDate();
        const pad = (n) => String(n).padStart(2, '0');
        const instanceDateStr = `${year}-${pad(month + 1)}-${pad(dayOfMonth)}`;
        const instanceDate = new Date(instanceDateStr);
        if (instanceDate >= startDate && instanceDate <= endDate) {
          instances.push({ ...p, instanceDate: instanceDateStr });
        }
      }
    });
    return instances;
  }, [selectedMonth, payments]);

  // Calendar days array
  const daysInMonth = useMemo(() => {
    const year = selectedMonth.getFullYear();
    const month = selectedMonth.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysCount = new Date(year, month + 1, 0).getDate();
    const pad = (n) => String(n).padStart(2, '0');

    const days = [];
    const offset = firstDay === 0 ? 6 : firstDay - 1;
    for (let i = 0; i < offset; i++) {
      days.push({ day: null, type: 'padding' });
    }
    for (let i = 1; i <= daysCount; i++) {
      const dateStr = `${year}-${pad(month + 1)}-${pad(i)}`;
      const dayInstances = instancesInMonth.filter(inst => inst.instanceDate === dateStr);
      const processed = dayInstances.map(inst => {
        const isPaid = transactions.some(t =>
          t.description?.toLowerCase().includes(inst.brand?.toLowerCase()) &&
          t.date === inst.instanceDate && t.type === 'EXPENSE'
        );
        const isOverdue = !isPaid && inst.instanceDate < todayStr;
        return { ...inst, isPaid, isOverdue };
      });
      days.push({ day: i, date: dateStr, instances: processed, type: 'current' });
    }
    return days;
  }, [selectedMonth, instancesInMonth, transactions]);

  // Subscriptions summary
  const subscriptions = useMemo(() => {
    const subs = [];
    const seen = new Set();
    payments.forEach(p => {
      if (!seen.has(p.brand)) {
        seen.add(p.brand);
        subs.push({ ...p, annualCost: p.amount * 12 });
      }
    });
    return subs;
  }, [payments]);

  const totalMonthly = payments.reduce((s, p) => s + p.amount, 0);

  const prevMonth = () => {
    setSelectedMonth(new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() - 1, 1));
  };
  const nextMonth = () => {
    setSelectedMonth(new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() + 1, 1));
  };

  const handleAdd = () => {
    if (!brand || !amount || !date) return showToast('Alanları doldurun', 'error');
    addPayment({
      brand, amount: parseFloat(amount), date,
      categoryId: selBrand?.categoryId || 'cat10',
      domain: selBrand?.domain || 'generic',
      color: selBrand?.color || '#4318FF',
    });
    setBrand(''); setAmount(''); setSelBrand(null); setShowAdd(false);
    showToast('Ödeme eklendi!', 'success');
  };

  const handleMarkAsPaid = (payment) => {
    markAsPaid(payment.id, payment.instanceDate || payment.date);
    showToast('Ödeme kaydedildi', 'success');
    setSelectedPayment(null);
  };

  const handleDelete = (id) => {
    deletePayment(id);
    showToast('Plan silindi', 'success');
    setSelectedPayment(null);
  };

  const monthLabel = selectedMonth.toLocaleDateString('tr-TR', { month: 'long', year: 'numeric' }).toUpperCase();

  return (
    <View style={st.container}>
      <StatusBar barStyle="dark-content" />
      <ScrollView contentContainerStyle={st.scroll} showsVerticalScrollIndicator={false}>

        {/* Header */}
        <View style={st.headerRow}>
          <TouchableOpacity style={st.backBtn} onPress={() => navigation.goBack()}>
            <Text style={st.backIcon}>←</Text>
          </TouchableOpacity>
          <View style={{ flex: 1 }}>
            <Text style={st.title}>Ödeme Takvimi</Text>
            <Text style={st.subtitle}>GELECEK ÖDEMELERİNİ PLANLA</Text>
          </View>
        </View>

        {/* Controls Row */}
        <View style={st.controlsRow}>
          <TouchableOpacity style={st.addPlanBtn} onPress={() => setShowAdd(true)} activeOpacity={0.85}>
            <Text style={st.addPlanText}>+ ÖDEME PLANLA</Text>
          </TouchableOpacity>
          <View style={st.monthNav}>
            <TouchableOpacity onPress={prevMonth} style={st.monthArrow}>
              <Text style={st.monthArrowText}>‹</Text>
            </TouchableOpacity>
            <Text style={st.monthLabel}>{monthLabel}</Text>
            <TouchableOpacity onPress={nextMonth} style={st.monthArrow}>
              <Text style={st.monthArrowText}>›</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Calendar Grid */}
        <View style={st.calendarCard}>
          {/* Day Names Header */}
          <View style={st.dayNamesRow}>
            {DAY_NAMES.map(d => (
              <View key={d} style={st.dayNameCell}>
                <Text style={st.dayNameText}>{d}</Text>
              </View>
            ))}
          </View>

          {/* Calendar Cells */}
          <View style={st.calendarGrid}>
            {daysInMonth.map((dayObj, idx) => (
              <View key={idx} style={[st.calendarCell, dayObj.type === 'padding' && st.paddingCell]}>
                {dayObj.day && (
                  <>
                    <Text style={[st.dayNumber, dayObj.date === todayStr && st.todayNumber]}>
                      {dayObj.day}
                    </Text>
                    {dayObj.instances?.map(inst => (
                      <TouchableOpacity
                        key={inst.id + inst.instanceDate}
                        style={[
                          st.calPayment,
                          inst.isPaid ? st.calPaid : inst.isOverdue ? st.calOverdue : st.calPending,
                        ]}
                        onPress={() => setSelectedPayment(inst)}
                        activeOpacity={0.7}
                      >
                        <Text style={[
                          st.calPayBrand,
                          inst.isPaid && { color: '#059669', textDecorationLine: 'line-through' },
                          inst.isOverdue && { color: '#C2410C' },
                        ]} numberOfLines={1}>
                          {inst.brand}
                        </Text>
                        <Text style={st.calPayAmount}>{fmt(inst.amount)}</Text>
                      </TouchableOpacity>
                    ))}
                  </>
                )}
              </View>
            ))}
          </View>
        </View>

        {/* Subscription Management */}
        {subscriptions.length > 0 && (
          <View style={st.subsCard}>
            <View style={st.subsHeader}>
              <View>
                <Text style={st.subsTitle}>Abonelik Yönetimi</Text>
                <Text style={st.subsSubtitle}>YILLIK GİDER ANALİZİ</Text>
              </View>
              <View style={st.subsIcon}>
                <Text style={{ fontSize: 18 }}>💳</Text>
              </View>
            </View>

            {subscriptions.map(sub => (
              <View key={sub.id} style={st.subItem}>
                <View style={[st.subIconWrap, { backgroundColor: (sub.color || COLORS.indigo) + '20' }]}>
                  <Text style={{ fontSize: 18 }}>💳</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={st.subBrand}>{sub.brand}</Text>
                  <Text style={st.subAnnual}>
                    Yıllık: <Text style={{ color: COLORS.indigo }}>{fmt(sub.annualCost)}</Text>
                  </Text>
                </View>
                <TouchableOpacity style={st.subDeleteBtn} onPress={() => handleDelete(sub.id)}>
                  <Text style={st.subDeleteText}>✕</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}

        {/* Smart Tip */}
        <View style={st.tipCard}>
          <View style={st.tipRow}>
            <Text style={{ fontSize: 22 }}>💡</Text>
            <View style={{ flex: 1 }}>
              <Text style={st.tipLabel}>AKILLI İPUCU</Text>
              <Text style={st.tipText}>
                Aboneliklerini yıllık plana taşıyarak ortalama ₺1.200 tasarruf edebilirsin.
              </Text>
            </View>
          </View>
        </View>

        <View style={{ height: 30 }} />
      </ScrollView>

      {/* Payment Detail Modal */}
      <Modal visible={!!selectedPayment} transparent animationType="fade">
        <View style={st.modalOverlay}>
          <View style={st.detailModal}>
            <TouchableOpacity style={st.detailClose} onPress={() => setSelectedPayment(null)}>
              <Text style={st.detailCloseText}>✕</Text>
            </TouchableOpacity>

            <View style={st.detailTop}>
              <View style={st.detailIconBig}>
                <Text style={{ fontSize: 32 }}>💳</Text>
              </View>
              <Text style={st.detailBrand}>{selectedPayment?.brand}</Text>
              <Text style={st.detailType}>
                {selectedPayment?.isRecurring ? 'Tekrarlanan Ödeme' : 'Tek Seferlik Ödeme'}
              </Text>
            </View>

            <View style={st.detailBody}>
              <Text style={st.detailAmount}>{fmt(selectedPayment?.amount)}</Text>
              <View style={[
                st.detailBadge,
                selectedPayment?.isPaid ? st.detailBadgePaid : st.detailBadgePending,
              ]}>
                <Text style={[
                  st.detailBadgeText,
                  selectedPayment?.isPaid ? { color: '#059669' } : { color: COLORS.indigo },
                ]}>
                  {selectedPayment?.isPaid
                    ? 'ÖDENDİ'
                    : `PLANLANAN: ${selectedPayment?.instanceDate
                      ? new Date(selectedPayment.instanceDate).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long' })
                      : ''}`
                  }
                </Text>
              </View>

              {selectedPayment && !selectedPayment.isPaid && (
                <View style={st.detailActions}>
                  <TouchableOpacity style={st.detailPaidBtn} onPress={() => handleMarkAsPaid(selectedPayment)}>
                    <Text style={st.detailPaidBtnText}>Ödeme Gerçekleşti</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={st.detailCancelBtn} onPress={() => handleDelete(selectedPayment.id)}>
                    <Text style={st.detailCancelBtnText}>Planı İptal Et</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>

            <TouchableOpacity style={st.detailDismiss} onPress={() => setSelectedPayment(null)}>
              <Text style={st.detailDismissText}>VAZGEÇ</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Add Payment Modal */}
      <Modal visible={showAdd} transparent animationType="slide">
        <View style={st.addModalBg}>
          <View style={st.addModalContent}>
            <View style={st.addModalHeader}>
              <Text style={st.addModalTitle}>Yeni Ödeme Planla</Text>
              <TouchableOpacity onPress={() => setShowAdd(false)}>
                <View style={st.addModalCloseBtn}><Text style={st.addModalCloseText}>✕</Text></View>
              </TouchableOpacity>
            </View>

            <Text style={st.addLabel}>AÇIKLAMA</Text>
            <TextInput
              style={st.addInput}
              placeholder="Örn: Netflix"
              placeholderTextColor={COLORS.text3}
              value={brand}
              onChangeText={setBrand}
            />

            <View style={st.brandPicker}>
              {BRAND_LOGOS.slice(0, 8).map((b, i) => (
                <TouchableOpacity
                  key={i}
                  style={[st.brandBtn, selBrand?.brand === b.brand && st.brandBtnSel]}
                  onPress={() => { setSelBrand(b); setBrand(b.brand); }}
                >
                  <Text style={st.brandBtnText}>{b.brand.substring(0, 3)}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={st.addRow}>
              <View style={{ flex: 1 }}>
                <Text style={st.addLabel}>TUTAR (₺)</Text>
                <TextInput
                  style={st.addInput}
                  placeholder="0"
                  placeholderTextColor={COLORS.text3}
                  value={amount}
                  onChangeText={setAmount}
                  keyboardType="numeric"
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={st.addLabel}>TARİH</Text>
                <TextInput
                  style={st.addInput}
                  placeholder="YYYY-MM-DD"
                  placeholderTextColor={COLORS.text3}
                  value={date}
                  onChangeText={setDate}
                />
              </View>
            </View>

            <TouchableOpacity style={st.addSubmitBtn} onPress={handleAdd} activeOpacity={0.85}>
              <Text style={st.addSubmitText}>PLANI KAYDET</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const st = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  scroll: { paddingHorizontal: 20, paddingTop: 60, paddingBottom: 20 },

  // Header
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 16 },
  backBtn: {
    width: 44, height: 44, borderRadius: 22, backgroundColor: COLORS.white,
    borderWidth: 1, borderColor: COLORS.border, alignItems: 'center', justifyContent: 'center',
  },
  backIcon: { fontSize: 20, color: COLORS.text2 },
  title: { fontSize: 24, fontWeight: '800', color: '#11142D', letterSpacing: -0.5 },
  subtitle: { fontSize: 10, fontWeight: '800', color: COLORS.text3, letterSpacing: 2, marginTop: 2 },

  // Controls
  controlsRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, gap: 12 },
  addPlanBtn: {
    backgroundColor: '#11142D', paddingVertical: 14, paddingHorizontal: 20,
    borderRadius: 16, ...SHADOWS.lg,
  },
  addPlanText: { fontSize: 11, fontWeight: '800', color: '#FFFFFF', letterSpacing: 1.5 },
  monthNav: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#FAFBFC',
    borderRadius: 16, paddingVertical: 4, paddingHorizontal: 4,
    borderWidth: 1, borderColor: COLORS.border,
  },
  monthArrow: { paddingHorizontal: 10, paddingVertical: 8 },
  monthArrowText: { fontSize: 20, fontWeight: '700', color: COLORS.text3 },
  monthLabel: {
    fontSize: 11, fontWeight: '800', color: '#11142D', letterSpacing: 1.5,
    minWidth: 110, textAlign: 'center',
  },

  // Calendar Card
  calendarCard: {
    backgroundColor: COLORS.white, borderRadius: 28, padding: 2,
    borderWidth: 1, borderColor: COLORS.border, ...SHADOWS.sm, marginBottom: 16,
  },
  dayNamesRow: { flexDirection: 'row' },
  dayNameCell: {
    flex: 1, paddingVertical: 12, alignItems: 'center',
  },
  dayNameText: { fontSize: 9, fontWeight: '800', color: COLORS.text3, letterSpacing: 2 },

  calendarGrid: { flexDirection: 'row', flexWrap: 'wrap' },
  calendarCell: {
    width: (SCREEN_W - 44) / 7, minHeight: 70, padding: 4,
    borderTopWidth: 1, borderRightWidth: 0.5, borderColor: '#F5F5F8',
  },
  paddingCell: { backgroundColor: '#FCFCFD' },
  dayNumber: { fontSize: 11, fontWeight: '800', color: COLORS.text3, marginBottom: 3 },
  todayNumber: { color: COLORS.indigo },

  // Calendar Payment Chips
  calPayment: {
    paddingVertical: 3, paddingHorizontal: 5, borderRadius: 8,
    marginBottom: 2, borderWidth: 1,
  },
  calPaid: { backgroundColor: '#ECFDF5', borderColor: '#A7F3D0' },
  calOverdue: { backgroundColor: '#FFF7ED', borderColor: '#FED7AA' },
  calPending: { backgroundColor: '#EEF2FF', borderColor: '#C7D2FE' },
  calPayBrand: { fontSize: 7, fontWeight: '800', color: '#4338CA', letterSpacing: 0.3 },
  calPayAmount: { fontSize: 7, fontWeight: '700', color: COLORS.text2 },

  // Subscriptions Card
  subsCard: {
    backgroundColor: COLORS.white, borderRadius: 28, padding: 20,
    borderWidth: 1, borderColor: COLORS.border, ...SHADOWS.sm, marginBottom: 16,
  },
  subsHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 },
  subsTitle: { fontSize: 17, fontWeight: '800', color: '#11142D', letterSpacing: -0.3 },
  subsSubtitle: { fontSize: 9, fontWeight: '800', color: COLORS.text3, letterSpacing: 2, marginTop: 2 },
  subsIcon: {
    width: 40, height: 40, borderRadius: 14, backgroundColor: '#EEF2FF',
    alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#C7D2FE',
  },
  subItem: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingVertical: 12, paddingHorizontal: 14, backgroundColor: '#FAFBFC',
    borderRadius: 20, borderWidth: 1, borderColor: COLORS.border, marginBottom: 8,
  },
  subIconWrap: {
    width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center',
  },
  subBrand: { fontSize: 14, fontWeight: '800', color: '#11142D' },
  subAnnual: { fontSize: 11, fontWeight: '700', color: COLORS.text3, marginTop: 2 },
  subDeleteBtn: {
    width: 30, height: 30, borderRadius: 15, backgroundColor: COLORS.white,
    borderWidth: 1, borderColor: COLORS.border, alignItems: 'center', justifyContent: 'center',
  },
  subDeleteText: { fontSize: 12, color: COLORS.text3 },

  // Smart Tip
  tipCard: {
    backgroundColor: '#EEF2FF', borderRadius: 24, padding: 20,
    borderWidth: 1, borderColor: '#C7D2FE',
  },
  tipRow: { flexDirection: 'row', gap: 12, alignItems: 'flex-start' },
  tipLabel: { fontSize: 10, fontWeight: '800', color: COLORS.indigo, letterSpacing: 2, marginBottom: 4 },
  tipText: { fontSize: 12, fontWeight: '600', color: '#475569', lineHeight: 18 },

  // Detail Modal
  modalOverlay: {
    flex: 1, backgroundColor: 'rgba(17,20,45,0.45)', justifyContent: 'center',
    alignItems: 'center', paddingHorizontal: 24,
  },
  detailModal: {
    width: '100%', backgroundColor: COLORS.white, borderRadius: 32,
    overflow: 'hidden', ...SHADOWS.lg,
  },
  detailClose: {
    position: 'absolute', top: 16, right: 16, zIndex: 10,
    width: 36, height: 36, borderRadius: 12, backgroundColor: '#F1F5F9',
    alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: COLORS.border,
  },
  detailCloseText: { fontSize: 14, color: COLORS.text3 },
  detailTop: {
    alignItems: 'center', paddingVertical: 28, paddingHorizontal: 20, backgroundColor: '#FAFBFC',
    borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  detailIconBig: {
    width: 72, height: 72, borderRadius: 24, backgroundColor: '#EEF2FF',
    alignItems: 'center', justifyContent: 'center', marginBottom: 16,
    borderWidth: 1, borderColor: '#C7D2FE', ...SHADOWS.md,
  },
  detailBrand: { fontSize: 22, fontWeight: '800', color: '#11142D', letterSpacing: -0.3 },
  detailType: { fontSize: 10, fontWeight: '800', color: COLORS.text3, letterSpacing: 2, marginTop: 4 },
  detailBody: { padding: 24, alignItems: 'center' },
  detailAmount: { fontSize: 34, fontWeight: '800', color: '#11142D', letterSpacing: -1, marginBottom: 12 },
  detailBadge: { paddingHorizontal: 16, paddingVertical: 6, borderRadius: 20, borderWidth: 1, marginBottom: 20 },
  detailBadgePaid: { backgroundColor: '#ECFDF5', borderColor: '#A7F3D0' },
  detailBadgePending: { backgroundColor: '#EEF2FF', borderColor: '#C7D2FE' },
  detailBadgeText: { fontSize: 9, fontWeight: '800', letterSpacing: 1.5 },
  detailActions: { width: '100%', gap: 10 },
  detailPaidBtn: {
    backgroundColor: '#22C55E', paddingVertical: 16, borderRadius: 16,
    alignItems: 'center', ...SHADOWS.md,
  },
  detailPaidBtnText: { fontSize: 12, fontWeight: '800', color: '#FFFFFF', letterSpacing: 1.5 },
  detailCancelBtn: {
    backgroundColor: '#FEF2F2', paddingVertical: 16, borderRadius: 16,
    alignItems: 'center', borderWidth: 1, borderColor: '#FECACA',
  },
  detailCancelBtnText: { fontSize: 12, fontWeight: '800', color: '#EF4444', letterSpacing: 1.5 },
  detailDismiss: { paddingVertical: 16, backgroundColor: '#F8FAFC', alignItems: 'center' },
  detailDismissText: { fontSize: 10, fontWeight: '800', color: COLORS.text3, letterSpacing: 2 },

  // Add Modal
  addModalBg: { flex: 1, backgroundColor: 'rgba(17,20,45,0.5)', justifyContent: 'flex-end' },
  addModalContent: {
    backgroundColor: COLORS.white, borderTopLeftRadius: 32, borderTopRightRadius: 32,
    padding: 24, paddingBottom: 40,
  },
  addModalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  addModalTitle: { fontSize: 20, fontWeight: '800', color: '#11142D', letterSpacing: -0.3 },
  addModalCloseBtn: {
    width: 36, height: 36, borderRadius: 14, backgroundColor: '#F1F5F9',
    alignItems: 'center', justifyContent: 'center',
  },
  addModalCloseText: { fontSize: 14, color: COLORS.text3 },
  addLabel: { fontSize: 9, fontWeight: '800', color: COLORS.text3, letterSpacing: 2, marginBottom: 6, marginTop: 14 },
  addInput: {
    backgroundColor: '#FAFBFC', borderWidth: 1, borderColor: COLORS.border,
    borderRadius: 16, paddingHorizontal: 16, paddingVertical: 14,
    fontSize: 14, fontWeight: '600', color: '#11142D',
  },
  brandPicker: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 10 },
  brandBtn: {
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 12,
    backgroundColor: '#FAFBFC', borderWidth: 1, borderColor: COLORS.border,
  },
  brandBtnSel: { backgroundColor: '#EEF2FF', borderColor: COLORS.indigo },
  brandBtnText: { fontSize: 10, fontWeight: '800', color: '#11142D' },
  addRow: { flexDirection: 'row', gap: 12 },
  addSubmitBtn: {
    backgroundColor: '#11142D', paddingVertical: 16, borderRadius: 16,
    alignItems: 'center', marginTop: 20, ...SHADOWS.lg,
  },
  addSubmitText: { fontSize: 12, fontWeight: '800', color: '#FFFFFF', letterSpacing: 1.5 },
});
