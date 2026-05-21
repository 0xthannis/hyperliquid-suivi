import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import type { HistoryEvent } from '../utils/calculations';
import { formatUsd, timeAgo } from '../utils/calculations';
import { colors, spacing, radius } from '../theme';

type Props = {
  event: HistoryEvent;
  onSharePnl?: () => void;
};

export function HistoryItem({ event, onSharePnl }: Props) {
  const pnlColor =
    event.netPnl > 0 ? colors.green : event.netPnl < 0 ? colors.red : colors.textMuted;

  return (
    <View style={styles.card}>
      <View style={styles.row}>
        <View style={styles.main}>
          <Text style={styles.coin}>{event.coin}</Text>
          <Text style={styles.label}>{event.label}</Text>
        </View>
        <View style={styles.right}>
          {event.isClose && onSharePnl && (
            <Pressable
              style={styles.cardBtn}
              onPress={onSharePnl}
              accessibilityLabel="Générer carte PnL"
            >
              <Text style={styles.cardBtnText}>Card</Text>
            </Pressable>
          )}
          <Text style={styles.time}>{timeAgo(event.time)}</Text>
        </View>
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
  main: { flex: 1, minWidth: 0 },
  right: { alignItems: 'flex-end', gap: 6 },
  coin: { color: colors.text, fontSize: 15, fontWeight: '600' },
  label: { color: colors.text, fontSize: 14, marginTop: 4, fontWeight: '500' },
  time: { color: colors.textDim, fontSize: 11 },
  cardBtn: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    backgroundColor: colors.accentMuted,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  cardBtnText: {
    color: colors.goldLight,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.6,
  },
  pnl: { fontSize: 16, fontWeight: '600', marginTop: spacing.sm, fontVariant: ['tabular-nums'] },
});
