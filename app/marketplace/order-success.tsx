/**
 * Koli One — Order Success
 */
import React, { useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Animated, { FadeInDown, FadeInUp, BounceIn } from 'react-native-reanimated';
import { CheckCircle, Package, Home, ArrowRight } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { colors } from '../../src/styles/theme';

export default function OrderSuccessScreen() {
  const router = useRouter();

  useEffect(() => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }, []);

  return (
    <LinearGradient colors={['#001a33', '#003366', '#004488']} style={styles.container}>
      <SafeAreaView style={styles.safe}>
        {/* Success Icon */}
        <Animated.View entering={BounceIn.delay(200)} style={styles.iconContainer}>
          <View style={styles.iconRing}>
            <CheckCircle size={64} color="#FFF" />
          </View>
        </Animated.View>

        {/* Title */}
        <Animated.View entering={FadeInDown.delay(400)} style={styles.center}>
          <Text style={styles.title}>Поръчката е приета!</Text>
          <Text style={styles.subtitle}>Благодарим ви за покупката</Text>
        </Animated.View>

        {/* Order Info */}
        <Animated.View entering={FadeInUp.delay(600)} style={styles.orderCard}>
          <View style={styles.orderRow}>
            <Text style={styles.orderLabel}>Номер на поръчка</Text>
            <Text style={styles.orderValue}>#KO-{Date.now().toString().slice(-6)}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.orderRow}>
            <Text style={styles.orderLabel}>Очаквана доставка</Text>
            <Text style={styles.orderValue}>3-5 работни дни</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.orderRow}>
            <Text style={styles.orderLabel}>Обща сума</Text>
            <Text style={styles.orderPrice}>€379</Text>
          </View>
        </Animated.View>

        {/* Tracking info */}
        <Animated.View entering={FadeInUp.delay(800)} style={styles.trackingCard}>
          <Package size={24} color={colors.brand.orange} />
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={styles.trackTitle}>Проследяване</Text>
            <Text style={styles.trackDesc}>Ще получите имейл с линк за проследяване на пратката</Text>
          </View>
        </Animated.View>

        <View style={{ flex: 1 }} />

        {/* Actions */}
        <Animated.View entering={FadeInUp.delay(1000)} style={styles.actions}>
          <TouchableOpacity
            style={styles.primaryBtn}
            onPress={() => router.replace('/(tabs)' as any)}
            activeOpacity={0.8}
          >
            <Home size={20} color="#FFF" />
            <Text style={styles.primaryBtnText}>Начало</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryBtn}
            onPress={() => router.replace('/marketplace' as any)}
          >
            <Text style={styles.secondaryText}>Продължи пазаруването</Text>
            <ArrowRight size={18} color={colors.brand.orange} />
          </TouchableOpacity>
        </Animated.View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safe: { flex: 1, padding: 24 },
  iconContainer: { alignItems: 'center', marginTop: 40 },
  iconRing: {
    width: 120, height: 120, borderRadius: 60, backgroundColor: 'rgba(34,197,94,0.25)',
    alignItems: 'center', justifyContent: 'center', borderWidth: 3, borderColor: 'rgba(34,197,94,0.5)',
  },
  center: { alignItems: 'center', marginTop: 24 },
  title: { fontSize: 28, fontWeight: '800', color: '#FFF' },
  subtitle: { fontSize: 16, color: 'rgba(255,255,255,0.7)', marginTop: 6 },
  orderCard: {
    marginTop: 32, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 16, padding: 20,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)',
  },
  orderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  orderLabel: { fontSize: 14, color: 'rgba(255,255,255,0.6)' },
  orderValue: { fontSize: 15, fontWeight: '600', color: '#FFF' },
  orderPrice: { fontSize: 20, fontWeight: '800', color: colors.brand.orange },
  divider: { height: 1, backgroundColor: 'rgba(255,255,255,0.1)', marginVertical: 12 },
  trackingCard: {
    marginTop: 16, flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 14, padding: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)',
  },
  trackTitle: { fontSize: 15, fontWeight: '600', color: '#FFF' },
  trackDesc: { fontSize: 13, color: 'rgba(255,255,255,0.6)', marginTop: 2 },
  actions: { gap: 12, marginBottom: Platform.OS === 'ios' ? 12 : 0 },
  primaryBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    backgroundColor: colors.brand.orange, height: 54, borderRadius: 14,
  },
  primaryBtnText: { color: '#FFF', fontSize: 17, fontWeight: '700' },
  secondaryBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, height: 48,
  },
  secondaryText: { fontSize: 15, color: colors.brand.orange, fontWeight: '600' },
});
