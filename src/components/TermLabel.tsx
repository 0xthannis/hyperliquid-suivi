import React, { useState } from 'react';
import { Pressable, Text, View, StyleSheet } from 'react-native';
import type { GlossaryKey } from '../utils/glossary';
import { GLOSSARY } from '../utils/glossary';
import { colors, radius, spacing } from '../theme';

type Props = {
  term: GlossaryKey;
  children?: string;
  style?: object;
};

export function TermLabel({ term, children, style }: Props) {
  const entry = GLOSSARY[term];
  const label = children ?? entry.short;
  const [open, setOpen] = useState(false);

  return (
    <View style={styles.wrap}>
      <Pressable
        onPress={() => setOpen((v) => !v)}
        accessibilityRole="button"
        accessibilityHint={entry.description}
      >
        <Text style={[styles.label, style]}>{label}</Text>
      </Pressable>
      {open && (
        <View style={styles.tooltip}>
          <Text style={styles.tooltipText}>{entry.description}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { position: 'relative' },
  label: {
    color: colors.textMuted,
    fontSize: 11,
    textDecorationLine: 'underline',
    textDecorationStyle: 'dotted',
  },
  tooltip: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: '100%',
    marginBottom: 4,
    zIndex: 10,
    padding: spacing.sm,
    backgroundColor: colors.bgElevated,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderRadius: radius.sm,
  },
  tooltipText: {
    color: colors.text,
    fontSize: 11,
    lineHeight: 16,
  },
});
