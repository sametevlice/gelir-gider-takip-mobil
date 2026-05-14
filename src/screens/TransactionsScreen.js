import React, { useState, useMemo } from 'react';
import { View, Text, FlatList, TouchableOpacity, TextInput, StyleSheet, StatusBar } from 'react-native';
import { COLORS, RADIUS, FONT_SIZE, SHADOWS } from '../constants/theme';
import { useStore, getCat, fmt, fmtDate } from '../store/useStore';
import TransactionItem from '../components/TransactionItem';
import EmptyState from '../components/EmptyState';

export default function TransactionsScreen({ navigation }) {
  const transactions = useStore(s => s.transactions);
  const deleteTransaction = useStore(s => s.deleteTransaction);

  const [filter, setFilter] = useState('ALL');
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    return transactions
      .filter(t => {
        if (filter === 'INCOME') return t.type === 'INCOME';
        if (filter === 'EXPENSE') return t.type === 'EXPENSE';
        return true;
      })
      .filter(t => {
        const term = search.toLowerCase();
        return (t.description || '').toLowerCase().includes(term) || getCat(t.categoryId).name.toLowerCase().includes(term);
      })
      .sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [transactions, filter, search]);

  const totalIncome = filtered.filter(t => t.type === 'INCOME').reduce((s, t) => s + t.amount, 0);
  const totalExpense = filtered.filter(t => t.type === 'EXPENSE').reduce((s, t) => s + t.amount, 0);

  const filters = [
    { id: 'ALL', label: 'Tümü' },
    { id: 'INCOME', label: 'Gelir' },
    { id: 'EXPENSE', label: 'Gider' },
  ];

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>İşlem Geçmişi</Text>
        <Text style={styles.subtitle}>Tüm finansal hareketlerini detaylıca incele.</Text>
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterRow}>
        {filters.map(f => (
          <TouchableOpacity
            key={f.id}
            onPress={() => setFilter(f.id)}
            style={[styles.filterBtn, filter === f.id && styles.filterBtnActive]}
            activeOpacity={0.7}
          >
            <Text style={[styles.filterText, filter === f.id && styles.filterTextActive]}>{f.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Search */}
      <View style={styles.searchWrap}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={styles.searchInput}
          placeholder="İşlemlerde ara..."
          placeholderTextColor={COLORS.text3}
          value={search}
          onChangeText={setSearch}
        />
      </View>

      {/* Summary */}
      <View style={styles.summaryRow}>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>TOPLAM GELİR</Text>
          <Text style={[styles.summaryValue, { color: COLORS.green }]}>{fmt(totalIncome)}</Text>
        </View>
        <View style={[styles.summaryItem, { borderLeftWidth: 1, borderLeftColor: COLORS.border }]}>
          <Text style={styles.summaryLabel}>TOPLAM GİDER</Text>
          <Text style={[styles.summaryValue, { color: COLORS.red }]}>{fmt(totalExpense)}</Text>
        </View>
      </View>

      {/* List */}
      <FlatList
        data={filtered}
        keyExtractor={item => item.id}
        renderItem={({ item }) => <TransactionItem item={item} />}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={<EmptyState icon="🔍" title="İşlem bulunamadı" message="Farklı bir filtre veya arama dene" />}
      />

      {/* FAB */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('AddTransaction')}
        activeOpacity={0.85}
      >
        <Text style={styles.fabIcon}>+</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  header: { paddingHorizontal: 20, paddingTop: 60, paddingBottom: 16 },
  title: { fontSize: 28, fontWeight: '800', color: COLORS.text1, letterSpacing: -0.5, marginBottom: 4 },
  subtitle: { fontSize: 12, fontWeight: '600', color: COLORS.text3 },

  filterRow: { flexDirection: 'row', paddingHorizontal: 20, marginBottom: 14, backgroundColor: COLORS.bg2, marginHorizontal: 20, borderRadius: RADIUS.full, padding: 4, gap: 4 },
  filterBtn: { flex: 1, paddingVertical: 12, borderRadius: RADIUS.full, alignItems: 'center' },
  filterBtnActive: { backgroundColor: COLORS.primary, ...SHADOWS.md },
  filterText: { fontSize: 11, fontWeight: '800', color: COLORS.text3, letterSpacing: 0.5 },
  filterTextActive: { color: COLORS.white },

  searchWrap: { flexDirection: 'row', alignItems: 'center', marginHorizontal: 20, marginBottom: 14, backgroundColor: COLORS.white, borderRadius: RADIUS.full, paddingHorizontal: 16, borderWidth: 1, borderColor: COLORS.border },
  searchIcon: { fontSize: 14, marginRight: 8 },
  searchInput: { flex: 1, paddingVertical: 14, fontSize: 13, fontWeight: '600', color: COLORS.text1 },

  summaryRow: { flexDirection: 'row', marginHorizontal: 20, marginBottom: 10, backgroundColor: COLORS.white, borderRadius: RADIUS.xl, padding: 14, borderWidth: 1, borderColor: COLORS.border },
  summaryItem: { flex: 1, alignItems: 'center', paddingHorizontal: 8 },
  summaryLabel: { fontSize: 9, fontWeight: '800', color: COLORS.text3, letterSpacing: 1, marginBottom: 4 },
  summaryValue: { fontSize: 15, fontWeight: '800', letterSpacing: -0.3 },

  listContent: { paddingHorizontal: 20, paddingBottom: 100 },

  fab: { position: 'absolute', bottom: 30, right: 24, width: 56, height: 56, borderRadius: 28, backgroundColor: COLORS.indigo, alignItems: 'center', justifyContent: 'center', ...SHADOWS.lg, shadowColor: COLORS.indigo },
  fabIcon: { fontSize: 28, fontWeight: '300', color: COLORS.white },
});
