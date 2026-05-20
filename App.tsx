import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Platform,
  StatusBar,
  Pressable,
  Linking,
  AppState,
} from 'react-native';
import * as ExpoLinking from 'expo-linking';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import * as Notifications from 'expo-notifications';
import { TabBar, type TabId } from './src/components/TabBar';
import { SyncBadge } from './src/components/SyncBadge';
import { TerminalTour } from './src/components/TerminalTour';
import { LiveScreen } from './src/screens/LiveScreen';
import { HistoryScreen } from './src/screens/HistoryScreen';
import { AboutScreen } from './src/screens/AboutScreen';
import { useTraderData } from './src/hooks/useTraderData';
import { registerBackgroundFetch } from './src/background/positionTask';
import { scheduleDailyWeeklySummaries } from './src/services/alertEngine';
import { registerRemotePush } from './src/services/remotePush';
import {
  onAppStateChange,
  setAndroidWatchMode,
  startGlobalPositionMonitoring,
  stopGlobalPositionMonitoring,
} from './src/services/positionMonitor';
import { tabFromDeepLink } from './src/services/deepLink';
import {
  BRAND_NAME,
  DATA_SCOPE,
  TERMINAL_NAME,
  TRADER_WALLET,
  hyperliquidExplorerUrl,
} from './src/constants';
import { truncateWallet } from './src/utils/wallet';
import { colors, spacing, typography } from './src/theme';

async function setupNotifications() {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('trades', {
      name: 'A&T CAPITAL · Terminal 277',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 120, 250],
      sound: 'default',
    });
  }
  const { status: existing } = await Notifications.getPermissionsAsync();
  if (existing !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    if (status !== 'granted') {
      console.warn('[notifs] Permission refusée');
    }
  }
}

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export default function App() {
  const [tab, setTab] = useState<TabId>('live');
  const [replayTour, setReplayTour] = useState(false);
  const data = useTraderData();

  const handleDeepLink = useCallback((url: string | null) => {
    const next = tabFromDeepLink(url);
    if (next) setTab(next);
  }, []);

  useEffect(() => {
    let mounted = true;

    async function boot() {
      await setupNotifications();
      await scheduleDailyWeeklySummaries();
      const remote = await registerRemotePush();
      if (!remote.ok) {
        console.warn('[remotePush] Enregistrement serveur:', remote.reason);
      }
      await registerBackgroundFetch();
      if (mounted) {
        startGlobalPositionMonitoring();
        await onAppStateChange(AppState.currentState);
      }
    }
    void boot();

    const appStateSub = AppState.addEventListener('change', (state) => {
      void onAppStateChange(state);
      if (state === 'active') {
        void registerRemotePush();
      }
    });

    ExpoLinking.getInitialURL().then(handleDeepLink);
    const linkSub = ExpoLinking.addEventListener('url', (event) => {
      handleDeepLink(event.url);
    });

    return () => {
      mounted = false;
      appStateSub.remove();
      linkSub.remove();
      stopGlobalPositionMonitoring();
      void setAndroidWatchMode(false);
    };
  }, [handleDeepLink]);

  const syncLabel = data.lastUpdate
    ? `Sync ${data.lastUpdate.toLocaleTimeString('fr-FR')}`
    : 'Sync en attente';

  return (
    <SafeAreaProvider>
      <View style={styles.root}>
        <StatusBar barStyle="light-content" backgroundColor={colors.bg} />
        <SafeAreaView style={styles.safe} edges={['top']}>
          <View style={styles.header}>
            <View style={styles.headerTop}>
              <View>
                <Text style={styles.brandMark}>A&T</Text>
                <Text style={styles.appName}>{BRAND_NAME}</Text>
                <Text style={styles.tagline}>{TERMINAL_NAME} · Hyperliquid</Text>
              </View>
              <View style={styles.liveRow}>
                <View
                  style={[
                    styles.dot,
                    {
                      backgroundColor: data.wsConnected ? colors.green : colors.textDim,
                    },
                  ]}
                />
                <Text style={styles.liveText}>
                  {data.wsConnected ? 'Flux connecté' : 'Synchronisation'}
                </Text>
              </View>
            </View>
            <SyncBadge lastUpdate={data.lastUpdate} wsConnected={data.wsConnected} />
          </View>

          <View style={styles.scopeBar}>
            <Text style={styles.scopeText}>{DATA_SCOPE}</Text>
            <View style={styles.scopeMeta}>
              <Text style={styles.scopeMetaText}>{syncLabel}</Text>
              <Text style={styles.scopeMetaText}> · API HL</Text>
              <Pressable
                onPress={() => Linking.openURL(hyperliquidExplorerUrl(TRADER_WALLET))}
              >
                <Text style={styles.scopeLink}>{truncateWallet(TRADER_WALLET)}</Text>
              </Pressable>
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
              onOpenHistory={() => setTab('history')}
            />
          ) : tab === 'history' ? (
            <HistoryScreen
              history={data.history}
              allTimePnl={data.allTimePnl}
              loading={data.loading}
              refreshing={data.refreshing}
              onRefresh={data.refresh}
            />
          ) : (
            <AboutScreen onReplayTour={() => setReplayTour(true)} />
          )}
        </SafeAreaView>
        <TerminalTour
          forceShow={replayTour}
          onForceConsumed={() => setReplayTour(false)}
        />
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
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  brandMark: {
    alignSelf: 'flex-start',
    paddingHorizontal: 6,
    paddingVertical: 2,
    backgroundColor: colors.gold,
    color: colors.bg,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  appName: {
    color: colors.goldLight,
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 2,
  },
  tagline: {
    color: colors.textMuted,
    fontSize: typography.fontSize.sm,
    marginTop: 4,
    lineHeight: 20,
  },
  liveRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 },
  dot: { width: 6, height: 6, borderRadius: 3 },
  liveText: {
    color: colors.green,
    fontSize: typography.fontSize.xs,
    fontWeight: '600',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  scopeBar: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.cardBorder,
    backgroundColor: colors.bgElevated,
  },
  scopeText: {
    color: colors.textMuted,
    fontSize: 11,
    lineHeight: 16,
  },
  scopeMeta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    marginTop: 4,
  },
  scopeMetaText: {
    color: colors.textDim,
    fontSize: 10,
  },
  scopeLink: {
    color: colors.gold,
    fontSize: 10,
    fontWeight: '600',
  },
});
