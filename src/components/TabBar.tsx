import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { colors, spacing } from '../theme';

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
            onPress={() => onChange(tab.id)}
            style={[styles.tab, selected && styles.tabActive]}
          >
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
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
    padding: 4,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderRadius: 999,
    gap: 4,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 9,
    borderRadius: 999,
  },
  tabActive: {
    backgroundColor: colors.accent,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  label: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  labelActive: { color: '#ffffff', fontWeight: '700' },
});
