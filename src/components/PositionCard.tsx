import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import type { AssetPosition, TpSlOrder } from '../api/hyperliquid';
import {
  findTpSlForCoin,
  formatPct,
  formatUsd,
  pnlAtPrice,
  pnlPercent,
  computeTargetProgress,
} from '../utils/calculations';
import { computeExitMetrics, formatRiskReward } from '../utils/riskMetrics';
import { TermLabel } from './TermLabel';
import { TargetProgressBar } from './ui/TargetProgressBar';
import { colors, spacing, radius, typography } from '../theme';

type Props = {
  position: AssetPosition;
  orders: TpSlOrder[];
  currentPrice?: number;
};

export function PositionCard({ position, orders, currentPrice }: Props) {
  const { coin, isLong, unrealizedPnl, entryPx, leverage, positionValue } = position;
  const price = currentPrice ?? entryPx;
  const livePnl = currentPrice != null ? pnlAtPrice(position, price) : unrealizedPnl;
  const pct = pnlPercent(position, price);
  const isWin = livePnl >= 0;
  const { stopLoss, takeProfit } = findTpSlForCoin(orders, coin);

  const lossAtSl = stopLoss ? pnlAtPrice(position, stopLoss.triggerPx) : null;
  const gainAtTp = takeProfit ? pnlAtPrice(position, takeProfit.triggerPx) : null;
  const exitMetrics = computeExitMetrics(
    position,
    price,
    stopLoss?.triggerPx ?? null,
    takeProfit?.triggerPx ?? null
  );

  const targetProgress =
    stopLoss && takeProfit
      ? computeTargetProgress(
          position,
          price,
          stopLoss.triggerPx,
          takeProfit.triggerPx
        )
      : null;

  return (
    <View style={[styles.card, { borderLeftColor: isLong ? colors.green : colors.red }]}>
      <View style={styles.header}>
        <View style={styles.idRow}>
          <Text style={styles.coin}>{coin}</Text>
          <Text style={[styles.sideBadge, { color: isLong ? colors.green : colors.red, borderColor: isLong ? colors.green : colors.red }]}>
            {isLong ? 'LONG' : 'SHORT'}
          </Text>
        </View>
        <Text style={styles.leverage}>×{leverage}</Text>
      </View>

      <View style={styles.pnlBlock}>
        <TermLabel term="pnlNonRealise" style={styles.pnlLabel} />
        <Text style={[styles.pnlValue, { color: isWin ? colors.green : colors.red }]}>
          {formatUsd(livePnl, true)}
        </Text>
        <Text style={[styles.pnlPct, { color: isWin ? colors.green : colors.red }]}>
          {formatPct(pct)} · Mark {price.toFixed(4)}
        </Text>
      </View>

      <View style={styles.riskRow}>
        <RiskChip term="distanceSl" value={exitMetrics.distToSlPct != null ? `${exitMetrics.distToSlPct.toFixed(1)}%` : 'N/A'} />
        <RiskChip term="distanceTp" value={exitMetrics.distToTpPct != null ? `${exitMetrics.distToTpPct.toFixed(1)}%` : 'N/A'} />
        <RiskChip term="riskReward" value={formatRiskReward(exitMetrics.riskReward)} />
      </View>

      {targetProgress && stopLoss && takeProfit && (
        <TargetProgressBar
          progress={targetProgress}
          stopLabel={formatUsd(lossAtSl ?? 0, true)}
          tpLabel={formatUsd(gainAtTp ?? 0, true)}
        />
      )}

      <View style={styles.infoRow}>
        <InfoChip term="entree" value={`${entryPx.toFixed(4)} $`} />
        <InfoChip term="notionnel" value={formatUsd(positionValue)} />
      </View>

      {(stopLoss || takeProfit) && (
        <View style={styles.scenarioBox}>
          <Text style={styles.scenarioTitle}>Scénarios de sortie</Text>
          {stopLoss && lossAtSl != null && (
            <ScenarioRow
              title="Stop loss"
              price={stopLoss.triggerPx}
              amount={lossAtSl}
              negative
            />
          )}
          {takeProfit && gainAtTp != null && (
            <ScenarioRow
              title="Take profit"
              price={takeProfit.triggerPx}
              amount={gainAtTp}
              negative={false}
            />
          )}
        </View>
      )}
    </View>
  );
}

function RiskChip({
  term,
  value,
}: {
  term: 'distanceSl' | 'distanceTp' | 'riskReward';
  value: string;
}) {
  return (
    <View style={styles.riskChip}>
      <TermLabel term={term} style={styles.chipLabel} />
      <Text style={styles.chipValue}>{value}</Text>
    </View>
  );
}

function InfoChip({
  term,
  value,
}: {
  term: 'entree' | 'notionnel';
  value: string;
}) {
  return (
    <View style={styles.chip}>
      <TermLabel term={term} style={styles.chipLabel} />
      <Text style={styles.chipValue}>{value}</Text>
    </View>
  );
}

function ScenarioRow({
  title,
  price,
  amount,
  negative,
}: {
  title: string;
  price: number;
  amount: number;
  negative: boolean;
}) {
  return (
    <View style={styles.scenarioRow}>
      <View style={styles.scenarioTexts}>
        <Text style={styles.scenarioLabel}>{title}</Text>
        <Text style={styles.scenarioPrice}>à {price.toFixed(4)} $</Text>
      </View>
      <Text
        style={[
          styles.scenarioAmount,
          { color: negative ? colors.red : colors.green },
        ]}
      >
        {formatUsd(amount, true)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.sm,
    padding: spacing.lg,
    backgroundColor: colors.card,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderLeftWidth: 3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  idRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  coin: { color: colors.text, fontSize: 18, fontWeight: '700' },
  sideBadge: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.2,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderWidth: 1,
  },
  leverage: { color: colors.textMuted, fontSize: 14, fontVariant: ['tabular-nums'] },
  pnlBlock: {
    marginTop: spacing.md,
    padding: spacing.md,
    backgroundColor: colors.bgElevated,
    borderRadius: radius.md,
    alignItems: 'center',
  },
  pnlLabel: { ...typography.label, fontSize: 11 },
  pnlValue: { fontSize: 28, fontWeight: '600', marginTop: 4, fontVariant: ['tabular-nums'] },
  pnlPct: { fontSize: 14, marginTop: 4, fontVariant: ['tabular-nums'] },
  riskRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.cardBorder,
  },
  riskChip: {
    flex: 1,
    padding: spacing.sm,
    backgroundColor: colors.bgElevated,
    borderRadius: radius.sm,
  },
  infoRow: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.md },
  chip: {
    flex: 1,
    padding: spacing.sm,
    backgroundColor: colors.bgElevated,
    borderRadius: 6,
  },
  chipLabel: { color: colors.textMuted, fontSize: 11 },
  chipValue: { color: colors.text, fontSize: 14, fontWeight: '500', marginTop: 2 },
  scenarioBox: {
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.cardBorder,
    gap: spacing.sm,
  },
  scenarioTitle: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  scenarioRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  scenarioTexts: { flex: 1 },
  scenarioLabel: { color: colors.text, fontSize: 14, fontWeight: '500' },
  scenarioPrice: { color: colors.textMuted, fontSize: 12, marginTop: 2 },
  scenarioAmount: { fontSize: 15, fontWeight: '600', fontVariant: ['tabular-nums'] },
});
