import React, { useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator, StatusBar } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { COLORS, RADIUS, SHADOWS } from '../constants/theme';
import { useStore, getCat, fmt } from '../store/useStore';
import Card from '../components/Card';

// ── Web-matching Gauge Chart (SVG half-circle) ────────────
function GaugeChart({ score = 50, size = 200 }) {
  const w = size;
  const h = size / 2 + 20;
  const cx = 50, cy = 50, r = 40;
  const sw = 10;

  // Background arc
  const bgArc = `M 10 50 A ${r} ${r} 0 0 1 90 50`;
  // Score arc — dash offset
  const totalLen = Math.PI * r; // ~125.6
  const offset = totalLen * (1 - Math.max(0, score) / 100);

  // Color based on score (web logic)
  let color = '#05CD99';
  let label = 'Harika';
  let labelBg = '#ECFDF5';
  let labelBorder = '#A7F3D0';
  let labelColor = '#059669';
  if (score < 40) {
    color = '#E02424'; label = 'Kritik';
    labelBg = '#FEF2F2'; labelBorder = '#FECACA'; labelColor = '#DC2626';
  } else if (score < 70) {
    color = '#F97316'; label = 'Uyarı';
    labelBg = '#FFF7ED'; labelBorder = '#FED7AA'; labelColor = '#C2410C';
  } else if (score < 85) {
    color = '#3B82F6'; label = 'İyi';
    labelBg = '#EFF6FF'; labelBorder = '#BFDBFE'; labelColor = '#2563EB';
  }

  return (
    <View style={{ alignItems: 'center' }}>
      <View style={{ width: w, height: h, alignItems: 'center', justifyContent: 'flex-end' }}>
        <Svg viewBox="0 0 100 55" width={w} height={h}>
          <Path d={bgArc} fill="none" stroke="#F4F7FE" strokeWidth={sw} strokeLinecap="round" />
          <Path
            d={bgArc} fill="none" stroke={color} strokeWidth={sw} strokeLinecap="round"
            strokeDasharray={`${totalLen}`} strokeDashoffset={`${offset}`}
          />
        </Svg>
        <View style={styles.gaugeCenter}>
          <Text style={styles.gaugeScore}>{score}</Text>
          <Text style={styles.gaugeSkorLabel}>SKOR</Text>
        </View>
      </View>
      <View style={[styles.scoreBadge, { backgroundColor: labelBg, borderColor: labelBorder }]}>
        <Text style={[styles.scoreBadgeText, { color: labelColor }]}>{label}</Text>
      </View>
    </View>
  );
}

export default function AIHealthScreen({ navigation }) {
  const aiScore = useStore(s => s.aiScore);
  const aiNote = useStore(s => s.aiNote);
  const isAnalyzing = useStore(s => s.isAnalyzing);
  const analyzeFinancialHealth = useStore(s => s.analyzeFinancialHealth);
  const transactions = useStore(s => s.transactions);
  const totalBudget = useStore(s => s.totalBudget);

  useEffect(() => {
    if (aiScore === null) {
      analyzeFinancialHealth();
    }
  }, []);

  const now = new Date();
  const month = now.getMonth();
  const year = now.getFullYear();

  const thisMonth = transactions.filter(t => {
    const d = new Date(t.date);
    return d.getMonth() === month && d.getFullYear() === year;
  });

  const expense = thisMonth.filter(t => t.type === 'EXPENSE').reduce((s, t) => s + t.amount, 0);
  const income = thisMonth.filter(t => t.type === 'INCOME').reduce((s, t) => s + t.amount, 0);

  // Top expense category
  const expensesByCategory = thisMonth.filter(t => t.type === 'EXPENSE').reduce((acc, t) => {
    acc[t.categoryId] = (acc[t.categoryId] || 0) + t.amount;
    return acc;
  }, {});
  const topCatId = Object.keys(expensesByCategory).sort((a, b) => expensesByCategory[b] - expensesByCategory[a])[0];
  const topCategoryName = topCatId ? getCat(topCatId).name : 'Faturalar';
  const topCategoryRatio = topCatId ? Math.min(100, (expensesByCategory[topCatId] / (totalBudget || 1000)) * 100) : 0;

  // Fallback score if AI hasn't analyzed yet
  const displayScore = aiScore !== null ? aiScore : (
    totalBudget > 0 ? Math.min(100, Math.max(0, Math.round(100 - (expense / totalBudget) * 100))) : 50
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
          <Text style={styles.title}>AI Finansal Sağlık</Text>
          <View style={{ width: 44 }} />
        </View>

        {/* Main Card */}
        <Card style={styles.mainCard}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>AI Finansal Sağlık</Text>
            <Text style={styles.cardSub}>BÜTÇE ANALİZ SKORU</Text>
          </View>

          {/* Gauge */}
          <View style={styles.gaugeContainer}>
            {isAnalyzing ? (
              <View style={styles.loaderContainer}>
                <ActivityIndicator size="large" color={COLORS.indigo} />
                <Text style={styles.loaderText}>Analiz ediliyor...</Text>
              </View>
            ) : (
              <GaugeChart score={displayScore} size={200} />
            )}
          </View>

          {/* Refresh Button */}
          {!isAnalyzing && (
            <TouchableOpacity
              style={styles.refreshBtn}
              onPress={() => analyzeFinancialHealth()}
              activeOpacity={0.7}
            >
              <Text style={styles.refreshBtnText}>🔄 YENİLE</Text>
            </TouchableOpacity>
          )}

          {/* Smart Note */}
          <View style={styles.noteBox}>
            <View style={styles.noteHeader}>
              <View style={styles.noteIconWrap}>
                <Text style={styles.noteIcon}>🤖</Text>
              </View>
              <Text style={styles.noteTitle}>AKILLI NOT</Text>
              <TouchableOpacity
                style={styles.miniRefresh}
                onPress={() => analyzeFinancialHealth()}
                disabled={isAnalyzing}
              >
                <Text style={styles.miniRefreshText}>
                  {isAnalyzing ? '⏳ BEKLEYİN' : '🔄 YENİLE'}
                </Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.noteContent}>
              {isAnalyzing
                ? "Verileriniz işleniyor..."
                : (aiNote || "Harcamalarınızı analiz etmem için yukarıdaki butona tıklayın.")}
            </Text>
          </View>

          {/* Financial Summary */}
          <View style={styles.summaryRow}>
            <View style={[styles.summaryItem, { backgroundColor: '#ECFDF5' }]}>
              <Text style={styles.summaryLabel}>AYLIK GELİR</Text>
              <Text style={[styles.summaryValue, { color: '#059669' }]}>{fmt(income)}</Text>
            </View>
            <View style={[styles.summaryItem, { backgroundColor: '#FEF2F2' }]}>
              <Text style={styles.summaryLabel}>AYLIK GİDER</Text>
              <Text style={[styles.summaryValue, { color: '#DC2626' }]}>{fmt(expense)}</Text>
            </View>
          </View>

          {/* Top Category Bar */}
          <View style={styles.topSpending}>
            <View style={styles.spendingHeader}>
              <Text style={styles.spendingLabel}>EN ÇOK HARCAMA: {topCategoryName.toUpperCase()}</Text>
              <Text style={[styles.spendingValue, topCategoryRatio > 80 && { color: COLORS.orange }]}>
                %{Math.round(topCategoryRatio)}
              </Text>
            </View>
            <View style={styles.progressBar}>
              <View
                style={[
                  styles.progressFill,
                  {
                    width: `${topCategoryRatio}%`,
                    backgroundColor: topCategoryRatio > 80 ? COLORS.orange : COLORS.indigo,
                  },
                ]}
              />
            </View>
          </View>
        </Card>

        {/* Category Breakdown */}
        {Object.keys(expensesByCategory).length > 0 && (
          <Card style={styles.breakdownCard}>
            <Text style={styles.breakdownTitle}>Kategori Bazlı Harcamalar</Text>
            <Text style={styles.breakdownSub}>BU AY İÇİN</Text>
            {Object.entries(expensesByCategory)
              .sort((a, b) => b[1] - a[1])
              .slice(0, 6)
              .map(([catId, amount]) => {
                const cat = getCat(catId);
                const pct = Math.round((amount / expense) * 100);
                return (
                  <View key={catId} style={styles.breakdownItem}>
                    <View style={[styles.breakdownIcon, { backgroundColor: cat.color + '20' }]}>
                      <Text style={{ fontSize: 16 }}>{cat.icon}</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.breakdownName}>{cat.name}</Text>
                      <View style={styles.breakdownBar}>
                        <View style={[styles.breakdownBarFill, { width: `${pct}%`, backgroundColor: cat.color }]} />
                      </View>
                    </View>
                    <View style={{ alignItems: 'flex-end' }}>
                      <Text style={styles.breakdownAmount}>{fmt(amount)}</Text>
                      <Text style={styles.breakdownPct}>%{pct}</Text>
                    </View>
                  </View>
                );
              })}
          </Card>
        )}

        {/* Footer */}
        <View style={styles.footerInfo}>
          <Text style={styles.footerText}>
            Bu analiz Gemini 1.5 Flash yapay zeka modeli tarafından son 20 işleminiz baz alınarak oluşturulmuştur.
          </Text>
        </View>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  scroll: { paddingHorizontal: 20, paddingTop: 60, paddingBottom: 40 },

  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 },
  backBtn: {
    width: 44, height: 44, borderRadius: 22, backgroundColor: COLORS.white,
    alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: COLORS.border,
  },
  backIcon: { fontSize: 20, color: COLORS.text2 },
  title: { fontSize: 20, fontWeight: '800', color: '#11142D' },

  mainCard: { padding: 24, borderRadius: 32, backgroundColor: COLORS.white, ...SHADOWS.md },
  cardHeader: { marginBottom: 20 },
  cardTitle: { fontSize: 22, fontWeight: '900', color: '#11142D', marginBottom: 4 },
  cardSub: { fontSize: 10, fontWeight: '800', color: COLORS.text3, letterSpacing: 2 },

  gaugeContainer: { alignItems: 'center', justifyContent: 'center', marginVertical: 10, minHeight: 160 },
  gaugeCenter: { position: 'absolute', bottom: 20, alignItems: 'center' },
  gaugeScore: { fontSize: 36, fontWeight: '800', color: '#11142D', letterSpacing: -1 },
  gaugeSkorLabel: { fontSize: 9, fontWeight: '800', color: COLORS.text3, letterSpacing: 2, marginTop: 2 },

  scoreBadge: { paddingHorizontal: 16, paddingVertical: 6, borderRadius: 20, borderWidth: 1, marginTop: 8 },
  scoreBadgeText: { fontSize: 10, fontWeight: '800', letterSpacing: 2 },

  loaderContainer: { alignItems: 'center' },
  loaderText: { marginTop: 10, fontSize: 14, fontWeight: '700', color: COLORS.text3 },

  refreshBtn: {
    backgroundColor: '#FFF5F0', paddingVertical: 12, paddingHorizontal: 24,
    borderRadius: 20, alignSelf: 'center', marginTop: 10, marginBottom: 24,
    borderWidth: 1, borderColor: '#FFE0D0',
  },
  refreshBtnText: { fontSize: 11, fontWeight: '800', color: COLORS.orange, letterSpacing: 1.5 },

  noteBox: {
    backgroundColor: '#F4F7FE', borderRadius: 24, padding: 20, marginBottom: 24,
    borderWidth: 1, borderColor: '#E0E7FF',
  },
  noteHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  noteIconWrap: {
    width: 32, height: 32, borderRadius: 10, backgroundColor: COLORS.indigo,
    alignItems: 'center', justifyContent: 'center', marginRight: 10,
  },
  noteIcon: { fontSize: 16 },
  noteTitle: { flex: 1, fontSize: 11, fontWeight: '800', color: '#11142D', letterSpacing: 2 },
  miniRefresh: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.white,
    paddingVertical: 6, paddingHorizontal: 12, borderRadius: 12,
    borderWidth: 1, borderColor: '#E0E7FF',
  },
  miniRefreshText: { fontSize: 9, fontWeight: '800', color: COLORS.indigo },
  noteContent: { fontSize: 13, fontWeight: '600', color: '#475569', lineHeight: 20 },

  summaryRow: { flexDirection: 'row', gap: 10, marginBottom: 20 },
  summaryItem: { flex: 1, borderRadius: 16, padding: 14, alignItems: 'center' },
  summaryLabel: { fontSize: 8, fontWeight: '800', letterSpacing: 1.5, color: '#11142D', opacity: 0.5, marginBottom: 4 },
  summaryValue: { fontSize: 16, fontWeight: '800', letterSpacing: -0.5 },

  topSpending: { marginTop: 4 },
  spendingHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  spendingLabel: { fontSize: 9, fontWeight: '800', color: COLORS.text3, letterSpacing: 1 },
  spendingValue: { fontSize: 12, fontWeight: '800', color: COLORS.indigo },
  progressBar: { height: 8, backgroundColor: '#F0F0F0', borderRadius: 4, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 4 },

  breakdownCard: { marginTop: 16, padding: 20 },
  breakdownTitle: { fontSize: 17, fontWeight: '800', color: '#11142D', marginBottom: 2 },
  breakdownSub: { fontSize: 9, fontWeight: '800', color: COLORS.text3, letterSpacing: 2, marginBottom: 16 },
  breakdownItem: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  breakdownIcon: { width: 36, height: 36, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  breakdownName: { fontSize: 13, fontWeight: '700', color: '#11142D', marginBottom: 4 },
  breakdownBar: { height: 4, backgroundColor: '#F0F0F0', borderRadius: 2, overflow: 'hidden' },
  breakdownBarFill: { height: '100%', borderRadius: 2 },
  breakdownAmount: { fontSize: 13, fontWeight: '800', color: '#11142D' },
  breakdownPct: { fontSize: 9, fontWeight: '700', color: COLORS.text3, marginTop: 2 },

  footerInfo: { marginTop: 24, paddingHorizontal: 10 },
  footerText: { fontSize: 11, fontWeight: '500', color: COLORS.text3, textAlign: 'center', lineHeight: 16 },
});
