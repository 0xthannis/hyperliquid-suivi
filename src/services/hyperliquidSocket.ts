import { TRADER_WALLET, WS_URL } from '../constants';

type MidHandler = (coin: string, midPx: number) => void;
type FillHandler = (fill: {
  coin: string;
  dir: string;
  closedPnl: number;
  fee: number;
  px: number;
  sz: number;
  time: number;
}) => void;

export class HyperliquidSocket {
  private ws: WebSocket | null = null;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private pingTimer: ReturnType<typeof setInterval> | null = null;
  private onMid: MidHandler | null = null;
  private onFill: FillHandler | null = null;
  private alive = false;
  private trackedCoins = new Set<string>();
  private pendingCoins = new Set<string>();

  connect(onMid: MidHandler, onFill: FillHandler) {
    this.onMid = onMid;
    this.onFill = onFill;
    this.alive = true;
    this.open();
  }

  disconnect() {
    this.alive = false;
    this.clearPing();
    if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
    this.ws?.close();
    this.ws = null;
    this.trackedCoins.clear();
    this.pendingCoins.clear();
  }

  /** S'abonne au prix live de chaque coin en position */
  setTrackedCoins(coins: string[]) {
    const next = new Set(coins.filter(Boolean));
    this.pendingCoins = next;

    if (this.ws?.readyState === WebSocket.OPEN) {
      this.syncSubscriptions();
    }
  }

  private open() {
    if (!this.alive) return;
    this.ws = new WebSocket(WS_URL);

    this.ws.onopen = () => {
      this.send({
        method: 'subscribe',
        subscription: { type: 'userFills', user: TRADER_WALLET },
      });
      this.syncSubscriptions();
      this.clearPing();
      this.pingTimer = setInterval(() => {
        this.send({ method: 'ping' });
      }, 25_000);
    };

    this.ws.onmessage = (ev) => {
      try {
        const msg = JSON.parse(String(ev.data));
        this.handleMessage(msg);
      } catch {
        /* ignore */
      }
    };

    this.ws.onclose = () => {
      this.clearPing();
      if (!this.alive) return;
      this.reconnectTimer = setTimeout(() => this.open(), 2000);
    };

    this.ws.onerror = () => {
      this.ws?.close();
    };
  }

  private clearPing() {
    if (this.pingTimer) {
      clearInterval(this.pingTimer);
      this.pingTimer = null;
    }
  }

  private syncSubscriptions() {
    for (const coin of this.trackedCoins) {
      if (!this.pendingCoins.has(coin)) {
        this.send({
          method: 'unsubscribe',
          subscription: { type: 'activeAssetCtx', coin },
        });
      }
    }
    for (const coin of this.pendingCoins) {
      if (!this.trackedCoins.has(coin)) {
        this.send({
          method: 'subscribe',
          subscription: { type: 'activeAssetCtx', coin },
        });
      }
    }
    this.trackedCoins = new Set(this.pendingCoins);
  }

  private send(payload: object) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(payload));
    }
  }

  private handleMessage(msg: {
    channel?: string;
    data?: unknown;
  }) {
    if (msg.channel === 'activeAssetCtx' && msg.data && typeof msg.data === 'object') {
      const payload = msg.data as {
        coin?: string;
        ctx?: { midPx?: string; markPx?: string };
      };
      const coin = payload.coin;
      if (!coin) return;
      const raw = payload.ctx?.midPx ?? payload.ctx?.markPx;
      if (raw == null) return;
      const midPx = parseFloat(raw);
      if (!Number.isFinite(midPx)) return;
      this.onMid?.(coin, midPx);
      return;
    }

    if (msg.channel === 'allMids' && msg.data && typeof msg.data === 'object') {
      const payload = msg.data as { mids?: Record<string, string> };
      const raw = payload.mids ?? (msg.data as Record<string, string>);
      for (const coin of this.trackedCoins) {
        const v = raw[coin];
        if (v != null) {
          const midPx = parseFloat(v);
          if (Number.isFinite(midPx)) this.onMid?.(coin, midPx);
        }
      }
      return;
    }

    if (msg.channel === 'userFills' && msg.data) {
      const payload = msg.data as {
        fills?: Array<Record<string, string>>;
        isSnapshot?: boolean;
      };
      if (payload.isSnapshot) return;

      const list = Array.isArray(msg.data)
        ? (msg.data as Array<Record<string, string>>)
        : (payload.fills ?? []);
      for (const f of list) {
        if (String(f.isSnapshot) === 'true') continue;
        this.onFill?.({
          coin: f.coin,
          dir: f.dir ?? '',
          closedPnl: parseFloat(f.closedPnl ?? '0'),
          fee: parseFloat(f.fee ?? '0'),
          px: parseFloat(f.px ?? '0'),
          sz: parseFloat(f.sz ?? '0'),
          time: Number(f.time ?? Date.now()),
        });
      }
    }
  }
}

export const hyperliquidSocket = new HyperliquidSocket();
