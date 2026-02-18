/**
 * Koli One — Marketplace (WebView)
 * Displays koli.one/marketplace in WebView with auth integration
 */
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { WebViewScreen } from '../../src/components/shared/WebViewScreen';

export default function MarketplaceScreen() {
  return (
    <View style={styles.container}>
      <WebViewScreen 
        url="https://koli.one/marketplace" 
        title="Marketplace"
        showHeader={true}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
  },
});
