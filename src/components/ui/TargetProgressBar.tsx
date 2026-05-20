import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import type { TargetProgress } from '../../utils/calculations';
import { colors, radius, spacing } from '../../theme';

type Props = {
  progress: TargetProgress;
  stopLabel: string;
  tpLabel: string;
};

export function TargetProgressBar({ progress, stopLabel, tpLabel }: Props) {
  const markerColor =
    progress.zone === 'danger' ? colors.red : colors.accent;
  const pctText =
    progress.pct >= 0
      ? `${progress.pct.toFixed(0)}%`
      : `-${Math.abs(progress.pct).toFixed(0)}%`;

  return (
    <View style={styles.wrap}>
      <View style={styles.labels}>
        <Text style={styles.sl}>🛑 {stopLabel}</Text>
        <Text style={styles.tp}>🎯 {tpLabel}</Text>
      </View>
      <View style={styles.track}>
        <View
          style={[
            styles.fill,
            {
              width: `${progress.barPct}%`,
              backgroundColor: markerColor,
              opacity: 0.4,
            },
          ]}
        />
        <View
          style={[
            styles.marker,
            {
              left: `${Math.min(99, Math.max(1, progress.barPct))}%`,
              backgroundColor: markerColor,
            },
          ]}
        />
      </View>
      <Text style={styles.hint}>
        Le prix est à {pctText} du chemin vers l'objectif
        {progress.zone === 'danger' &&
          ` · attention, proche du plancher`}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginTop: spacing.md },
  labels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  sl: { color: colors.red, fontSize: 11 },
  tp: { color: colors.green, fontSize: 11 },
  track: {
    height: 4,
    borderRadius: radius.pill,
    backgroundColor: 'rgba(151, 163, 175, 0.15)',
    position: 'relative',
  },
  fill: { height: '100%', borderRadius: radius.pill },
  marker: {
    position: 'absolute',
    top: -3,
    width: 10,
    height: 10,
    borderRadius: 5,
    marginLeft: -5,
    borderWidth: 1,
    borderColor: colors.bg,
  },
  hint: { color: colors.textDim, fontSize: 11, marginTop: spacing.xs, lineHeight: 16 },
});
