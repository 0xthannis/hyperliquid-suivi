import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  RefreshControl,
  StyleSheet,
  ActivityIndicator,
  Pressable,
} from 'react-native';
import { HistoryItem } from '../components/HistoryItem';
import { PnlCardSheet } from '../components/PnlCardSheet';
import type { Fill } from '../api/hyperliquid';
import {
  computeHistorySummary,
  filterHistoryByDays,
  formatUsd,
  type HistoryEvent,
} from '../utils/calculations';
import { shareHistoryCsv } from '../utils/exportCsv';
import { colors, spacing, radius } from '../theme';

type Props = {
  history: HistoryEvent[];
  fills: Fill[];
  allTimePnl: number;
  loading: boolean;
  refreshing: boolean;
  onRefresh: () => void;
};

type PeriodFilter = 7 | 30;

export function HistoryScreen({
  history,
  fills,
  allTimePnl,
  loading,
  refreshing,
  onRefresh,
}: Props) {
  const [periodDays, setPeriodDays] = useState<PeriodFilter>(7);
  const [pnlCardEvent, setPnlCardEvent] = useState<HistoryEvent | null>(null);

  const filtered = useMemo(
    () => filterHistoryByDays(history, periodDays),
    [history, periodDays]
  );

  const summary = useMemo(
    () => computeHistorySummary(filtered, allTimePnl),
    [filtered, allTimePnl]
  );

  const winRate =
    summary.closedCount > 0
      ? Math.round((summary.winCount / summary.closedCount) * 100)
      : 0;

  const allTimePositive = summary.allTimePnl >= 0;
  const periodPositive = summary.fillsClosedNet >= 0;

  if (loading && history.length === 0) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="small" color={colors.gold} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.topRow}>
          <View style={styles.periodToggle}>
            {([7, 30] as const).map((d) => (
              <Pressable
                key={d}
                style={[
                  styles.periodBtn,
                  periodDays === d && styles.periodBtnActive,
                ]}
                onPress={() => setPeriodDays(d)}
              >
                <Text
                  style={[
                    styles.periodBtnText,
                    periodDays === d && styles.periodBtnTextActive,
                  ]}
                >
                  {d}j
                </Text>
              </Pressable>
            ))}
          </View>
          {filtered.length > 0 && (
            <Pressable
              style={styles.exportBtn}
              onPress={() => shareHistoryCsv(filtered)}
            >
              <Text style={styles.exportBtnText}>CSV</Text>
            </Pressable>
          )}
        </View>

        <View style={styles.statsRow}>
          <View style={styles.stat}>
            <Text style={styles.statLabel}>PnL fermé</Text>
            <Text
              style={[
                styles.statValue,
                { color: allTimePositive ? colors.green : colors.red },
              ]}
            >
              {formatUsd(summary.allTimePnl, true)}
            </Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.stat}>
            <Text style={styles.statLabel}>{periodDays}j</Text>
            <Text
              style={[
                styles.statValue,
                { color: periodPositive ? colors.green : colors.red },
              ]}
            >
              {formatUsd(summary.fillsClosedNet, true)}
            </Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.stat}>
            <Text style={styles.statLabel}>Réussite</Text>
            <Text style={styles.statValue}>{winRate}%</Text>
            <Text style={styles.statHint}>
              {summary.closedCount} op. · {summary.winCount}G/{summary.lossCount}P
            </Text>
          </View>
        </View>
      </View>

      <FlatList
        style={styles.list}
        data={filtered}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <HistoryItem
            event={item}
            onSharePnl={
              item.isClose ? () => setPnlCardEvent(item) : undefined
            }
          />
        )}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.gold}
          />
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyTitle}>Aucune opération</Text>
            <Text style={styles.emptyText}>
              Aucun trade sur {periodDays} jours. Essayez 30j ou attendez une
              nouvelle clôture.
            </Text>
          </View>
        }
      />

      {pnlCardEvent && (
        <PnlCardSheet
          event={pnlCardEvent}
          fills={fills}
          onClose={() => setPnlCardEvent(null)}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  header: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xs,
    paddingBottom: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.cardBorder,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  periodToggle: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderRadius: radius.sm,
    overflow: 'hidden',
  },
  periodBtn: {
    paddingVertical: 6,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.card,
  },
  periodBtnActive: {
    backgroundColor: colors.accentMuted,
  },
  periodBtnText: {
    color: colors.textMuted,
    fontSize: 13,
    fontWeight: '600',
  },
  periodBtnTextActive: { color: colors.goldLight },
  exportBtn: {
    paddingVertical: 6,
    paddingHorizontal: spacing.sm,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderRadius: radius.sm,
    backgroundColor: colors.card,
  },
  exportBtnText: {
    color: colors.goldLight,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'stretch',
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderRadius: radius.sm,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
  },
  stat: { flex: 1, alignItems: 'center' },
  statDivider: {
    width: 1,
    backgroundColor: colors.cardBorder,
    marginVertical: 2,
  },
  statLabel: {
    color: colors.textMuted,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  statValue: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '600',
    marginTop: 2,
    fontVariant: ['tabular-nums'],
  },
  statHint: {
    color: colors.textMuted,
    fontSize: 9,
    marginTop: 1,
    fontVariant: ['tabular-nums'],
  },
  list: { flex: 1 },
  listContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: 96,
    flexGrow: 1,
  },
  empty: {
    alignItems: 'center',
    paddingTop: 40,
    paddingHorizontal: spacing.lg,
  },
  emptyTitle: { color: colors.text, fontSize: 15, fontWeight: '500' },
  emptyText: {
    color: colors.textMuted,
    fontSize: 13,
    marginTop: spacing.xs,
    textAlign: 'center',
    lineHeight: 20,
  },
});
