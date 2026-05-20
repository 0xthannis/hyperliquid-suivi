import { useCallback, useEffect, useRef, useState } from 'react';
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
  type HistoryEvent,
  type PeriodStats,
} from '../utils/calculations';
import { MIDS_POLL_MS, POLL_BACKUP_MS } from '../constants';
import { hyperliquidSocket } from '../services/hyperliquidSocket';
import { saveWidgetSnapshot, type WidgetSnapshot } from '../services/widgetStore';

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
    []
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

  const refreshHistoryAndPnl = useCallback(async () => {
    try {
      const [fills, portfolio] = await Promise.all([
        fetchFills(),
        fetchPortfolioPnl(),
      ]);
      fillsRef.current = fills;
      const history = groupFillsToHistory(fills);
      const periodStats = computePeriodStats(history);
      setSnapshot((s) => ({
        ...s,
        fills,
        history,
        periodStats,
        allTimePnl: portfolio.perpAllTimePnl,
        lastUpdate: new Date(),
      }));
    } catch {
      /* silencieux */
    }
  }, []);

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
    refreshSilentRef.current();

    const midsPoll = setInterval(() => refreshMidsOnly(), MIDS_POLL_MS);
    const dataPoll = setInterval(() => refreshHistoryAndPnl(), POLL_BACKUP_MS);

    hyperliquidSocket.connect(
      (coin, midPx) => {
        wsConnectedRef.current = true;
        applyMidPrice(coin, midPx);
      },
      async (_fill) => {
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
      clearInterval(midsPoll);
      clearInterval(dataPoll);
      if (fillRefreshTimerRef.current) {
        clearTimeout(fillRefreshTimerRef.current);
      }
      hyperliquidSocket.disconnect();
      wsConnectedRef.current = false;
    };
  }, [applyMidPrice, refreshMidsOnly, refreshHistoryAndPnl]);

  return {
    ...snapshot,
    refresh: () => refreshUserRef.current(),
  };
}
