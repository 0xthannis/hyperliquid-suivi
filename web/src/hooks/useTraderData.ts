import { useCallback, useEffect, useRef, useState } from 'react';
import {
  fetchFills,
  fetchMids,
  fetchPortfolioPnl,
  fetchPositions,
  fetchTpSlOrders,
  type AssetPosition,
  type TpSlOrder,
} from '../api/hyperliquid';
import { groupFillsToHistory, type HistoryEvent } from '../lib/calculations';
import { hyperliquidSocket } from '../lib/socket';
import { MIDS_POLL_MS, POLL_BACKUP_MS } from '../constants';

export function useTraderData() {
  const [positions, setPositions] = useState<AssetPosition[]>([]);
  const [orders, setOrders] = useState<TpSlOrder[]>([]);
  const [mids, setMids] = useState<Record<string, number>>({});
  const [accountValue, setAccountValue] = useState(0);
  const [history, setHistory] = useState<HistoryEvent[]>([]);
  const [allTimePnl, setAllTimePnl] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [wsConnected, setWsConnected] = useState(false);
  const [priceTick, setPriceTick] = useState(0);

  const positionsRef = useRef<AssetPosition[]>([]);
  const midsRef = useRef<Record<string, number>>({});

  const applyMidPrice = useCallback((coin: string, midPx: number) => {
    if (midsRef.current[coin] === midPx) return;
    midsRef.current[coin] = midPx;
    setMids((m) => ({ ...m, [coin]: midPx }));
    setLastUpdate(new Date());
    setPriceTick((t) => t + 1);
    setWsConnected(true);
  }, []);

  const fetchAll = useCallback(async () => {
    const [{ positions: pos, accountValue: av }, ord, fills, portfolio] =
      await Promise.all([
        fetchPositions(),
        fetchTpSlOrders(),
        fetchFills(),
        fetchPortfolioPnl(),
      ]);
    const coins = pos.map((p) => p.coin);
    const newMids = await fetchMids(coins);

    positionsRef.current = pos;
    midsRef.current = { ...midsRef.current, ...newMids };
    hyperliquidSocket.setTrackedCoins(coins);

    setPositions(pos);
    setOrders(ord);
    setMids({ ...midsRef.current });
    setAccountValue(av);
    setHistory(groupFillsToHistory(fills));
    setAllTimePnl(portfolio.perpAllTimePnl);
    setLoading(false);
    setError(null);
    setLastUpdate(new Date());
    setPriceTick((t) => t + 1);
  }, []);

  const refreshMidsOnly = useCallback(async () => {
    const coins = positionsRef.current.map((p) => p.coin);
    if (coins.length === 0) return;
    try {
      const newMids = await fetchMids(coins);
      let changed = false;
      for (const [coin, px] of Object.entries(newMids)) {
        if (midsRef.current[coin] !== px) {
          midsRef.current[coin] = px;
          changed = true;
        }
      }
      if (changed) {
        setMids({ ...midsRef.current });
        setLastUpdate(new Date());
        setPriceTick((t) => t + 1);
      }
    } catch {
      /* silencieux */
    }
  }, []);

  useEffect(() => {
    fetchAll().catch((e) => {
      setError(e instanceof Error ? e.message : 'Erreur de connexion');
      setLoading(false);
    });

    const fullPoll = setInterval(() => {
      fetchAll().catch(() => {});
    }, POLL_BACKUP_MS);

    const midsPoll = setInterval(() => refreshMidsOnly(), MIDS_POLL_MS);

    hyperliquidSocket.connect(applyMidPrice);
    setWsConnected(true);

    return () => {
      clearInterval(fullPoll);
      clearInterval(midsPoll);
      hyperliquidSocket.disconnect();
    };
  }, [fetchAll, refreshMidsOnly, applyMidPrice]);

  return {
    positions,
    orders,
    mids,
    accountValue,
    history,
    allTimePnl,
    loading,
    error,
    lastUpdate,
    wsConnected,
    priceTick,
    refresh: fetchAll,
  };
}
