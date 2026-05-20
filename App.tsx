import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Platform, StatusBar } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import * as Notifications from 'expo-notifications';
import { TabBar, type TabId } from './src/components/TabBar';
import { LiveScreen } from './src/screens/LiveScreen';
import { HistoryScreen } from './src/screens/HistoryScreen';
import { useTraderData } from './src/hooks/useTraderData';
import { registerBackgroundFetch } from './src/background/positionTask';
import { scheduleDailyWeeklySummaries } from './src/services/alertEngine';
import { APP_NAME } from './src/constants';
import { colors, spacing } from './src/theme';

async function setupNotifications() {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('trades', {
      name: 'Nouveaux trades',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 120, 250],
      sound: 'default',
    });
  }
  const { status } = await Notifications.getPermissionsAsync();
  if (status !== 'granted') {
    await Notifications.requestPermissionsAsync();
  }
}

export default function App() {
  const [tab, setTab] = useState<TabId>('live');
  const data = useTraderData();

  useEffect(() => {
    setupNotifications();
    scheduleDailyWeeklySummaries();
    registerBackgroundFetch();
  }, []);

  return (
    <SafeAreaProvider>
      <View style={styles.root}>
        <StatusBar barStyle="light-content" backgroundColor={colors.bg} />
        <SafeAreaView style={styles.safe} edges={['top']}>
          <View style={styles.header}>
            <Text style={styles.appName}>{APP_NAME}</Text>
            <Text style={styles.tagline}>
              Suivez les trades de Neymo en temps réel
            </Text>
            <View style={styles.liveRow}>
              <View
                style={[
                  styles.dot,
                  { backgroundColor: data.wsConnected ? colors.green : colors.textDim },
                ]}
              />
              <Text style={styles.liveText}>Temps réel</Text>
            </View>
          </View>

          <TabBar active={tab} onChange={setTab} />

          {tab === 'live' ? (
            <LiveScreen
              positions={data.positions}
              orders={data.orders}
              mids={data.mids}
              accountValue={data.accountValue}
              loading={data.loading}
              error={data.error}
              lastUpdate={data.lastUpdate}
              refreshing={data.refreshing}
              priceTick={data.priceTick}
              onRefresh={data.refresh}
            />
          ) : (
            <HistoryScreen
              history={data.history}
              allTimePnl={data.allTimePnl}
              loading={data.loading}
              refreshing={data.refreshing}
              onRefresh={data.refresh}
            />
          )}
        </SafeAreaView>
      </View>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  safe: { flex: 1 },
  header: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.cardBorder,
  },
  appName: {
    color: colors.text,
    fontSize: 22,
    fontWeight: '600',
    letterSpacing: -0.3,
  },
  tagline: {
    color: colors.textMuted,
    fontSize: 14,
    marginTop: 4,
    lineHeight: 20,
  },
  liveRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: spacing.sm },
  dot: { width: 6, height: 6, borderRadius: 3 },
  liveText: { color: colors.green, fontSize: 12, fontWeight: '500' },
});
