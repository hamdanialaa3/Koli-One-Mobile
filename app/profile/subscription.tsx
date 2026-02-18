/**
 * Koli One — Subscription Management
 */
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Platform, Alert, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Animated, { FadeInUp, FadeInDown } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowLeft, Check, Crown, Zap, Star, Shield, Eye, TrendingUp, Sparkles } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { colors } from '../../src/styles/theme';

const PLANS = [
  {
    id: 'free', name: 'Безплатен', price: 0, period: '',
    features: ['3 обяви', 'Основно търсене', 'Съобщения'],
    color: colors.text.secondary,
  },
  {
    id: 'premium', name: 'Premium', price: 19.99, period: '/месец',
    features: ['Неограничени обяви', 'AI оценка на автомобили', 'Приоритетно показване', 'Без реклами', 'VIN проверка', 'Статистики на обяви'],
    color: colors.brand.orange, popular: true,
  },
  {
    id: 'dealer', name: 'Дилър Pro', price: 49.99, period: '/месец',
    features: ['Всичко от Premium', 'Верифициран бадж', 'Детайлна аналитика', 'API достъп', 'Импорт на обяви', 'Приоритетна поддръжка', 'Шаблони за обяви'],
    color: colors.primary.main,
  },
];

export default function SubscriptionScreen() {
  const router = useRouter();
  const [selected, setSelected] = useState('premium');
  const [billing, setBilling] = useState<'monthly' | 'yearly'>('monthly');

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.iconBtn}><ArrowLeft size={24} color={colors.text.primary} /></TouchableOpacity>
        <Text style={styles.headerTitle}>Абонамент</Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Hero */}
        <Animated.View entering={FadeInUp} style={styles.hero}>
          <Crown size={32} color={colors.accent.gold} />
          <Text style={styles.heroTitle}>Отключете пълния потенциал</Text>
          <Text style={styles.heroDesc}>Изберете план, който отговаря на вашите нужди</Text>
        </Animated.View>

        {/* Billing Toggle */}
        <Animated.View entering={FadeInUp.delay(100)} style={styles.billingToggle}>
          <TouchableOpacity
            style={[styles.billingOption, billing === 'monthly' && styles.billingActive]}
            onPress={() => setBilling('monthly')}
          >
            <Text style={[styles.billingText, billing === 'monthly' && styles.billingTextActive]}>Месечен</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.billingOption, billing === 'yearly' && styles.billingActive]}
            onPress={() => setBilling('yearly')}
          >
            <Text style={[styles.billingText, billing === 'yearly' && styles.billingTextActive]}>Годишен</Text>
            <View style={styles.saveBadge}><Text style={styles.saveText}>-20%</Text></View>
          </TouchableOpacity>
        </Animated.View>

        {/* Plans */}
        {PLANS.map((plan, i) => (
          <Animated.View key={plan.id} entering={FadeInDown.delay(200 + i * 100)}>
            <TouchableOpacity
              style={[styles.planCard, selected === plan.id && styles.planCardSelected, selected === plan.id && { borderColor: plan.color }]}
              onPress={() => { setSelected(plan.id); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); }}
              activeOpacity={0.7}
            >
              {plan.popular && (
                <View style={styles.popularBadge}>
                  <Sparkles size={12} color="#FFF" />
                  <Text style={styles.popularText}>Най-популярен</Text>
                </View>
              )}
              <View style={styles.planHeader}>
                <View>
                  <Text style={[styles.planName, { color: plan.color }]}>{plan.name}</Text>
                  <View style={styles.planPriceRow}>
                    <Text style={styles.planPrice}>
                      €{billing === 'yearly' ? (plan.price * 0.8).toFixed(2) : plan.price.toFixed(2)}
                    </Text>
                    {plan.period && <Text style={styles.planPeriod}>{plan.period}</Text>}
                  </View>
                </View>
                <View style={[styles.radio, selected === plan.id && styles.radioActive, selected === plan.id && { borderColor: plan.color }]}>
                  {selected === plan.id && <View style={[styles.radioDot, { backgroundColor: plan.color }]} />}
                </View>
              </View>

              <View style={styles.featuresList}>
                {plan.features.map((f, fi) => (
                  <View key={fi} style={styles.featureRow}>
                    <Check size={16} color={plan.color} />
                    <Text style={styles.featureText}>{f}</Text>
                  </View>
                ))}
              </View>
            </TouchableOpacity>
          </Animated.View>
        ))}

        {/* Trust Badges */}
        <Animated.View entering={FadeInUp.delay(600)} style={styles.trustRow}>
          {[
            { icon: Shield, label: 'Сигурно плащане' },
            { icon: Zap, label: 'Анулирай по всяко време' },
            { icon: Star, label: '7-дневен пробен период' },
          ].map(({ icon: Icon, label }, i) => (
            <View key={i} style={styles.trustItem}>
              <Icon size={16} color={colors.status.success} />
              <Text style={styles.trustText}>{label}</Text>
            </View>
          ))}
        </Animated.View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* CTA */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={styles.subscribeBtn}
          onPress={() => {
            if (selected === 'free') return;
            const plan = PLANS.find(p => p.id === selected);
            const price = billing === 'yearly' ? (plan!.price * 0.8 * 12).toFixed(2) : plan!.price.toFixed(2);
            const period = billing === 'yearly' ? 'годишен' : 'месечен';
            Alert.alert(
              `${plan!.name} — €${price} (${period})`,
              'За активиране на платен план, моля свържете се с нас:',
              [
                {
                  text: 'Имейл: info@kolione.com',
                  onPress: () => Linking.openURL('mailto:info@kolione.com?subject=Абонамент ' + plan!.name),
                },
                {
                  text: 'Телефон: +359 88 123 4567',
                  onPress: () => Linking.openURL('tel:+359881234567'),
                },
                { text: 'Затвори', style: 'cancel' },
              ]
            );
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          }}
          activeOpacity={0.8}
        >
          <LinearGradient colors={[colors.brand.orange, '#6A1B9A']} style={styles.gradBtn} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
            <Text style={styles.subscribeBtnText}>
              {selected === 'free' ? 'Текущ план' : `Стартирай ${PLANS.find(p => p.id === selected)?.name}`}
            </Text>
          </LinearGradient>
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
  hero: { alignItems: 'center', paddingVertical: 20 },
  heroTitle: { fontSize: 24, fontWeight: '800', color: colors.text.primary, marginTop: 12 },
  heroDesc: { fontSize: 15, color: colors.text.secondary, marginTop: 6 },
  billingToggle: {
    flexDirection: 'row', backgroundColor: colors.background.paper, borderRadius: 12, padding: 4, marginBottom: 20,
  },
  billingOption: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 10, borderRadius: 10 },
  billingActive: { backgroundColor: colors.primary.main },
  billingText: { fontSize: 14, fontWeight: '600', color: colors.text.secondary },
  billingTextActive: { color: '#FFF' },
  saveBadge: { backgroundColor: colors.status.success, paddingHorizontal: 6, paddingVertical: 1, borderRadius: 4 },
  saveText: { color: '#FFF', fontSize: 10, fontWeight: '700' },
  planCard: {
    backgroundColor: colors.background.paper, borderRadius: 16, padding: 18, marginBottom: 12,
    borderWidth: 2, borderColor: 'transparent',
    ...Platform.select({ ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8 }, android: { elevation: 2 } }),
  },
  planCardSelected: { backgroundColor: '#FFF' },
  popularBadge: {
    position: 'absolute', top: -1, right: 16, flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: colors.brand.orange, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 0,
    borderBottomLeftRadius: 8, borderBottomRightRadius: 8,
  },
  popularText: { color: '#FFF', fontSize: 11, fontWeight: '700' },
  planHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  planName: { fontSize: 20, fontWeight: '700' },
  planPriceRow: { flexDirection: 'row', alignItems: 'baseline', marginTop: 4 },
  planPrice: { fontSize: 28, fontWeight: '800', color: colors.text.primary },
  planPeriod: { fontSize: 14, color: colors.text.secondary, marginLeft: 2 },
  radio: { width: 24, height: 24, borderRadius: 12, borderWidth: 2, borderColor: colors.border.default, alignItems: 'center', justifyContent: 'center' },
  radioActive: {},
  radioDot: { width: 12, height: 12, borderRadius: 6 },
  featuresList: { marginTop: 14, gap: 8 },
  featureRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  featureText: { fontSize: 14, color: colors.text.secondary },
  trustRow: { flexDirection: 'row', justifyContent: 'space-around', marginTop: 16, paddingVertical: 14, backgroundColor: colors.background.paper, borderRadius: 12 },
  trustItem: { alignItems: 'center', gap: 4 },
  trustText: { fontSize: 11, color: colors.text.secondary, fontWeight: '500', textAlign: 'center', maxWidth: 80 },
  bottomBar: {
    paddingHorizontal: 16, paddingVertical: 12, paddingBottom: Platform.OS === 'ios' ? 28 : 12,
    backgroundColor: colors.background.paper, borderTopWidth: 1, borderTopColor: colors.border.light,
  },
  subscribeBtn: { borderRadius: 14, overflow: 'hidden' },
  gradBtn: { height: 54, alignItems: 'center', justifyContent: 'center' },
  subscribeBtnText: { color: '#FFF', fontSize: 17, fontWeight: '700' },
});
