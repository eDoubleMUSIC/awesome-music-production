import { useFocusEffect } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { Alert, FlatList, StyleSheet, Text, View } from 'react-native';

import { Avatar, Card, EmptyState } from '@/components/ui';
import { listPeopleCards, type PersonCard } from '@/db/repo';
import { buildBriefingText, getPersonBeliefs } from '@/lib/briefings';
import { colors, font, spacing } from '@/theme';

export default function People() {
  const [people, setPeople] = useState<PersonCard[]>([]);

  useFocusEffect(
    useCallback(() => {
      setPeople(listPeopleCards());
    }, []),
  );

  const showBriefing = (p: PersonCard) => {
    const beliefs = getPersonBeliefs(p.id);
    Alert.alert(`Before you see ${p.name}`, buildBriefingText(p.name, beliefs), [
      { text: 'Got it' },
    ]);
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={people}
        keyExtractor={(item) => item.id}
        contentContainerStyle={people.length === 0 ? styles.emptyWrap : styles.list}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          people.length > 0 ? (
            <Text style={styles.hint}>Tap anyone for a “before you meet” briefing.</Text>
          ) : null
        }
        ListEmptyComponent={
          <EmptyState
            emoji="🕵️"
            title="No one in the web yet"
            subtitle="People you've told lies to show up here. Tap one before you see them to remember exactly what they believe."
          />
        }
        renderItem={({ item }) => (
          <Card onPress={() => showBriefing(item)} style={styles.row}>
            <Avatar name={item.name} seed={item.avatarSeed} />
            <View style={{ flex: 1 }}>
              <Text style={styles.name}>{item.name}</Text>
              {item.role ? <Text style={styles.role}>{item.role}</Text> : null}
            </View>
            <Text style={styles.count}>
              {item.lieCount} {item.lieCount === 1 ? 'lie' : 'lies'}
            </Text>
          </Card>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  list: { padding: spacing.lg, gap: spacing.md },
  emptyWrap: { flexGrow: 1, justifyContent: 'center' },
  hint: { color: colors.textFaint, fontSize: font.size.sm, marginBottom: spacing.md },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  name: { color: colors.text, fontSize: font.size.md, fontWeight: font.weight.semibold },
  role: { color: colors.textMuted, fontSize: font.size.sm },
  count: { color: colors.primary, fontSize: font.size.sm, fontWeight: font.weight.semibold },
});
