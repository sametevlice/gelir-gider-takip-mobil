import React, { useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator, StatusBar } from 'react-native';
import { COLORS, RADIUS, SPACING, FONT_SIZE, SHADOWS } from '../constants/theme';
import { useStore, getCat } from '../store/useStore';
import Card from '../components/Card';
import HealthGauge from '../components/HealthGauge';

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

  const expensesByCategory = thisMonth.filter(t => t.type === 'EXPENSE').reduce((acc, t) => {
    acc[t.categoryId] = (acc[t.categoryId] || 0) + t.amount;
    return acc;
  }, {});

  const topCatId = Object.keys(expensesByCategory).sort((a, b) => expensesByCategory[b] - expensesByCategory[a])[0];
  const topCategoryName = topCatId ? getCat(topCatId).name : 'Faturalar';
  const topCategoryRatio = topCatId ? Math.min(100, (expensesByCategory[topCatId] / (totalBudget || 1000)) * 100) : 100;

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

        <Card style={styles.mainCard}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>AI Finansal Sağlık</Text>
            <Text style={styles.cardSub}>Bütçe Analiz Skoru</Text>
          </View>

          <View style={styles.gaugeContainer}>
            {isAnalyzing ? (
              <View style={styles.loaderContainer}>
                <ActivityIndicator size="large" color={COLORS.primary} />
                <Text style={styles.loaderText}>Analiz ediliyor...</Text>
              </View>
            ) : (
              <HealthGauge score={aiScore || 50} size={220} />
            )}
          </View>

          {!isAnalyzing && (
            <TouchableOpacity 
              style={styles.refreshBtn} 
              onPress={() => analyzeFinancialHealth()}
              activeOpacity={0.7}
            >
              <Text style={styles.refreshBtnText}>🔄 YENİLE</Text>
            </TouchableOpacity>
          )}

          {/* Smart Note Box */}
          <View style={styles.noteBox}>
            <View style={styles.noteHeader}>
              <View style={styles.noteIconWrap}>
                <Text style={styles.noteIcon}>🤖</Text>
              </View>
              <Text style={styles.noteTitle}>AKILLI NOT</Text>
              <TouchableOpacity 
                style={styles.miniRefresh} 
                onPress={() => analyzeFinancialHealth()}
              >
                <Text style={styles.miniRefreshText}>🔄 YENİLE</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.noteContent}>
              {isAnalyzing ? "Verileriniz işleniyor..." : (aiNote || "Harcamalarınızı analiz etmem için yukarıdaki butona tıklayın.")}
            </Text>
          </View>

          {/* Top Spending Bar */}
          <View style={styles.topSpending}>
            <View style={styles.spendingHeader}>
              <Text style={styles.spendingLabel}>EN ÇOK HARCAMA: {topCategoryName.toUpperCase()}</Text>
              <Text style={styles.spendingValue}>%{Math.round(topCategoryRatio)}</Text>
            </View>
            <View style={styles.progressBar}>
              <View 
                style={[
                  styles.progressFill, 
                  { width: `${topCategoryRatio}%`, backgroundColor: topCategoryRatio > 80 ? COLORS.red : COLORS.orange }
                ]} 
              />
            </View>
          </View>
        </Card>

        {/* Footer Info */}
        <View style={styles.footerInfo}>
          <Text style={styles.footerText}>
            Bu analiz Gemini 1.5 Pro yapay zeka modeli tarafından son 20 işleminiz baz alınarak oluşturulmuştur.
          </Text>
        </View>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  scroll: {
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  backIcon: {
    fontSize: 20,
    color: COLORS.text2,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.text1,
  },
  mainCard: {
    padding: 24,
    borderRadius: 32,
    backgroundColor: COLORS.white,
    ...SHADOWS.md,
  },
  cardHeader: {
    marginBottom: 20,
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: COLORS.text1,
    marginBottom: 4,
  },
  cardSub: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text3,
  },
  gaugeContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 10,
    height: 160,
  },
  loaderContainer: {
    alignItems: 'center',
  },
  loaderText: {
    marginTop: 10,
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.text3,
  },
  refreshBtn: {
    backgroundColor: '#FFF5F0',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 20,
    alignSelf: 'center',
    marginTop: 10,
    marginBottom: 30,
    borderWidth: 1,
    borderColor: '#FFE0D0',
  },
  refreshBtnText: {
    fontSize: 12,
    fontWeight: '900',
    color: COLORS.orange,
    letterSpacing: 1,
  },
  noteBox: {
    backgroundColor: '#F8F9FF',
    borderRadius: 24,
    padding: 20,
    marginBottom: 30,
    borderWidth: 1,
    borderColor: '#EEF0FF',
  },
  noteHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  noteIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: COLORS.indigo,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  noteIcon: {
    fontSize: 16,
  },
  noteTitle: {
    flex: 1,
    fontSize: 12,
    fontWeight: '900',
    color: COLORS.text1,
    letterSpacing: 1,
  },
  miniRefresh: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  miniRefreshText: {
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.primary,
  },
  noteContent: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text2,
    lineHeight: 22,
  },
  topSpending: {
    marginTop: 10,
  },
  spendingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  spendingLabel: {
    fontSize: 12,
    fontWeight: '900',
    color: COLORS.text3,
    letterSpacing: 0.5,
  },
  spendingValue: {
    fontSize: 14,
    fontWeight: '900',
    color: COLORS.orange,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#F0F0F0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  footerInfo: {
    marginTop: 24,
    paddingHorizontal: 10,
  },
  footerText: {
    fontSize: 11,
    fontWeight: '500',
    color: COLORS.text3,
    textAlign: 'center',
    lineHeight: 16,
  }
});
