import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { EXAMPLE_LIES, seedExample } from '@/db/seed';
import { Button, Card } from '@/components/ui';
import { useApp } from '@/state/app';
import { colors, font, radius, spacing } from '@/theme';

export default function Onboarding() {
  const { completeOnboarding } = useApp();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [seeded, setSeeded] = useState<number[]>([]);

  const tapExample = (index: number) => {
    if (seeded.includes(index)) return;
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    seedExample(EXAMPLE_LIES[index]);
    setSeeded((s) => [...s, index]);
  };

  const finish = async () => {
    await completeOnboarding();
    router.replace('/(tabs)');
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top + spacing.xl }]}>
      <ScrollView contentContainerStyle={{ paddingBottom: spacing.xxl }} showsVerticalScrollIndicator={false}>
        <Text style={styles.logo}>Liedger</Text>
        <Text style={styles.tagline}>Keep your stories straight.</Text>

        <Text style={styles.body}>
          A private, encrypted ledger of the little white lies you tell — so you
          never get caught contradicting yourself. Everything stays on your
          phone. We literally can't read it.
        </Text>

        <Text style={styles.section}>Tap one to log your first lie 👇</Text>
        <View style={{ gap: spacing.sm }}>
          {EXAMPLE_LIES.map((ex, i) => {
            const done = seeded.includes(i);
            return (
              <Card
                key={i}
                onPress={() => tapExample(i)}
                style={[styles.example, done && styles.exampleDone]}
              >
                <Text style={styles.exampleText}>
                  {done ? '✓ ' : ''}
                  {ex.claim}
                </Text>
                <Text style={styles.examplePerson}>to {ex.person}</Text>
              </Card>
            );
          })}
        </View>
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + spacing.md }]}>
        <Button
          label={seeded.length > 0 ? `Continue with ${seeded.length} logged` : 'Skip — I lie spontaneously'}
          onPress={finish}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg, paddingHorizontal: spacing.xl },
  logo: { color: colors.primary, fontSize: font.size.xxl, fontWeight: font.weight.bold },
  tagline: { color: colors.text, fontSize: font.size.lg, fontWeight: font.weight.medium, marginTop: spacing.xs },
  body: { color: colors.textMuted, fontSize: font.size.md, lineHeight: 24, marginTop: spacing.lg },
  section: { color: colors.text, fontSize: font.size.md, fontWeight: font.weight.semibold, marginTop: spacing.xl, marginBottom: spacing.md },
  example: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderRadius: radius.md },
  exampleDone: { borderColor: colors.primary, backgroundColor: colors.primaryDim },
  exampleText: { color: colors.text, fontSize: font.size.md, flexShrink: 1, paddingRight: spacing.md },
  examplePerson: { color: colors.textFaint, fontSize: font.size.sm },
  footer: { paddingTop: spacing.md },
});
