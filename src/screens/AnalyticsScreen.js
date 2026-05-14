import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, StatusBar } from 'react-native';
import Svg, { Rect } from 'react-native-svg';
import { COLORS, RADIUS, SHADOWS } from '../constants/theme';
import { useStore, getCat, fmt } from '../store/useStore';
import Card from '../components/Card';
import DonutChart from '../components/DonutChart';

export default function AnalyticsScreen() {
  const transactions = useStore(s => s.transactions);
  const [period, setPeriod] = useState(6);

  const now = new Date();
  const months = [];
  for (let i = period - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push({ year: d.getFullYear(), month: d.getMonth(), label: d.toLocaleDateString('tr-TR', { month: 'short' }) });
  }

  const chartData = months.map(m => {
    const txs = transactions.filter(t => { const d = new Date(t.date); return d.getFullYear() === m.year && d.getMonth() === m.month; });
    return { name: m.label, gelir: txs.filter(t => t.type === 'INCOME').reduce((s, t) => s + t.amount, 0), gider: txs.filter(t => t.type === 'EXPENSE').reduce((s, t) => s + t.amount, 0) };
  });
  const maxVal = Math.max(...chartData.map(d => Math.max(d.gelir, d.gider)), 1);

  const catSpend = {};
  transactions.filter(t => t.type === 'EXPENSE').forEach(t => { catSpend[t.categoryId || 'cat15'] = (catSpend[t.categoryId || 'cat15'] || 0) + t.amount; });
  const topCats = Object.entries(catSpend).sort((a, b) => b[1] - a[1]).map(([id, value]) => ({ id, value, name: getCat(id).name, icon: getCat(id).icon, color: getCat(id).color }));
  const totalExp = topCats.reduce((s, t) => s + t.value, 0);
  const donutData = topCats.map(c => ({ value: c.value, color: c.color, name: c.name }));

  const periods = [{ v: 3, l: '3 AY' }, { v: 6, l: '6 AY' }, { v: 12, l: '12 AY' }];
  const barW = 20;
  const chartH = 160;

  return (
    <View style={st.container}>
      <StatusBar barStyle="dark-content" />
      <ScrollView contentContainerStyle={st.scroll} showsVerticalScrollIndicator={false}>
        <Text style={st.title}>Finansal Analiz</Text>
        <Text style={st.subtitle}>Harcama ve gelir dengeni detaylıca incele.</Text>

        {/* Period */}
        <View style={st.periodRow}>
          {periods.map(p => (
            <TouchableOpacity key={p.v} style={[st.periodBtn, period === p.v && st.periodBtnActive]} onPress={() => setPeriod(p.v)}>
              <Text style={[st.periodText, period === p.v && st.periodTextActive]}>{p.l}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Bar Chart */}
        <Card style={{ marginBottom: 20 }}>
          <Text style={st.cardTitle}>Gelir & Gider Akışı</Text>
          <Text style={st.cardSub}>AYLIK KARŞILAŞTIRMA</Text>
          <View style={st.legend}>
            <View style={st.legendItem}><View style={[st.legendDot, { backgroundColor: COLORS.indigo }]} /><Text style={st.legendText}>Gelir</Text></View>
            <View style={st.legendItem}><View style={[st.legendDot, { backgroundColor: COLORS.red }]} /><Text style={st.legendText}>Gider</Text></View>
          </View>
          <View style={[st.barChart, { height: chartH + 30 }]}>
            {chartData.map((d, i) => (
              <View key={i} style={st.barCol}>
                <View style={[st.barContainer, { height: chartH }]}>
                  <View style={[st.bar, { height: Math.max(4, (d.gelir / maxVal) * chartH), backgroundColor: COLORS.indigo }]} />
                  <View style={[st.bar, { height: Math.max(4, (d.gider / maxVal) * chartH), backgroundColor: COLORS.red, marginLeft: 4 }]} />
                </View>
                <Text style={st.barLabel}>{d.name}</Text>
              </View>
            ))}
          </View>
        </Card>

        {/* Donut */}
        <Card style={{ marginBottom: 20 }}>
          <Text style={st.cardTitle}>Kategori Dağılımı</Text>
          <Text style={st.cardSub}>EN ÇOK HARCANANLAR</Text>
          <View style={st.donutWrap}>
            <DonutChart data={donutData} size={180} centerLabel={topCats[0]?.name} centerValue={`%${totalExp > 0 ? ((topCats[0]?.value / totalExp) * 100).toFixed(0) : 0}`} />
          </View>
          {topCats.slice(0, 5).map((c, i) => {
            const pct = totalExp > 0 ? ((c.value / totalExp) * 100).toFixed(1) : 0;
            return (
              <View key={i} style={st.catRow}>
                <View style={[st.catIcon, { backgroundColor: c.color + '20' }]}><Text>{c.icon}</Text></View>
                <View style={{ flex: 1 }}>
                  <View style={st.catInfo}><Text style={st.catName}>{c.name}</Text><Text style={st.catPct}>%{pct}</Text></View>
                  <View style={st.catBar}><View style={[st.catBarFill, { width: `${pct}%`, backgroundColor: c.color }]} /></View>
                </View>
              </View>
            );
          })}
        </Card>

        {/* Detail Table */}
        <Card>
          <Text style={st.cardTitle}>Kategori Detayları</Text>
          <Text style={st.cardSub}>HARCAMA ANALİZİ</Text>
          {topCats.length === 0 ? (
            <Text style={st.emptyText}>Henüz harcama kaydı yok.</Text>
          ) : (
            topCats.map((c, i) => (
              <View key={i} style={st.detailRow}>
                <View style={[st.catIcon, { backgroundColor: c.color + '20' }]}><Text>{c.icon}</Text></View>
                <Text style={st.detailName}>{c.name}</Text>
                <Text style={st.detailAmount}>{fmt(c.value)}</Text>
              </View>
            ))
          )}
        </Card>
        <View style={{ height: 30 }} />
      </ScrollView>
    </View>
  );
}

const st = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  scroll: { paddingHorizontal: 20, paddingTop: 60, paddingBottom: 20 },
  title: { fontSize: 28, fontWeight: '800', color: COLORS.text1, marginBottom: 4 },
  subtitle: { fontSize: 12, fontWeight: '600', color: COLORS.text3, marginBottom: 16 },
  periodRow: { flexDirection: 'row', backgroundColor: COLORS.bg2, borderRadius: RADIUS.full, padding: 4, gap: 4, marginBottom: 20 },
  periodBtn: { flex: 1, paddingVertical: 10, borderRadius: RADIUS.full, alignItems: 'center' },
  periodBtnActive: { backgroundColor: COLORS.primary, ...SHADOWS.sm },
  periodText: { fontSize: 10, fontWeight: '800', color: COLORS.text3, letterSpacing: 1 },
  periodTextActive: { color: COLORS.white },
  cardTitle: { fontSize: 18, fontWeight: '800', color: COLORS.text1, marginBottom: 2 },
  cardSub: { fontSize: 10, fontWeight: '800', color: COLORS.text3, letterSpacing: 1, marginBottom: 16 },
  legend: { flexDirection: 'row', gap: 16, marginBottom: 14 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
  legendText: { fontSize: 10, fontWeight: '800', color: COLORS.text3, letterSpacing: 1 },
  barChart: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'flex-end' },
  barCol: { alignItems: 'center' },
  barContainer: { flexDirection: 'row', alignItems: 'flex-end' },
  bar: { width: 20, borderRadius: 4 },
  barLabel: { fontSize: 9, fontWeight: '700', color: COLORS.text3, marginTop: 6, textTransform: 'uppercase' },
  donutWrap: { alignItems: 'center', marginVertical: 20 },
  catRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 14 },
  catIcon: { width: 36, height: 36, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  catInfo: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  catName: { fontSize: 13, fontWeight: '800', color: COLORS.text1 },
  catPct: { fontSize: 11, fontWeight: '700', color: COLORS.text3 },
  catBar: { height: 6, backgroundColor: COLORS.bg2, borderRadius: 3, overflow: 'hidden' },
  catBarFill: { height: '100%', borderRadius: 3 },
  detailRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  detailName: { flex: 1, fontSize: 14, fontWeight: '800', color: COLORS.text1 },
  detailAmount: { fontSize: 14, fontWeight: '800', color: COLORS.text1 },
  emptyText: { fontSize: 14, fontWeight: '700', color: COLORS.text3, textAlign: 'center', paddingVertical: 30 },
});
