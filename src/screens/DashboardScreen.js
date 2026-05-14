import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, StatusBar, RefreshControl } from 'react-native';
import { COLORS, RADIUS, SPACING, FONT_SIZE, SHADOWS } from '../constants/theme';
import { useStore, getCat, fmt, fmtDate } from '../store/useStore';
import Card from '../components/Card';
import MiniChart from '../components/MiniChart';
import HealthGauge from '../components/HealthGauge';
import TransactionItem from '../components/TransactionItem';
import EmptyState from '../components/EmptyState';

export default function DashboardScreen({ navigation }) {
  const user = useStore(s => s.user);
  const transactions = useStore(s => s.transactions);
  const payments = useStore(s => s.payments);
  const totalBudget = useStore(s => s.totalBudget);
  const fetchTransactions = useStore(s => s.fetchTransactions);
  const [refreshing, setRefreshing] = useState(false);

  const now = new Date();
  const month = now.getMonth();
  const year = now.getFullYear();

  useEffect(() => { fetchTransactions(); }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchTransactions();
    setRefreshing(false);
  };

  // ── Hesaplamalar (web ile aynı mantık) ───────────────
  const thisMonth = transactions.filter(t => {
    const d = new Date(t.date);
    return d.getMonth() === month && d.getFullYear() === year;
  });

  const income = thisMonth.filter(t => t.type === 'INCOME').reduce((s, t) => s + t.amount, 0);
  const expense = thisMonth.filter(t => t.type === 'EXPENSE').reduce((s, t) => s + t.amount, 0);
  const predictedBalance = income - expense;

  const healthScore = totalBudget > 0
    ? Math.min(100, Math.max(0, Math.round(100 - (expense / totalBudget) * 100)))
    : expense > 0 ? 0 : 100;

  const expensesByCategory = thisMonth.filter(t => t.type === 'EXPENSE').reduce((acc, t) => {
    acc[t.categoryId] = (acc[t.categoryId] || 0) + t.amount;
    return acc;
  }, {});
  const topCatId = Object.keys(expensesByCategory).sort((a, b) => expensesByCategory[b] - expensesByCategory[a])[0];
  const topCategoryName = topCatId ? getCat(topCatId).name : 'Diğer';
  const topCategoryRatio = topCatId ? Math.min(100, (expensesByCategory[topCatId] / (totalBudget || 1000)) * 100) : 0;

  // Haftalık gelir verileri
  const weeklyData = useMemo(() => {
    const weeks = [
      { label: '1.H', amount: 0 },
      { label: '2.H', amount: 0 },
      { label: '3.H', amount: 0 },
      { label: '4.H', amount: 0 },
    ];
    thisMonth.filter(t => t.type === 'INCOME').forEach(t => {
      const day = new Date(t.date).getDate();
      if (day <= 7) weeks[0].amount += t.amount;
      else if (day <= 14) weeks[1].amount += t.amount;
      else if (day <= 21) weeks[2].amount += t.amount;
      else weeks[3].amount += t.amount;
    });
    return weeks;
  }, [thisMonth]);

  // AI mesajı
  let aiMessage = "Bu ay bütçene sadık kaldın ve harika ilerliyorsun!";
  if (expense > totalBudget && totalBudget > 0) {
    aiMessage = "Bütçeni aşıyorsun! Harcamalarını kontrol altına almalısın.";
  } else if (expense > totalBudget * 0.8 && totalBudget > 0) {
    aiMessage = "Limitinin %80'ine ulaştın. Dikkatli ol.";
  }

  const recentTx = thisMonth.slice(0, 6);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.indigo} />}
      >
        {/* ── Karşılama ─────────────────────────────── */}
        <View style={styles.greetingSection}>
          <View>
            <Text style={styles.greeting}>Merhaba, {user?.full_name?.split(' ')[0] || 'Kullanıcı'}! 👋</Text>
            <Text style={styles.greetingSub}>Finansal durumun bugün oldukça iyi görünüyor.</Text>
          </View>
          <TouchableOpacity
            style={styles.addBtn}
            onPress={() => navigation.navigate('AddTransaction')}
            activeOpacity={0.85}
          >
            <Text style={styles.addBtnIcon}>+</Text>
          </TouchableOpacity>
        </View>

        {/* ── Aylık Gelir Analizi ───────────────────── */}
        <Card style={styles.incomeCard}>
          <Text style={styles.cardTitle}>Aylık Gelir Analizi</Text>
          <Text style={styles.cardSub}>Bu aya ait gelir dağılımı</Text>

          <View style={styles.chartArea}>
            <View style={styles.chartHeader}>
              <Text style={styles.chartLabel}>AKTİVİTE GRAFİĞİ</Text>
            </View>
            <Text style={styles.incomeAmount}>{fmt(income)}</Text>

            {income === 0 ? (
              <View style={styles.emptyChart}>
                <Text style={styles.emptyChartIcon}>📊</Text>
                <Text style={styles.emptyChartText}>Veri girişi yapılana kadar{'\n'}grafik boş görünecektir.</Text>
              </View>
            ) : (
              <MiniChart data={weeklyData} height={120} />
            )}
          </View>

          {/* Quick Navigation Buttons */}
          <View style={styles.quickNav}>
            {[
              { icon: '₺', label: 'Goals', color: '#F4B266', onPress: () => navigation.navigate('BudgetTab') },
              { icon: '🎯', label: 'Monthly Plan', color: '#2853FF' },
              { icon: '⚙️', label: 'Settings', color: '#4FD1C5', onPress: () => navigation.navigate('ProfileTab') },
            ].map((item, i) => (
              <TouchableOpacity key={i} style={styles.quickNavBtn} onPress={item.onPress} activeOpacity={0.7}>
                <View style={[styles.quickNavIcon, { backgroundColor: item.color }]}>
                  <Text style={styles.quickNavIconText}>{item.icon}</Text>
                </View>
                <Text style={styles.quickNavLabel}>{item.label}</Text>
                <Text style={styles.quickNavArrow}>›</Text>
              </TouchableOpacity>
            ))}
          </View>
        </Card>

        {/* ── Finansal Özet ─────────────────────────── */}
        <Text style={styles.sectionTitle}>Finansal Özet</Text>
        <View style={styles.summaryGrid}>
          {[
            { title: 'Tahmini Bakiye', amount: fmt(predictedBalance), bg: COLORS.pastelYellow, sub: 'Ay Sonu' },
            { title: 'Aylık Gelir', amount: fmt(income), bg: COLORS.pastelGreen, sub: 'Gerçekleşen' },
            { title: 'Aylık Gider', amount: fmt(expense), bg: COLORS.pastelLime, sub: 'Toplam' },
            { title: 'İşlem Sayısı', amount: `${thisMonth.length}`, bg: COLORS.pastelPurple, sub: 'Bu Ay' },
          ].map((item, i) => (
            <View key={i} style={[styles.summaryCard, { backgroundColor: item.bg }]}>
              <Text style={styles.summaryTitle}>{item.title}</Text>
              <Text style={styles.summarySub}>{item.sub}</Text>
              <Text style={styles.summaryAmount}>{item.amount}</Text>
            </View>
          ))}
        </View>

        {/* ── AI Finansal Sağlık ────────────────────── */}
        <Card style={styles.aiCard}>
          <TouchableOpacity onPress={() => navigation.navigate('AIHealth')} activeOpacity={0.9}>
            <Text style={styles.cardTitle}>AI Finansal Sağlık</Text>
            <Text style={styles.cardSub}>Bütçe Analiz Skoru</Text>

            <View style={styles.gaugeWrap}>
              <HealthGauge score={healthScore} size={180} />
            </View>

            <View style={styles.aiNote}>
              <Text style={styles.aiNoteIcon}>🤖</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.aiNoteLabel}>AKILLI NOT</Text>
                <Text style={styles.aiNoteText}>{aiMessage}</Text>
              </View>
            </View>

            <TouchableOpacity 
              style={styles.aiDetailBtn} 
              onPress={() => navigation.navigate('AIHealth')}
            >
              <Text style={styles.aiDetailBtnText}>DETAYLI ANALİZİ GÖR →</Text>
            </TouchableOpacity>
          </TouchableOpacity>

          {/* Top Category Bar */}

          <View style={styles.topCatSection}>
            <View style={styles.topCatHeader}>
              <Text style={styles.topCatLabel}>En Çok Harcama: {topCategoryName}</Text>
              <Text style={[styles.topCatPct, topCategoryRatio > 85 && { color: COLORS.orange }]}>%{Math.round(topCategoryRatio)}</Text>
            </View>
            <View style={styles.topCatBar}>
              <View style={[styles.topCatBarFill, { width: `${topCategoryRatio}%`, backgroundColor: topCategoryRatio > 85 ? COLORS.orange : COLORS.indigo }]} />
            </View>
          </View>
        </Card>

        {/* ── Son İşlemler ──────────────────────────── */}
        <View style={styles.recentHeader}>
          <Text style={styles.sectionTitle}>Son İşlemler</Text>
          <TouchableOpacity onPress={() => navigation.navigate('TransactionsTab')}>
            <Text style={styles.seeAll}>TÜMÜNÜ GÖR ›</Text>
          </TouchableOpacity>
        </View>

        <Card>
          {recentTx.length === 0 ? (
            <EmptyState icon="📂" title="Henüz işlem yok" message="Yeni kayıt ekleyerek başla" />
          ) : (
            recentTx.map(tx => (
              <TransactionItem key={tx.id} item={tx} />
            ))
          )}
        </Card>

        {/* ── Quick Links ───────────────────────────── */}
        <View style={styles.quickLinks}>
          <TouchableOpacity style={styles.quickLink} onPress={() => navigation.navigate('Payments')} activeOpacity={0.7}>
            <View style={[styles.quickLinkIcon, { backgroundColor: '#FFE4D6' }]}>
              <Text style={{ fontSize: 20 }}>📅</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.quickLinkTitle}>Ödeme Takvimi</Text>
              <Text style={styles.quickLinkSub}>Gelecek ödemelerini planla</Text>
            </View>
            <Text style={styles.quickLinkArrow}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.quickLink} onPress={() => navigation.navigate('Investments')} activeOpacity={0.7}>
            <View style={[styles.quickLinkIcon, { backgroundColor: '#E0E7FF' }]}>
              <Text style={{ fontSize: 20 }}>💼</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.quickLinkTitle}>Yatırım Portföyü</Text>
              <Text style={styles.quickLinkSub}>Varlıklarını takip et</Text>
            </View>
            <Text style={styles.quickLinkArrow}>›</Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 30 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  scrollView: { flex: 1 },
  scrollContent: { paddingHorizontal: 20, paddingTop: 60, paddingBottom: 20 },

  greetingSection: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  greeting: { fontSize: 26, fontWeight: '800', color: COLORS.text1, letterSpacing: -0.5, marginBottom: 4 },
  greetingSub: { fontSize: 12, fontWeight: '600', color: COLORS.text3 },
  addBtn: { width: 48, height: 48, borderRadius: RADIUS.xl, backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center', ...SHADOWS.lg },
  addBtnIcon: { fontSize: 24, fontWeight: '300', color: COLORS.white },

  incomeCard: { marginBottom: 20 },
  cardTitle: { fontSize: 18, fontWeight: '800', color: COLORS.text1, letterSpacing: -0.3, marginBottom: 2 },
  cardSub: { fontSize: 11, fontWeight: '600', color: COLORS.text3, marginBottom: 16 },

  chartArea: { backgroundColor: COLORS.bg, borderRadius: RADIUS.xxl, padding: 20, marginBottom: 16 },
  chartHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  chartLabel: { fontSize: 10, fontWeight: '800', color: COLORS.text3, letterSpacing: 1.5 },
  incomeAmount: { fontSize: 30, fontWeight: '800', color: COLORS.text1, letterSpacing: -1, marginBottom: 16 },

  emptyChart: { height: 100, borderWidth: 2, borderStyle: 'dashed', borderColor: COLORS.border, borderRadius: RADIUS.xl, alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.bg2 + '50' },
  emptyChartIcon: { fontSize: 24, opacity: 0.4, marginBottom: 6 },
  emptyChartText: { fontSize: 10, fontWeight: '700', color: COLORS.text3, textAlign: 'center', letterSpacing: 0.5 },

  quickNav: { gap: 8 },
  quickNavBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.white, borderRadius: RADIUS.xxl, paddingVertical: 14, paddingHorizontal: 18, borderWidth: 1, borderColor: COLORS.border, ...SHADOWS.sm },
  quickNavIcon: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', marginRight: 14 },
  quickNavIconText: { fontSize: 18, fontWeight: '800', color: COLORS.white },
  quickNavLabel: { flex: 1, fontSize: 15, fontWeight: '800', color: COLORS.text1 },
  quickNavArrow: { fontSize: 22, fontWeight: '300', color: COLORS.text3 },

  sectionTitle: { fontSize: 18, fontWeight: '800', color: COLORS.text1, marginBottom: 14, letterSpacing: -0.3 },

  summaryGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 20 },
  summaryCard: { width: '47%', borderRadius: RADIUS.xxl, padding: 18, minHeight: 110, justifyContent: 'space-between', ...SHADOWS.sm },
  summaryTitle: { fontSize: 11, fontWeight: '800', color: COLORS.text1, opacity: 0.6, textTransform: 'uppercase', letterSpacing: 0.5 },
  summarySub: { fontSize: 8, fontWeight: '700', color: COLORS.text1 + '66', marginTop: 2 },
  summaryAmount: { fontSize: 20, fontWeight: '800', color: COLORS.text1, letterSpacing: -0.5, marginTop: 8 },

  aiCard: { marginBottom: 20 },
  gaugeWrap: { alignItems: 'center', marginVertical: 16 },
  aiNote: { flexDirection: 'row', backgroundColor: COLORS.pastelIndigo, borderRadius: RADIUS.xxl, padding: 16, gap: 12, alignItems: 'flex-start', marginTop: 8 },
  aiNoteIcon: { fontSize: 22, marginTop: 2 },
  aiNoteLabel: { fontSize: 10, fontWeight: '800', color: COLORS.text1, letterSpacing: 1.5, marginBottom: 4 },
  aiNoteText: { fontSize: 12, fontWeight: '600', color: COLORS.text2, lineHeight: 18 },
  aiDetailBtn: { marginTop: 16, backgroundColor: COLORS.pastelIndigo, paddingVertical: 12, borderRadius: RADIUS.lg, alignItems: 'center' },
  aiDetailBtnText: { fontSize: 10, fontWeight: '800', color: COLORS.indigo, letterSpacing: 1 },

  topCatSection: { marginTop: 16 },
  topCatHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  topCatLabel: { fontSize: 10, fontWeight: '800', color: COLORS.text3, letterSpacing: 0.5 },
  topCatPct: { fontSize: 11, fontWeight: '800', color: COLORS.indigo },
  topCatBar: { height: 8, backgroundColor: COLORS.bg2, borderRadius: 4, overflow: 'hidden' },
  topCatBarFill: { height: '100%', borderRadius: 4 },

  recentHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  seeAll: { fontSize: 11, fontWeight: '800', color: COLORS.indigo, letterSpacing: 1 },

  quickLinks: { gap: 12, marginTop: 20 },
  quickLink: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.white, borderRadius: RADIUS.xxl, padding: 18, borderWidth: 1, borderColor: COLORS.border, ...SHADOWS.sm },
  quickLinkIcon: { width: 48, height: 48, borderRadius: RADIUS.lg, alignItems: 'center', justifyContent: 'center', marginRight: 14 },
  quickLinkTitle: { fontSize: 15, fontWeight: '800', color: COLORS.text1 },
  quickLinkSub: { fontSize: 11, fontWeight: '600', color: COLORS.text3, marginTop: 2 },
  quickLinkArrow: { fontSize: 24, fontWeight: '300', color: COLORS.text3, marginLeft: 8 },
});
