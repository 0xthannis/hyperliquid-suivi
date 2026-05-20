import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing } from '../theme';

const FRESH_MS = 60_000;

type Props = {
  lastUpdate: Date | null;
  wsConnected: boolean;
};

export function SyncBadge({ lastUpdate, wsConnected }: Props) {
  const isFresh =
    lastUpdate != null && Date.now() - lastUpdate.getTime() < FRESH_MS;
  const ok = Boolean(wsConnected && isFresh);
  const label = ok ? 'Données à jour' : 'Resynchronisation';

  return (
    <View style={[styles.badge, ok ? styles.badgeOk : styles.badgeWarn]}>
      <View style={[styles.dot, ok ? styles.dotOk : styles.dotWarn]} />
      <Text style={[styles.text, ok ? styles.textOk : styles.textWarn]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderWidth: 1,
    alignSelf: 'flex-start',
    marginTop: spacing.sm,
  },
  badgeOk: { borderColor: 'rgba(74, 222, 128, 0.35)' },
  badgeWarn: { borderColor: 'rgba(201, 169, 98, 0.35)' },
  dot: { width: 6, height: 6, borderRadius: 3 },
  dotOk: { backgroundColor: colors.green },
  dotWarn: { backgroundColor: colors.gold },
  text: { fontSize: 10, fontWeight: '700', letterSpacing: 0.6, textTransform: 'uppercase' },
  textOk: { color: colors.green },
  textWarn: { color: colors.goldLight },
});
