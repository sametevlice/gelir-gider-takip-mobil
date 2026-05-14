import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, StatusBar } from 'react-native';
import { COLORS, RADIUS, SHADOWS } from '../constants/theme';
import { useStore, fmt } from '../store/useStore';
import Card from '../components/Card';
import DonutChart from '../components/DonutChart';
import EmptyState from '../components/EmptyState';

const ASSET_META = {
  GOLD: { icon: '🥇', color: '#FFB547', bg: '#FFF7ED' },
  STOCK: { icon: '📈', color: '#4318FF', bg: '#EEF2FF' },
  CRYPTO: { icon: '🪙', color: '#F7931A', bg: '#FFF7ED' },
  FX: { icon: '💵', color: '#05CD99', bg: '#ECFDF5' },
};

export default function InvestmentsScreen({ navigation }) {
  const investments = useStore(s => s.investments);
  const updateInvestmentPrice = useStore(s => s.updateInvestmentPrice);
  const [selectedType, setSelectedType] = useState('all');

  const assets = investments.map(a => {
    const totalCost = a.amount * a.buyPrice;
    const totalValue = a.amount * a.currentPrice;
    const pnl = totalValue - totalCost;
    const pnlPct = totalCost > 0 ? ((pnl / totalCost) * 100).toFixed(2) : 0;
    const meta = ASSET_META[a.type] || { icon: '💎', color: '#8B5CF6', bg: '#F5F3FF' };
    return { ...a, ...meta, totalCost, totalValue, pnl, pnlPct: parseFloat(pnlPct) };
  });

  const totalInvestment = assets.reduce((s, a) => s + a.totalCost, 0);
  const totalValue = assets.reduce((s, a) => s + a.totalValue, 0);
  const totalPnl = totalValue - totalInvestment;
  const totalPnlPct = totalInvestment > 0 ? ((totalPnl / totalInvestment) * 100).toFixed(2) : 0;

  const typeGroups = {};
  assets.forEach(a => { if (!typeGroups[a.type]) typeGroups[a.type] = { value: 0, color: a.color }; typeGroups[a.type].value += a.totalValue; });
  const donutData = Object.entries(typeGroups).map(([name, d]) => ({ name, value: d.value, color: d.color }));

  const filtered = selectedType === 'all' ? assets : assets.filter(a => a.type === selectedType);
  const types = ['all', ...Object.keys(ASSET_META)];

  return (
    <View style={st.container}>
      <StatusBar barStyle="dark-content" />
      <ScrollView contentContainerStyle={st.scroll} showsVerticalScrollIndicator={false}>
        <View style={st.headerRow}>
          <TouchableOpacity style={st.backBtn} onPress={() => navigation.goBack()}><Text style={st.backIcon}>←</Text></TouchableOpacity>
          <Text style={st.title}>Yatırım Portföyü</Text>
        </View>
        <Text style={st.subtitle}>Varlıklarını ve kar/zarar durumunu anlık takip et.</Text>

        {/* Summary Cards */}
        <View style={st.summaryRow}>
          <View style={[st.sumCard, { backgroundColor: COLORS.bg2 }]}>
            <Text style={st.sumIcon}>💼</Text>
            <Text style={st.sumLabel}>TOPLAM YATIRIM</Text>
            <Text style={st.sumValue}>{fmt(totalInvestment)}</Text>
          </View>
          <View style={[st.sumCard, { backgroundColor: totalPnl >= 0 ? '#ECFDF5' : '#FEF2F2' }]}>
            <Text style={st.sumIcon}>{totalPnl >= 0 ? '📈' : '📉'}</Text>
            <Text style={st.sumLabel}>KAR / ZARAR</Text>
            <Text style={[st.sumValue, { color: totalPnl >= 0 ? COLORS.green : COLORS.red }]}>{totalPnl >= 0 ? '+' : ''}{fmt(totalPnl)}</Text>
          </View>
        </View>

        <View style={[st.sumCardFull, { backgroundColor: '#EEF2FF' }]}>
          <Text style={{ fontSize: 24, marginRight: 12 }}>💰</Text>
          <View>
            <Text style={st.sumLabel}>GÜNCEL DEĞER</Text>
            <Text style={[st.sumValue, { color: COLORS.indigo }]}>{fmt(totalValue)}</Text>
          </View>
          <View style={[st.pnlBadge, { backgroundColor: totalPnl >= 0 ? COLORS.green : COLORS.red }]}>
            <Text style={st.pnlBadgeText}>{totalPnl >= 0 ? '▲' : '▼'} %{Math.abs(totalPnlPct)}</Text>
          </View>
        </View>

        {/* Donut Chart */}
        <Card style={{ marginBottom: 20, alignItems: 'center' }}>
          <Text style={st.cardTitle}>Varlık Dağılımı</Text>
          <Text style={st.cardSub}>YATIRIM TÜRLERİNE GÖRE</Text>
          <DonutChart data={donutData} size={180} centerLabel="Portföy Değeri" centerValue={fmt(totalValue)} />
          <View style={st.legendGrid}>
            {donutData.map(d => (
              <TouchableOpacity key={d.name} style={[st.legendBtn, selectedType === d.name && st.legendBtnSel]} onPress={() => setSelectedType(selectedType === d.name ? 'all' : d.name)}>
                <View style={[st.legendDot, { backgroundColor: d.color }]} />
                <Text style={st.legendName}>{d.name}</Text>
                <Text style={st.legendPct}>%{totalValue > 0 ? ((d.value / totalValue) * 100).toFixed(0) : 0}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </Card>

        {/* Type Filter */}
        <View style={st.filterRow}>
          {types.map(t => (
            <TouchableOpacity key={t} style={[st.filterBtn, selectedType === t && st.filterBtnActive]} onPress={() => setSelectedType(t)}>
              <Text style={[st.filterText, selectedType === t && { color: COLORS.white }]}>{t === 'all' ? 'Tümü' : t}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Asset List */}
        {filtered.length === 0 ? (
          <Card><EmptyState icon="💼" title="Yatırım bulunamadı" message="Varlık ekleyerek portföyünü oluştur" /></Card>
        ) : (
          filtered.map(a => (
            <Card key={a.id} style={{ marginBottom: 12 }}>
              <View style={st.assetRow}>
                <View style={[st.assetIcon, { backgroundColor: a.bg }]}><Text style={{ fontSize: 22 }}>{a.icon}</Text></View>
                <View style={{ flex: 1 }}>
                  <Text style={st.assetName}>{a.name}</Text>
                  <Text style={st.assetType}>{a.type}</Text>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={st.assetPrice}>{fmt(a.currentPrice)}</Text>
                  <Text style={[st.assetPnl, { color: a.pnl >= 0 ? COLORS.green : COLORS.red }]}>{a.pnl >= 0 ? '▲' : '▼'} {fmt(Math.abs(a.pnl))}</Text>
                </View>
              </View>
              <View style={st.assetDetails}>
                <View style={st.assetDetail}><Text style={st.detailLabel}>Miktar</Text><Text style={st.detailValue}>{a.amount}</Text></View>
                <View style={st.assetDetail}><Text style={st.detailLabel}>Maliyet</Text><Text style={st.detailValue}>{fmt(a.buyPrice)}</Text></View>
                <View style={st.assetDetail}><Text style={st.detailLabel}>K/Z %</Text><Text style={[st.detailValue, { color: a.pnl >= 0 ? COLORS.green : COLORS.red }]}>%{Math.abs(a.pnlPct)}</Text></View>
              </View>
              <TouchableOpacity style={st.simBtn} onPress={() => updateInvestmentPrice(a.id, a.currentPrice * (1 + (Math.random() * 0.1 - 0.04)))}>
                <Text style={st.simBtnText}>SİMÜLE ET</Text>
              </TouchableOpacity>
            </Card>
          ))
        )}
        <View style={{ height: 30 }} />
      </ScrollView>
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
  summaryRow: { flexDirection: 'row', gap: 12, marginBottom: 12 },
  sumCard: { flex: 1, borderRadius: RADIUS.xxl, padding: 16, ...SHADOWS.sm },
  sumIcon: { fontSize: 24, marginBottom: 8 },
  sumLabel: { fontSize: 9, fontWeight: '800', color: COLORS.text1 + '66', letterSpacing: 1 },
  sumValue: { fontSize: 18, fontWeight: '800', color: COLORS.text1, marginTop: 4 },
  sumCardFull: { flexDirection: 'row', alignItems: 'center', borderRadius: RADIUS.xxl, padding: 18, marginBottom: 20, ...SHADOWS.sm },
  pnlBadge: { marginLeft: 'auto', paddingHorizontal: 12, paddingVertical: 6, borderRadius: RADIUS.md },
  pnlBadgeText: { fontSize: 11, fontWeight: '800', color: COLORS.white, letterSpacing: 0.5 },
  cardTitle: { fontSize: 18, fontWeight: '800', color: COLORS.text1, marginBottom: 2, alignSelf: 'flex-start' },
  cardSub: { fontSize: 10, fontWeight: '800', color: COLORS.text3, letterSpacing: 1, marginBottom: 16, alignSelf: 'flex-start' },
  legendGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 16, width: '100%' },
  legendBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 8, paddingHorizontal: 14, borderRadius: RADIUS.md, borderWidth: 1, borderColor: 'transparent' },
  legendBtnSel: { backgroundColor: COLORS.bg, borderColor: COLORS.border2 },
  legendDot: { width: 10, height: 10, borderRadius: 5 },
  legendName: { fontSize: 12, fontWeight: '800', color: COLORS.text1 },
  legendPct: { fontSize: 11, fontWeight: '600', color: COLORS.text3 },
  filterRow: { flexDirection: 'row', backgroundColor: COLORS.bg2, borderRadius: RADIUS.full, padding: 4, gap: 4, marginBottom: 16 },
  filterBtn: { flex: 1, paddingVertical: 10, borderRadius: RADIUS.full, alignItems: 'center' },
  filterBtnActive: { backgroundColor: COLORS.primary, ...SHADOWS.sm },
  filterText: { fontSize: 9, fontWeight: '800', color: COLORS.text3, letterSpacing: 0.5 },
  assetRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  assetIcon: { width: 48, height: 48, borderRadius: RADIUS.lg, alignItems: 'center', justifyContent: 'center' },
  assetName: { fontSize: 15, fontWeight: '800', color: COLORS.text1 },
  assetType: { fontSize: 10, fontWeight: '700', color: COLORS.text3, letterSpacing: 1 },
  assetPrice: { fontSize: 15, fontWeight: '800', color: COLORS.text1, marginBottom: 2 },
  assetPnl: { fontSize: 11, fontWeight: '700' },
  assetDetails: { flexDirection: 'row', gap: 16, marginTop: 14, paddingTop: 14, borderTopWidth: 1, borderTopColor: COLORS.border },
  assetDetail: { flex: 1 },
  detailLabel: { fontSize: 9, fontWeight: '800', color: COLORS.text3, letterSpacing: 0.5, marginBottom: 4 },
  detailValue: { fontSize: 13, fontWeight: '700', color: COLORS.text1 },
  simBtn: { backgroundColor: COLORS.bg2, paddingVertical: 10, borderRadius: RADIUS.md, alignItems: 'center', marginTop: 12, borderWidth: 1, borderColor: COLORS.border },
  simBtnText: { fontSize: 10, fontWeight: '800', color: COLORS.text2, letterSpacing: 1 },
});
