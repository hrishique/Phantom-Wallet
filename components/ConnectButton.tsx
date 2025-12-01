import React, { useState } from 'react';
import {
  View,
  TouchableOpacity,
  Text,
  ActivityIndicator,
  StyleSheet,
  Alert,
} from 'react-native';
import { useConnect, useAccounts } from '@phantom/react-native-sdk';
import { useRouter } from 'expo-router';
import { Ionicons, AntDesign } from '@expo/vector-icons';
import { colors } from '@/lib/theme';

// Available authentication providers for mobile
type AuthProvider = 'google' | 'apple';

/**
 * ConnectButton component handles Phantom wallet authentication
 * Uses Phantom Connect (OAuth) to create/connect an embedded user wallet
 * Supports Google and Apple authentication for mobile
 */
export function ConnectButton() {
  const { connect, isConnecting } = useConnect();
  const { isConnected } = useAccounts();
  const router = useRouter();
  const [activeProvider, setActiveProvider] = useState<AuthProvider | null>(null);
  // Only track errors from user-initiated connections, not auto-connect
  const [userError, setUserError] = useState<string | null>(null);

  /**
   * Initiates Phantom Connect flow with specific provider
   * On success, navigates to wallet screen
   */
  const handleConnect = async (provider: AuthProvider) => {
    setActiveProvider(provider);
    setUserError(null);
    try {
      await connect({ provider });
      router.push('/wallet');
    } catch (error: any) {
      console.error('Connection failed:', error);
      // Only show error if not user cancellation
      if (error?.message && !error.message.includes('cancelled')) {
        setUserError(error.message);
        Alert.alert('Connection Failed', error.message);
      }
    } finally {
      setActiveProvider(null);
    }
  };

  // Hide button if already connected
  if (isConnected) {
    return null;
  }

  return (
    <View style={styles.container}>
      {/* Google authentication */}
      <TouchableOpacity
        style={[styles.button, styles.googleButton]}
        onPress={() => handleConnect('google')}
        disabled={isConnecting}
      >
        {activeProvider === 'google' && isConnecting ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <View style={styles.buttonContent}>
            <AntDesign name="google" size={20} color="#fff" style={styles.icon} />
            <Text style={styles.buttonText}>Continue with Google</Text>
          </View>
        )}
      </TouchableOpacity>

      {/* Apple authentication */}
      <TouchableOpacity
        style={[styles.button, styles.appleButton]}
        onPress={() => handleConnect('apple')}
        disabled={isConnecting}
      >
        {activeProvider === 'apple' && isConnecting ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <View style={styles.buttonContent}>
            <Ionicons name="logo-apple" size={22} color="#fff" style={styles.icon} />
            <Text style={styles.buttonText}>Continue with Apple</Text>
          </View>
        )}
      </TouchableOpacity>

      {/* Error display - only show user-initiated errors */}
      {userError && (
        <Text style={styles.errorText}>
          Error: {userError}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    maxWidth: 300,
    gap: 8,
  },
  button: {
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    alignItems: 'center',
    width: '100%',
    borderWidth: 1,
    shadowColor: '#00000014',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 2,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    marginRight: 10,
  },
  googleButton: {
    backgroundColor: colors.brand,
    borderColor: colors.brand,
  },
  appleButton: {
    backgroundColor: colors.ink,
    borderColor: colors.ink,
  },
  buttonText: {
    color: colors.paper,
    fontSize: 16,
    fontWeight: '600',
  },
  errorText: {
    color: colors.coral,
    fontSize: 12,
    textAlign: 'center',
    marginTop: 8,
  },
});
