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

/**
 * Symbole affichable : on retire le préfixe du perp dex builder.
 * Ex. « xyz:MRVL » → « MRVL », « BTC » → « BTC ».
 */
export function displaySymbol(coin: string): string {
  const i = coin.indexOf(':');
  return i >= 0 ? coin.slice(i + 1) : coin;
}

/** Perp dex builder (HIP-3) d'un coin namespacé, sinon dex principal (''). */
function dexOfCoin(coin: string): string {
  const i = coin.indexOf(':');
  return i > 0 ? coin.slice(0, i) : '';
}

/**
 * Liste des perp dexs Hyperliquid. Le dex principal (crypto) est représenté
 * par '' ; les dexs builder (matières premières, indices, actions… ex. « xyz »)
 * portent leur nom. Mise en cache pour la session.
 */
let perpDexNamesCache: string[] | null = null;
let perpDexNamesPromise: Promise<string[]> | null = null;

export async function fetchPerpDexNames(): Promise<string[]> {
  if (perpDexNamesCache) return perpDexNamesCache;
  if (!perpDexNamesPromise) {
    perpDexNamesPromise = postInfo<Array<[string, string | null] | null>>({
      type: 'perpDexs',
    })
      .then((list) => {
        const names = (list ?? [])
          .filter((d): d is [string, string | null] => Array.isArray(d) && !!d[0])
          .map((d) => d[0]);
        perpDexNamesCache = names;
        return names;
      })
      .catch(() => {
        perpDexNamesPromise = null;
        return [];
      });
  }
  return perpDexNamesPromise;
}

/** [dex principal, ...dexs builder] → corps de requête `info` par dex. */
async function allDexBodies(base: object): Promise<object[]> {
  const names = await fetchPerpDexNames();
  return ['', ...names].map((dex) => (dex ? { ...base, dex } : base));
}

function mapPosition(
  p: ClearinghouseResponse['assetPositions'][number]['position']
): AssetPosition | null {
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
}

export async function fetchPositions(): Promise<{
  positions: AssetPosition[];
  accountValue: number;
}> {
  const bodies = await allDexBodies({
    type: 'clearinghouseState',
    user: TRADER_WALLET,
  });
  const states = await Promise.all(
    bodies.map((b) => postInfo<ClearinghouseResponse>(b).catch(() => null))
  );

  let accountValue = 0;
  const positions: AssetPosition[] = [];
  for (const data of states) {
    if (!data) continue;
    accountValue += parseFloat(data.marginSummary.accountValue) || 0;
    for (const ap of data.assetPositions) {
      const pos = mapPosition(ap.position);
      if (pos) positions.push(pos);
    }
  }

  return { positions, accountValue };
}

export async function fetchTpSlOrders(): Promise<TpSlOrder[]> {
  const bodies = await allDexBodies({
    type: 'frontendOpenOrders',
    user: TRADER_WALLET,
  });
  const lists = await Promise.all(
    bodies.map((b) => postInfo<OpenOrder[]>(b).catch(() => [] as OpenOrder[]))
  );

  return lists
    .flat()
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

  // Les mids sont propres à chaque perp dex : on regroupe les coins par dex.
  const byDex = new Map<string, string[]>();
  for (const c of coins) {
    const dex = dexOfCoin(c);
    const arr = byDex.get(dex);
    if (arr) arr.push(c);
    else byDex.set(dex, [c]);
  }

  const out: Record<string, number> = {};
  await Promise.all(
    [...byDex.entries()].map(async ([dex, dexCoins]) => {
      const all = await postInfo<Record<string, string>>(
        dex ? { type: 'allMids', dex } : { type: 'allMids' }
      ).catch(() => ({}) as Record<string, string>);
      for (const c of dexCoins) {
        if (all[c] != null) out[c] = parseFloat(all[c]);
      }
    })
  );
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

/** Courbe de valeur du compte (équité) pour le sparkline du terminal. */
export async function fetchAccountValueHistory(
  period: 'day' | 'week' | 'month' | 'allTime' = 'month'
): Promise<number[]> {
  const data = await postInfo<
    Array<[string, { accountValueHistory?: Array<[number, string]> }]>
  >({
    type: 'portfolio',
    user: TRADER_WALLET,
  });

  const block = data.find(([p]) => p === period)?.[1];
  const hist = block?.accountValueHistory ?? [];
  return hist.map(([, v]) => parseFloat(v)).filter((n) => Number.isFinite(n));
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
