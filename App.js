import React, { useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useStore } from './src/store/useStore';
import AppNavigator from './src/navigation/AppNavigator';
import Toast from './src/components/Toast';

export default function App() {
  const initialize = useStore(s => s.initialize);
  const isInitialized = useStore(s => s.isInitialized);

  useEffect(() => {
    initialize();
  }, []);

  if (!isInitialized) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#4318FF" />
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <AppNavigator />
      <Toast />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FAFBFC',
  },
});