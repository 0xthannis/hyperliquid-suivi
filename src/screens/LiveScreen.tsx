import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  StyleSheet,
  ActivityIndicator,
  Pressable,
  Dimensions,
} from 'react-native';
import Svg, { Path, Defs, LinearGradient, Stop } from 'react-native-svg';
import * as Haptics from 'expo-haptics';
import type { TraderSnapshot } from '../hooks/useTraderData';
import {
  fetchAccountValueHistory,
  displaySymbol,
} from '../api/hyperliquid';
import {
  formatUsd,
  formatPct,
  pnlAtPrice,
  pnlPercent,
  findTpSlForCoin,
} from '../utils/calculations';
import { computeExitMetrics, formatRiskReward } from '../utils/riskMetrics';
import { PnlCardSheet } from '../components/PnlCardSheet';
import { WatchlistSection } from '../components/WatchlistSection';
import { registerRemotePush } from '../services/remotePush';
import { useCountUp } from '../hooks/useCountUp';
import { useLang } from '../i18n';
import { getCopy } from '../i18n/strings';
import type { PnlCardData } from '../utils/pnlCard';
import { colors, spacing, font } from '../theme';

type Props = Pick<
  TraderSnapshot,
  | 'positions'
  | 'orders'
  | 'mids'
  | 'accountValue'
  | 'allTimePnl'
  | 'history'
  | 'loading'
  | 'error'
  | 'lastUpdate'
  | 'refreshing'
  | 'priceTick'
> & {
  onRefresh: () => void;
  onOpenHistory: () => void;
};

type Period = 'day' | 'week' | 'month' | 'allTime';
const PERIODS: [Period, string][] = [
  ['day', '1J'],
  ['week', '1S'],
  ['month', '1M'],
  ['allTime', 'MAX'],
];

const CHART_W = Dimensions.get('window').width - spacing.lg * 2;
const CHART_H = 130;

function curveCoords(values: number[]): { x: number; y: number }[] {
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || 1;
  const pad = CHART_H * 0.14;
  return values.map((v, i) => ({
    x: (i / (values.length - 1)) * CHART_W,
    y: CHART_H - pad - ((v - min) / span) * (CHART_H - pad * 2),
  }));
}

function lineD(pts: { x: number; y: number }[]): string {
  return pts.map((p, i) => `${i ? 'L' : 'M'}${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ');
}

function areaD(pts: { x: number; y: number }[]): string {
  if (pts.length < 2) return '';
  return `${lineD(pts)} L${pts[pts.length - 1].x.toFixed(1)} ${CHART_H} L${pts[0].x.toFixed(1)} ${CHART_H} Z`;
}

export function LiveScreen({
  positions,
  orders,
  mids,
  accountValue,
  allTimePnl,
  history,
  loading,
  error,
  refreshing,
  priceTick,
  onRefresh,
  onOpenHistory,
}: Props) {
  const [period, setPeriod] = useState<Period>('month');
  const [equity, setEquity] = useState<number[]>([]);
  const [cardData, setCardData] = useState<PnlCardData | null>(null);
  const [alertBusy, setAlertBusy] = useState(false);
  const [alertMsg, setAlertMsg] = useState<string | null>(null);
  const [lang] = useLang();
  const t = getCopy(lang).live_;

  async function enableAlerts() {
    setAlertBusy(true);
    try {
      const r = await registerRemotePush();
      setAlertMsg(r.ok ? t.alertsOk : t.alertsKo);
    } finally {
      setAlertBusy(false);
    }
  }

  useEffect(() => {
    let cancelled = false;
    fetchAccountValueHistory(period)
      .then((s) => !cancelled && setEquity(s))
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [period, accountValue]);

  const totalPnl = positions.reduce((sum, p) => {
    const px = mids[p.coin];
    return sum + (px != null ? pnlAtPrice(p, px) : p.unrealizedPnl);
  }, 0);
  const closed = history.filter((e) => e.isClose);
  const winRate =
    closed.length > 0
      ? `${Math.round((closed.filter((e) => e.isWin).length / closed.length) * 100)}%`
      : 'n/a';

  const first = equity[0];
  const last = equity[equity.length - 1];
  const changeAbs = first != null && last != null ? last - first : null;
  const changePct =
    first != null && last != null && first !== 0
      ? ((last - first) / Math.abs(first)) * 100
      : null;
  const up = (changeAbs ?? 0) >= 0;

  const animAccount = useCountUp(accountValue);
  const animAllTime = useCountUp(allTimePnl);
  const exposure = positions.reduce(
    (s, p) => s + Math.abs(p.size) * (mids[p.coin] ?? p.entryPx),
    0
  );
  const maxDd = (() => {
    if (equity.length < 2) return null;
    let peak = equity[0];
    let dd = 0;
    for (const v of equity) {
      if (v > peak) peak = v;
      if (peak > 0) {
        const d = (peak - v) / peak;
        if (d > dd) dd = d;
      }
    }
    return dd * 100;
  })();

  function buildCard(p: (typeof positions)[number], price: number): PnlCardData {
    const net = pnlAtPrice(p, price);
    const size = Math.abs(p.size);
    // Marge engagée = notional d'entrée / levier (capital réellement immobilisé).
    const margin = p.leverage > 0 ? (p.entryPx * size) / p.leverage : p.entryPx * size;
    return {
      coin: p.coin,
      side: p.isLong ? 'LONG' : 'SHORT',
      entryPx: p.entryPx,
      exitPx: price,
      size: p.size,
      riskedUsd: margin,
      exitCapitalUsd: margin + net,
      grossPnl: net,
      totalFees: 0,
      netPnl: net,
      pnlPct: margin > 1e-6 ? (net / margin) * 100 : pnlPercent(p, price),
      leverage: p.leverage,
      durationMs: null,
      durationLabel: 'En cours',
      closedAt: Date.now(),
      isWin: net >= 0,
      closeHash: null,
      closeTid: null,
      closeProofLabel: null,
    };
  }

  if (loading && positions.length === 0 && equity.length === 0) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="small" color="#0a0a0b" />
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#0a0a0b" />
      }
    >
      <Text style={styles.heroLabel}>{t.accountValue}</Text>
      <Text style={styles.heroValue}>{formatUsd(animAccount)}</Text>
      {changeAbs != null && (
        <Text style={[styles.heroChange, { color: up ? colors.green : colors.red }]}>
          {up ? '↑' : '↓'} {formatUsd(Math.abs(changeAbs))}
          {changePct != null ? ` · ${formatPct(changePct)}` : ''}
        </Text>
      )}

      {equity.length >= 2 && (() => {
        const pts = curveCoords(equity);
        const stroke = up ? colors.green : colors.red;
        return (
          <View style={styles.chart}>
            <Svg width={CHART_W} height={CHART_H}>
              <Defs>
                <LinearGradient id="equityFill" x1="0" y1="0" x2="0" y2="1">
                  <Stop offset="0" stopColor={stroke} stopOpacity={0.18} />
                  <Stop offset="1" stopColor={stroke} stopOpacity={0} />
                </LinearGradient>
              </Defs>
              <Path d={areaD(pts)} fill="url(#equityFill)" stroke="none" />
              <Path
                d={lineD(pts)}
                fill="none"
                stroke={stroke}
                strokeWidth={2}
                strokeLinejoin="round"
              />
            </Svg>
          </View>
        );
      })()}

      <View style={styles.periods}>
        {PERIODS.map(([p]) => {
          const active = period === p;
          return (
            <Pressable
              key={p}
              onPress={() => {
                Haptics.selectionAsync().catch(() => {});
                setPeriod(p);
              }}
              style={[styles.period, active && styles.periodActive]}
            >
              <Text style={[styles.periodText, active && styles.periodTextActive]}>
                {t.periods[p]}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <View style={styles.stats}>
        <View style={styles.stat}>
          <Text style={styles.statLabel}>{t.pnlOpen}</Text>
          <Text
            style={[
              styles.statValue,
              positions.length
                ? { color: totalPnl >= 0 ? colors.green : colors.red }
                : null,
            ]}
          >
            {positions.length ? formatUsd(totalPnl, true) : formatUsd(0)}
          </Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.stat}>
          <Text style={styles.statLabel}>{t.pnlTotal}</Text>
          <Text style={[styles.statValue, { color: allTimePnl >= 0 ? colors.green : colors.red }]}>
            {formatUsd(animAllTime, true)}
          </Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.stat}>
          <Text style={styles.statLabel}>{t.winRate}</Text>
          <Text style={styles.statValue}>{winRate}</Text>
        </View>
      </View>

      <View style={styles.riskLine}>
        <Text style={styles.riskText}>
          {t.exposure} <Text style={styles.riskLineStrong}>{formatUsd(exposure)}</Text>
        </Text>
        <Text style={styles.riskText}>
          {t.maxDrawdown}{' '}
          <Text style={[styles.riskLineStrong, { color: colors.red }]}>
            {maxDd != null ? formatPct(-maxDd) : 'n/a'}
          </Text>
        </Text>
      </View>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <Text style={styles.section}>
        {t.positions} <Text style={styles.sectionCount}>{positions.length}</Text>
      </Text>

      {positions.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyTitle}>{t.emptyTitle}</Text>
          <Text style={styles.emptyText}>{t.emptyText}</Text>
          <Pressable style={styles.emptyBtn} onPress={onOpenHistory}>
            <Text style={styles.emptyBtnText}>{t.seeHistory}</Text>
          </Pressable>
        </View>
      ) : (
        positions.map((p) => {
          const px = mids[p.coin] ?? p.entryPx;
          const live = mids[p.coin] != null ? pnlAtPrice(p, px) : p.unrealizedPnl;
          const pct = pnlPercent(p, px);
          const win = live >= 0;
          const { stopLoss, takeProfit } = findTpSlForCoin(orders, p.coin);
          const lossAtSl = stopLoss ? pnlAtPrice(p, stopLoss.triggerPx) : null;
          const gainAtTp = takeProfit ? pnlAtPrice(p, takeProfit.triggerPx) : null;
          const { riskReward } = computeExitMetrics(
            p,
            px,
            stopLoss?.triggerPx ?? null,
            takeProfit?.triggerPx ?? null
          );
          return (
            <View key={`${p.coin}-${priceTick}`} style={styles.pos}>
              <View style={styles.posTop}>
                <View style={styles.posId}>
                  <Text style={styles.posSym}>{displaySymbol(p.coin)}</Text>
                  <Text style={styles.posSub}>
                    {p.isLong ? t.long : t.short} · {p.leverage}× · {t.entry} {p.entryPx}
                  </Text>
                </View>
                <View style={styles.posFig}>
                  <Text style={[styles.posPnl, { color: win ? colors.green : colors.red }]}>
                    {formatUsd(live, true)}
                  </Text>
                  <Text style={[styles.posPct, { color: win ? colors.green : colors.red }]}>
                    {formatPct(pct)}
                  </Text>
                </View>
              </View>

              {(stopLoss || takeProfit) && (
                <View style={styles.posRisk}>
                  <Text style={styles.riskTxt}>
                    SL {stopLoss ? stopLoss.triggerPx : 'n/a'}
                    {lossAtSl != null ? (
                      <Text style={{ color: colors.red }}> {formatUsd(lossAtSl, true)}</Text>
                    ) : null}
                  </Text>
                  <Text style={styles.riskTxt}>
                    TP {takeProfit ? takeProfit.triggerPx : 'n/a'}
                    {gainAtTp != null ? (
                      <Text style={{ color: colors.green }}> {formatUsd(gainAtTp, true)}</Text>
                    ) : null}
                  </Text>
                  <Text style={styles.riskTxt}>
                    R:R <Text style={styles.riskStrong}>{formatRiskReward(riskReward)}</Text>
                  </Text>
                </View>
              )}

              <Pressable style={styles.cardBtn} onPress={() => setCardData(buildCard(p, px))}>
                <Text style={styles.cardBtnText}>{t.pnlCard}</Text>
              </Pressable>
            </View>
          );
        })
      )}

      <WatchlistSection />

      <View style={styles.alertCard}>
        <Text style={styles.alertTitle}>{t.alertsTitle}</Text>
        <Text style={styles.alertText}>{t.alertsText}</Text>
        <Pressable
          style={[styles.alertBtn, alertBusy && styles.alertBtnDisabled]}
          onPress={() => {
            Haptics.selectionAsync().catch(() => {});
            void enableAlerts();
          }}
          disabled={alertBusy}
        >
          <Text style={styles.alertBtnText}>
            {alertBusy ? t.alertsEnabling : t.alertsBtn}
          </Text>
        </Pressable>
        {alertMsg ? <Text style={styles.alertNote}>{alertMsg}</Text> : null}
      </View>

      {cardData && (
        <PnlCardSheet prebuilt={cardData} onClose={() => setCardData(null)} />
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  content: { paddingHorizontal: spacing.lg, paddingTop: spacing.lg, paddingBottom: spacing.xl },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 80 },

  heroLabel: { color: colors.textMuted, fontSize: 14, fontFamily: font.medium },
  heroValue: {
    color: colors.text,
    fontSize: 46,
    fontFamily: font.extrabold,
    letterSpacing: -1.2,
    marginTop: 6,
  },
  heroChange: { fontSize: 15, fontFamily: font.bold, marginTop: 8 },

  chart: { marginTop: 18, marginBottom: 4 },

  periods: { flexDirection: 'row', gap: 6, marginTop: 6, marginBottom: 22 },
  period: { paddingVertical: 7, paddingHorizontal: 16, borderRadius: 999 },
  periodActive: { backgroundColor: '#0a0a0b' },
  periodText: { color: colors.textMuted, fontSize: 13, fontFamily: font.bold },
  periodTextActive: { color: '#fff' },

  stats: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 18,
    borderTopWidth: 1,
    borderTopColor: colors.line,
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
  },
  stat: { flex: 1 },
  statDivider: { width: 1, alignSelf: 'stretch', backgroundColor: colors.line },
  statLabel: { color: colors.textDim, fontSize: 11, fontFamily: font.medium },
  statValue: { color: colors.text, fontSize: 17, fontFamily: font.bold, marginTop: 6 },

  error: { color: colors.red, fontSize: 13, fontFamily: font.medium, marginTop: 16 },

  riskLine: { flexDirection: 'row', flexWrap: 'wrap', gap: 20, marginTop: 14 },
  riskText: { color: colors.textDim, fontSize: 12, fontFamily: font.medium },
  riskLineStrong: { color: colors.textMuted, fontFamily: font.bold },

  section: { color: colors.text, fontSize: 17, fontFamily: font.extrabold, marginTop: 28, marginBottom: 4 },
  sectionCount: { color: colors.textMuted, fontSize: 14, fontFamily: font.bold },

  pos: { paddingVertical: 18, borderBottomWidth: 1, borderBottomColor: colors.line },
  posTop: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' },
  posId: { flex: 1, paddingRight: 12 },
  posSym: { color: colors.text, fontSize: 20, fontFamily: font.extrabold, letterSpacing: -0.3 },
  posSub: { color: colors.textMuted, fontSize: 13, fontFamily: font.medium, marginTop: 4 },
  posFig: { alignItems: 'flex-end' },
  posPnl: { fontSize: 19, fontFamily: font.extrabold },
  posPct: { fontSize: 13, fontFamily: font.semibold, marginTop: 3 },

  posRisk: { flexDirection: 'row', flexWrap: 'wrap', gap: 14, marginTop: 12 },
  riskTxt: { color: colors.textDim, fontSize: 12, fontFamily: font.medium },
  riskStrong: { color: colors.textMuted, fontFamily: font.bold },

  cardBtn: {
    alignSelf: 'flex-start',
    marginTop: 14,
    paddingVertical: 7,
    paddingHorizontal: 15,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.2)',
  },
  cardBtnText: { color: colors.text, fontSize: 12, fontFamily: font.bold },

  empty: { paddingVertical: 40, alignItems: 'center' },
  emptyTitle: { color: colors.text, fontSize: 17, fontFamily: font.bold },
  emptyText: {
    color: colors.textMuted,
    fontSize: 14,
    fontFamily: font.regular,
    marginTop: 8,
    textAlign: 'center',
    lineHeight: 21,
  },
  emptyBtn: {
    marginTop: 18,
    paddingVertical: 11,
    paddingHorizontal: 22,
    borderRadius: 999,
    backgroundColor: '#0a0a0b',
  },
  emptyBtnText: { color: '#fff', fontSize: 13, fontFamily: font.bold },

  alertCard: {
    marginTop: 28,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 20,
    backgroundColor: colors.bgElevated,
  },
  alertTitle: { color: colors.text, fontSize: 16, fontFamily: font.extrabold },
  alertText: {
    color: colors.textMuted,
    fontSize: 13,
    fontFamily: font.regular,
    lineHeight: 20,
    marginTop: 6,
  },
  alertBtn: {
    alignSelf: 'flex-start',
    marginTop: 14,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 999,
    backgroundColor: '#0a0a0b',
  },
  alertBtnDisabled: { opacity: 0.5 },
  alertBtnText: { color: '#fff', fontSize: 13, fontFamily: font.bold },
  alertNote: { color: colors.textDim, fontSize: 12, fontFamily: font.regular, marginTop: 10, lineHeight: 18 },
});
