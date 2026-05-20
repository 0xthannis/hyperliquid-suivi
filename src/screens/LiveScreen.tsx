import React from 'react';
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { PositionCard } from '../components/PositionCard';
import type { TraderSnapshot } from '../hooks/useTraderData';
import { formatUsd, pnlAtPrice } from '../utils/calculations';
import { colors, spacing } from '../theme';

type Props = Pick<
  TraderSnapshot,
  | 'positions'
  | 'orders'
  | 'mids'
  | 'accountValue'
  | 'loading'
  | 'error'
  | 'lastUpdate'
  | 'refreshing'
  | 'priceTick'
> & { onRefresh: () => void };

export function LiveScreen({
  positions,
  orders,
  mids,
  accountValue,
  loading,
  error,
  lastUpdate,
  refreshing,
  priceTick,
  onRefresh,
}: Props) {
  const totalPnl = positions.reduce((s, p) => {
    const px = mids[p.coin];
    return s + (px != null ? pnlAtPrice(p, px) : p.unrealizedPnl);
  }, 0);
  const totalPositive = totalPnl >= 0;

  if (loading && positions.length === 0) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="small" color={colors.accent} />
        <Text style={styles.loadingText}>Chargement des trades…</Text>
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
          tintColor={colors.accent}
        />
      }
    >
      <View style={styles.hero}>
        <Text style={styles.heroLabel}>Compte Neymo</Text>
        <Text style={styles.heroValue}>{formatUsd(accountValue)}</Text>
        <Text style={styles.heroSub}>Valeur totale sur Hyperliquid</Text>

        {positions.length > 0 && (
          <View style={styles.heroPnl}>
            <Text style={styles.heroPnlLabel}>Tous les trades ouverts</Text>
            <Text
              style={[
                styles.heroPnlValue,
                { color: totalPositive ? colors.green : colors.red },
              ]}
            >
              {formatUsd(totalPnl, true)}
            </Text>
          </View>
        )}

        {lastUpdate && (
          <Text style={styles.sync}>
            Mis à jour {lastUpdate.toLocaleTimeString('fr-FR')}
          </Text>
        )}
      </View>

      {error ? (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>{error}</Text>
          <Text style={styles.errorHint}>Tire vers le bas pour réessayer</Text>
        </View>
      ) : null}

      <Text style={styles.sectionTitle}>
        {positions.length === 0
          ? 'Aucun trade en cours'
          : `${positions.length} trade${positions.length > 1 ? 's' : ''} en cours`}
      </Text>

      {positions.length === 0 && !loading ? (
        <View style={styles.empty}>
          <Text style={styles.emptyTitle}>Rien pour l'instant</Text>
          <Text style={styles.emptyText}>
            Dès que Neymo ouvre une position, tu recevras une notification et tu
            la verras ici.
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
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  heroLabel: { color: colors.textMuted, fontSize: 13 },
  heroValue: {
    color: colors.text,
    fontSize: 32,
    fontWeight: '600',
    marginTop: 4,
    fontVariant: ['tabular-nums'],
  },
  heroSub: { color: colors.textMuted, fontSize: 13, marginTop: 4 },
  heroPnl: {
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.cardBorder,
  },
  heroPnlLabel: { color: colors.textMuted, fontSize: 12 },
  heroPnlValue: { fontSize: 22, fontWeight: '600', marginTop: 4, fontVariant: ['tabular-nums'] },
  sync: { color: colors.textDim, fontSize: 11, marginTop: spacing.sm },
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
    borderRadius: 8,
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
  errorBox: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.sm,
    padding: spacing.md,
    backgroundColor: colors.redMuted,
    borderRadius: 8,
  },
  errorText: { color: colors.red, fontSize: 14, fontWeight: '500' },
  errorHint: { color: colors.textMuted, fontSize: 12, marginTop: 4 },
});
