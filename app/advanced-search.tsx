/**
 * Koli One — Advanced Search (replaces web SEO pages with in-app filters)
 */
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Platform, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Animated, { FadeInUp, FadeInDown } from 'react-native-reanimated';
import { ArrowLeft, Search, SlidersHorizontal, X, ChevronDown, RotateCcw } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { colors } from '../src/styles/theme';

const VEHICLE_TYPES = ['Всички', 'Кола', 'Джип/SUV', 'Бус', 'Мотоциклет', 'Камион'];
const FUEL_TYPES = ['Бензин', 'Дизел', 'Електрически', 'Хибрид', 'Газ/LPG'];
const GEARBOX = ['Автоматик', 'Ръчна'];
const POPULAR_BRANDS = ['BMW', 'Mercedes', 'Audi', 'VW', 'Toyota', 'Opel', 'Renault', 'Peugeot', 'Ford', 'Hyundai', 'Kia', 'Skoda'];
const COLORS_LIST = [
  { name: 'Черен', color: '#1a1a1a' }, { name: 'Бял', color: '#F5F5F5' }, { name: 'Сребрист', color: '#C0C0C0' },
  { name: 'Син', color: '#2563EB' }, { name: 'Червен', color: '#DC2626' }, { name: 'Сив', color: '#6B7280' },
];

export default function AdvancedSearchScreen() {
  const router = useRouter();
  const [vehicleType, setVehicleType] = useState('Всички');
  const [brand, setBrand] = useState('');
  const [fuelTypes, setFuelTypes] = useState<string[]>([]);
  const [gearbox, setGearbox] = useState('');
  const [priceMin, setPriceMin] = useState('');
  const [priceMax, setPriceMax] = useState('');
  const [yearMin, setYearMin] = useState('');
  const [yearMax, setYearMax] = useState('');
  const [selectedColor, setSelectedColor] = useState('');

  const toggleFuel = (f: string) => setFuelTypes(prev => prev.includes(f) ? prev.filter(x => x !== f) : [...prev, f]);

  const resetFilters = () => {
    setVehicleType('Всички'); setBrand(''); setFuelTypes([]); setGearbox('');
    setPriceMin(''); setPriceMax(''); setYearMin(''); setYearMax(''); setSelectedColor('');
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  const activeFilters = [brand, ...fuelTypes, gearbox, priceMin, priceMax, yearMin, yearMax, selectedColor].filter(Boolean).length;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.iconBtn}><ArrowLeft size={24} color={colors.text.primary} /></TouchableOpacity>
        <Text style={styles.headerTitle}>Разширено търсене</Text>
        <TouchableOpacity onPress={resetFilters} style={styles.resetBtn}>
          <RotateCcw size={18} color={colors.brand.orange} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Vehicle Type */}
        <Animated.View entering={FadeInUp.delay(50)}>
          <Text style={styles.sectionTitle}>Тип превозно средство</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow}>
            {VEHICLE_TYPES.map(t => (
              <TouchableOpacity
                key={t}
                style={[styles.chip, vehicleType === t && styles.chipActive]}
                onPress={() => setVehicleType(t)}
              >
                <Text style={[styles.chipText, vehicleType === t && styles.chipTextActive]}>{t}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </Animated.View>

        {/* Brand */}
        <Animated.View entering={FadeInUp.delay(100)}>
          <Text style={styles.sectionTitle}>Марка</Text>
          <View style={styles.brandGrid}>
            {POPULAR_BRANDS.map(b => (
              <TouchableOpacity
                key={b}
                style={[styles.brandChip, brand === b && styles.brandActive]}
                onPress={() => setBrand(brand === b ? '' : b)}
              >
                <Text style={[styles.brandText, brand === b && styles.brandTextActive]}>{b}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </Animated.View>

        {/* Price Range */}
        <Animated.View entering={FadeInUp.delay(150)}>
          <Text style={styles.sectionTitle}>Цена (EUR)</Text>
          <View style={styles.rangeRow}>
            <TextInput
              style={styles.rangeInput} value={priceMin} onChangeText={setPriceMin}
              placeholder="от" placeholderTextColor={colors.text.tertiary} keyboardType="numeric"
            />
            <Text style={styles.rangeSep}>—</Text>
            <TextInput
              style={styles.rangeInput} value={priceMax} onChangeText={setPriceMax}
              placeholder="до" placeholderTextColor={colors.text.tertiary} keyboardType="numeric"
            />
          </View>
          {/* Quick Price Filters */}
          <View style={styles.quickRow}>
            {[{ l: '< 5K', v: ['', '5000'] }, { l: '5-15K', v: ['5000', '15000'] }, { l: '15-30K', v: ['15000', '30000'] }, { l: '30K+', v: ['30000', ''] }].map(q => (
              <TouchableOpacity key={q.l} style={styles.quickChip} onPress={() => { setPriceMin(q.v[0]); setPriceMax(q.v[1]); }}>
                <Text style={styles.quickText}>{q.l}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </Animated.View>

        {/* Year */}
        <Animated.View entering={FadeInUp.delay(200)}>
          <Text style={styles.sectionTitle}>Година</Text>
          <View style={styles.rangeRow}>
            <TextInput
              style={styles.rangeInput} value={yearMin} onChangeText={setYearMin}
              placeholder="от" placeholderTextColor={colors.text.tertiary} keyboardType="numeric"
            />
            <Text style={styles.rangeSep}>—</Text>
            <TextInput
              style={styles.rangeInput} value={yearMax} onChangeText={setYearMax}
              placeholder="до" placeholderTextColor={colors.text.tertiary} keyboardType="numeric"
            />
          </View>
        </Animated.View>

        {/* Fuel */}
        <Animated.View entering={FadeInUp.delay(250)}>
          <Text style={styles.sectionTitle}>Гориво</Text>
          <View style={styles.chipRow}>
            {FUEL_TYPES.map(f => (
              <TouchableOpacity key={f} style={[styles.chip, fuelTypes.includes(f) && styles.chipActive]} onPress={() => toggleFuel(f)}>
                <Text style={[styles.chipText, fuelTypes.includes(f) && styles.chipTextActive]}>{f}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </Animated.View>

        {/* Gearbox */}
        <Animated.View entering={FadeInUp.delay(300)}>
          <Text style={styles.sectionTitle}>Скоростна кутия</Text>
          <View style={styles.chipRow}>
            {GEARBOX.map(g => (
              <TouchableOpacity key={g} style={[styles.chip, gearbox === g && styles.chipActive]} onPress={() => setGearbox(gearbox === g ? '' : g)}>
                <Text style={[styles.chipText, gearbox === g && styles.chipTextActive]}>{g}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </Animated.View>

        {/* Color */}
        <Animated.View entering={FadeInUp.delay(350)}>
          <Text style={styles.sectionTitle}>Цвят</Text>
          <View style={styles.colorRow}>
            {COLORS_LIST.map(c => (
              <TouchableOpacity
                key={c.name}
                style={[
                  styles.colorCircle,
                  { backgroundColor: c.color },
                  selectedColor === c.name && styles.colorActive,
                  c.name === 'Бял' && { borderWidth: 1, borderColor: colors.border.muted }
                ]}
                onPress={() => {
                  Haptics.selectionAsync();
                  setSelectedColor(selectedColor === c.name ? '' : c.name);
                }}
              >
                {selectedColor === c.name && <View style={[styles.colorCheck, c.name === 'Бял' && { backgroundColor: colors.brand.orange }]} />}
              </TouchableOpacity>
            ))}
          </View>
        </Animated.View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Search Button */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={styles.searchBtn}
          onPress={() => {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

            // Build query params
            const params = new URLSearchParams();
            if (brand) params.append('make', brand);
            if (fuelTypes.length > 0) params.append('fuelType', fuelTypes.join(','));
            if (gearbox) params.append('transmission', gearbox);
            if (priceMin) params.append('priceMin', priceMin);
            if (priceMax) params.append('priceMax', priceMax);
            if (yearMin) params.append('yearMin', yearMin);
            if (yearMax) params.append('yearMax', yearMax);
            if (selectedColor) params.append('color', selectedColor);
            if (vehicleType !== 'Всички') params.append('bodyType', vehicleType);

            router.push(`/all-cars?${params.toString()}` as any);
          }}
          activeOpacity={0.8}
        >
          <Search size={20} color="#FFF" />
          <Text style={styles.searchBtnText}>Покажи резултати{activeFilters > 0 ? ` (${activeFilters} филтъра)` : ''}</Text>
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
  headerTitle: { fontSize: 18, fontWeight: '700', color: colors.text.primary },
  resetBtn: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  content: { padding: 16 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: colors.text.primary, marginTop: 20, marginBottom: 10 },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    paddingHorizontal: 16, paddingVertical: 9, borderRadius: 20,
    backgroundColor: colors.background.paper, borderWidth: 1, borderColor: colors.border.default,
  },
  chipActive: { backgroundColor: colors.brand.orange, borderColor: colors.brand.orange },
  chipText: { fontSize: 14, fontWeight: '500', color: colors.text.secondary },
  chipTextActive: { color: '#FFF', fontWeight: '600' },
  brandGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  brandChip: {
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10,
    backgroundColor: colors.background.paper, borderWidth: 1, borderColor: colors.border.default,
  },
  brandActive: { backgroundColor: colors.primary.main, borderColor: colors.primary.main },
  brandText: { fontSize: 13, fontWeight: '500', color: colors.text.secondary },
  brandTextActive: { color: '#FFF', fontWeight: '600' },
  rangeRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  rangeInput: {
    flex: 1, height: 48, borderRadius: 12, borderWidth: 1, borderColor: colors.border.default,
    paddingHorizontal: 14, fontSize: 15, color: colors.text.primary, backgroundColor: colors.background.paper,
  },
  rangeSep: { fontSize: 16, color: colors.text.disabled },
  quickRow: { flexDirection: 'row', gap: 8, marginTop: 10 },
  quickChip: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 8, backgroundColor: colors.background.paper, borderWidth: 1, borderColor: colors.border.default },
  quickText: { fontSize: 13, fontWeight: '600', color: colors.text.secondary },
  colorRow: { flexDirection: 'row', gap: 12 },
  colorCircle: { width: 40, height: 40, borderRadius: 20, borderWidth: 2, borderColor: 'transparent', alignItems: 'center', justifyContent: 'center' },
  colorActive: { borderColor: colors.brand.orange },
  colorCheck: { width: 12, height: 12, borderRadius: 6, backgroundColor: colors.brand.orange },
  bottomBar: {
    paddingHorizontal: 16, paddingVertical: 12, paddingBottom: Platform.OS === 'ios' ? 28 : 12,
    backgroundColor: colors.background.paper, borderTopWidth: 1, borderTopColor: colors.border.light,
  },
  searchBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    backgroundColor: colors.brand.orange, height: 54, borderRadius: 14,
  },
  searchBtnText: { color: '#FFF', fontSize: 17, fontWeight: '700' },
});
