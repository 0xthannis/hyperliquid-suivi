import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import type { PeriodStats } from '../utils/calculations';
import { formatUsd } from '../utils/calculations';
import { colors, spacing, typography } from '../theme';

export function PeriodStatsStrip({ stats }: { stats: PeriodStats }) {
  const items = [
    {
      label: "Aujourd'hui",
      value: formatUsd(stats.todayNet, true),
      sub: `${stats.todayWinRate.toFixed(0)}% · ${stats.todayClosed} fermés`,
      positive: stats.todayNet >= 0,
    },
    {
      label: '7 jours',
      value: formatUsd(stats.weekNet, true),
      sub: `${stats.weekWinRate.toFixed(0)}% · ${stats.weekClosed} fermés`,
      positive: stats.weekNet >= 0,
    },
  ];

  return (
    <View style={styles.row}>
      {items.map((c) => (
        <View key={c.label} style={styles.chip}>
          <Text style={styles.chipLabel}>{c.label}</Text>
          <Text
            style={[
              styles.chipValue,
              { color: c.positive ? colors.green : colors.red },
            ]}
          >
            {c.value}
          </Text>
          <Text style={styles.chipSub}>{c.sub}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  chip: {
    flex: 1,
    padding: spacing.md,
    backgroundColor: colors.card,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  chipLabel: { ...typography.label, fontSize: 10 },
  chipValue: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: spacing.xs,
    fontVariant: ['tabular-nums'],
  },
  chipSub: { color: colors.textDim, fontSize: 11, marginTop: 4 },
});
