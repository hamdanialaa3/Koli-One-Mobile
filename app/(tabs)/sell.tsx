import React, { useState } from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import WizardOrchestrator from '@/components/sell/WizardOrchestrator';
import { SmartSellFlow } from '@/components/sell/SmartSellFlow';
import { theme } from '@/styles/theme';

/**
 * Sell Tab - Main Entry Point
 * Now delegated to the modular WizardOrchestrator for functional parity with Web.
 * 🚗 7-Step Premium Wizard Implementation
 * TASK-14: Smart Sell from Photo - AI-powered listing creation
 */
export default function SellScreen() {
  const [showSmartSell, setShowSmartSell] = useState(false);

  return (
    <View style={{ flex: 1 }}>
      {/* TASK-14: Smart Sell from Photo button */}
      <TouchableOpacity 
        style={styles.smartSellButton}
        onPress={() => setShowSmartSell(true)}
      >
        <Ionicons name="camera" size={24} color="#fff" />
        <Text style={styles.smartSellText}>Smart Sell from Photo</Text>
        <Ionicons name="sparkles" size={20} color="#FFD700" />
      </TouchableOpacity>

      <WizardOrchestrator />
      
      <SmartSellFlow 
        visible={showSmartSell} 
        onClose={() => setShowSmartSell(false)} 
      />
    </View>
  );
}

const styles = StyleSheet.create({
  smartSellButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.primary.main,
    padding: 16,
    margin: 16,
    borderRadius: 12,
    gap: 8,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  smartSellText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});
