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
import Svg, { Polyline } from 'react-native-svg';
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
import type { PnlCardData } from '../utils/pnlCard';
import { colors, spacing } from '../theme';

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

function curvePoints(values: number[]): string {
  if (values.length < 2) return '';
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || 1;
  const pad = CHART_H * 0.14;
  return values
    .map((v, i) => {
      const x = (i / (values.length - 1)) * CHART_W;
      const y = CHART_H - pad - ((v - min) / span) * (CHART_H - pad * 2);
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(' ');
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

  function buildCard(p: (typeof positions)[number], price: number): PnlCardData {
    const net = pnlAtPrice(p, price);
    return {
      coin: p.coin,
      side: p.isLong ? 'LONG' : 'SHORT',
      entryPx: p.entryPx,
      exitPx: price,
      size: p.size,
      riskedUsd: 0,
      exitCapitalUsd: 0,
      grossPnl: net,
      totalFees: 0,
      netPnl: net,
      pnlPct: pnlPercent(p, price),
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
        <ActivityIndicator size="small" color="#fff" />
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#fff" />
      }
    >
      <Text style={styles.heroLabel}>Valeur du compte</Text>
      <Text style={styles.heroValue}>{formatUsd(accountValue)}</Text>
      {changeAbs != null && (
        <Text style={[styles.heroChange, { color: up ? colors.green : colors.red }]}>
          {up ? '↑' : '↓'} {formatUsd(Math.abs(changeAbs))}
          {changePct != null ? ` · ${formatPct(changePct)}` : ''}
        </Text>
      )}

      {equity.length >= 2 && (
        <View style={styles.chart}>
          <Svg width={CHART_W} height={CHART_H}>
            <Polyline
              points={curvePoints(equity)}
              fill="none"
              stroke={up ? colors.green : colors.red}
              strokeWidth={2}
            />
          </Svg>
        </View>
      )}

      <View style={styles.periods}>
        {PERIODS.map(([p, label]) => {
          const active = period === p;
          return (
            <Pressable
              key={p}
              onPress={() => setPeriod(p)}
              style={[styles.period, active && styles.periodActive]}
            >
              <Text style={[styles.periodText, active && styles.periodTextActive]}>
                {label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <View style={styles.stats}>
        <View style={styles.stat}>
          <Text style={styles.statLabel}>PnL ouvert</Text>
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
          <Text style={styles.statLabel}>PnL total</Text>
          <Text style={[styles.statValue, { color: allTimePnl >= 0 ? colors.green : colors.red }]}>
            {formatUsd(allTimePnl, true)}
          </Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.stat}>
          <Text style={styles.statLabel}>Réussite</Text>
          <Text style={styles.statValue}>{winRate}</Text>
        </View>
      </View>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <Text style={styles.section}>
        Positions <Text style={styles.sectionCount}>{positions.length}</Text>
      </Text>

      {positions.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyTitle}>Aucune position ouverte</Text>
          <Text style={styles.emptyText}>
            Dès qu'une position s'ouvre, elle apparaît ici en temps réel.
          </Text>
          <Pressable style={styles.emptyBtn} onPress={onOpenHistory}>
            <Text style={styles.emptyBtnText}>Voir l'historique</Text>
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
                    {p.isLong ? 'Long' : 'Short'} · {p.leverage}× · entrée {p.entryPx}
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
                    SL {stopLoss ? stopLoss.triggerPx : '—'}
                    {lossAtSl != null ? (
                      <Text style={{ color: colors.red }}> {formatUsd(lossAtSl, true)}</Text>
                    ) : null}
                  </Text>
                  <Text style={styles.riskTxt}>
                    TP {takeProfit ? takeProfit.triggerPx : '—'}
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
                <Text style={styles.cardBtnText}>Carte PnL ↗</Text>
              </Pressable>
            </View>
          );
        })
      )}

      {cardData && (
        <PnlCardSheet prebuilt={cardData} onClose={() => setCardData(null)} />
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  content: { paddingHorizontal: spacing.lg, paddingTop: spacing.lg, paddingBottom: 96 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 80 },

  heroLabel: { color: colors.textMuted, fontSize: 14, fontWeight: '500' },
  heroValue: {
    color: colors.text,
    fontSize: 46,
    fontWeight: '800',
    letterSpacing: -1.2,
    marginTop: 6,
  },
  heroChange: { fontSize: 15, fontWeight: '700', marginTop: 8 },

  chart: { marginTop: 18, marginBottom: 4 },

  periods: { flexDirection: 'row', gap: 6, marginTop: 6, marginBottom: 22 },
  period: { paddingVertical: 7, paddingHorizontal: 16, borderRadius: 999 },
  periodActive: { backgroundColor: '#fff' },
  periodText: { color: colors.textMuted, fontSize: 13, fontWeight: '700' },
  periodTextActive: { color: '#000' },

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
  statLabel: { color: colors.textDim, fontSize: 11, fontWeight: '500' },
  statValue: { color: colors.text, fontSize: 17, fontWeight: '700', marginTop: 6 },

  error: { color: colors.red, fontSize: 13, marginTop: 16 },

  section: { color: colors.text, fontSize: 17, fontWeight: '800', marginTop: 28, marginBottom: 4 },
  sectionCount: { color: colors.textMuted, fontSize: 14, fontWeight: '700' },

  pos: { paddingVertical: 18, borderBottomWidth: 1, borderBottomColor: colors.line },
  posTop: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' },
  posId: { flex: 1, paddingRight: 12 },
  posSym: { color: colors.text, fontSize: 20, fontWeight: '800', letterSpacing: -0.3 },
  posSub: { color: colors.textMuted, fontSize: 13, fontWeight: '500', marginTop: 4 },
  posFig: { alignItems: 'flex-end' },
  posPnl: { fontSize: 19, fontWeight: '800' },
  posPct: { fontSize: 13, fontWeight: '600', marginTop: 3 },

  posRisk: { flexDirection: 'row', flexWrap: 'wrap', gap: 14, marginTop: 12 },
  riskTxt: { color: colors.textDim, fontSize: 12, fontWeight: '500' },
  riskStrong: { color: colors.textMuted, fontWeight: '700' },

  cardBtn: {
    alignSelf: 'flex-start',
    marginTop: 14,
    paddingVertical: 7,
    paddingHorizontal: 15,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.22)',
  },
  cardBtnText: { color: colors.text, fontSize: 12, fontWeight: '700' },

  empty: { paddingVertical: 40, alignItems: 'center' },
  emptyTitle: { color: colors.text, fontSize: 17, fontWeight: '700' },
  emptyText: {
    color: colors.textMuted,
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
    lineHeight: 21,
  },
  emptyBtn: {
    marginTop: 18,
    paddingVertical: 11,
    paddingHorizontal: 22,
    borderRadius: 999,
    backgroundColor: '#fff',
  },
  emptyBtnText: { color: '#000', fontSize: 13, fontWeight: '700' },
});
