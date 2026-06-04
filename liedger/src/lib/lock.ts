import * as LocalAuthentication from 'expo-local-authentication';

/** Whether the device has biometric hardware that's enrolled. */
export async function isBiometricAvailable(): Promise<boolean> {
  const hasHardware = await LocalAuthentication.hasHardwareAsync();
  const enrolled = await LocalAuthentication.isEnrolledAsync();
  return hasHardware && enrolled;
}

/**
 * Prompt for Face ID / Touch ID / fingerprint.
 * In the shipping build this gates release of the SQLCipher key, not just the
 * UI — see secureKey.ts.
 */
export async function authenticate(
  reason = 'Unlock your ledger',
): Promise<boolean> {
  const result = await LocalAuthentication.authenticateAsync({
    promptMessage: reason,
    fallbackLabel: 'Use passcode',
    cancelLabel: 'Cancel',
  });
  return result.success;
}
