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
import {
  useFonts,
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  Inter_800ExtraBold,
  Inter_900Black,
} from '@expo-google-fonts/inter';
import { TabBar, type TabId } from './src/components/TabBar';
import { SyncBadge } from './src/components/SyncBadge';
import { TerminalTour } from './src/components/TerminalTour';
import { LiveScreen } from './src/screens/LiveScreen';
import { HistoryScreen } from './src/screens/HistoryScreen';
import { TrackRecordScreen } from './src/screens/TrackRecordScreen';
import { AboutScreen } from './src/screens/AboutScreen';
import { useTraderData } from './src/hooks/useTraderData';
import { registerBackgroundFetch } from './src/background/positionTask';
import { scheduleDailyWeeklySummaries } from './src/services/alertEngine';
import { registerRemotePush } from './src/services/remotePush';
import {
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
import { colors, spacing, typography, font } from './src/theme';
import { useLang } from './src/i18n';
import { getCopy } from './src/i18n/strings';

const LEGACY_WATCH_NOTIFICATION_ID = 'at-capital-watch-service';

async function setupNotifications() {
  await Notifications.dismissNotificationAsync(LEGACY_WATCH_NOTIFICATION_ID).catch(
    () => {}
  );
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('trades', {
      name: 'Thannis · Terminal',
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
  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
    Inter_800ExtraBold,
    Inter_900Black,
  });
  const [lang, setLang] = useLang();
  const t = getCopy(lang);

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
      if (mounted) startGlobalPositionMonitoring();
    }
    void boot();

    const appStateSub = AppState.addEventListener('change', (state) => {
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
      void Notifications.dismissNotificationAsync(LEGACY_WATCH_NOTIFICATION_ID).catch(
        () => {}
      );
    };
  }, [handleDeepLink]);

  const syncLabel = data.lastUpdate
    ? `Sync ${data.lastUpdate.toLocaleTimeString('fr-FR')}`
    : 'Sync en attente';

  if (!fontsLoaded) {
    return (
      <View style={[styles.root, styles.boot]}>
        <StatusBar barStyle="dark-content" backgroundColor={colors.bg} />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <View style={styles.root}>
        <StatusBar barStyle="dark-content" backgroundColor={colors.bg} />
        <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
          <View style={styles.header}>
            <Text style={styles.brand}>{BRAND_NAME}</Text>
            <View style={styles.headerRight}>
              <View style={styles.liveRow}>
                <View
                  style={[
                    styles.dot,
                    { backgroundColor: data.wsConnected ? colors.green : colors.textDim },
                  ]}
                />
                <Text
                  style={[styles.liveText, data.wsConnected && { color: colors.green }]}
                >
                  {data.wsConnected ? t.live : t.sync}
                </Text>
              </View>
              <Pressable
                style={styles.langBtn}
                onPress={() => setLang(lang === 'fr' ? 'en' : 'fr')}
                hitSlop={8}
              >
                <Text style={styles.langBtnText}>{lang === 'fr' ? 'EN' : 'FR'}</Text>
              </Pressable>
            </View>
          </View>

          <View style={styles.body}>
            {tab === 'live' ? (
              <LiveScreen
                positions={data.positions}
                orders={data.orders}
                mids={data.mids}
                accountValue={data.accountValue}
                allTimePnl={data.allTimePnl}
                history={data.history}
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
                fills={data.fills}
                allTimePnl={data.allTimePnl}
                loading={data.loading}
                refreshing={data.refreshing}
                onRefresh={data.refresh}
              />
            ) : tab === 'track' ? (
              <TrackRecordScreen
                history={data.history}
                allTimePnl={data.allTimePnl}
                loading={data.loading}
                refreshing={data.refreshing}
                onRefresh={data.refresh}
              />
            ) : (
              <AboutScreen onReplayTour={() => setReplayTour(true)} />
            )}
          </View>

          <TabBar active={tab} onChange={setTab} />
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
  boot: { alignItems: 'center', justifyContent: 'center' },
  safe: { flex: 1 },
  body: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
  },
  brand: {
    color: colors.text,
    fontSize: 20,
    fontFamily: font.extrabold,
    letterSpacing: -0.2,
  },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  liveRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  dot: { width: 7, height: 7, borderRadius: 4 },
  liveText: {
    color: colors.textMuted,
    fontSize: 12,
    fontFamily: font.semibold,
  },
  langBtn: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  langBtnText: { color: colors.textMuted, fontSize: 11, fontFamily: font.bold, letterSpacing: 0.5 },
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
