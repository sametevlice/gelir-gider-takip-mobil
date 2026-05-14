import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, StyleSheet, StatusBar, Alert } from 'react-native';
import { COLORS, RADIUS, SHADOWS, FONT_SIZE } from '../constants/theme';
import { useStore, CATEGORIES, getCat, fmt } from '../store/useStore';
import Card from '../components/Card';
import BudgetBar from '../components/BudgetBar';
import EmptyState from '../components/EmptyState';

export default function BudgetScreen() {
  const transactions = useStore(s => s.transactions);
  const totalBudget = useStore(s => s.totalBudget);
  const setTotalBudget = useStore(s => s.setTotalBudget);
  const budgetLimits = useStore(s => s.budgetLimits);
  const updateBudgetLimit = useStore(s => s.updateBudgetLimit);
  const goals = useStore(s => s.goals);
  const addGoal = useStore(s => s.addGoal);
  const addToGoal = useStore(s => s.addToGoal);
  const deleteGoal = useStore(s => s.deleteGoal);
  const showToast = useStore(s => s.showToast);

  const [showAddGoal, setShowAddGoal] = useState(false);
  const [goalName, setGoalName] = useState('');
  const [goalTarget, setGoalTarget] = useState('');
  const [goalIcon, setGoalIcon] = useState('🎯');
  const [editingCat, setEditingCat] = useState(null);
  const [tempLimit, setTempLimit] = useState('');

  const now = new Date();
  const month = now.getMonth();
  const year = now.getFullYear();

  const monthExpenses = useMemo(() => {
    return transactions
      .filter(t => t.type === 'EXPENSE' && new Date(t.date).getMonth() === month && new Date(t.date).getFullYear() === year)
      .reduce((acc, t) => { acc[t.categoryId || 'cat15'] = (acc[t.categoryId || 'cat15'] || 0) + t.amount; return acc; }, {});
  }, [transactions]);

  const totalExpense = Object.values(monthExpenses).reduce((s, v) => s + v, 0);
  const totalSaved = goals.reduce((s, g) => s + (g.saved || 0), 0);

  const budgetItems = CATEGORIES.filter(c => c.id !== 'cat15').map(c => ({
    catId: c.id, spent: monthExpenses[c.id] || 0, limit: budgetLimits[c.id] || 0,
  })).sort((a, b) => b.limit - a.limit || b.spent - a.spent);

  const handleAddGoal = () => {
    if (!goalName || !goalTarget) return showToast('Alanları doldurun', 'error');
    addGoal({ name: goalName, target: parseFloat(goalTarget), saved: 0, icon: goalIcon });
    setGoalName(''); setGoalTarget(''); setShowAddGoal(false);
    showToast('Hedef eklendi!', 'success');
  };

  return (
    <View style={st.container}>
      <StatusBar barStyle="dark-content" />
      <ScrollView contentContainerStyle={st.scroll} showsVerticalScrollIndicator={false}>
        <Text style={st.title}>Bütçe Yönetimi</Text>
        <Text style={st.subtitle}>Bütçeni planla, harcamalarını kontrol altında tut.</Text>

        {/* Summary Cards */}
        <View style={st.summaryRow}>
          <View style={[st.summaryCard, { backgroundColor: COLORS.pastelYellow }]}>
            <Text style={st.summaryLabel}>AYLIK BÜTÇE</Text>
            <Text style={st.summaryValue}>{fmt(totalBudget)}</Text>
            <TouchableOpacity onPress={() => {
              Alert.prompt('Aylık Bütçe', 'Yeni bütçe tutarını girin:', (val) => {
                if (val) setTotalBudget(parseFloat(val));
              }, 'plain-text', totalBudget.toString());
            }}>
              <Text style={st.editLink}>DÜZENLE</Text>
            </TouchableOpacity>
          </View>
          <View style={[st.summaryCard, { backgroundColor: COLORS.pastelGreen }]}>
            <Text style={st.summaryLabel}>BİRİKİM</Text>
            <Text style={st.summaryValue}>{fmt(totalSaved)}</Text>
          </View>
          <View style={[st.summaryCard, { backgroundColor: '#FEE2E2' }]}>
            <Text style={st.summaryLabel}>HARCAMA</Text>
            <Text style={st.summaryValue}>{fmt(totalExpense)}</Text>
          </View>
        </View>

        {/* Category Budgets */}
        <Card style={{ marginBottom: 20 }}>
          <Text style={st.cardTitle}>Kategori Bütçeleri</Text>
          <Text style={st.cardSub}>Limit belirleyip harcamanı takip et</Text>
          {budgetItems.map(b => (
            <TouchableOpacity key={b.catId} onPress={() => {
              if (editingCat === b.catId) { updateBudgetLimit(b.catId, parseFloat(tempLimit) || 0); setEditingCat(null); }
              else { setEditingCat(b.catId); setTempLimit(b.limit.toString()); }
            }} activeOpacity={0.7}>
              {editingCat === b.catId ? (
                <View style={st.editRow}>
                  <Text style={{ fontSize: 14 }}>{getCat(b.catId).icon} {getCat(b.catId).name}</Text>
                  <TextInput style={st.editInput} value={tempLimit} onChangeText={setTempLimit} keyboardType="numeric" autoFocus onBlur={() => { updateBudgetLimit(b.catId, parseFloat(tempLimit) || 0); setEditingCat(null); }} />
                </View>
              ) : (
                <BudgetBar catId={b.catId} spent={b.spent} limit={b.limit} />
              )}
            </TouchableOpacity>
          ))}
        </Card>

        {/* Savings Goals */}
        <View style={st.goalsHeader}>
          <Text style={st.cardTitle}>Birikim Hedefleri</Text>
          <TouchableOpacity style={st.addGoalBtn} onPress={() => setShowAddGoal(!showAddGoal)}>
            <Text style={st.addGoalText}>+ EKLE</Text>
          </TouchableOpacity>
        </View>

        {showAddGoal && (
          <Card style={{ marginBottom: 16 }}>
            <TextInput style={st.input} placeholder="Hedef adı" placeholderTextColor={COLORS.text3} value={goalName} onChangeText={setGoalName} />
            <TextInput style={[st.input, { marginTop: 10 }]} placeholder="Hedef tutar (₺)" placeholderTextColor={COLORS.text3} value={goalTarget} onChangeText={setGoalTarget} keyboardType="numeric" />
            <View style={st.emojiRow}>
              {['🎯', '🏠', '🚗', '✈️', '💻', '🎓'].map(e => (
                <TouchableOpacity key={e} style={[st.emojiBtn, goalIcon === e && st.emojiBtnSel]} onPress={() => setGoalIcon(e)}>
                  <Text style={{ fontSize: 22 }}>{e}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <TouchableOpacity style={st.saveGoalBtn} onPress={handleAddGoal}><Text style={st.saveGoalText}>KAYDET</Text></TouchableOpacity>
          </Card>
        )}

        {goals.length === 0 ? (
          <Card><EmptyState icon="🎯" title="Hedef yok" message="Birikim hedefi ekleyerek başla" /></Card>
        ) : (
          goals.map(g => {
            const pct = g.target > 0 ? Math.min(100, (g.saved / g.target) * 100) : 0;
            return (
              <Card key={g.id} style={{ marginBottom: 12 }}>
                <View style={st.goalRow}>
                  <Text style={{ fontSize: 28, marginRight: 14 }}>{g.icon || '🎯'}</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={st.goalName}>{g.name}</Text>
                    <Text style={st.goalProgress}>{fmt(g.saved)} / {fmt(g.target)}</Text>
                    <View style={st.goalBar}><View style={[st.goalBarFill, { width: `${pct}%` }]} /></View>
                  </View>
                  <Text style={st.goalPct}>%{Math.round(pct)}</Text>
                </View>
                <View style={st.goalActions}>
                  <TouchableOpacity style={st.goalAction} onPress={() => addToGoal(g.id, 100)}><Text style={st.goalActionText}>+₺100</Text></TouchableOpacity>
                  <TouchableOpacity style={st.goalAction} onPress={() => addToGoal(g.id, 500)}><Text style={st.goalActionText}>+₺500</Text></TouchableOpacity>
                  <TouchableOpacity style={[st.goalAction, { backgroundColor: '#FEE2E2' }]} onPress={() => deleteGoal(g.id)}><Text style={[st.goalActionText, { color: COLORS.red }]}>Sil</Text></TouchableOpacity>
                </View>
              </Card>
            );
          })
        )}
        <View style={{ height: 30 }} />
      </ScrollView>
    </View>
  );
}

const st = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  scroll: { paddingHorizontal: 20, paddingTop: 60, paddingBottom: 20 },
  title: { fontSize: 28, fontWeight: '800', color: COLORS.text1, letterSpacing: -0.5, marginBottom: 4 },
  subtitle: { fontSize: 12, fontWeight: '600', color: COLORS.text3, marginBottom: 20 },
  summaryRow: { flexDirection: 'row', gap: 10, marginBottom: 20 },
  summaryCard: { flex: 1, borderRadius: RADIUS.xxl, padding: 14, ...SHADOWS.sm },
  summaryLabel: { fontSize: 8, fontWeight: '800', color: COLORS.text1 + '88', letterSpacing: 1, marginBottom: 6 },
  summaryValue: { fontSize: 16, fontWeight: '800', color: COLORS.text1, letterSpacing: -0.3 },
  editLink: { fontSize: 9, fontWeight: '800', color: COLORS.indigo, letterSpacing: 1, marginTop: 6 },
  cardTitle: { fontSize: 18, fontWeight: '800', color: COLORS.text1, marginBottom: 2 },
  cardSub: { fontSize: 11, fontWeight: '600', color: COLORS.text3, marginBottom: 16 },
  editRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14, backgroundColor: COLORS.bg, borderRadius: RADIUS.md, padding: 12 },
  editInput: { width: 80, backgroundColor: COLORS.white, borderWidth: 1, borderColor: COLORS.indigo, borderRadius: RADIUS.sm, paddingHorizontal: 10, paddingVertical: 6, fontSize: 13, fontWeight: '700', color: COLORS.text1, textAlign: 'right' },
  goalsHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  addGoalBtn: { backgroundColor: COLORS.primary, paddingHorizontal: 16, paddingVertical: 8, borderRadius: RADIUS.full },
  addGoalText: { fontSize: 10, fontWeight: '800', color: COLORS.white, letterSpacing: 1 },
  input: { backgroundColor: COLORS.bg2, borderWidth: 1, borderColor: COLORS.border, borderRadius: RADIUS.md, paddingHorizontal: 16, paddingVertical: 14, fontSize: 14, fontWeight: '600', color: COLORS.text1 },
  emojiRow: { flexDirection: 'row', gap: 8, marginTop: 12 },
  emojiBtn: { width: 42, height: 42, borderRadius: RADIUS.md, backgroundColor: COLORS.bg, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: COLORS.border },
  emojiBtnSel: { borderColor: COLORS.indigo, backgroundColor: COLORS.pastelIndigo },
  saveGoalBtn: { backgroundColor: COLORS.primary, paddingVertical: 14, borderRadius: RADIUS.lg, alignItems: 'center', marginTop: 14 },
  saveGoalText: { fontSize: 12, fontWeight: '800', color: COLORS.white, letterSpacing: 1.5 },
  goalRow: { flexDirection: 'row', alignItems: 'center' },
  goalName: { fontSize: 15, fontWeight: '800', color: COLORS.text1, marginBottom: 2 },
  goalProgress: { fontSize: 11, fontWeight: '600', color: COLORS.text3, marginBottom: 8 },
  goalBar: { height: 8, backgroundColor: COLORS.bg2, borderRadius: 4, overflow: 'hidden' },
  goalBarFill: { height: '100%', borderRadius: 4, backgroundColor: COLORS.indigo },
  goalPct: { fontSize: 16, fontWeight: '800', color: COLORS.indigo, marginLeft: 12 },
  goalActions: { flexDirection: 'row', gap: 8, marginTop: 14 },
  goalAction: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: RADIUS.full, backgroundColor: COLORS.pastelIndigo },
  goalActionText: { fontSize: 11, fontWeight: '800', color: COLORS.indigo, letterSpacing: 0.5 },
});
