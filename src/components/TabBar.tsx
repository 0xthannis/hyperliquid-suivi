import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import * as Haptics from 'expo-haptics';
import { colors, spacing, font } from '../theme';

export type TabId = 'live' | 'history' | 'about';

const TABS: { id: TabId; label: string }[] = [
  { id: 'live', label: 'Positions' },
  { id: 'history', label: 'Historique' },
  { id: 'about', label: 'À propos' },
];

export function TabBar({
  active,
  onChange,
}: {
  active: TabId;
  onChange: (id: TabId) => void;
}) {
  return (
    <View style={styles.bar}>
      {TABS.map((tab) => {
        const selected = active === tab.id;
        return (
          <Pressable
            key={tab.id}
            onPress={() => {
              Haptics.selectionAsync().catch(() => {});
              onChange(tab.id);
            }}
            style={styles.tab}
            hitSlop={8}
          >
            <View style={[styles.indicator, selected && styles.indicatorActive]} />
            <Text style={[styles.label, selected && styles.labelActive]}>
              {tab.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    paddingTop: 10,
    paddingBottom: 6,
    backgroundColor: colors.bg,
    borderTopWidth: 1,
    borderTopColor: colors.line,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 6,
    gap: 7,
  },
  indicator: {
    width: 22,
    height: 2.5,
    borderRadius: 2,
    backgroundColor: 'transparent',
  },
  indicatorActive: { backgroundColor: colors.accent },
  label: {
    color: colors.textDim,
    fontSize: 12,
    fontFamily: font.semibold,
    letterSpacing: 0.2,
  },
  labelActive: { color: colors.text, fontFamily: font.bold },
});
