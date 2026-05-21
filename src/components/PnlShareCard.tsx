import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BRAND_NAME, TERMINAL_NAME } from '../constants';
import {
  formatPct,
  formatTradePrice,
  formatUsd,
  type PnlCardData,
} from '../utils/pnlCard';
import { colors, radius } from '../theme';

type Props = {
  data: PnlCardData;
  width?: number;
};

const CARD_RATIO = 5 / 4;

function fmtCapital(value: number): string {
  return value > 1e-6 ? formatUsd(value) : '—';
}

export function PnlShareCard({ data, width = 360 }: Props) {
  const height = width * CARD_RATIO;
  const scale = width / 360;
  const s = (n: number) => n * scale;

  const pnlColor = data.isWin ? colors.green : colors.red;
  const sideBg = data.side === 'LONG' ? colors.greenMuted : colors.redMuted;
  const sideColor = data.side === 'LONG' ? colors.green : colors.red;

  const closedLabel = new Date(data.closedAt).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

  return (
    <View style={[styles.wrap, { width, height }]}>
      <LinearGradient
        colors={['#0a0a0e', '#060608', '#12110c']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      <View
        style={[
          styles.glow,
          {
            width: s(220),
            height: s(220),
            top: -s(80),
            right: -s(60),
            backgroundColor: data.isWin
              ? 'rgba(74, 222, 128, 0.12)'
              : 'rgba(248, 113, 113, 0.1)',
          },
        ]}
      />
      <View
        style={[
          styles.glow,
          {
            width: s(160),
            height: s(160),
            bottom: s(40),
            left: -s(40),
            backgroundColor: 'rgba(201, 169, 98, 0.08)',
          },
        ]}
      />

      <View style={[styles.inner, { padding: s(22) }]}>
        <View style={styles.header}>
          <View style={[styles.brandBlock, { gap: s(5), minHeight: s(34) }]}>
            <Text style={[styles.brand, { fontSize: s(11), lineHeight: s(14) }]}>
              {BRAND_NAME}
            </Text>
            <Text style={[styles.terminal, { fontSize: s(9), lineHeight: s(12) }]}>
              {TERMINAL_NAME}
            </Text>
          </View>
          <View style={[styles.badges, { gap: s(5) }]}>
            <View style={[styles.sidePill, { backgroundColor: sideBg, paddingHorizontal: s(10), paddingVertical: s(4) }]}>
              <Text style={[styles.sideText, { color: sideColor, fontSize: s(10) }]}>
                {data.side}
              </Text>
            </View>
            {data.leverage != null && (
              <Text style={[styles.leverage, { fontSize: s(10) }]}>×{data.leverage}</Text>
            )}
          </View>
        </View>

        <Text style={[styles.coin, { fontSize: s(42), marginTop: s(18) }]}>{data.coin}</Text>

        <View style={[styles.hero, { marginTop: s(20) }]}>
          <Text style={[styles.pnlHero, { color: pnlColor, fontSize: s(38) }]}>
            {formatUsd(data.netPnl, true)}
          </Text>
          <Text style={[styles.pctHero, { color: pnlColor, fontSize: s(20), marginTop: s(4) }]}>
            {formatPct(data.pnlPct)}
          </Text>
        </View>

        <View style={[styles.priceRow, { marginTop: s(24), gap: s(12) }]}>
          <View style={[styles.priceCell, { padding: s(12) }]}>
            <Text style={[styles.cellLabel, { fontSize: s(9) }]}>Entrée</Text>
            <Text style={[styles.cellValue, { fontSize: s(15), marginTop: s(4) }]}>
              {formatTradePrice(data.entryPx)}
            </Text>
          </View>
          <View style={[styles.priceCell, { padding: s(12) }]}>
            <Text style={[styles.cellLabel, { fontSize: s(9) }]}>Sortie</Text>
            <Text style={[styles.cellValue, { fontSize: s(15), marginTop: s(4) }]}>
              {formatTradePrice(data.exitPx)}
            </Text>
          </View>
        </View>

        <View style={[styles.notionalRow, { marginTop: s(10), gap: s(8) }]}>
          <View style={[styles.notionalCell, { padding: s(10) }]}>
            <Text style={[styles.cellLabel, { fontSize: s(8) }]}>Capital risqué</Text>
            <Text style={[styles.cellValueSm, { fontSize: s(12), marginTop: s(3) }]}>
              {fmtCapital(data.riskedUsd)}
            </Text>
          </View>
          <View style={[styles.notionalCell, { padding: s(10) }]}>
            <Text style={[styles.cellLabel, { fontSize: s(8) }]}>Capital sortie</Text>
            <Text style={[styles.cellValueSm, { fontSize: s(12), marginTop: s(3) }]}>
              {fmtCapital(data.exitCapitalUsd)}
            </Text>
          </View>
          <View style={[styles.notionalCell, styles.notionalProfit, { padding: s(10) }]}>
            <Text style={[styles.cellLabel, { fontSize: s(8) }]}>Profit</Text>
            <Text
              style={[
                styles.cellValueSm,
                { color: pnlColor, fontSize: s(12), marginTop: s(3) },
              ]}
            >
              {formatUsd(data.netPnl, true)}
            </Text>
          </View>
        </View>

        <View style={[styles.footer, { marginTop: s(16), paddingTop: s(12) }]}>
          <View style={styles.footerLeft}>
            <Text style={[styles.footerMeta, { fontSize: s(10) }]}>
              Durée · {data.durationLabel}
            </Text>
            <Text style={[styles.footerDate, { fontSize: s(10), marginTop: s(2) }]}>
              {closedLabel}
            </Text>
          </View>
          {data.closeProofLabel ? (
            <View style={styles.footerRight}>
              <Text style={[styles.proofLabel, { fontSize: s(8) }]}>Clôture HL</Text>
              <Text style={[styles.proof, { fontSize: s(9), marginTop: s(2) }]}>
                {data.closeProofLabel}
              </Text>
            </View>
          ) : null}
        </View>
      </View>

      <View style={[styles.border, { borderRadius: s(8) }]} pointerEvents="none" />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    overflow: 'hidden',
    borderRadius: 8,
    backgroundColor: colors.bg,
  },
  glow: {
    position: 'absolute',
    borderRadius: 999,
  },
  inner: {
    flex: 1,
    zIndex: 1,
  },
  border: {
    ...StyleSheet.absoluteFillObject,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    zIndex: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  brandBlock: {
    flexDirection: 'column',
    flexShrink: 0,
  },
  brand: {
    color: colors.goldLight,
    fontWeight: '700',
    letterSpacing: 1.2,
  },
  terminal: {
    color: colors.textDim,
    fontWeight: '600',
    letterSpacing: 0.6,
  },
  badges: {
    alignItems: 'flex-end',
    flexShrink: 0,
  },
  sidePill: {
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  sideText: {
    fontWeight: '800',
    letterSpacing: 1,
  },
  leverage: {
    color: colors.textMuted,
    fontWeight: '700',
  },
  coin: {
    color: colors.text,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  hero: {
    alignItems: 'flex-start',
  },
  pnlHero: {
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  pctHero: {
    fontWeight: '600',
    fontVariant: ['tabular-nums'],
  },
  priceRow: {
    flexDirection: 'row',
  },
  priceCell: {
    flex: 1,
    backgroundColor: 'rgba(20, 20, 24, 0.85)',
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  notionalRow: {
    flexDirection: 'row',
  },
  notionalCell: {
    flex: 1,
    backgroundColor: 'rgba(20, 20, 24, 0.65)',
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  notionalProfit: {
    borderColor: 'rgba(201, 169, 98, 0.25)',
  },
  cellLabel: {
    color: colors.textMuted,
    fontWeight: '700',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  cellValue: {
    color: colors.text,
    fontWeight: '600',
    fontVariant: ['tabular-nums'],
  },
  cellValueSm: {
    color: colors.text,
    fontWeight: '600',
    fontVariant: ['tabular-nums'],
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    borderTopWidth: 1,
    borderTopColor: colors.cardBorder,
  },
  footerLeft: {
    flex: 1,
  },
  footerRight: {
    alignItems: 'flex-end',
    maxWidth: '48%',
  },
  footerMeta: {
    color: colors.textMuted,
    fontWeight: '600',
  },
  footerDate: {
    color: colors.textDim,
  },
  proofLabel: {
    color: colors.textDim,
    fontWeight: '700',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  proof: {
    color: colors.textMuted,
    fontWeight: '600',
    fontVariant: ['tabular-nums'],
  },
});
