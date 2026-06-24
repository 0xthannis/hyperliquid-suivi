import React from 'react';
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  StyleSheet,
  ActivityIndicator,
  Pressable,
} from 'react-native';
import { PositionCard } from '../components/PositionCard';
import { TermLabel } from '../components/TermLabel';
import type { TraderSnapshot } from '../hooks/useTraderData';
import { formatUsd, pnlAtPrice } from '../utils/calculations';
import { TERMINAL_NAME } from '../constants';
import { colors, spacing, radius, mono } from '../theme';

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

function Kpi({
  label,
  value,
  color,
}: {
  label: string;
  value: string;
  color?: string;
}) {
  return (
    <View style={styles.kpi}>
      <Text style={styles.kpiLabel}>{label}</Text>
      <Text style={[styles.kpiValue, color ? { color } : null]}>{value}</Text>
    </View>
  );
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
  lastUpdate,
  refreshing,
  priceTick,
  onRefresh,
  onOpenHistory,
}: Props) {
  const totalPnl = positions.reduce((s, p) => {
    const px = mids[p.coin];
    return s + (px != null ? pnlAtPrice(p, px) : p.unrealizedPnl);
  }, 0);
  const totalPositive = totalPnl >= 0;
  const closed = history.filter((e) => e.isClose);
  const winRate =
    closed.length > 0
      ? `${Math.round((closed.filter((e) => e.isWin).length / closed.length) * 100)}%`
      : 'n/a';

  if (loading && positions.length === 0) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="small" color={colors.gold} />
        <Text style={styles.loadingText}>Chargement du {TERMINAL_NAME}…</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={colors.gold}
        />
      }
    >
      <View style={styles.hero}>
        <TermLabel term="valeurCompte" style={styles.heroLabel} />
        <Text style={styles.heroValue}>{formatUsd(accountValue)}</Text>
        {lastUpdate && (
          <Text style={styles.sync}>
            Mis à jour {lastUpdate.toLocaleTimeString('fr-FR')}
          </Text>
        )}

        <View style={styles.kpiGrid}>
          <Kpi
            label="PnL ouvert"
            value={positions.length ? formatUsd(totalPnl, true) : formatUsd(0)}
            color={
              positions.length
                ? totalPositive
                  ? colors.green
                  : colors.red
                : colors.text
            }
          />
          <Kpi
            label="PnL all-time"
            value={formatUsd(allTimePnl, true)}
            color={allTimePnl >= 0 ? colors.green : colors.red}
          />
          <Kpi label="Réussite" value={winRate} />
        </View>
      </View>

      {error ? (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>{error}</Text>
          <Text style={styles.errorHint}>Tirez vers le bas pour réessayer</Text>
        </View>
      ) : null}

      <Text style={styles.sectionTitle}>
        {positions.length === 0
          ? 'Aucune position ouverte'
          : `${positions.length} position${positions.length > 1 ? 's' : ''} ouverte${positions.length > 1 ? 's' : ''}`}
      </Text>

      {positions.length === 0 && !loading ? (
        <View style={styles.empty}>
          <Text style={styles.emptyTitle}>Portefeuille sans exposition</Text>
          <Text style={styles.emptyText}>
            Dès qu'une position s'ouvre sur Hyperliquid, elle apparaît ici avec ses
            stops et take profits.
          </Text>
          <Pressable style={styles.emptyBtn} onPress={onOpenHistory}>
            <Text style={styles.emptyBtnText}>Voir l'historique</Text>
          </Pressable>
          <Text style={styles.emptyHint}>
            Les notifications indiquent chaque ouverture et chaque fermeture avec le
            gain ou la perte en $.
          </Text>
        </View>
      ) : (
        positions.map((p) => (
          <PositionCard
            key={`${p.coin}-${priceTick}`}
            position={p}
            orders={orders}
            currentPrice={mids[p.coin]}
          />
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  content: { paddingBottom: 80 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.md },
  loadingText: { color: colors.textMuted, fontSize: 14 },
  hero: {
    marginHorizontal: spacing.lg,
    marginTop: spacing.md,
    padding: spacing.lg,
    backgroundColor: colors.card,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  heroLabel: { fontSize: 13 },
  heroValue: {
    color: colors.text,
    fontSize: 36,
    fontWeight: '600',
    marginTop: 6,
    letterSpacing: -0.5,
    fontFamily: mono,
    fontVariant: ['tabular-nums'],
  },
  sync: { color: colors.textDim, fontSize: 11, marginTop: spacing.sm },
  kpiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: spacing.lg,
  },
  kpi: {
    flexGrow: 1,
    flexBasis: 0,
    minWidth: 92,
    backgroundColor: colors.card2,
    borderRadius: radius.sm,
    paddingVertical: 12,
    paddingHorizontal: 14,
  },
  kpiLabel: {
    color: colors.textDim,
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  kpiValue: {
    color: colors.text,
    fontSize: 17,
    fontWeight: '600',
    marginTop: 5,
    fontFamily: mono,
    fontVariant: ['tabular-nums'],
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '600',
    marginHorizontal: spacing.lg,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  empty: {
    marginHorizontal: spacing.lg,
    padding: spacing.xl,
    backgroundColor: colors.card,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  emptyTitle: { color: colors.text, fontSize: 17, fontWeight: '600' },
  emptyText: {
    color: colors.textMuted,
    fontSize: 14,
    marginTop: spacing.sm,
    lineHeight: 22,
  },
  emptyBtn: {
    marginTop: spacing.lg,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.gold,
    alignSelf: 'flex-start',
  },
  emptyBtnText: {
    color: colors.bg,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  emptyHint: {
    color: colors.textDim,
    fontSize: 12,
    marginTop: spacing.md,
    lineHeight: 18,
  },
  errorBox: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.sm,
    padding: spacing.md,
    backgroundColor: colors.redMuted,
    borderRadius: radius.md,
  },
  errorText: { color: colors.red, fontSize: 14, fontWeight: '500' },
  errorHint: { color: colors.textMuted, fontSize: 12, marginTop: 4 },
});
