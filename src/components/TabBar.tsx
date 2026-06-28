import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import * as Haptics from 'expo-haptics';
import { colors, spacing, font } from '../theme';
import { useLang } from '../i18n';
import { getCopy } from '../i18n/strings';

export type TabId = 'live' | 'history' | 'track' | 'about';

const TAB_IDS: TabId[] = ['live', 'history', 'track', 'about'];

export function TabBar({
  active,
  onChange,
}: {
  active: TabId;
  onChange: (id: TabId) => void;
}) {
  const [lang] = useLang();
  const t = getCopy(lang).tabs;
  const labels: Record<TabId, string> = {
    live: t.positions,
    history: t.history,
    track: t.track,
    about: t.about,
  };
  const TABS: { id: TabId; label: string }[] = TAB_IDS.map((id) => ({ id, label: labels[id] }));

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
