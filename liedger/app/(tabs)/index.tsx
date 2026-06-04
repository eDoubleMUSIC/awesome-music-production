import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';

import { Card, EmptyState, Pill, RiskDot } from '@/components/ui';
import { listLieCards, type LieCard } from '@/db/repo';
import { channelLabel, relativeTime } from '@/lib/format';
import { colors, font, radius, spacing } from '@/theme';

export default function Ledger() {
  const router = useRouter();
  const [cards, setCards] = useState<LieCard[]>([]);

  useFocusEffect(
    useCallback(() => {
      setCards(listLieCards());
    }, []),
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={cards}
        keyExtractor={(item) => item.id}
        contentContainerStyle={cards.length === 0 ? styles.emptyWrap : styles.list}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <EmptyState
            emoji="🗒️"
            title="Your ledger is clean"
            subtitle="Suspiciously clean. Tap + to log your first white lie and start keeping your stories straight."
          />
        }
        renderItem={({ item }) => (
          <Card onPress={() => router.push(`/lie/${item.id}`)} style={styles.cardSpacing}>
            <View style={styles.row}>
              <RiskDot risk={item.risk} />
              <Text style={styles.claim} numberOfLines={2}>
                {item.claim}
              </Text>
            </View>
            <View style={styles.metaRow}>
              {item.peopleNames.length > 0 && (
                <Pill text={`to ${item.peopleNames.join(', ')}`} muted />
              )}
              {item.storyTitle && <Pill text={item.storyTitle} />}
            </View>
            <Text style={styles.sub}>
              {channelLabel(item.channel)} · {relativeTime(item.occurredAt)}
              {item.status !== 'active' ? ` · ${item.status}` : ''}
            </Text>
          </Card>
        )}
      />

      <Pressable style={styles.fab} onPress={() => router.push('/add')}>
        <Ionicons name="add" size={32} color={colors.white} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  list: { padding: spacing.lg },
  emptyWrap: { flexGrow: 1, justifyContent: 'center' },
  cardSpacing: { marginBottom: spacing.md, gap: spacing.sm },
  row: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.md },
  claim: { color: colors.text, fontSize: font.size.md, fontWeight: font.weight.medium, flex: 1, lineHeight: 22 },
  metaRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  sub: { color: colors.textFaint, fontSize: font.size.xs },
  fab: {
    position: 'absolute',
    right: spacing.xl,
    bottom: spacing.xl,
    width: 60,
    height: 60,
    borderRadius: radius.pill,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.black,
    shadowOpacity: 0.35,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
});
