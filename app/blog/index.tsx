/**
 * Koli One — Blog Screen (WebView)
 * Displays koli.one/blog in WebView with auth integration
 */
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { WebViewScreen } from '../../src/components/shared/WebViewScreen';

export default function BlogScreen() {
  return (
    <View style={styles.container}>
      <WebViewScreen 
        url="https://koli.one/blog" 
        title="Blog"
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
