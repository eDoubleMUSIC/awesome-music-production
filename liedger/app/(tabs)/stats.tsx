import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { Alert, ScrollView, Share, StyleSheet, Switch, Text, View } from 'react-native';

import { Button, Card } from '@/components/ui';
import { getStats, type Stats } from '@/db/repo';
import { restorePurchases } from '@/lib/purchases';
import { useApp } from '@/state/app';
import { colors, font, radius, spacing } from '@/theme';

export default function StatsScreen() {
  const router = useRouter();
  const { pro, lockEnabled, setLockEnabled, refreshPro } = useApp();
  const [stats, setStats] = useState<Stats | null>(null);

  useFocusEffect(
    useCallback(() => {
      setStats(getStats());
    }, []),
  );

  const share = async () => {
    if (!stats) return;
    await Share.share({
      message:
        `📒 My Liedger stats:\n` +
        `• ${stats.totalLies} stories tracked\n` +
        `• ${stats.activeLies} still active\n` +
        `• ${stats.exposedLies} caught 😬\n` +
        `• ${stats.peopleInvolved} people in the web\n\n` +
        `Keeping my stories straight with Liedger.`,
    });
  };

  const onToggleLock = async (v: boolean) => {
    await setLockEnabled(v);
    if (v && lockEnabled === false) {
      // setLockEnabled silently no-ops if biometrics unavailable.
      const { isBiometricAvailable } = await import('@/lib/lock');
      if (!(await isBiometricAvailable())) {
        Alert.alert('No biometrics', 'Set up Face ID / fingerprint on your device first.');
      }
    }
  };

  const restore = async () => {
    const ok = await restorePurchases();
    await refreshPro();
    Alert.alert(ok ? 'Restored' : 'Nothing to restore', ok ? 'Welcome back to Pro.' : 'No prior purchase found.');
  };

  const s = stats ?? {
    totalLies: 0,
    activeLies: 0,
    exposedLies: 0,
    storiesTracked: 0,
    peopleInvolved: 0,
    highRisk: 0,
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Shareable stats card — the primary organic-growth surface. */}
      <View style={styles.shareCard}>
        <Text style={styles.shareTitle}>📒 Liedger</Text>
        <View style={styles.grid}>
          <Stat n={s.totalLies} label="tracked" />
          <Stat n={s.activeLies} label="active" />
          <Stat n={s.exposedLies} label="caught" />
          <Stat n={s.peopleInvolved} label="people" />
        </View>
        <Text style={styles.shareTagline}>Keeping my stories straight.</Text>
      </View>

      <Button label="Share my stats" onPress={share} style={{ marginTop: spacing.lg }} />

      {!pro && (
        <Card style={styles.proCard}>
          <Text style={styles.proTitle}>Liedger Pro</Text>
          <Text style={styles.proBody}>
            Unlock unlimited lies, “before you meet” briefings, and the
            relationship graph. One payment, yours forever.
          </Text>
          <Button label="Unlock for life" onPress={() => router.push('/paywall')} />
        </Card>
      )}
      {pro && (
        <Card style={styles.proCard}>
          <View style={styles.proRow}>
            <Ionicons name="checkmark-circle" size={22} color={colors.riskLow} />
            <Text style={styles.proActive}>Liedger Pro — unlocked for life</Text>
          </View>
        </Card>
      )}

      <Card style={styles.settingRow}>
        <View style={{ flex: 1 }}>
          <Text style={styles.settingTitle}>App lock (Face ID / fingerprint)</Text>
          <Text style={styles.settingSub}>Require biometrics to open Liedger.</Text>
        </View>
        <Switch
          value={lockEnabled}
          onValueChange={onToggleLock}
          trackColor={{ true: colors.primary, false: colors.border }}
        />
      </Card>

      <Button label="Restore purchases" variant="ghost" onPress={restore} />
    </ScrollView>
  );
}

function Stat({ n, label }: { n: number; label: string }) {
  return (
    <View style={styles.statCell}>
      <Text style={styles.statN}>{n}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  content: { padding: spacing.lg, gap: spacing.md },
  shareCard: {
    backgroundColor: colors.primaryDim,
    borderRadius: radius.lg,
    padding: spacing.xl,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  shareTitle: { color: colors.white, fontSize: font.size.lg, fontWeight: font.weight.bold },
  grid: { flexDirection: 'row', flexWrap: 'wrap', marginTop: spacing.lg },
  statCell: { width: '50%', paddingVertical: spacing.sm },
  statN: { color: colors.white, fontSize: font.size.xxl, fontWeight: font.weight.bold },
  statLabel: { color: colors.text, fontSize: font.size.sm },
  shareTagline: { color: colors.text, fontSize: font.size.sm, marginTop: spacing.md, fontStyle: 'italic' },
  proCard: { gap: spacing.md, marginTop: spacing.sm },
  proTitle: { color: colors.primary, fontSize: font.size.lg, fontWeight: font.weight.bold },
  proBody: { color: colors.textMuted, fontSize: font.size.sm, lineHeight: 20 },
  proRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  proActive: { color: colors.text, fontSize: font.size.md, fontWeight: font.weight.semibold },
  settingRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  settingTitle: { color: colors.text, fontSize: font.size.md, fontWeight: font.weight.medium },
  settingSub: { color: colors.textMuted, fontSize: font.size.xs, marginTop: 2 },
});
