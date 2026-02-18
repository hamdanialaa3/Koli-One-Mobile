/**
 * Koli One — RatingStars — Reusable star rating component
 */
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Star } from 'lucide-react-native';

interface Props {
  rating: number;
  maxStars?: number;
  size?: number;
  color?: string;
  showValue?: boolean;
  interactive?: boolean;
  onChange?: (rating: number) => void;
}

export default function RatingStars({
  rating,
  maxStars = 5,
  size = 16,
  color = '#F59E0B',
  showValue = false,
  interactive = false,
  onChange,
}: Props) {
  const stars = Array.from({ length: maxStars }, (_, i) => i + 1);

  return (
    <View style={styles.container}>
      {stars.map((star) => {
        const filled = star <= Math.floor(rating);
        const half = !filled && star <= rating + 0.5;
        const StarWrapper = interactive ? TouchableOpacity : View;

        return (
          <StarWrapper
            key={star}
            onPress={interactive ? () => onChange?.(star) : undefined}
            style={styles.star}
          >
            <Star
              size={size}
              color={color}
              fill={filled ? color : half ? color : 'transparent'}
              strokeWidth={filled || half ? 0 : 1.5}
            />
          </StarWrapper>
        );
      })}
      {showValue && (
        <Text style={[styles.value, { fontSize: size * 0.85 }]}>{rating.toFixed(1)}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  star: {},
  value: { marginLeft: 4, fontWeight: '700', color: '#1E293B' },
});
