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
import { TargetProgressBar } from './ui/TargetProgressBar';
import { colors, spacing } from '../theme';

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
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.coin}>{coin}</Text>
        <Text style={styles.leverage}>Levier ×{leverage}</Text>
      </View>

      <Text style={[styles.direction, { color: isLong ? colors.green : colors.red }]}>
        {isLong ? 'Neymo est à l\'achat' : 'Neymo est à la vente'}
      </Text>

      <View style={styles.pnlBlock}>
        <Text style={styles.pnlLabel}>Résultat pour l'instant</Text>
        <Text style={[styles.pnlValue, { color: isWin ? colors.green : colors.red }]}>
          {formatUsd(livePnl, true)}
        </Text>
        <Text style={[styles.pnlPct, { color: isWin ? colors.green : colors.red }]}>
          {formatPct(pct)} · prix {price.toFixed(4)} $
        </Text>
      </View>

      {targetProgress && stopLoss && takeProfit && (
        <TargetProgressBar
          progress={targetProgress}
          stopLabel={formatUsd(lossAtSl ?? 0, true)}
          tpLabel={formatUsd(gainAtTp ?? 0, true)}
        />
      )}

      <View style={styles.infoRow}>
        <InfoChip label="Prix d'entrée" value={`${entryPx.toFixed(4)} $`} />
        <InfoChip label="Taille" value={formatUsd(positionValue)} />
      </View>

      {(stopLoss || takeProfit) && (
        <View style={styles.scenarioBox}>
          <Text style={styles.scenarioTitle}>Et si le prix touche…</Text>
          {stopLoss && lossAtSl != null && (
            <ScenarioRow
              title="Le plancher (stop loss)"
              price={stopLoss.triggerPx}
              amount={lossAtSl}
              negative
            />
          )}
          {takeProfit && gainAtTp != null && (
            <ScenarioRow
              title="L'objectif (take profit)"
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

function InfoChip({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.chip}>
      <Text style={styles.chipLabel}>{label}</Text>
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
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  coin: { color: colors.text, fontSize: 18, fontWeight: '600' },
  leverage: { color: colors.textMuted, fontSize: 12 },
  direction: { fontSize: 13, marginTop: spacing.sm, fontWeight: '500' },
  pnlBlock: {
    marginTop: spacing.md,
    padding: spacing.md,
    backgroundColor: colors.bgElevated,
    borderRadius: 8,
    alignItems: 'center',
  },
  pnlLabel: { color: colors.textMuted, fontSize: 12 },
  pnlValue: { fontSize: 28, fontWeight: '600', marginTop: 4, fontVariant: ['tabular-nums'] },
  pnlPct: { fontSize: 14, marginTop: 4, fontVariant: ['tabular-nums'] },
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
