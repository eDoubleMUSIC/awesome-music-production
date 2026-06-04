import { Redirect } from 'expo-router';

// The Gate in _layout handles onboarding/lock redirects; once past those,
// "/" lands on the main tabs.
export default function Index() {
  return <Redirect href="/(tabs)" />;
}
