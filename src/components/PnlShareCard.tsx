import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { BRAND_NAME } from '../constants';
import {
  formatPct,
  formatTradePrice,
  formatUsd,
  type PnlCardData,
} from '../utils/pnlCard';
import { displaySymbol } from '../api/hyperliquid';

type Props = {
  data: PnlCardData;
  width?: number;
};

const CARD_RATIO = 1.34;

export function PnlShareCard({ data, width = 360 }: Props) {
  const scale = width / 360;
  const s = (n: number) => n * scale;
  const height = width * CARD_RATIO;

  const win = data.isWin;
  const accent = win ? '#00b37e' : '#ff3b30';
  const sideBg = data.side === 'LONG' ? '#e6f9f1' : '#ffeceb';
  const sideColor = data.side === 'LONG' ? '#00875a' : '#d92d20';

  const closedLabel = new Date(data.closedAt).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

  return (
    <View style={[styles.wrap, { width, height, padding: s(28) }]}>
      <View style={styles.header}>
        <Text style={[styles.brand, { fontSize: s(15) }]}>{BRAND_NAME}</Text>
        <View style={[styles.badges, { gap: s(8) }]}>
          <View
            style={[
              styles.sidePill,
              { backgroundColor: sideBg, paddingHorizontal: s(10), paddingVertical: s(4) },
            ]}
          >
            <Text style={[styles.sideText, { color: sideColor, fontSize: s(10) }]}>
              {data.side}
            </Text>
          </View>
          {data.leverage != null && (
            <Text style={[styles.lev, { fontSize: s(12) }]}>×{data.leverage}</Text>
          )}
        </View>
      </View>

      <Text style={[styles.sym, { fontSize: s(26), marginTop: s(26) }]}>
        {displaySymbol(data.coin)}
      </Text>

      <View style={[styles.hero, { marginTop: s(6), gap: s(6) }]}>
        <Text style={[styles.arrow, { color: accent, fontSize: s(30) }]}>
          {win ? '↑' : '↓'}
        </Text>
        <Text style={[styles.pct, { color: accent, fontSize: s(52) }]}>
          {formatPct(data.pnlPct)}
        </Text>
      </View>
      <Text style={[styles.pnl, { color: accent, fontSize: s(20), marginTop: s(6) }]}>
        {formatUsd(data.netPnl, true)}
      </Text>

      <View style={[styles.grid, { marginTop: s(26), paddingTop: s(18) }]}>
        <View style={styles.cell}>
          <Text style={[styles.cellLabel, { fontSize: s(10) }]}>Entrée</Text>
          <Text style={[styles.cellVal, { fontSize: s(15), marginTop: s(5) }]}>
            {formatTradePrice(data.entryPx)}
          </Text>
        </View>
        <View style={styles.cell}>
          <Text style={[styles.cellLabel, { fontSize: s(10) }]}>Sortie</Text>
          <Text style={[styles.cellVal, { fontSize: s(15), marginTop: s(5) }]}>
            {formatTradePrice(data.exitPx)}
          </Text>
        </View>
        <View style={styles.cell}>
          <Text style={[styles.cellLabel, { fontSize: s(10) }]}>Durée</Text>
          <Text style={[styles.cellVal, { fontSize: s(15), marginTop: s(5) }]}>
            {data.durationLabel}
          </Text>
        </View>
      </View>

      <View style={[styles.footer, { marginTop: s(22) }]}>
        <Text style={[styles.foot, { fontSize: s(10) }]}>{closedLabel}</Text>
        <Text style={[styles.foot, { fontSize: s(10) }]}>
          {data.closeProofLabel ? `Clôture HL · ${data.closeProofLabel}` : 'Vérifié on-chain'}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  brand: { color: '#0a0a0a', fontWeight: '800', letterSpacing: -0.2 },
  badges: { flexDirection: 'row', alignItems: 'center' },
  sidePill: { borderRadius: 999 },
  sideText: { fontWeight: '800', letterSpacing: 0.8 },
  lev: { color: '#0a0a0a', fontWeight: '700' },
  sym: { color: '#0a0a0a', fontWeight: '800', letterSpacing: -0.5 },
  hero: { flexDirection: 'row', alignItems: 'baseline' },
  arrow: { fontWeight: '800' },
  pct: { fontWeight: '800', letterSpacing: -1, fontVariant: ['tabular-nums'] },
  pnl: { fontWeight: '700', fontVariant: ['tabular-nums'] },
  grid: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#ededed',
  },
  cell: { flex: 1 },
  cellLabel: {
    color: '#9b9b9b',
    fontWeight: '600',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
  cellVal: { color: '#0a0a0a', fontWeight: '700', fontVariant: ['tabular-nums'] },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  foot: { color: '#9b9b9b', fontWeight: '500' },
});
