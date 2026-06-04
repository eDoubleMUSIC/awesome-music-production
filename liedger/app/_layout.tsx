import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { Button } from '@/components/ui';
import { AppProvider, useApp } from '@/state/app';
import { colors, font, spacing } from '@/theme';

function LockScreen() {
  const { unlock } = useApp();
  useEffect(() => {
    // Auto-prompt once when the lock screen appears.
    void unlock();
  }, [unlock]);
  return (
    <View style={styles.center}>
      <Text style={styles.lockEmoji}>🔒</Text>
      <Text style={styles.lockTitle}>Liedger is locked</Text>
      <Text style={styles.lockSub}>Your stories stay between you and your face.</Text>
      <Button label="Unlock" onPress={() => void unlock()} style={{ marginTop: spacing.xl, minWidth: 200 }} />
    </View>
  );
}

function Gate() {
  const { ready, onboarded, lockEnabled, locked } = useApp();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (!ready) return;
    const inOnboarding = segments[0] === 'onboarding';
    if (!onboarded && !inOnboarding) {
      router.replace('/onboarding');
    } else if (onboarded && inOnboarding) {
      router.replace('/(tabs)');
    }
  }, [ready, onboarded, segments, router]);

  if (!ready) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  if (lockEnabled && locked) return <LockScreen />;

  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: colors.bg },
        headerTintColor: colors.text,
        headerTitleStyle: { fontWeight: font.weight.semibold },
        contentStyle: { backgroundColor: colors.bg },
      }}
    >
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="onboarding" options={{ headerShown: false }} />
      <Stack.Screen
        name="add"
        options={{ presentation: 'modal', title: 'Log a lie' }}
      />
      <Stack.Screen name="lie/[id]" options={{ title: 'Lie' }} />
      <Stack.Screen
        name="paywall"
        options={{ presentation: 'modal', title: 'Liedger Pro' }}
      />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <AppProvider>
          <StatusBar style="light" />
          <Gate />
        </AppProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.bg,
    padding: spacing.xl,
  },
  lockEmoji: { fontSize: 56, marginBottom: spacing.lg },
  lockTitle: { color: colors.text, fontSize: font.size.xl, fontWeight: font.weight.bold },
  lockSub: {
    color: colors.textMuted,
    fontSize: font.size.sm,
    marginTop: spacing.sm,
    textAlign: 'center',
  },
});
