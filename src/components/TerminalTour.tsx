import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Modal,
  Pressable,
  StyleSheet,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { TERMINAL_NAME } from '../constants';
import { colors, spacing, radius } from '../theme';

const STORAGE_KEY = 'at-capital-terminal-tour-v1';

const STEPS = [
  {
    title: 'Positions en direct',
    text: 'Chaque carte affiche le PnL, le mark, les distances SL/TP et le R:R. Appuyez sur un libellé pour voir sa définition.',
  },
  {
    title: 'Historique et export',
    text: 'L\'onglet Historique liste les trades fermés. Filtrez par actif ou période, exportez en CSV.',
  },
  {
    title: 'Données à jour',
    text: 'Le badge en haut indique si les données sont synchronisées. Le wallet est vérifiable sur Hyperliquid.',
  },
];

type Props = {
  onDone?: () => void;
  /** Force replay from About screen */
  forceShow?: boolean;
  onForceConsumed?: () => void;
};

export function TerminalTour({ onDone, forceShow, onForceConsumed }: Props) {
  const [step, setStep] = useState(0);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (forceShow) {
      setStep(0);
      setVisible(true);
      onForceConsumed?.();
      return;
    }
    AsyncStorage.getItem(STORAGE_KEY).then((v) => {
      if (v !== 'done') setVisible(true);
    });
  }, [forceShow, onForceConsumed]);

  async function finish() {
    await AsyncStorage.setItem(STORAGE_KEY, 'done');
    setVisible(false);
    onDone?.();
  }

  if (!visible) return null;

  const current = STEPS[step];
  const isLast = step === STEPS.length - 1;

  return (
    <Modal visible transparent animationType="fade" onRequestClose={finish}>
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <Text style={styles.eyebrow}>{TERMINAL_NAME}</Text>
          <Text style={styles.title}>{current.title}</Text>
          <Text style={styles.text}>{current.text}</Text>
          <View style={styles.dots}>
            {STEPS.map((_, i) => (
              <View key={i} style={[styles.dot, i === step && styles.dotActive]} />
            ))}
          </View>
          <View style={styles.actions}>
            <Pressable onPress={finish} hitSlop={8}>
              <Text style={styles.skip}>Passer</Text>
            </Pressable>
            <Pressable
              style={styles.nextBtn}
              onPress={() => (isLast ? finish() : setStep((s) => s + 1))}
            >
              <Text style={styles.nextText}>{isLast ? 'Compris' : 'Suivant'}</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.75)',
    justifyContent: 'flex-end',
    padding: spacing.lg,
  },
  card: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    padding: spacing.lg,
  },
  eyebrow: {
    color: colors.gold,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  title: {
    color: colors.text,
    fontSize: 20,
    fontWeight: '700',
    marginTop: spacing.sm,
  },
  text: {
    color: colors.textMuted,
    fontSize: 14,
    lineHeight: 22,
    marginTop: spacing.sm,
  },
  dots: {
    flexDirection: 'row',
    gap: 6,
    marginTop: spacing.lg,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.cardBorder,
  },
  dotActive: { backgroundColor: colors.gold },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.lg,
  },
  skip: { color: colors.textMuted, fontSize: 14 },
  nextBtn: {
    backgroundColor: colors.gold,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  nextText: {
    color: colors.bg,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
});
