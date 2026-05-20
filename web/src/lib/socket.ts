import { WS_URL } from '../constants';

type MidHandler = (coin: string, midPx: number) => void;

export class HyperliquidSocket {
  private ws: WebSocket | null = null;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private pingTimer: ReturnType<typeof setInterval> | null = null;
  private onMid: MidHandler | null = null;
  private alive = false;
  private trackedCoins = new Set<string>();
  private pendingCoins = new Set<string>();

  connect(onMid: MidHandler) {
    this.onMid = onMid;
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

  setTrackedCoins(coins: string[]) {
    this.pendingCoins = new Set(coins.filter(Boolean));
    if (this.ws?.readyState === WebSocket.OPEN) this.syncSubscriptions();
  }

  private open() {
    if (!this.alive) return;
    this.ws = new WebSocket(WS_URL);

    this.ws.onopen = () => {
      this.syncSubscriptions();
      this.clearPing();
      this.pingTimer = setInterval(() => {
        this.send({ method: 'ping' });
      }, 25_000);
    };

    this.ws.onmessage = (ev) => {
      try {
        this.handleMessage(JSON.parse(String(ev.data)));
      } catch {
        /* ignore */
      }
    };

    this.ws.onclose = () => {
      this.clearPing();
      if (!this.alive) return;
      this.reconnectTimer = setTimeout(() => this.open(), 2000);
    };

    this.ws.onerror = () => this.ws?.close();
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

  private handleMessage(msg: { channel?: string; data?: unknown }) {
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
      if (Number.isFinite(midPx)) this.onMid?.(coin, midPx);
    }
  }
}

export const hyperliquidSocket = new HyperliquidSocket();
