/**
 * modal.tsx - Quick Actions Modal
 * Shows available quick actions like Sell, Search, AI Valuation
 */

import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { Platform, StyleSheet, TouchableOpacity, View, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

const ACTIONS = [
  { icon: 'add-circle', label: 'Sell a Car', route: '/(tabs)/sell', color: '#7B2FBE' },
  { icon: 'search', label: 'Search Cars', route: '/(tabs)/search', color: '#3b82f6' },
  { icon: 'calculator', label: 'AI Valuation', route: '/ai/valuation', color: '#22c55e' },
  { icon: 'car-sport', label: 'My Garage', route: '/garage', color: '#f59e0b' },
  { icon: 'map', label: 'Cars Near Me', route: '/map-search', color: '#ef4444' },
  { icon: 'hammer', label: 'Auctions', route: '/auctions', color: '#8b5cf6' },
];

export default function ModalScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <View style={styles.handle} />
      <Text style={styles.title}>Quick Actions</Text>

      <View style={styles.grid}>
        {ACTIONS.map(action => (
          <TouchableOpacity
            key={action.route}
            style={styles.card}
            onPress={() => {
              router.back();
              setTimeout(() => router.push(action.route as any), 100);
            }}
          >
            <View style={[styles.iconCircle, { backgroundColor: action.color + '20' }]}>
              <Ionicons name={action.icon as any} size={28} color={action.color} />
            </View>
            <Text style={styles.label}>{action.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <StatusBar style={Platform.OS === 'ios' ? 'light' : 'auto'} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1E1E1E',
    paddingHorizontal: 24,
    paddingTop: 16,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#444',
    alignSelf: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: '#fff',
    marginBottom: 24,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  card: {
    width: '45%',
    backgroundColor: '#242424',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#333',
  },
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#fff',
    textAlign: 'center',
  },
});
