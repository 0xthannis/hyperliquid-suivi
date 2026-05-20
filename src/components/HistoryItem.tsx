import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import type { HistoryEvent } from '../utils/calculations';
import { formatUsd, timeAgo } from '../utils/calculations';
import { colors, spacing, radius } from '../theme';

export function HistoryItem({ event }: { event: HistoryEvent }) {
  const pnlColor =
    event.netPnl > 0 ? colors.green : event.netPnl < 0 ? colors.red : colors.textMuted;

  return (
    <View style={styles.card}>
      <View style={styles.row}>
        <View>
          <Text style={styles.coin}>{event.coin}</Text>
          <Text style={styles.label}>{event.label}</Text>
        </View>
        <Text style={styles.time}>{timeAgo(event.time)}</Text>
      </View>

      {event.isClose && (
        <Text style={[styles.pnl, { color: pnlColor }]}>
          {formatUsd(event.netPnl, true)}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  coin: { color: colors.text, fontSize: 15, fontWeight: '600' },
  label: { color: colors.text, fontSize: 14, marginTop: 4, fontWeight: '500' },
  time: { color: colors.textDim, fontSize: 11 },
  pnl: { fontSize: 16, fontWeight: '600', marginTop: spacing.sm, fontVariant: ['tabular-nums'] },
});
