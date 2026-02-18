/**
 * Koli One — Checkout
 */
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Platform, TextInput, Alert, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { ArrowLeft, MapPin, CreditCard, Truck, ChevronRight, Lock, Phone, Mail, MessageCircle } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { colors } from '../../src/styles/theme';

export default function CheckoutScreen() {
  const router = useRouter();
  const [deliveryMethod, setDeliveryMethod] = useState<'address' | 'office'>('address');
  const params = useLocalSearchParams<{ sellerPhone?: string; sellerEmail?: string; carTitle?: string }>();

  const handleContactSeller = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    const title = params.carTitle || 'Автомобил';
    Alert.alert(
      `Свържете се с продавача`,
      `За ${title}`,
      [
        params.sellerPhone ? {
          text: `Обадете се: ${params.sellerPhone}`,
          onPress: () => Linking.openURL(`tel:${params.sellerPhone}`),
        } : null,
        params.sellerEmail ? {
          text: `Имейл: ${params.sellerEmail}`,
          onPress: () => Linking.openURL(`mailto:${params.sellerEmail}?subject=Запитване за ${title}`),
        } : null,
        {
          text: 'Изпрати съобщение',
          onPress: () => router.push('/chat' as any),
        },
        { text: 'Затвори', style: 'cancel' },
      ].filter(Boolean) as any
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.iconBtn}><ArrowLeft size={24} color={colors.text.primary} /></TouchableOpacity>
        <Text style={styles.headerTitle}>Плащане</Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Step 1: Delivery Address */}
        <Animated.View entering={FadeInUp.delay(100)}>
          <Text style={styles.sectionTitle}>1. Доставка</Text>
          <View style={styles.deliveryOptions}>
            <TouchableOpacity
              style={[styles.deliveryChoice, deliveryMethod === 'address' && styles.deliveryActive]}
              onPress={() => setDeliveryMethod('address')}
            >
              <MapPin size={20} color={deliveryMethod === 'address' ? colors.brand.orange : colors.text.secondary} />
              <Text style={[styles.deliveryLabel, deliveryMethod === 'address' && styles.deliveryLabelActive]}>До адрес</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.deliveryChoice, deliveryMethod === 'office' && styles.deliveryActive]}
              onPress={() => setDeliveryMethod('office')}
            >
              <Truck size={20} color={deliveryMethod === 'office' ? colors.brand.orange : colors.text.secondary} />
              <Text style={[styles.deliveryLabel, deliveryMethod === 'office' && styles.deliveryLabelActive]}>До офис</Text>
            </TouchableOpacity>
          </View>

          {/* Address Fields */}
          <View style={styles.fieldGroup}>
            <TextInput style={styles.input} placeholder="Име и фамилия" placeholderTextColor={colors.text.tertiary} />
            <TextInput style={styles.input} placeholder="Телефон" placeholderTextColor={colors.text.tertiary} keyboardType="phone-pad" />
            <TextInput style={styles.input} placeholder={deliveryMethod === 'address' ? 'Адрес за доставка' : 'Офис на куриер'} placeholderTextColor={colors.text.tertiary} />
            <View style={styles.row}>
              <TextInput style={[styles.input, { flex: 1 }]} placeholder="Град" placeholderTextColor={colors.text.tertiary} />
              <TextInput style={[styles.input, { width: 100 }]} placeholder="Пощ. код" placeholderTextColor={colors.text.tertiary} keyboardType="numeric" />
            </View>
          </View>
        </Animated.View>

        {/* Step 2: Payment */}
        <Animated.View entering={FadeInUp.delay(200)}>
          <Text style={styles.sectionTitle}>2. Плащане</Text>
          {[
            { label: 'Google Pay', sublabel: 'Бързо и сигурно', selected: true },
            { label: 'Наложен платеж', sublabel: '+2 лв. при получаване', selected: false },
            { label: 'Карта', sublabel: 'Visa / Mastercard', selected: false },
          ].map((method, i) => (
            <TouchableOpacity key={i} style={[styles.paymentOption, method.selected && styles.paymentActive]}>
              <CreditCard size={20} color={method.selected ? colors.brand.orange : colors.text.secondary} />
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={[styles.payLabel, method.selected && styles.payLabelActive]}>{method.label}</Text>
                <Text style={styles.paySub}>{method.sublabel}</Text>
              </View>
              <ChevronRight size={18} color={colors.text.disabled} />
            </TouchableOpacity>
          ))}
        </Animated.View>

        {/* Order Summary */}
        <Animated.View entering={FadeInUp.delay(300)}>
          <Text style={styles.sectionTitle}>3. Обобщение</Text>
          <View style={styles.summaryCard}>
            <View style={styles.sumRow}><Text style={styles.sumLabel}>2 продукта</Text><Text style={styles.sumVal}>€379</Text></View>
            <View style={styles.sumRow}><Text style={styles.sumLabel}>Доставка</Text><Text style={[styles.sumVal, { color: colors.status.success }]}>Безплатна</Text></View>
            <View style={styles.sumDivider} />
            <View style={styles.sumRow}><Text style={styles.sumTotalLabel}>Общо</Text><Text style={styles.sumTotalVal}>€379</Text></View>
          </View>
        </Animated.View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* CTA */}
      <View style={styles.bottomBar}>
        <View style={styles.secureBadge}><Lock size={14} color={colors.status.success} /><Text style={styles.secureText}>Сигурно плащане</Text></View>
        <TouchableOpacity style={styles.orderBtn} onPress={handleContactSeller} activeOpacity={0.8}>
          <Text style={styles.orderBtnText}>Свържете се с продавача</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background.default },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 12, paddingVertical: 10, backgroundColor: colors.background.paper,
    borderBottomWidth: 1, borderBottomColor: colors.border.light,
  },
  iconBtn: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 20, fontWeight: '700', color: colors.text.primary },
  content: { padding: 16 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: colors.text.primary, marginTop: 24, marginBottom: 12 },
  deliveryOptions: { flexDirection: 'row', gap: 12 },
  deliveryChoice: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    paddingVertical: 14, borderRadius: 12, borderWidth: 1.5, borderColor: colors.border.default, backgroundColor: colors.background.paper,
  },
  deliveryActive: { borderColor: colors.brand.orange, backgroundColor: '#F3E8FF' },
  deliveryLabel: { fontSize: 15, fontWeight: '600', color: colors.text.secondary },
  deliveryLabelActive: { color: colors.brand.orange },
  fieldGroup: { gap: 10, marginTop: 14 },
  input: {
    height: 50, borderRadius: 12, borderWidth: 1, borderColor: colors.border.default,
    paddingHorizontal: 14, fontSize: 15, color: colors.text.primary, backgroundColor: colors.background.paper,
  },
  row: { flexDirection: 'row', gap: 10 },
  paymentOption: {
    flexDirection: 'row', alignItems: 'center', padding: 14, borderRadius: 12,
    borderWidth: 1.5, borderColor: colors.border.default, backgroundColor: colors.background.paper, marginBottom: 8,
  },
  paymentActive: { borderColor: colors.brand.orange, backgroundColor: '#F3E8FF' },
  payLabel: { fontSize: 15, fontWeight: '600', color: colors.text.primary },
  payLabelActive: { color: colors.brand.orange },
  paySub: { fontSize: 12, color: colors.text.secondary, marginTop: 2 },
  summaryCard: { backgroundColor: colors.background.paper, borderRadius: 14, padding: 16 },
  sumRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  sumLabel: { fontSize: 15, color: colors.text.secondary },
  sumVal: { fontSize: 15, fontWeight: '600', color: colors.text.primary },
  sumDivider: { height: 1, backgroundColor: colors.border.light, marginVertical: 8 },
  sumTotalLabel: { fontSize: 18, fontWeight: '700', color: colors.text.primary },
  sumTotalVal: { fontSize: 22, fontWeight: '800', color: colors.brand.orange },
  bottomBar: {
    paddingHorizontal: 16, paddingVertical: 12, paddingBottom: Platform.OS === 'ios' ? 28 : 12,
    backgroundColor: colors.background.paper, borderTopWidth: 1, borderTopColor: colors.border.light,
  },
  secureBadge: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, marginBottom: 10 },
  secureText: { fontSize: 12, color: colors.status.success, fontWeight: '500' },
  orderBtn: { backgroundColor: colors.brand.orange, height: 54, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  orderBtnText: { color: '#FFF', fontSize: 18, fontWeight: '700' },
});
