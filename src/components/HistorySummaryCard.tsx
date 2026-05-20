import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import type { HistorySummary } from '../utils/calculations';
import { formatUsd } from '../utils/calculations';
import { colors, spacing } from '../theme';

export function HistorySummaryCard({ summary }: { summary: HistorySummary }) {
  const positive = summary.allTimePnl >= 0;
  const winRate =
    summary.closedCount > 0
      ? ((summary.winCount / summary.closedCount) * 100).toFixed(0)
      : '0';

  return (
    <View style={styles.card}>
      <Text style={styles.label}>PnL total fermé (All Time)</Text>
      <Text
        style={[styles.total, { color: positive ? colors.green : colors.red }]}
      >
        {formatUsd(summary.allTimePnl, true)}
      </Text>
      <Text style={styles.hint}>
        Même chiffre que Hyperliquid · perpétuels
      </Text>

      <View style={styles.row}>
        <Mini label="Taux de réussite" value={`${winRate}%`} />
        <Mini label="Gagnants" value={String(summary.winCount)} positive />
        <Mini label="Perdants" value={String(summary.lossCount)} negative />
      </View>
    </View>
  );
}

function Mini({
  label,
  value,
  positive,
  negative,
}: {
  label: string;
  value: string;
  positive?: boolean;
  negative?: boolean;
}) {
  return (
    <View style={styles.mini}>
      <Text style={styles.miniLabel}>{label}</Text>
      <Text
        style={[
          styles.miniVal,
          positive && { color: colors.green },
          negative && { color: colors.red },
        ]}
      >
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
    padding: spacing.lg,
    backgroundColor: colors.card,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  label: { color: colors.textMuted, fontSize: 13 },
  total: {
    fontSize: 28,
    fontWeight: '600',
    marginTop: 4,
    fontVariant: ['tabular-nums'],
  },
  hint: { color: colors.textMuted, fontSize: 12, marginTop: 4, marginBottom: spacing.md },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.cardBorder,
    paddingTop: spacing.md,
  },
  mini: { minWidth: '40%' },
  miniLabel: { color: colors.textMuted, fontSize: 11 },
  miniVal: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '500',
    marginTop: 2,
    fontVariant: ['tabular-nums'],
  },
});
