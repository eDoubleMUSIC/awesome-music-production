import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/ui';
import {
  getLifetimePackage,
  purchaseLifetime,
  restorePurchases,
} from '@/lib/purchases';
import { useApp } from '@/state/app';
import { colors, font, radius, spacing } from '@/theme';

const BENEFITS = [
  { icon: 'infinite', text: 'Unlimited lies (free caps at 10)' },
  { icon: 'calendar', text: '“Before you meet” briefings' },
  { icon: 'git-network', text: 'Who-knows-what relationship graph' },
  { icon: 'sparkles', text: 'Contradiction detection (coming soon)' },
  { icon: 'lock-closed', text: 'Stays private & on-device, forever' },
];

export default function Paywall() {
  const router = useRouter();
  const { setProLocally, refreshPro } = useApp();
  const [price, setPrice] = useState<string>('$5.99');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    (async () => {
      const pkg = await getLifetimePackage();
      if (pkg?.product.priceString) setPrice(pkg.product.priceString);
    })();
  }, []);

  const buy = async () => {
    setBusy(true);
    const ok = await purchaseLifetime();
    setBusy(false);
    if (ok) {
      setProLocally(true);
      await refreshPro();
      router.back();
    }
  };

  const restore = async () => {
    setBusy(true);
    const ok = await restorePurchases();
    setBusy(false);
    await refreshPro();
    if (ok) {
      setProLocally(true);
      router.back();
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.emoji}>📒</Text>
      <Text style={styles.title}>Liedger Pro</Text>
      <Text style={styles.subtitle}>One payment. Yours for life. No subscription.</Text>

      <View style={styles.benefits}>
        {BENEFITS.map((b) => (
          <View key={b.text} style={styles.benefitRow}>
            <Ionicons name={b.icon as any} size={20} color={colors.primary} />
            <Text style={styles.benefitText}>{b.text}</Text>
          </View>
        ))}
      </View>

      <View style={styles.priceTag}>
        <Text style={styles.price}>{price}</Text>
        <Text style={styles.priceNote}>one time · forever</Text>
      </View>

      <Button label={`Unlock for life — ${price}`} onPress={buy} loading={busy} />
      <Button label="Restore purchase" variant="ghost" onPress={restore} />
      <Text style={styles.fine}>
        Everything stays encrypted on your device. We can't see your ledger — and
        neither can anyone else.
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  content: { padding: spacing.xl, gap: spacing.md, alignItems: 'stretch' },
  emoji: { fontSize: 48, textAlign: 'center' },
  title: { color: colors.text, fontSize: font.size.xxl, fontWeight: font.weight.bold, textAlign: 'center' },
  subtitle: { color: colors.textMuted, fontSize: font.size.md, textAlign: 'center', marginBottom: spacing.lg },
  benefits: { gap: spacing.md, marginBottom: spacing.lg },
  benefitRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  benefitText: { color: colors.text, fontSize: font.size.md, flex: 1 },
  priceTag: { alignItems: 'center', marginBottom: spacing.md },
  price: { color: colors.primary, fontSize: font.size.xxl, fontWeight: font.weight.bold },
  priceNote: { color: colors.textFaint, fontSize: font.size.sm },
  fine: { color: colors.textFaint, fontSize: font.size.xs, textAlign: 'center', marginTop: spacing.md, lineHeight: 18 },
});
