/**
 * Koli One — AI Car Valuation Screen
 * Get AI-powered market value estimate for any car
 */
import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, ActivityIndicator, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Animated, { FadeInDown, FadeInUp, ZoomIn } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowLeft, TrendingUp, Car, Calendar, Fuel, Gauge, DollarSign, BarChart3 } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { colors } from '../../src/styles/theme';
import { aiService } from '../../src/services/ai/ai.service';
import { Alert } from 'react-native';

export default function AIValuationScreen() {
  const router = useRouter();
  const [brand, setBrand] = useState('');
  const [model, setModel] = useState('');
  const [year, setYear] = useState('');
  const [mileage, setMileage] = useState('');
  const [fuel, setFuel] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleValuation = async () => {
    if (!brand || !model || !year) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setLoading(true);
    try {
      const data = await aiService.getPriceSuggestion({
        make: brand,
        model,
        year: parseInt(year),
        mileage: mileage ? parseInt(mileage) : undefined,
        fuelType: fuel || undefined,
        location: 'Bulgaria',
      });
      setResult({
        low: data.minPrice,
        mid: data.avgPrice,
        high: data.maxPrice,
        confidence: data.confidence,
        trend: data.marketTrend === 'up' ? 'up' : 'stable',
        similar: data.similarCount,
        reasoning: data.reasoning,
      });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error: any) {
      Alert.alert('Грешка', error?.message || 'Неуспешна AI оценка. Опитайте отново.');
    } finally {
      setLoading(false);
    }
  };

  const FUEL_TYPES = ['Бензин', 'Дизел', 'Хибрид', 'Електрик', 'Газ'];

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <LinearGradient colors={['#003366', '#004488']} style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <ArrowLeft size={24} color="#FFF" />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <TrendingUp size={28} color={colors.brand.orange} />
          <Text style={styles.headerTitle}>AI Оценка</Text>
          <Text style={styles.headerSub}>Пазарна стойност в реално време</Text>
        </View>
      </LinearGradient>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        {!result ? (
          <>
            {/* Form */}
            <Animated.View entering={FadeInDown.delay(100)} style={styles.formCard}>
              <Text style={styles.sectionTitle}>Данни за автомобила</Text>

              <View style={styles.row}>
                <View style={styles.inputWrap}>
                  <Text style={styles.label}>Марка *</Text>
                  <TextInput style={styles.input} value={brand} onChangeText={setBrand}
                    placeholder="напр. BMW" placeholderTextColor={colors.text.tertiary} />
                </View>
                <View style={styles.inputWrap}>
                  <Text style={styles.label}>Модел *</Text>
                  <TextInput style={styles.input} value={model} onChangeText={setModel}
                    placeholder="напр. 320d" placeholderTextColor={colors.text.tertiary} />
                </View>
              </View>

              <View style={styles.row}>
                <View style={styles.inputWrap}>
                  <Text style={styles.label}>Година *</Text>
                  <TextInput style={styles.input} value={year} onChangeText={setYear}
                    placeholder="2020" keyboardType="numeric" placeholderTextColor={colors.text.tertiary} />
                </View>
                <View style={styles.inputWrap}>
                  <Text style={styles.label}>Пробег (км)</Text>
                  <TextInput style={styles.input} value={mileage} onChangeText={setMileage}
                    placeholder="80000" keyboardType="numeric" placeholderTextColor={colors.text.tertiary} />
                </View>
              </View>

              <Text style={styles.label}>Гориво</Text>
              <View style={styles.fuelRow}>
                {FUEL_TYPES.map(f => (
                  <TouchableOpacity
                    key={f}
                    style={[styles.fuelChip, fuel === f && styles.fuelChipActive]}
                    onPress={() => setFuel(f)}
                  >
                    <Text style={[styles.fuelText, fuel === f && styles.fuelTextActive]}>{f}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </Animated.View>

            <Animated.View entering={FadeInUp.delay(200)}>
              <TouchableOpacity
                style={[styles.valuateBtn, (!brand || !model || !year) && styles.btnDisabled]}
                onPress={handleValuation}
                disabled={!brand || !model || !year || loading}
              >
                <LinearGradient colors={['#7B2FBE', '#9C5FE0']} style={styles.gradBtn}>
                  {loading ? (
                    <ActivityIndicator color="#FFF" />
                  ) : (
                    <>
                      <BarChart3 size={22} color="#FFF" />
                      <Text style={styles.btnText}>Оцени автомобила</Text>
                    </>
                  )}
                </LinearGradient>
              </TouchableOpacity>
            </Animated.View>
          </>
        ) : (
          /* Results */
          <Animated.View entering={ZoomIn.duration(500)}>
            <View style={styles.resultCard}>
              <Text style={styles.resultTitle}>{brand} {model} ({year})</Text>

              {/* Price gauge */}
              <View style={styles.priceGauge}>
                <View style={styles.priceBox}>
                  <Text style={styles.priceLabel}>Минимална</Text>
                  <Text style={styles.priceLow}>€{result.low.toLocaleString()}</Text>
                </View>
                <View style={[styles.priceBox, styles.priceBoxMain]}>
                  <Text style={styles.priceLabelMain}>Пазарна цена</Text>
                  <Text style={styles.priceMain}>€{result.mid.toLocaleString()}</Text>
                </View>
                <View style={styles.priceBox}>
                  <Text style={styles.priceLabel}>Максимална</Text>
                  <Text style={styles.priceHigh}>€{result.high.toLocaleString()}</Text>
                </View>
              </View>

              {/* Stats */}
              <View style={styles.statsRow}>
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>{result.confidence}%</Text>
                  <Text style={styles.statLabel}>Точност</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>{result.similar}</Text>
                  <Text style={styles.statLabel}>Подобни обяви</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>{result.trend === 'up' ? '📈' : '➡️'}</Text>
                  <Text style={styles.statLabel}>Тенденция</Text>
                </View>
              </View>

              {/* Actions */}
              <TouchableOpacity style={styles.searchBtn} onPress={() => router.push('/(tabs)/search')}>
                <Text style={styles.searchBtnText}>🔍 Виж подобни обяви</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.againBtn} onPress={() => setResult(null)}>
                <Text style={styles.againText}>Нова оценка</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background.default },
  header: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 24 },
  backBtn: { width: 40, height: 40, justifyContent: 'center' },
  headerContent: { alignItems: 'center', gap: 8, marginTop: 8 },
  headerTitle: { fontSize: 26, fontWeight: '800', color: '#FFF' },
  headerSub: { fontSize: 14, color: 'rgba(255,255,255,0.6)' },
  scroll: { flex: 1 },
  scrollContent: { padding: 20, paddingBottom: 40 },
  formCard: {
    backgroundColor: colors.background.paper, borderRadius: 16, padding: 20,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 8 },
      android: { elevation: 3 },
    }),
    marginBottom: 20,
  },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: colors.text.primary, marginBottom: 16 },
  row: { flexDirection: 'row', gap: 12, marginBottom: 12 },
  inputWrap: { flex: 1 },
  label: { fontSize: 13, fontWeight: '600', color: colors.text.secondary, marginBottom: 6 },
  input: {
    height: 48, borderRadius: 12, borderWidth: 1, borderColor: colors.border.default,
    paddingHorizontal: 14, fontSize: 16, color: colors.text.primary,
    backgroundColor: colors.background.subtle,
  },
  fuelRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 8, marginBottom: 8 },
  fuelChip: {
    paddingHorizontal: 16, paddingVertical: 10, borderRadius: 20,
    borderWidth: 1, borderColor: colors.border.default, backgroundColor: colors.background.paper,
  },
  fuelChipActive: { backgroundColor: colors.primary.main, borderColor: colors.primary.main },
  fuelText: { fontSize: 14, color: colors.text.secondary },
  fuelTextActive: { color: '#FFF', fontWeight: '600' },
  valuateBtn: { borderRadius: 14, overflow: 'hidden' },
  gradBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    paddingVertical: 16, gap: 10, borderRadius: 14,
  },
  btnText: { color: '#FFF', fontSize: 17, fontWeight: '700' },
  btnDisabled: { opacity: 0.5 },
  // Results
  resultCard: {
    backgroundColor: colors.background.paper, borderRadius: 20, padding: 24,
    ...Platform.select({
      ios: { shadowColor: '#003366', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.12, shadowRadius: 16 },
      android: { elevation: 6 },
    }),
  },
  resultTitle: { fontSize: 22, fontWeight: '800', color: colors.text.primary, textAlign: 'center', marginBottom: 24 },
  priceGauge: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 24 },
  priceBox: { alignItems: 'center', flex: 1 },
  priceBoxMain: {
    backgroundColor: 'rgba(255,121,0,0.08)', borderRadius: 16, paddingVertical: 16, marginHorizontal: 4,
  },
  priceLabel: { fontSize: 12, color: colors.text.secondary, marginBottom: 4 },
  priceLabelMain: { fontSize: 12, color: colors.brand.orange, fontWeight: '600', marginBottom: 4 },
  priceLow: { fontSize: 18, fontWeight: '700', color: colors.status.success },
  priceMain: { fontSize: 24, fontWeight: '900', color: colors.brand.orange },
  priceHigh: { fontSize: 18, fontWeight: '700', color: colors.status.error },
  statsRow: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 24, paddingVertical: 16, borderTopWidth: 1, borderBottomWidth: 1, borderColor: colors.border.light },
  statItem: { alignItems: 'center' },
  statValue: { fontSize: 20, fontWeight: '800', color: colors.text.primary },
  statLabel: { fontSize: 12, color: colors.text.secondary, marginTop: 4 },
  searchBtn: {
    backgroundColor: colors.primary.main, borderRadius: 14, paddingVertical: 14, alignItems: 'center', marginBottom: 12,
  },
  searchBtnText: { color: '#FFF', fontSize: 16, fontWeight: '700' },
  againBtn: { alignItems: 'center', paddingVertical: 12 },
  againText: { color: colors.brand.orange, fontSize: 15, fontWeight: '600' },
});
