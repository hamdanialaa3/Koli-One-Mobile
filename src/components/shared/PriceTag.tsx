/**
 * Koli One — PriceTag — Formatted price display with optional discount
 */
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { TrendingDown } from 'lucide-react-native';

interface Props {
  price: number;
  originalPrice?: number;
  currency?: string;
  size?: 'sm' | 'md' | 'lg';
  color?: string;
}

const SIZES = {
  sm: { price: 14, original: 11, badge: 10 },
  md: { price: 18, original: 13, badge: 11 },
  lg: { price: 24, original: 15, badge: 12 },
};

export default function PriceTag({ price, originalPrice, currency = '€', size = 'md', color = '#003366' }: Props) {
  const s = SIZES[size];
  const discount = originalPrice ? Math.round(((originalPrice - price) / originalPrice) * 100) : 0;

  return (
    <View style={styles.container}>
      <Text style={[styles.price, { fontSize: s.price, color }]}>
        {currency}{price.toLocaleString()}
      </Text>
      {originalPrice && originalPrice > price && (
        <View style={styles.discountRow}>
          <Text style={[styles.originalPrice, { fontSize: s.original }]}>
            {currency}{originalPrice.toLocaleString()}
          </Text>
          <View style={styles.discountBadge}>
            <TrendingDown size={s.badge} color="#FFF" />
            <Text style={[styles.discountText, { fontSize: s.badge }]}>-{discount}%</Text>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {},
  price: { fontWeight: '800' },
  discountRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 2 },
  originalPrice: { color: '#94A3B8', textDecorationLine: 'line-through' },
  discountBadge: { flexDirection: 'row', alignItems: 'center', gap: 2, backgroundColor: '#22C55E', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },
  discountText: { fontWeight: '700', color: '#FFF' },
});
