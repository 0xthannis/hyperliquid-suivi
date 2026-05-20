import { useCallback, useEffect, useRef, useState } from 'react';
import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  fetchFills,
  fetchMids,
  fetchPositions,
  fetchPortfolioPnl,
  fetchTpSlOrders,
  type AssetPosition,
  type Fill,
  type TpSlOrder,
} from '../api/hyperliquid';
import {
  groupFillsToHistory,
  computePeriodStats,
  computeNetPnlFromFill,
  type HistoryEvent,
  type PeriodStats,
} from '../utils/calculations';
import {
  MIDS_POLL_MS,
  POLL_BACKUP_MS,
  STORAGE_KEY_POSITIONS,
} from '../constants';
import { hyperliquidSocket } from '../services/hyperliquidSocket';
import {
  notifyNewPosition,
  notifyPositionClosed,
  scheduleDailyWeeklySummaries,
} from '../services/alertEngine';
import { saveWidgetSnapshot, type WidgetSnapshot } from '../services/widgetStore';
import { fillKey, shouldNotifyFill } from '../services/fillDedup';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export type TraderSnapshot = {
  positions: AssetPosition[];
  orders: TpSlOrder[];
  mids: Record<string, number>;
  accountValue: number;
  history: HistoryEvent[];
  fills: Fill[];
  periodStats: PeriodStats;
  allTimePnl: number;
  widget: WidgetSnapshot | null;
  loading: boolean;
  error: string | null;
  lastUpdate: Date | null;
  refreshing: boolean;
  wsConnected: boolean;
  /** Incrémenté à chaque tick prix → force le rendu PnL live */
  priceTick: number;
};

const FILL_REFRESH_DEBOUNCE_MS = 3000;

export function useTraderData() {
  const [snapshot, setSnapshot] = useState<TraderSnapshot>({
    positions: [],
    orders: [],
    mids: {},
    accountValue: 0,
    history: [],
    fills: [],
    periodStats: {
      todayNet: 0,
      weekNet: 0,
      todayWinRate: 0,
      weekWinRate: 0,
      todayClosed: 0,
      weekClosed: 0,
    },
    allTimePnl: 0,
    widget: null,
    loading: true,
    error: null,
    lastUpdate: null,
    refreshing: false,
    wsConnected: false,
    priceTick: 0,
  });

  const positionsRef = useRef<AssetPosition[]>([]);
  const ordersRef = useRef<TpSlOrder[]>([]);
  const fillsRef = useRef<Fill[]>([]);
  const knownCoinsRef = useRef<Set<string>>(new Set());
  const initializedRef = useRef(false);
  const midsRef = useRef<Record<string, number>>({});
  const wsConnectedRef = useRef(false);
  const fillRefreshTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const applyMidPrice = useCallback((coin: string, midPx: number) => {
    const prev = midsRef.current[coin];
    if (prev === midPx) return;
    midsRef.current[coin] = midPx;

    setSnapshot((s) => {
      const hasPosition = s.positions.some((p) => p.coin === coin);
      if (!hasPosition) return s;
      return {
        ...s,
        mids: { ...s.mids, [coin]: midPx },
        wsConnected: wsConnectedRef.current,
        lastUpdate: new Date(),
        priceTick: s.priceTick + 1,
      };
    });
  }, []);

  const checkClosedPositions = useCallback(
    async (newPositions: AssetPosition[]) => {
      const prev = positionsRef.current;
      const newCoins = new Set(newPositions.map((p) => p.coin));
      for (const p of prev) {
        if (!newCoins.has(p.coin)) {
          const lastFill = fillsRef.current.find(
            (f) => f.coin === p.coin && f.dir.includes('Close')
          );
          const net = lastFill
            ? computeNetPnlFromFill(lastFill.closedPnl, lastFill.fee)
            : p.unrealizedPnl;
          await notifyPositionClosed(p.coin, net);
        }
      }
      positionsRef.current = newPositions;
    },
    []
  );

  const checkNewPositions = useCallback(async (positions: AssetPosition[]) => {
    const currentCoins = positions.map((p) => p.coin);
    const stored = await AsyncStorage.getItem(STORAGE_KEY_POSITIONS);
    const previous: string[] = stored ? JSON.parse(stored) : [];

    if (!initializedRef.current && previous.length === 0) {
      knownCoinsRef.current = new Set(currentCoins);
      initializedRef.current = true;
      await AsyncStorage.setItem(
        STORAGE_KEY_POSITIONS,
        JSON.stringify(currentCoins)
      );
      return;
    }

    const prevSet = new Set(
      previous.length ? previous : [...knownCoinsRef.current]
    );
    for (const p of positions) {
      if (!prevSet.has(p.coin)) {
        await notifyNewPosition(p.coin, p.isLong);
      }
    }

    knownCoinsRef.current = new Set(currentCoins);
    await AsyncStorage.setItem(
      STORAGE_KEY_POSITIONS,
      JSON.stringify(currentCoins)
    );
    initializedRef.current = true;
  }, []);

  const applySnapshot = useCallback(
    async (
      positions: AssetPosition[],
      orders: TpSlOrder[],
      mids: Record<string, number>,
      accountValue: number,
      fills: Fill[],
      allTimePnl: number
    ) => {
      positionsRef.current = positions;
      hyperliquidSocket.setTrackedCoins(positions.map((p) => p.coin));

      await checkClosedPositions(positions);
      await checkNewPositions(positions);

      const history = groupFillsToHistory(fills);
      const periodStats = computePeriodStats(history);
      const openPnl = positions.reduce((s, p) => s + p.unrealizedPnl, 0);

      const widget: WidgetSnapshot = {
        accountValue,
        openPnl,
        openCount: positions.length,
        todayNetPnl: periodStats.todayNet,
        updatedAt: Date.now(),
      };
      await saveWidgetSnapshot(widget);

      ordersRef.current = orders;
      fillsRef.current = fills;
      midsRef.current = { ...midsRef.current, ...mids };

      setSnapshot((s) => ({
        ...s,
        positions,
        orders,
        mids: { ...midsRef.current },
        accountValue,
        history,
        fills,
        periodStats,
        allTimePnl,
        widget,
        loading: false,
        error: null,
        lastUpdate: new Date(),
        wsConnected: wsConnectedRef.current,
        priceTick: s.priceTick + 1,
      }));
    },
    [checkClosedPositions, checkNewPositions]
  );

  const fetchAll = useCallback(async () => {
    const [{ positions, accountValue }, orders, fills, portfolio] =
      await Promise.all([
        fetchPositions(),
        fetchTpSlOrders(),
        fetchFills(),
        fetchPortfolioPnl(),
      ]);
    const coins = positions.map((p) => p.coin);
    const mids = await fetchMids(coins);
    await applySnapshot(
      positions,
      orders,
      mids,
      accountValue,
      fills,
      portfolio.perpAllTimePnl
    );
  }, [applySnapshot]);

  const refreshMidsOnly = useCallback(async () => {
    const coins = positionsRef.current.map((p) => p.coin);
    if (coins.length === 0) return;
    try {
      const mids = await fetchMids(coins);
      let changed = false;
      for (const [coin, px] of Object.entries(mids)) {
        if (midsRef.current[coin] !== px) {
          midsRef.current[coin] = px;
          changed = true;
        }
      }
      if (!changed) return;
      setSnapshot((s) => ({
        ...s,
        mids: { ...midsRef.current },
        lastUpdate: new Date(),
        priceTick: s.priceTick + 1,
      }));
    } catch {
      /* silencieux */
    }
  }, []);

  const refreshSilentRef = useRef<() => Promise<void>>(async () => {});
  const refreshUserRef = useRef<() => Promise<void>>(async () => {});

  const refreshSilent = useCallback(async () => {
    try {
      await fetchAll();
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Erreur de connexion';
      setSnapshot((s) => ({ ...s, loading: false, error: msg }));
    }
  }, [fetchAll]);

  const refreshUser = useCallback(async () => {
    setSnapshot((s) => ({ ...s, refreshing: true }));
    try {
      await fetchAll();
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Erreur de connexion';
      setSnapshot((s) => ({ ...s, error: msg }));
    } finally {
      setSnapshot((s) => ({ ...s, refreshing: false, loading: false }));
    }
  }, [fetchAll]);

  refreshSilentRef.current = refreshSilent;
  refreshUserRef.current = refreshUser;

  useEffect(() => {
    scheduleDailyWeeklySummaries();
    refreshSilentRef.current();

    const fullPoll = setInterval(() => refreshSilentRef.current(), POLL_BACKUP_MS);
    const midsPoll = setInterval(() => refreshMidsOnly(), MIDS_POLL_MS);

    hyperliquidSocket.connect(
      (coin, midPx) => {
        wsConnectedRef.current = true;
        applyMidPrice(coin, midPx);
      },
      async (fill) => {
        const key = fillKey(fill.coin, fill.time, fill.dir);
        if (await shouldNotifyFill(key)) {
          if (fill.dir.includes('Close')) {
            const net = computeNetPnlFromFill(fill.closedPnl, fill.fee);
            await notifyPositionClosed(fill.coin, net);
          } else if (fill.dir.includes('Open')) {
            await notifyNewPosition(fill.coin, fill.dir.includes('Long'));
          }
        }
        if (fillRefreshTimerRef.current) {
          clearTimeout(fillRefreshTimerRef.current);
        }
        fillRefreshTimerRef.current = setTimeout(() => {
          fillRefreshTimerRef.current = null;
          refreshSilentRef.current();
        }, FILL_REFRESH_DEBOUNCE_MS);
      }
    );

    wsConnectedRef.current = true;
    setSnapshot((s) => ({ ...s, wsConnected: true }));

    return () => {
      clearInterval(fullPoll);
      clearInterval(midsPoll);
      if (fillRefreshTimerRef.current) {
        clearTimeout(fillRefreshTimerRef.current);
      }
      hyperliquidSocket.disconnect();
      wsConnectedRef.current = false;
    };
  }, [applyMidPrice, refreshMidsOnly]);

  return {
    ...snapshot,
    refresh: () => refreshUserRef.current(),
  };
}
