import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../api/supabase';
import { GoogleGenerativeAI } from '@google/generative-ai';

const GEMINI_API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);


const STORAGE_KEY = 'fintech_data';

// ── Kategoriler (web ile birebir aynı) ─────────────────
export const CATEGORIES = [
  { id: 'cat1',  name: 'Yemek & Kafe',     icon: '☕', color: '#FF6B6B' },
  { id: 'cat2',  name: 'Market',            icon: '🛒', color: '#4ECDC4' },
  { id: 'cat3',  name: 'Eğlence',           icon: '🎬', color: '#FFE66D' },
  { id: 'cat4',  name: 'Ulaşım',            icon: '🚗', color: '#1A535C' },
  { id: 'cat5',  name: 'Sağlık',            icon: '💊', color: '#FF9F1C' },
  { id: 'cat6',  name: 'Giyim',             icon: '👕', color: '#845EC2' },
  { id: 'cat7',  name: 'Kişisel Bakım',     icon: '🧴', color: '#D65DB1' },
  { id: 'cat8',  name: 'Ev & Yaşam',        icon: '🏠', color: '#FFC75F' },
  { id: 'cat9',  name: 'Eğitim',            icon: '📚', color: '#F9F871' },
  { id: 'cat10', name: 'Abonelikler',       icon: '📺', color: '#2C3E50' },
  { id: 'cat11', name: 'Faturalar',         icon: '🧾', color: '#95A5A6' },
  { id: 'cat12', name: 'Maaş',              icon: '💰', color: '#27AE60' },
  { id: 'cat13', name: 'Borçlar',           icon: '💳', color: '#E74C3C' },
  { id: 'cat14', name: 'Ek Gelir',          icon: '📈', color: '#F39C12' },
  { id: 'cat15', name: 'Diğer',             icon: '✨', color: '#BDC3C7' },
];

export const BRAND_LOGOS = [
  { keywords: ['netflix'], brand: 'Netflix', domain: 'netflix.com', color: '#E50914', categoryId: 'cat10' },
  { keywords: ['spotify'], brand: 'Spotify', domain: 'spotify.com', color: '#1DB954', categoryId: 'cat10' },
  { keywords: ['youtube', 'premium'], brand: 'YouTube', domain: 'youtube.com', color: '#FF0000', categoryId: 'cat10' },
  { keywords: ['apple', 'icloud'], brand: 'Apple', domain: 'apple.com', color: '#555555', categoryId: 'cat10' },
  { keywords: ['amazon', 'prime'], brand: 'Amazon', domain: 'amazon.com', color: '#FF9900', categoryId: 'cat2' },
  { keywords: ['google', 'drive'], brand: 'Google', domain: 'google.com', color: '#4285F4', categoryId: 'cat11' },
  { keywords: ['disney'], brand: 'Disney+', domain: 'disneyplus.com', color: '#113CCF', categoryId: 'cat10' },
  { keywords: ['adobe'], brand: 'Adobe', domain: 'adobe.com', color: '#FF0000', categoryId: 'cat5' },
];

export const detectBrand = (text) => {
  if (!text) return null;
  const lower = text.toLowerCase();
  return BRAND_LOGOS.find(b => b.keywords.some(k => lower.includes(k))) || null;
};

// ── Veri dönüştürücü ───────────────────────────────────
const mapTransaction = (t) => ({
  ...t,
  categoryId: t.categoryId || t.category || 'cat15',
  date: t.date ? t.date.split('T')[0] : new Date().toISOString().split('T')[0],
});

// ── AsyncStorage helper'ları ───────────────────────────
async function loadData() {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* ignore */ }
  return {
    user: null,
    transactions: [],
    goals: [],
    investments: [],
    payments: [],
    totalBudget: 0,
    budgetLimits: {},
  };
}

async function saveData(data) {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch { /* ignore */ }
}

// ── Zustand Store ──────────────────────────────────────
export const useStore = create((set, get) => ({
  user: null,
  transactions: [],
  goals: [],
  investments: [],
  payments: [],
  totalBudget: 0,
  budgetLimits: {},
  toastMsg: null,
  isLoading: false,
  isInitialized: false,
  aiScore: null,
  aiNote: null,
  isAnalyzing: false,

  // Uygulama başladığında AsyncStorage'dan veri yükle
  initialize: async () => {
    const data = await loadData();
    set({
      user: data.user,
      transactions: data.transactions || [],
      goals: data.goals || [],
      investments: data.investments || [],
      payments: data.payments || [],
      totalBudget: data.totalBudget || 0,
      budgetLimits: data.budgetLimits || {},
      isInitialized: true,
    });
  },

  // ── Toast ──────────────────────────────────────────
  showToast: (msg, type = 'success') => {
    set({ toastMsg: { msg, type } });
    setTimeout(() => set({ toastMsg: null }), 3000);
  },
  hideToast: () => set({ toastMsg: null }),

  // ── Auth ───────────────────────────────────────────
  login: async (email, password) => {
    set({ isLoading: true });
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      const user = { id: data.user.id, email: data.user.email, full_name: data.user.user_metadata?.full_name || '', currency: 'TRY' };
      set({ user });
      const state = get();
      await saveData({ ...state, user });
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    } finally {
      set({ isLoading: false });
    }
  },

  register: async (full_name, email, password) => {
    set({ isLoading: true });
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name } },
      });
      if (error) throw error;
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    } finally {
      set({ isLoading: false });
    }
  },

  setUser: (userData) => {
    const user = { ...userData, currency: userData?.currency || 'TRY' };
    set({ user });
    const state = get();
    saveData({ ...state, user });
  },

  logout: async () => {
    await supabase.auth.signOut();
    await AsyncStorage.removeItem(STORAGE_KEY);
    set({
      user: null,
      transactions: [],
      goals: [],
      investments: [],
      payments: [],
      totalBudget: 0,
      budgetLimits: {},
    });
  },

  updateUser: (updates) => {
    set((state) => {
      const user = { ...state.user, ...updates };
      saveData({ ...state, user });
      return { user };
    });
  },

  // ── Transactions ───────────────────────────────────
  setTransactions: (rawTransactions) => {
    const transactions = (rawTransactions || []).map(mapTransaction);
    set((state) => {
      saveData({ ...state, transactions });
      return { transactions };
    });
  },

  fetchTransactions: async () => {
    const user = get().user;
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false });
      if (error) throw error;
      get().setTransactions(data || []);
    } catch (err) {
      console.error('İşlem çekme hatası:', err);
    }
  },

  addTransaction: async (t) => {
    const user = get().user;
    if (!user) return;
    try {
      const payload = {
        user_id: user.id,
        type: t.type,
        amount: t.amount,
        description: t.description,
        category: t.categoryId || 'cat15',
        date: t.date || new Date().toISOString().split('T')[0],
      };
      const { data, error } = await supabase.from('transactions').insert([payload]).select();
      if (error) throw error;
      set((state) => {
        const transactions = [mapTransaction(data[0]), ...state.transactions];
        saveData({ ...state, transactions });
        return { transactions };
      });
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  },

  deleteTransaction: async (id) => {
    try {
      await supabase.from('transactions').delete().eq('id', id);
      set((state) => {
        const transactions = state.transactions.filter(t => t.id !== id);
        saveData({ ...state, transactions });
        return { transactions };
      });
    } catch (err) {
      console.error('Silme hatası:', err);
    }
  },

  // ── Goals ──────────────────────────────────────────
  setGoals: (goals) => {
    set((state) => {
      saveData({ ...state, goals });
      return { goals };
    });
  },

  addGoal: (g) => {
    set((state) => {
      const newG = { ...g, id: 'g_' + Date.now() };
      const goals = [...state.goals, newG];
      saveData({ ...state, goals });
      return { goals };
    });
  },

  updateGoal: (id, updates) => {
    set((state) => {
      const goals = state.goals.map(g => g.id === id ? { ...g, ...updates } : g);
      saveData({ ...state, goals });
      return { goals };
    });
  },

  addToGoal: (id, amount) => {
    set((state) => {
      const goals = state.goals.map(g => g.id === id ? { ...g, saved: g.saved + amount } : g);
      saveData({ ...state, goals });
      return { goals };
    });
  },

  deleteGoal: (id) => {
    set((state) => {
      const goals = state.goals.filter(g => g.id !== id);
      saveData({ ...state, goals });
      return { goals };
    });
  },

  // ── Investments ────────────────────────────────────
  setInvestments: (investments) => {
    set((state) => {
      saveData({ ...state, investments });
      return { investments };
    });
  },

  addInvestment: (inv) => {
    set((state) => {
      const newInv = { ...inv, id: 'i_' + Date.now() };
      const investments = [...state.investments, newInv];
      saveData({ ...state, investments });
      return { investments };
    });
  },

  deleteInvestment: (id) => {
    set((state) => {
      const investments = state.investments.filter(i => i.id !== id);
      saveData({ ...state, investments });
      return { investments };
    });
  },

  updateInvestmentPrice: (id, newPrice) => {
    set((state) => {
      const investments = state.investments.map(i => i.id === id ? { ...i, currentPrice: newPrice } : i);
      saveData({ ...state, investments });
      return { investments };
    });
  },

  // ── Payments ───────────────────────────────────────
  setPayments: (payments) => {
    set((state) => {
      saveData({ ...state, payments });
      return { payments };
    });
  },

  addPayment: (p) => {
    set((state) => {
      const newP = { ...p, id: 'p_' + Date.now() };
      const payments = [...state.payments, newP];
      saveData({ ...state, payments });
      return { payments };
    });
  },

  deletePayment: (id) => {
    set((state) => {
      const payments = state.payments.filter(p => p.id !== id);
      saveData({ ...state, payments });
      return { payments };
    });
  },

  markAsPaid: async (paymentId, date) => {
    const state = get();
    const payment = state.payments.find(p => p.id === paymentId);
    if (!payment) return;
    
    await get().addTransaction({
      type: 'EXPENSE',
      amount: payment.amount,
      description: payment.brand,
      categoryId: payment.categoryId,
      date: date || new Date().toISOString().split('T')[0],
    });
  },

  // ── Budget ─────────────────────────────────────────
  setTotalBudget: (amount) => {
    set((state) => {
      saveData({ ...state, totalBudget: amount });
      return { totalBudget: amount };
    });
  },

  updateBudgetLimit: (catId, amount) => {
    set((state) => {
      const budgetLimits = { ...state.budgetLimits, [catId]: amount };
      saveData({ ...state, budgetLimits });
      return { budgetLimits };
    });
  },

  // ── AI Financial Health ───────────────────────────
  analyzeFinancialHealth: async () => {
    const { transactions, user } = get();
    if (!user || transactions.length === 0) {
      set({ aiNote: "Analiz için henüz yeterli işlem verisi bulunmuyor.", aiScore: 0 });
      return;
    }

    set({ isAnalyzing: true });
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" }, { apiVersion: 'v1' });
      
      const formattedTxs = transactions.slice(0, 20).map(t => {
        const cat = getCat(t.categoryId).name;
        return `${t.date} - ${cat}: ${t.type === 'INCOME' ? '+' : '-'}${t.amount} TL (${t.description})`;
      }).join('\n');

      const prompt = `Sen bir finans uzmanısın. Kullanıcının şu harcamalarına bak:\n\n${formattedTxs}\n\nBu kullanıcıya çok kısa (max 120 karakter), samimi ve Türkçe bir finansal tavsiye ver. Ayrıca finansal durumunu 100 üzerinden puanla. Cevabını SADECE aşağıdaki gibi geçerli bir JSON formatında döndür, başka hiçbir metin veya markdown (örneğin \`\`\`json) ekleme:\n{"score": 85, "note": "Buraya tavsiyeni yaz"}`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      // JSON temizleme (bazı modeller ```json ... ``` içinde dönebiliyor)
      const cleanJson = text.replace(/```json/g, '').replace(/```/g, '').trim();
      const data = JSON.parse(cleanJson);

      set({ aiScore: data.score, aiNote: data.note });
    } catch (error) {
      console.error("AI Analiz Hatası:", error);
      set({ 
        aiScore: 50, 
        aiNote: "Şu an AI analiz servisine ulaşılamıyor, harcamalarınıza dikkat etmeye devam edin." 
      });
    } finally {
      set({ isAnalyzing: false });
    }
  },
}));

// ── Yardımcı Fonksiyonlar (web ile aynı) ──────────────
export const fmt = (val) => {
  return new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(val || 0);
};

export const fmtDate = (dateStr) => {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' });
};

export const fmtShortDate = (dateStr) => {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' });
};

export const getCat = (id) => {
  return CATEGORIES.find(c => c.id === id) || CATEGORIES[CATEGORIES.length - 1];
};
