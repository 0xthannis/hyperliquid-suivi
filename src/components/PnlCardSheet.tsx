import React, { useRef, useState } from 'react';
import {
  Modal,
  View,
  Text,
  Pressable,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { captureRef } from 'react-native-view-shot';
import * as Sharing from 'expo-sharing';
import { PnlShareCard } from './PnlShareCard';
import type { PnlCardData } from '../utils/pnlCard';
import { pnlCardFilename } from '../utils/pnlCard';
import { colors, spacing, radius } from '../theme';

type Props = {
  visible: boolean;
  data: PnlCardData | null;
  onClose: () => void;
};

export function PnlCardSheet({ visible, data, onClose }: Props) {
  const cardRef = useRef<View>(null);
  const [busy, setBusy] = useState(false);

  async function shareCard() {
    if (!data || !cardRef.current) return;
    setBusy(true);
    try {
      const uri = await captureRef(cardRef, {
        format: 'png',
        quality: 1,
        result: 'tmpfile',
      });
      const canShare = await Sharing.isAvailableAsync();
      if (!canShare) {
        Alert.alert('Partage indisponible', 'Le partage n\'est pas supporté sur cet appareil.');
        return;
      }
      await Sharing.shareAsync(uri, {
        mimeType: 'image/png',
        dialogTitle: pnlCardFilename(data),
        UTI: 'public.png',
      });
    } catch (e) {
      Alert.alert(
        'Erreur',
        e instanceof Error ? e.message : 'Impossible de générer la carte.'
      );
    } finally {
      setBusy(false);
    }
  }

  if (!data) return null;

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.backdrop}>
        <View style={styles.sheet}>
          <Text style={styles.title}>Carte PnL</Text>
          <Text style={styles.subtitle}>
            Image brandée A&amp;T · sans lien · prête pour les réseaux
          </Text>

          <View style={styles.preview} collapsable={false}>
            <View ref={cardRef} collapsable={false}>
              <PnlShareCard data={data} width={320} />
            </View>
          </View>

          <View style={styles.actions}>
            <Pressable
              style={[styles.btn, styles.btnPrimary, busy && styles.btnDisabled]}
              onPress={shareCard}
              disabled={busy}
            >
              {busy ? (
                <ActivityIndicator color={colors.bg} size="small" />
              ) : (
                <Text style={styles.btnPrimaryText}>Télécharger / Partager</Text>
              )}
            </Pressable>
            <Pressable style={styles.btn} onPress={onClose} disabled={busy}>
              <Text style={styles.btnText}>Fermer</Text>
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
    backgroundColor: 'rgba(0,0,0,0.88)',
    justifyContent: 'center',
    padding: spacing.lg,
  },
  sheet: {
    backgroundColor: colors.bgElevated,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    padding: spacing.lg,
    maxHeight: '92%',
  },
  title: {
    color: colors.goldLight,
    fontSize: 18,
    fontWeight: '700',
  },
  subtitle: {
    color: colors.textMuted,
    fontSize: 12,
    marginTop: 4,
    marginBottom: spacing.md,
  },
  preview: {
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  actions: { gap: spacing.sm },
  btn: {
    paddingVertical: 12,
    borderRadius: radius.sm,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.cardBorder,
    backgroundColor: colors.card,
  },
  btnPrimary: {
    backgroundColor: colors.gold,
    borderColor: colors.gold,
  },
  btnDisabled: { opacity: 0.7 },
  btnPrimaryText: {
    color: colors.bg,
    fontWeight: '700',
    fontSize: 14,
  },
  btnText: {
    color: colors.textMuted,
    fontWeight: '600',
    fontSize: 14,
  },
});
