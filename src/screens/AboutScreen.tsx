import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  Linking,
  StyleSheet,
} from 'react-native';
import {
  APK_DOWNLOAD_URL,
  BRAND_NAME,
  CONTACT_EMAIL,
  SITE_URL,
  TERMINAL_NAME,
  TRADER_WALLET,
  hyperliquidExplorerUrl,
} from '../constants';
import { truncateWallet } from '../utils/wallet';
import {
  registerRemotePush,
  remotePushErrorMessage,
} from '../services/remotePush';
import { colors, spacing, radius } from '../theme';

type Props = {
  onReplayTour: () => void;
};

export function AboutScreen({ onReplayTour }: Props) {
  const [installing, setInstalling] = useState(false);
  const [pushStatus, setPushStatus] = useState<string | null>(null);
  const [pushLoading, setPushLoading] = useState(false);

  const syncServerPush = useCallback(async () => {
    setPushLoading(true);
    try {
      const r = await registerRemotePush();
      if (r.ok) {
        setPushStatus(`Alertes serveur actives (${r.kind.toUpperCase()}).`);
      } else {
        setPushStatus(remotePushErrorMessage(r.reason));
      }
    } finally {
      setPushLoading(false);
    }
  }, []);

  useEffect(() => {
    void syncServerPush();
  }, [syncServerPush]);

  async function openApkDownload() {
    setInstalling(true);
    try {
      await Linking.openURL(APK_DOWNLOAD_URL);
    } finally {
      setInstalling(false);
    }
  }

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
      <Text style={styles.title}>{BRAND_NAME}</Text>
      <Text style={styles.lead}>
        Structure fondée par Annissa et Thanh. Le {TERMINAL_NAME} affiche l'activité
        Hyperliquid du trader principal, en lecture seule.
      </Text>

      <View style={styles.card}>
        <Text style={styles.cardName}>Thanh</Text>
        <Text style={styles.cardRole}>Trader principal</Text>
        <Text style={styles.cardText}>
          Exécute les positions sur le wallet suivi. Données lues depuis l'API Hyperliquid.
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardName}>Annissa</Text>
        <Text style={styles.cardRole}>Co-fondatrice</Text>
        <Text style={styles.cardText}>
          Structure A&T CAPITAL avec Thanh et transparence publique du terminal.
        </Text>
      </View>

      <Text style={styles.sectionTitle}>Notifications (app fermée)</Text>
      <Text style={styles.body}>
        Les alertes passent par {SITE_URL}. Appuyez ci-dessous pour enregistrer ce
        téléphone sur le serveur.
      </Text>
      <Pressable
        style={styles.secondaryBtn}
        onPress={() => void syncServerPush()}
        disabled={pushLoading}
      >
        <Text style={styles.secondaryBtnText}>
          {pushLoading ? 'Enregistrement…' : 'Activer les alertes serveur'}
        </Text>
      </Pressable>
      {pushStatus ? (
        <Text
          style={[
            styles.pushStatus,
            pushStatus.includes('actives') ? styles.pushOk : styles.pushErr,
          ]}
        >
          {pushStatus}
        </Text>
      ) : null}

      <Text style={styles.sectionTitle}>Le 277</Text>
      <Text style={styles.body}>
        Référence personnelle pour nous. Le {TERMINAL_NAME} est notre espace de suivi public.
      </Text>

      <Text style={styles.sectionTitle}>Liens</Text>
      <Pressable style={styles.linkBtn} onPress={() => Linking.openURL(SITE_URL)}>
        <Text style={styles.linkText}>{SITE_URL}</Text>
      </Pressable>
      <Pressable
        style={styles.linkBtn}
        onPress={() => Linking.openURL(hyperliquidExplorerUrl(TRADER_WALLET))}
      >
        <Text style={styles.linkText}>Wallet {truncateWallet(TRADER_WALLET)}</Text>
      </Pressable>
      <Pressable style={styles.linkBtn} onPress={() => Linking.openURL(`mailto:${CONTACT_EMAIL}`)}>
        <Text style={styles.linkText}>{CONTACT_EMAIL}</Text>
      </Pressable>

      <Pressable style={styles.primaryBtn} onPress={openApkDownload}>
        <Text style={styles.primaryBtnText}>
          {installing ? 'Ouverture…' : 'Télécharger la dernière APK'}
        </Text>
      </Pressable>
      <Text style={styles.hint}>
        Partagez ce lien pour installer l'app Android ({TERMINAL_NAME}).
      </Text>

      <Pressable style={styles.secondaryBtn} onPress={onReplayTour}>
        <Text style={styles.secondaryBtnText}>Revoir le guide de démarrage</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  content: { padding: spacing.lg, paddingBottom: 96 },
  title: {
    color: colors.goldLight,
    fontSize: 22,
    fontWeight: '700',
    letterSpacing: 2,
  },
  lead: {
    color: colors.textMuted,
    fontSize: 15,
    lineHeight: 24,
    marginTop: spacing.md,
  },
  card: {
    marginTop: spacing.md,
    padding: spacing.lg,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderRadius: radius.md,
  },
  cardName: { color: colors.goldLight, fontSize: 18, fontWeight: '700' },
  cardRole: {
    color: colors.gold,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginTop: 4,
  },
  cardText: { color: colors.textMuted, fontSize: 14, lineHeight: 22, marginTop: spacing.sm },
  sectionTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '700',
    marginTop: spacing.xl,
    marginBottom: spacing.sm,
  },
  body: { color: colors.textMuted, fontSize: 14, lineHeight: 22 },
  linkBtn: {
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.cardBorder,
  },
  linkText: { color: colors.gold, fontSize: 14, fontWeight: '600' },
  primaryBtn: {
    marginTop: spacing.xl,
    backgroundColor: colors.gold,
    paddingVertical: spacing.md,
    alignItems: 'center',
    borderRadius: radius.sm,
  },
  primaryBtnText: {
    color: colors.bg,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  hint: {
    color: colors.textDim,
    fontSize: 12,
    marginTop: spacing.sm,
    lineHeight: 18,
    textAlign: 'center',
  },
  secondaryBtn: {
    marginTop: spacing.lg,
    paddingVertical: spacing.md,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    alignItems: 'center',
  },
  secondaryBtnText: {
    color: colors.textMuted,
    fontSize: 13,
    fontWeight: '600',
  },
  pushStatus: { fontSize: 13, marginTop: spacing.sm, lineHeight: 20 },
  pushOk: { color: colors.green },
  pushErr: { color: colors.red },
});
