import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { colors, spacing } from '../theme';

export type TabId = 'live' | 'history';

const TABS: { id: TabId; label: string }[] = [
  { id: 'live', label: 'En ce moment' },
  { id: 'history', label: 'Historique' },
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
            style={styles.tab}
          >
            <Text style={[styles.label, selected && styles.labelActive]}>
              {tab.label}
            </Text>
            {selected && <View style={styles.indicator} />}
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
    borderBottomWidth: 1,
    borderBottomColor: colors.cardBorder,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.sm,
    position: 'relative',
  },
  label: { color: colors.textMuted, fontSize: 14, fontWeight: '500' },
  labelActive: { color: colors.text, fontWeight: '600' },
  indicator: {
    position: 'absolute',
    bottom: 0,
    left: '15%',
    right: '15%',
    height: 2,
    backgroundColor: colors.accent,
  },
});
