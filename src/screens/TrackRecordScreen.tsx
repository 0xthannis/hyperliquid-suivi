import React, { useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  StyleSheet,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import Svg, { Path, Defs, LinearGradient, Stop } from 'react-native-svg';
import { formatUsd, type HistoryEvent } from '../utils/calculations';
import { displaySymbol } from '../api/hyperliquid';
import { colors, spacing, font } from '../theme';

type Props = {
  history: HistoryEvent[];
  allTimePnl: number;
  loading: boolean;
  refreshing: boolean;
  onRefresh: () => void;
};

const CW = Dimensions.get('window').width - spacing.lg * 2;
const CH = 150;

function monthLabel(ms: number): string {
  return new Date(ms).toLocaleDateString('fr-FR', { month: 'short', year: '2-digit' });
}

function cumPaths(values: number[]): { line: string; area: string } | null {
  if (values.length < 2) return null;
  const series = [0, ...values];
  const min = Math.min(...series);
  const max = Math.max(...series);
  const span = max - min || 1;
  const pad = CH * 0.12;
  const pts = series.map((v, i) => ({
    x: (i / (series.length - 1)) * CW,
    y: CH - pad - ((v - min) / span) * (CH - pad * 2),
  }));
  const line = pts
    .map((p, i) => `${i ? 'L' : 'M'}${p.x.toFixed(1)} ${p.y.toFixed(1)}`)
    .join(' ');
  const area = `${line} L${CW} ${CH} L0 ${CH} Z`;
  return { line, area };
}

export function TrackRecordScreen({
  history,
  allTimePnl,
  loading,
  refreshing,
  onRefresh,
}: Props) {
  const stats = useMemo(() => {
    const closed = history.filter((e) => e.isClose).sort((a, b) => a.time - b.time);
    const count = closed.length;
    const wins = closed.filter((e) => e.netPnl > 0);
    const losses = closed.filter((e) => e.netPnl < 0);
    const winRate = count ? Math.round((wins.length / count) * 100) : null;
    const grossWin = wins.reduce((s, e) => s + e.netPnl, 0);
    const grossLoss = Math.abs(losses.reduce((s, e) => s + e.netPnl, 0));
    const avgWin = wins.length ? grossWin / wins.length : 0;
    const avgLoss = losses.length ? grossLoss / losses.length : 0;
    const profitFactor = grossLoss > 0 ? grossWin / grossLoss : null;

    const best = closed.reduce<HistoryEvent | null>(
      (b, e) => (b == null || e.netPnl > b.netPnl ? e : b),
      null
    );
    const worst = closed.reduce<HistoryEvent | null>(
      (w, e) => (w == null || e.netPnl < w.netPnl ? e : w),
      null
    );

    let cum = 0;
    let peak = 0;
    let maxDd = 0;
    const cumPoints: number[] = [];
    for (const e of closed) {
      cum += e.netPnl;
      cumPoints.push(cum);
      if (cum > peak) peak = cum;
      if (peak - cum > maxDd) maxDd = peak - cum;
    }

    const byMonth = new Map<string, { key: string; label: string; pnl: number }>();
    for (const e of closed) {
      const d = new Date(e.time);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const cur = byMonth.get(key) ?? { key, label: monthLabel(e.time), pnl: 0 };
      cur.pnl += e.netPnl;
      byMonth.set(key, cur);
    }
    const monthly = Array.from(byMonth.values()).sort((a, b) => (a.key < b.key ? -1 : 1));
    const monthlyMax = Math.max(1, ...monthly.map((m) => Math.abs(m.pnl)));

    return {
      count,
      winRate,
      avgWin,
      avgLoss,
      profitFactor,
      best,
      worst,
      maxDd,
      cumPoints,
      monthly,
      monthlyMax,
    };
  }, [history]);

  if (loading && history.length === 0) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="small" color="#0a0a0b" />
      </View>
    );
  }

  if (stats.count === 0) {
    return (
      <ScrollView
        contentContainerStyle={styles.center}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#0a0a0b" />
        }
      >
        <Text style={styles.emptyTitle}>Aucun trade clôturé pour l'instant</Text>
        <Text style={styles.emptyText}>
          Le track record se construit à chaque position fermée, public et vérifiable.
        </Text>
      </ScrollView>
    );
  }

  const cumUp = allTimePnl >= 0;
  const curve = cumPaths(stats.cumPoints);
  const stroke = cumUp ? colors.green : colors.red;

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#0a0a0b" />
      }
    >
      <Text style={styles.heroLabel}>Performance cumulée · net</Text>
      <Text style={[styles.heroValue, { color: cumUp ? colors.green : colors.red }]}>
        {formatUsd(allTimePnl, true)}
      </Text>
      <Text style={styles.heroSub}>
        {stats.count} trades clôturés · {stats.winRate}% de réussite
      </Text>

      {curve && (
        <View style={styles.chart}>
          <Svg width={CW} height={CH}>
            <Defs>
              <LinearGradient id="trkFill" x1="0" y1="0" x2="0" y2="1">
                <Stop offset="0" stopColor={stroke} stopOpacity={0.2} />
                <Stop offset="1" stopColor={stroke} stopOpacity={0} />
              </LinearGradient>
            </Defs>
            <Path d={curve.area} fill="url(#trkFill)" stroke="none" />
            <Path d={curve.line} fill="none" stroke={stroke} strokeWidth={2} strokeLinejoin="round" />
          </Svg>
        </View>
      )}

      <View style={styles.kpis}>
        <View style={styles.kpi}>
          <Text style={styles.kpiLabel}>Profit factor</Text>
          <Text style={styles.kpiValue}>
            {stats.profitFactor != null ? stats.profitFactor.toFixed(2) : 'n/a'}
          </Text>
        </View>
        <View style={styles.kpi}>
          <Text style={styles.kpiLabel}>Gain moyen</Text>
          <Text style={[styles.kpiValue, { color: colors.green }]}>
            {formatUsd(stats.avgWin, true)}
          </Text>
        </View>
        <View style={styles.kpi}>
          <Text style={styles.kpiLabel}>Perte moyenne</Text>
          <Text style={[styles.kpiValue, { color: colors.red }]}>
            {formatUsd(-stats.avgLoss, true)}
          </Text>
        </View>
        <View style={styles.kpi}>
          <Text style={styles.kpiLabel}>Drawdown max</Text>
          <Text style={[styles.kpiValue, { color: colors.red }]}>
            {formatUsd(-stats.maxDd, true)}
          </Text>
        </View>
      </View>

      <Text style={styles.section}>Résultat mensuel</Text>
      {stats.monthly.map((m) => {
        const w = Math.max(4, (Math.abs(m.pnl) / stats.monthlyMax) * 100);
        const pos = m.pnl >= 0;
        return (
          <View style={styles.monthRow} key={m.key}>
            <Text style={styles.monthLabel}>{m.label}</Text>
            <View style={styles.barTrack}>
              <View
                style={[
                  styles.bar,
                  { width: `${w}%`, backgroundColor: pos ? colors.green : colors.red },
                ]}
              />
            </View>
            <Text style={[styles.monthVal, { color: pos ? colors.green : colors.red }]}>
              {formatUsd(m.pnl, true)}
            </Text>
          </View>
        );
      })}

      <View style={styles.extremes}>
        {stats.best && (
          <View style={styles.extreme}>
            <Text style={styles.extremeLabel}>Meilleur trade</Text>
            <View style={styles.extremeRow}>
              <Text style={styles.extremeSym}>{displaySymbol(stats.best.coin)}</Text>
              <Text style={[styles.extremeVal, { color: colors.green }]}>
                {formatUsd(stats.best.netPnl, true)}
              </Text>
            </View>
          </View>
        )}
        {stats.worst && (
          <View style={styles.extreme}>
            <Text style={styles.extremeLabel}>Pire trade</Text>
            <View style={styles.extremeRow}>
              <Text style={styles.extremeSym}>{displaySymbol(stats.worst.coin)}</Text>
              <Text style={[styles.extremeVal, { color: colors.red }]}>
                {formatUsd(stats.worst.netPnl, true)}
              </Text>
            </View>
          </View>
        )}
      </View>

      <Text style={styles.disclaimer}>
        Les performances passées ne préjugent pas des performances futures. Ceci n'est pas
        un conseil en investissement.
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  content: { paddingHorizontal: spacing.lg, paddingTop: spacing.lg, paddingBottom: spacing.xl },
  center: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
    paddingTop: 80,
  },
  emptyTitle: { color: colors.text, fontSize: 17, fontFamily: font.bold, textAlign: 'center' },
  emptyText: {
    color: colors.textMuted,
    fontSize: 14,
    fontFamily: font.regular,
    marginTop: 8,
    textAlign: 'center',
    lineHeight: 21,
  },

  heroLabel: { color: colors.textMuted, fontSize: 13, fontFamily: font.medium },
  heroValue: { fontSize: 40, fontFamily: font.extrabold, letterSpacing: -1, marginTop: 6 },
  heroSub: { color: colors.textMuted, fontSize: 13, fontFamily: font.medium, marginTop: 8 },

  chart: { marginTop: 18, marginBottom: 8 },

  kpis: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 8 },
  kpi: {
    width: '50%',
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: colors.line,
  },
  kpiLabel: { color: colors.textDim, fontSize: 11, fontFamily: font.medium },
  kpiValue: { color: colors.text, fontSize: 20, fontFamily: font.extrabold, marginTop: 6 },

  section: { color: colors.text, fontSize: 16, fontFamily: font.extrabold, marginTop: 28, marginBottom: 14 },
  monthRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12, gap: 10 },
  monthLabel: { width: 52, color: colors.textMuted, fontSize: 12, fontFamily: font.semibold, textTransform: 'capitalize' },
  barTrack: { flex: 1, height: 10, borderRadius: 999, backgroundColor: colors.bgElevated, overflow: 'hidden' },
  bar: { height: '100%', borderRadius: 999 },
  monthVal: { width: 76, textAlign: 'right', fontSize: 12, fontFamily: font.bold },

  extremes: { flexDirection: 'row', gap: 12, marginTop: 24 },
  extreme: {
    flex: 1,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 14,
  },
  extremeLabel: { color: colors.textDim, fontSize: 11, fontFamily: font.medium },
  extremeRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', marginTop: 8 },
  extremeSym: { color: colors.text, fontSize: 16, fontFamily: font.extrabold },
  extremeVal: { fontSize: 15, fontFamily: font.bold },

  disclaimer: { color: colors.textDim, fontSize: 12, fontFamily: font.regular, lineHeight: 18, marginTop: 28 },
});
