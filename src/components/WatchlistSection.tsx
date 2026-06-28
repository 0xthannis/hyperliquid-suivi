import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useWatchlist, type WatchBias } from '../hooks/useWatchlist';
import { colors, font } from '../theme';
import { useLang } from '../i18n';
import { getCopy } from '../i18n/strings';

function biasColors(bias: WatchBias) {
  if (bias === 'long') return { fg: colors.green, bg: 'rgba(0,147,95,0.1)' };
  if (bias === 'short') return { fg: colors.red, bg: 'rgba(229,52,42,0.1)' };
  return { fg: colors.textMuted, bg: colors.accentMuted };
}

export function WatchlistSection() {
  const { items, loading } = useWatchlist();
  const [lang] = useLang();
  const t = getCopy(lang).watch;

  if (loading || items.length === 0) return null;

  return (
    <View style={styles.wrap}>
      <Text style={styles.section}>{t.title}</Text>
      {items.map((it, i) => {
        const c = biasColors(it.bias);
        return (
          <View style={styles.item} key={`${it.symbol}-${i}`}>
            <View style={styles.top}>
              <Text style={styles.sym}>{it.symbol}</Text>
              <View style={[styles.badge, { backgroundColor: c.bg }]}>
                <Text style={[styles.badgeText, { color: c.fg }]}>{t.bias(it.bias)}</Text>
              </View>
            </View>
            <Text style={styles.note}>{it.note}</Text>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginTop: 28 },
  section: { color: colors.text, fontSize: 16, fontFamily: font.extrabold, marginBottom: 4 },
  item: { paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: colors.line },
  top: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  sym: { color: colors.text, fontSize: 18, fontFamily: font.extrabold, letterSpacing: -0.3 },
  badge: { paddingHorizontal: 9, paddingVertical: 3, borderRadius: 999 },
  badgeText: { fontSize: 10, fontFamily: font.extrabold, letterSpacing: 0.6, textTransform: 'uppercase' },
  note: { color: colors.textMuted, fontSize: 13, fontFamily: font.regular, lineHeight: 19, marginTop: 8 },
});
