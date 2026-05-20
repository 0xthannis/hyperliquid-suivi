import React from 'react';
import {
  View,
  Text,
  FlatList,
  RefreshControl,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { HistoryItem } from '../components/HistoryItem';
import { HistorySummaryCard } from '../components/HistorySummaryCard';
import { computeHistorySummary, type HistoryEvent } from '../utils/calculations';
import { colors, spacing } from '../theme';

type Props = {
  history: HistoryEvent[];
  allTimePnl: number;
  loading: boolean;
  refreshing: boolean;
  onRefresh: () => void;
};

export function HistoryScreen({
  history,
  allTimePnl,
  loading,
  refreshing,
  onRefresh,
}: Props) {
  const summary = computeHistorySummary(history, allTimePnl);

  if (loading && history.length === 0) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="small" color={colors.accent} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Historique</Text>
      <Text style={styles.subtitle}>
        Le total All Time correspond au portfolio Hyperliquid.
      </Text>
      <FlatList
        data={history}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <HistoryItem event={item} />}
        contentContainerStyle={styles.list}
        ListHeaderComponent={
          <>
            {summary.closedCount > 0 && <HistorySummaryCard summary={summary} />}
            {history.length > 0 && (
              <Text style={styles.listTitle}>Détail des opérations</Text>
            )}
          </>
        }
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.accent}
          />
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyTitle}>Pas encore d'historique</Text>
            <Text style={styles.emptyText}>
              Les trades de Neymo apparaîtront ici.
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  title: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '600',
    marginHorizontal: spacing.lg,
    marginTop: spacing.sm,
  },
  subtitle: {
    color: colors.textMuted,
    fontSize: 14,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
    lineHeight: 20,
  },
  list: { paddingHorizontal: spacing.lg, paddingBottom: 80 },
  listTitle: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: '600',
    marginBottom: spacing.sm,
  },
  empty: { alignItems: 'center', paddingTop: 48 },
  emptyTitle: { color: colors.text, fontSize: 16, fontWeight: '500' },
  emptyText: { color: colors.textMuted, fontSize: 14, marginTop: spacing.sm, textAlign: 'center' },
});
