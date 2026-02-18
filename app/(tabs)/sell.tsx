import React, { useState } from 'react';
import { View, TouchableOpacity, Text, StyleSheet, ActivityIndicator, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import WizardOrchestrator from '@/components/sell/WizardOrchestrator';
import { SmartSellFlow } from '@/components/sell/SmartSellFlow';
import { theme } from '@/styles/theme';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'expo-router';
import { WebViewScreen } from '@/components/shared/WebViewScreen';

/**
 * Sell Tab - Loads koli.one/sell/auto in WebView
 * Condition: User must be logged in
 */
export default function SellScreen() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [showSmartSell, setShowSmartSell] = useState(false);
  const [useWebView, setUseWebView] = useState(false);

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary.main} />
      </View>
    );
  }

  if (!user) {
    return (
      <View style={styles.centerContainer}>
        <Ionicons name="lock-closed" size={64} color={theme.colors.primary.main} style={{ marginBottom: 16 }} />
        <Text style={styles.title}>Login Required</Text>
        <Text style={styles.subtitle}>You must be logged in to sell your vehicle.</Text>
        <TouchableOpacity
          style={styles.loginButton}
          onPress={() => router.push('/(auth)/login' as any)}
        >
          <Text style={styles.loginButtonText}>Login / Sign Up</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Show web sell interface via WebView
  if (useWebView) {
    return (
      <View style={{ flex: 1 }}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => setUseWebView(false)}
        >
          <Ionicons name="arrow-back" size={24} color={theme.colors.primary.main} />
          <Text style={styles.backButtonText}>Back to Native Sell</Text>
        </TouchableOpacity>
        <WebViewScreen 
          url="https://koli.one/sell/auto" 
          title="Sell Your Car"
          showHeader={false}
        />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background.default }}>
      {/* Premium Web Redirect Call */}
      <TouchableOpacity
        style={styles.webLinkButton}
        onPress={() => setUseWebView(true)}
      >
        <Ionicons name="globe-outline" size={20} color={theme.colors.primary.main} />
        <Text style={styles.webLinkText}>Open Full Web Seller Suite (koli.one)</Text>
      </TouchableOpacity>

      {/* TASK-14: Smart Sell from Photo button */}
      <View style={styles.actionRow}>
        <TouchableOpacity
          style={[styles.smartSellButton, { flex: 1 }]}
          onPress={() => setShowSmartSell(true)}
        >
          <Ionicons name="camera" size={24} color="#fff" />
          <Text style={styles.smartSellText}>Smart Sell</Text>
          <Ionicons name="sparkles" size={20} color="#FFD700" />
        </TouchableOpacity>

        {/* Quick Capture — camera → draft */}
        <TouchableOpacity
          style={styles.quickCaptureButton}
          onPress={() => router.push('/quick-capture' as any)}
        >
          <Ionicons name="flash" size={22} color="#fff" />
          <Text style={styles.quickCaptureText}>Quick{'\n'}Capture</Text>
        </TouchableOpacity>
      </View>

      <WizardOrchestrator />

      <SmartSellFlow
        visible={showSmartSell}
        onClose={() => setShowSmartSell(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: theme.colors.background.default,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: theme.colors.text.primary,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: theme.colors.text.secondary,
    textAlign: 'center',
    marginBottom: 24,
  },
  loginButton: {
    backgroundColor: theme.colors.primary.main,
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 12,
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  smartSellButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.primary.main,
    padding: 16,
    borderRadius: 12,
    gap: 8,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 4 },
      android: { elevation: 4 },
      default: { boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.25)' },
    }),
  },
  smartSellText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  actionRow: {
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  quickCaptureButton: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FF6B00',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 4 },
      android: { elevation: 4 },
      default: { boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.25)' },
    }),
  },
  quickCaptureText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '700',
    textAlign: 'center',
    marginTop: 2,
  },
  webLinkButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    backgroundColor: theme.colors.background.paper,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border.muted,
    gap: 8,
  },
  webLinkText: {
    color: theme.colors.primary.main,
    fontSize: 13,
    fontWeight: '600',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: theme.colors.background.paper,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border.muted,
    gap: 8,
  },
  backButtonText: {
    color: theme.colors.primary.main,
    fontSize: 14,
    fontWeight: '600',
  }
});
