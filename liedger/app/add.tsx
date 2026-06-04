import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { Button } from '@/components/ui';
import { countLies, createLie, type Channel, type RiskLevel } from '@/db/repo';
import { FREE_LIE_LIMIT } from '@/lib/purchases';
import { useApp } from '@/state/app';
import { colors, font, radius, spacing } from '@/theme';

const CHANNELS: { value: Channel; label: string }[] = [
  { value: 'in_person', label: 'In person' },
  { value: 'text', label: 'Text' },
  { value: 'call', label: 'Call' },
  { value: 'social', label: 'Social' },
];

const RISKS: { value: RiskLevel; label: string; color: string }[] = [
  { value: 'low', label: 'Low', color: colors.riskLow },
  { value: 'med', label: 'Medium', color: colors.riskMed },
  { value: 'high', label: 'High', color: colors.riskHigh },
];

export default function AddLie() {
  const router = useRouter();
  const { pro } = useApp();
  const [claim, setClaim] = useState('');
  const [people, setPeople] = useState('');
  const [story, setStory] = useState('');
  const [channel, setChannel] = useState<Channel>('in_person');
  const [risk, setRisk] = useState<RiskLevel>('low');

  const save = () => {
    if (!claim.trim()) return;

    if (!pro && countLies() >= FREE_LIE_LIMIT) {
      router.replace('/paywall');
      return;
    }

    createLie({
      claim,
      channel,
      risk,
      storyTitle: story,
      peopleNames: people
        .split(',')
        .map((p) => p.trim())
        .filter(Boolean),
    });
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    router.back();
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={styles.label}>What did you say?</Text>
        <TextInput
          style={styles.claimInput}
          placeholder="e.g. Told my boss the train was delayed"
          placeholderTextColor={colors.textFaint}
          value={claim}
          onChangeText={setClaim}
          autoFocus
          multiline
        />

        <Text style={styles.label}>Who did you tell?</Text>
        <TextInput
          style={styles.input}
          placeholder="Boss, Mom (comma separated)"
          placeholderTextColor={colors.textFaint}
          value={people}
          onChangeText={setPeople}
        />

        <Text style={styles.label}>Part of a story? (optional)</Text>
        <TextInput
          style={styles.input}
          placeholder='e.g. "The new job"'
          placeholderTextColor={colors.textFaint}
          value={story}
          onChangeText={setStory}
        />

        <Text style={styles.label}>How?</Text>
        <View style={styles.chips}>
          {CHANNELS.map((c) => (
            <Chip key={c.value} label={c.label} active={channel === c.value} onPress={() => setChannel(c.value)} />
          ))}
        </View>

        <Text style={styles.label}>Risk of getting caught</Text>
        <View style={styles.chips}>
          {RISKS.map((r) => (
            <Chip
              key={r.value}
              label={r.label}
              active={risk === r.value}
              color={r.color}
              onPress={() => setRisk(r.value)}
            />
          ))}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Button label="Log it" onPress={save} disabled={!claim.trim()} />
      </View>
    </KeyboardAvoidingView>
  );
}

function Chip({
  label,
  active,
  color,
  onPress,
}: {
  label: string;
  active: boolean;
  color?: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.chip,
        active && { backgroundColor: color ?? colors.primary, borderColor: color ?? colors.primary },
      ]}
    >
      <Text style={[styles.chipText, active && { color: colors.white }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  content: { padding: spacing.lg, gap: spacing.sm },
  label: { color: colors.textMuted, fontSize: font.size.sm, fontWeight: font.weight.medium, marginTop: spacing.md },
  claimInput: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    color: colors.text,
    fontSize: font.size.lg,
    padding: spacing.lg,
    minHeight: 90,
    textAlignVertical: 'top',
  },
  input: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    color: colors.text,
    fontSize: font.size.md,
    padding: spacing.md,
  },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  chip: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  chipText: { color: colors.text, fontSize: font.size.sm, fontWeight: font.weight.medium },
  footer: { padding: spacing.lg, borderTopWidth: 1, borderTopColor: colors.border },
});
