import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Svg, { Path, Rect, Circle, Line, Polyline } from 'react-native-svg';
import { COLORS, SHADOWS } from '../constants/theme';
import { useStore } from '../store/useStore';

// Screens
import WelcomeScreen from '../screens/WelcomeScreen';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import DashboardScreen from '../screens/DashboardScreen';
import TransactionsScreen from '../screens/TransactionsScreen';
import AddTransactionScreen from '../screens/AddTransactionScreen';
import BudgetScreen from '../screens/BudgetScreen';
import AnalyticsScreen from '../screens/AnalyticsScreen';
import PaymentsScreen from '../screens/PaymentsScreen';
import InvestmentsScreen from '../screens/InvestmentsScreen';
import AccountScreen from '../screens/AccountScreen';
import AIHealthScreen from '../screens/AIHealthScreen';


const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// ── Tab Icons (SVG) ──────────────────────────────────────
const TabIcon = ({ name, color, size = 22 }) => {
  const sw = 2.2;
  const props = { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: color, strokeWidth: sw, strokeLinecap: 'round', strokeLinejoin: 'round' };

  switch (name) {
    case 'home':
      return <Svg {...props}><Rect x="3" y="3" width="7" height="7" rx="1.5" /><Rect x="14" y="3" width="7" height="7" rx="1.5" /><Rect x="3" y="14" width="7" height="7" rx="1.5" /><Rect x="14" y="14" width="7" height="7" rx="1.5" /></Svg>;
    case 'transactions':
      return <Svg {...props}><Path d="M21 15V19A2 2 0 0 1 19 21H5A2 2 0 0 1 3 19V15" /><Polyline points="17 8 12 3 7 8" /><Line x1="12" y1="3" x2="12" y2="15" /></Svg>;
    case 'budget':
      return <Svg {...props}><Path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><Polyline points="22,6 12,13 2,6" /></Svg>;
    case 'analytics':
      return <Svg {...props}><Path d="M18 20V10" /><Path d="M12 20V4" /><Path d="M6 20v-6" /></Svg>;
    case 'profile':
      return <Svg {...props}><Circle cx="12" cy="12" r="3" /><Path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.32 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" /></Svg>;
    default:
      return null;
  }
};

// ── Bottom Tab Navigator ─────────────────────────────────
function HomeTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused }) => {
          const iconMap = { HomeTab: 'home', TransactionsTab: 'transactions', BudgetTab: 'budget', AnalyticsTab: 'analytics', ProfileTab: 'profile' };
          return <TabIcon name={iconMap[route.name]} color={focused ? COLORS.primary : COLORS.text3} />;
        },
        tabBarLabel: ({ focused }) => {
          const labelMap = { HomeTab: 'Panel', TransactionsTab: 'İşlemler', BudgetTab: 'Bütçe', AnalyticsTab: 'Analiz', ProfileTab: 'Profil' };
          return <Text style={{ fontSize: 9, fontWeight: focused ? '800' : '600', color: focused ? COLORS.primary : COLORS.text3, marginTop: 2, letterSpacing: 0.5 }}>{labelMap[route.name]}</Text>;
        },
        tabBarStyle: {
          backgroundColor: COLORS.white,
          borderTopWidth: 1,
          borderTopColor: COLORS.border,
          height: Platform.OS === 'ios' ? 88 : 68,
          paddingTop: 8,
          paddingBottom: Platform.OS === 'ios' ? 28 : 8,
          ...SHADOWS.sm,
        },
        tabBarItemStyle: { gap: 2 },
      })}
    >
      <Tab.Screen name="HomeTab" component={DashboardScreen} />
      <Tab.Screen name="TransactionsTab" component={TransactionsScreen} />
      <Tab.Screen name="BudgetTab" component={BudgetScreen} />
      <Tab.Screen name="AnalyticsTab" component={AnalyticsScreen} />
      <Tab.Screen name="ProfileTab" component={AccountScreen} />
    </Tab.Navigator>
  );
}

// ── Auth Stack ───────────────────────────────────────────
function AuthStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Welcome" component={WelcomeScreen} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
    </Stack.Navigator>
  );
}

// ── Main Stack ───────────────────────────────────────────
function MainStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="MainTabs" component={HomeTabs} />
      <Stack.Screen name="AddTransaction" component={AddTransactionScreen} options={{ presentation: 'modal' }} />
      <Stack.Screen name="Payments" component={PaymentsScreen} />
      <Stack.Screen name="Investments" component={InvestmentsScreen} />
      <Stack.Screen name="AIHealth" component={AIHealthScreen} />
    </Stack.Navigator>

  );
}

// ── Root Navigator ───────────────────────────────────────
export default function AppNavigator() {
  const user = useStore(s => s.user);

  return (
    <NavigationContainer>
      {user ? <MainStack /> : <AuthStack />}
    </NavigationContainer>
  );
}
