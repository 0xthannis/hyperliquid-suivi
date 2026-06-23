import { Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import { BRAND_NAME, CONTACT_EMAIL, SITE_URL, TERMINAL_NAME } from '../constants';
import { colors, spacing, typography } from '../theme';

export function TerminalUnavailableScreen() {
  return (
    <View style={styles.wrap}>
      <View style={styles.badge}>
        <Text style={styles.badgeText}>Indisponible</Text>
      </View>
      <Text style={styles.title}>Suivi wallet suspendu</Text>
      <Text style={styles.lead}>
        Le {TERMINAL_NAME} ne publie plus les positions ni l&apos;historique du wallet
        Hyperliquid pour le moment. {BRAND_NAME} conserve l&apos;application à titre
        informatif ; le suivi en direct n&apos;est pas actif.
      </Text>
      <View style={styles.list}>
        <Text style={styles.listItem}>Positions en temps réel — désactivées</Text>
        <Text style={styles.listItem}>Historique des trades — désactivé</Text>
        <Text style={styles.listItem}>Alertes push liées au wallet — désactivées</Text>
      </View>
      <Text style={styles.note}>
        Ce n&apos;est pas un conseil en investissement.
      </Text>
      <Pressable style={styles.btn} onPress={() => Linking.openURL(SITE_URL)}>
        <Text style={styles.btnText}>Voir le site</Text>
      </Pressable>
      <Pressable onPress={() => Linking.openURL(`mailto:${CONTACT_EMAIL}`)}>
        <Text style={styles.link}>{CONTACT_EMAIL}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
    alignItems: 'center',
  },
  badge: {
    marginBottom: spacing.md,
    paddingHorizontal: 10,
    paddingVertical: 4,
    backgroundColor: colors.accentMuted,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderRadius: 4,
  },
  badgeText: {
    color: colors.goldLight,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  title: {
    color: colors.text,
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  lead: {
    color: colors.textMuted,
    fontSize: typography.fontSize.sm,
    lineHeight: 22,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  list: {
    alignSelf: 'stretch',
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderRadius: 8,
    backgroundColor: colors.card,
    marginBottom: spacing.lg,
  },
  listItem: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    color: colors.textDim,
    fontSize: typography.fontSize.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.cardBorder,
  },
  note: {
    color: colors.textDim,
    fontSize: 11,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  btn: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    backgroundColor: colors.gold,
    borderRadius: 6,
    marginBottom: spacing.md,
  },
  btnText: {
    color: colors.bg,
    fontSize: typography.fontSize.sm,
    fontWeight: '600',
  },
  link: {
    color: colors.gold,
    fontSize: typography.fontSize.sm,
  },
});
