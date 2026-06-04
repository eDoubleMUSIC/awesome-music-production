import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Button, Card, Pill, RiskDot } from '@/components/ui';
import { deleteLie, getLieCard, setLieStatus, type LieCard } from '@/db/repo';
import { channelLabel, relativeTime } from '@/lib/format';
import { colors, font, spacing } from '@/theme';

export default function LieDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [lie, setLie] = useState<LieCard | null>(null);

  useFocusEffect(
    useCallback(() => {
      if (id) setLie(getLieCard(id));
    }, [id]),
  );

  if (!lie) {
    return (
      <View style={styles.container}>
        <Text style={styles.muted}>This lie has vanished. Convenient.</Text>
      </View>
    );
  }

  const mark = (status: LieCard['status']) => {
    setLieStatus(lie.id, status);
    setLie(getLieCard(lie.id));
  };

  const confirmDelete = () => {
    Alert.alert('Delete this lie?', 'It will be gone forever. No paper trail.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          deleteLie(lie.id);
          router.back();
        },
      },
    ]);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.headerRow}>
        <RiskDot risk={lie.risk} />
        <Text style={styles.risk}>{lie.risk.toUpperCase()} RISK</Text>
        {lie.status !== 'active' && <Pill text={lie.status} />}
      </View>

      <Text style={styles.claim}>{lie.claim}</Text>
      <Text style={styles.meta}>
        {channelLabel(lie.channel)} · told {relativeTime(lie.occurredAt)}
      </Text>

      {lie.storyTitle && (
        <Card style={styles.block}>
          <Text style={styles.blockLabel}>Story</Text>
          <Text style={styles.blockValue}>{lie.storyTitle}</Text>
        </Card>
      )}

      <Card style={styles.block}>
        <Text style={styles.blockLabel}>Who's been told</Text>
        {lie.peopleNames.length > 0 ? (
          <View style={styles.pills}>
            {lie.peopleNames.map((n) => (
              <Pill key={n} text={n} />
            ))}
          </View>
        ) : (
          <Text style={styles.muted}>No one tagged yet.</Text>
        )}
      </Card>

      {lie.notes ? (
        <Card style={styles.block}>
          <Text style={styles.blockLabel}>Notes</Text>
          <Text style={styles.blockValue}>{lie.notes}</Text>
        </Card>
      ) : null}

      <View style={styles.actions}>
        {lie.status !== 'exposed' && (
          <Button label="Mark as caught 😬" variant="secondary" onPress={() => mark('exposed')} />
        )}
        {lie.status !== 'retired' && (
          <Button label="Retire this lie" variant="secondary" onPress={() => mark('retired')} />
        )}
        {lie.status !== 'active' && (
          <Button label="Reactivate" variant="ghost" onPress={() => mark('active')} />
        )}
        <Button label="Delete" variant="ghost" onPress={confirmDelete} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  content: { padding: spacing.lg, gap: spacing.md },
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  risk: { color: colors.textMuted, fontSize: font.size.xs, fontWeight: font.weight.bold, letterSpacing: 1 },
  claim: { color: colors.text, fontSize: font.size.xl, fontWeight: font.weight.bold, lineHeight: 34 },
  meta: { color: colors.textFaint, fontSize: font.size.sm },
  block: { gap: spacing.sm },
  blockLabel: { color: colors.textMuted, fontSize: font.size.xs, fontWeight: font.weight.semibold, textTransform: 'uppercase', letterSpacing: 0.5 },
  blockValue: { color: colors.text, fontSize: font.size.md },
  pills: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  muted: { color: colors.textFaint, fontSize: font.size.sm },
  actions: { gap: spacing.sm, marginTop: spacing.md },
});
