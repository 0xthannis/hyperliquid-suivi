import { API_URL, TRADER_WALLET } from '../constants';

export type AssetPosition = {
  coin: string;
  size: number;
  entryPx: number;
  positionValue: number;
  unrealizedPnl: number;
  leverage: number;
  liquidationPx: number | null;
  isLong: boolean;
};

export type TpSlOrder = {
  coin: string;
  orderType: string;
  triggerPx: number;
  size: number;
  isPositionTpsl: boolean;
};

export type Fill = {
  coin: string;
  px: number;
  sz: number;
  side: string;
  time: number;
  dir: string;
  closedPnl: number;
  fee: number;
  hash: string;
  oid: number;
  tid: number;
};

export type HistoricalOrder = {
  order: {
    coin: string;
    side: string;
    oid: number;
    timestamp: number;
    triggerPx: string;
    isTrigger: boolean;
    orderType: string;
    children?: HistoricalOrder['order'][];
  };
  status: string;
  statusTimestamp: number;
};

type ClearinghouseResponse = {
  marginSummary: { accountValue: string };
  assetPositions: Array<{
    position: {
      coin: string;
      szi: string;
      entryPx: string;
      positionValue: string;
      unrealizedPnl: string;
      leverage: { value: number };
      liquidationPx: string | null;
    };
  }>;
};

type OpenOrder = {
  coin: string;
  orderType: string;
  triggerPx: string;
  sz: string;
  isPositionTpsl: boolean;
};

async function postInfo<T>(body: object): Promise<T> {
  const res = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`API Hyperliquid: ${res.status}`);
  return res.json() as Promise<T>;
}

export async function fetchPositions(): Promise<{
  positions: AssetPosition[];
  accountValue: number;
}> {
  const data = await postInfo<ClearinghouseResponse>({
    type: 'clearinghouseState',
    user: TRADER_WALLET,
  });

  const positions: AssetPosition[] = data.assetPositions
    .map((ap) => {
      const p = ap.position;
      const size = parseFloat(p.szi);
      if (Math.abs(size) < 1e-12) return null;
      return {
        coin: p.coin,
        size: Math.abs(size),
        entryPx: parseFloat(p.entryPx),
        positionValue: parseFloat(p.positionValue),
        unrealizedPnl: parseFloat(p.unrealizedPnl),
        leverage: p.leverage?.value ?? 1,
        liquidationPx: p.liquidationPx ? parseFloat(p.liquidationPx) : null,
        isLong: size > 0,
      };
    })
    .filter((x): x is AssetPosition => x !== null);

  return {
    positions,
    accountValue: parseFloat(data.marginSummary.accountValue),
  };
}

export async function fetchTpSlOrders(): Promise<TpSlOrder[]> {
  const orders = await postInfo<OpenOrder[]>({
    type: 'frontendOpenOrders',
    user: TRADER_WALLET,
  });

  return orders
    .filter(
      (o) =>
        o.orderType.includes('Stop') || o.orderType.includes('Take Profit')
    )
    .filter((o) => o.isPositionTpsl === true || parseFloat(o.sz) > 0)
    .map((o) => ({
      coin: o.coin,
      orderType: o.orderType,
      triggerPx: parseFloat(o.triggerPx),
      size: parseFloat(o.sz),
      isPositionTpsl: o.isPositionTpsl,
    }));
}

export async function fetchMids(coins: string[]): Promise<Record<string, number>> {
  if (coins.length === 0) return {};
  const all = await postInfo<Record<string, string>>({ type: 'allMids' });
  const out: Record<string, number> = {};
  for (const c of coins) {
    if (all[c] != null) out[c] = parseFloat(all[c]);
  }
  return out;
}

export async function fetchPortfolioPnl(): Promise<{ perpAllTimePnl: number }> {
  const data = await postInfo<
    Array<[string, { pnlHistory?: Array<[number, string]> }]>
  >({
    type: 'portfolio',
    user: TRADER_WALLET,
  });

  let perpAllTimePnl = 0;
  for (const [period, block] of data) {
    const hist = block.pnlHistory ?? [];
    const last = hist.length > 0 ? parseFloat(hist[hist.length - 1][1]) : 0;
    if (period === 'perpAllTime') perpAllTimePnl = last;
  }
  return { perpAllTimePnl };
}

export async function fetchFills(): Promise<Fill[]> {
  const fills = await postInfo<
    Array<{
      coin: string;
      px: string;
      sz: string;
      side: string;
      time: number;
      dir: string;
      closedPnl: string;
      fee: string;
      hash: string;
      oid: number;
      tid: number;
    }>
  >({
    type: 'userFills',
    user: TRADER_WALLET,
    aggregateByTime: false,
  });

  return fills.map((f) => ({
    coin: f.coin,
    px: parseFloat(f.px),
    sz: parseFloat(f.sz),
    side: f.side,
    time: f.time,
    dir: f.dir,
    closedPnl: parseFloat(f.closedPnl),
    fee: parseFloat(f.fee),
    hash: f.hash,
    oid: f.oid,
    tid: f.tid,
  }));
}

export async function fetchHistoricalOrders(): Promise<HistoricalOrder[]> {
  return postInfo<HistoricalOrder[]>({
    type: 'historicalOrders',
    user: TRADER_WALLET,
  });
}

export async function fetchAssetLeverage(coin: string): Promise<number | null> {
  try {
    const data = await postInfo<{ leverage?: { value?: number } }>({
      type: 'activeAssetData',
      user: TRADER_WALLET,
      coin,
    });
    const v = data.leverage?.value;
    return v != null && v > 0 ? v : null;
  } catch {
    return null;
  }
}
