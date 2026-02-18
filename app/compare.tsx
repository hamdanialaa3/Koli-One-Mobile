/**
 * Koli One — Compare Cars — Side-by-side car comparison
 * Uses real Firestore data via ListingService
 */
import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, TextInput, ActivityIndicator, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Image } from 'expo-image';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { ArrowLeft, Plus, X, Trophy, Fuel, Gauge, Calendar, Settings, Palette, Search } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { ListingService } from '../src/services/ListingService';
import { ListingBase } from '../src/types/ListingBase';
import { logger } from '../src/services/logger-service';

/** Spec definition for display in the comparison table */
interface SpecDef {
  key: string;
  label: string;
  icon: any;
  extract: (car: ListingBase) => string | number | undefined;
  format?: (v: any) => string;
  better?: 'higher' | 'lower';
}

const SPECS: SpecDef[] = [
  { key: 'price', label: 'Цена', icon: Trophy, extract: (c) => c.price, format: (v) => v ? `€${Number(v).toLocaleString()}` : '—', better: 'lower' },
  { key: 'year', label: 'Година', icon: Calendar, extract: (c) => c.year, format: (v) => v ? `${v}` : '—', better: 'higher' },
  { key: 'hp', label: 'Мощност', icon: Gauge, extract: (c) => (c as any).horsePower || (c as any).hp || (c as any).power, format: (v) => v ? `${v} к.с.` : '—', better: 'higher' },
  { key: 'fuel', label: 'Гориво', icon: Fuel, extract: (c) => c.fuelType || (c as any).fuel, format: (v) => v || '—' },
  { key: 'gearbox', label: 'Скоростна к.', icon: Settings, extract: (c) => c.transmission || (c as any).gearbox, format: (v) => v || '—' },
  { key: 'mileage', label: 'Километраж', icon: Gauge, extract: (c) => c.mileage || (c as any).km, format: (v) => v ? `${(Number(v) / 1000).toFixed(0)}K км` : '—', better: 'lower' },
  { key: 'color', label: 'Цвят', icon: Palette, extract: (c) => (c as any).color || (c as any).exteriorColor, format: (v) => v || '—' },
];

export default function CompareScreen() {
  const router = useRouter();
  const [selectedCars, setSelectedCars] = useState<ListingBase[]>([]);
  const [showPicker, setShowPicker] = useState<number | null>(null);
  const [searchResults, setSearchResults] = useState<ListingBase[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const [allListings, setAllListings] = useState<ListingBase[]>([]);
  const [loadingInitial, setLoadingInitial] = useState(true);

  // Load listings from Firestore on mount
  useEffect(() => {
    (async () => {
      try {
        const listings = await ListingService.getListings();
        setAllListings(listings);
      } catch (err) {
        logger.error('Failed to load listings for compare', err);
      } finally {
        setLoadingInitial(false);
      }
    })();
  }, []);

  // Filter listings based on search query
  const handleSearch = useCallback((text: string) => {
    setSearchQuery(text);
    if (!text.trim()) {
      setSearchResults(allListings.filter(l => !selectedCars.find(s => s.id === l.id)));
      return;
    }
    const q = text.toLowerCase();
    const filtered = allListings.filter(l => {
      if (selectedCars.find(s => s.id === l.id)) return false;
      const title = `${l.make || ''} ${l.model || ''}`.toLowerCase();
      return title.includes(q) || (l.make || '').toLowerCase().includes(q) || (l.model || '').toLowerCase().includes(q);
    });
    setSearchResults(filtered);
  }, [allListings, selectedCars]);

  // Open picker: populate search results immediately
  const openPicker = (slot: number) => {
    setShowPicker(slot);
    setSearchQuery('');
    setSearchResults(allListings.filter(l => !selectedCars.find(s => s.id === l.id)));
  };

  const addCar = (car: ListingBase, slot: number) => {
    Haptics.selectionAsync();
    const updated = [...selectedCars];
    if (slot < updated.length) {
      updated[slot] = car;
    } else {
      updated.push(car);
    }
    setSelectedCars(updated);
    setShowPicker(null);
    setSearchQuery('');
  };

  const removeCar = (idx: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedCars(prev => prev.filter((_, i) => i !== idx));
  };

  const getBestValue = (spec: SpecDef) => {
    if (!spec.better || selectedCars.length < 2) return null;
    const values = selectedCars.map(c => {
      const v = spec.extract(c);
      return typeof v === 'number' ? v : Number(v) || null;
    });
    const numericValues = values.filter((v): v is number => v !== null);
    if (numericValues.length < 2) return null;
    return spec.better === 'higher' ? Math.max(...numericValues) : Math.min(...numericValues);
  };

  const getCarImage = (car: ListingBase): string | undefined => {
    if (car.images && car.images.length > 0) {
      return car.images.find(img => img && (img.startsWith('http://') || img.startsWith('https://')));
    }
    return undefined;
  };

  const getCarTitle = (car: ListingBase): string => {
    return `${car.make || ''} ${car.model || ''}`.trim() || 'Unknown';
  };

  if (loadingInitial) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <ArrowLeft size={24} color="#1E293B" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Сравнение</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color="#003366" />
          <Text style={{ color: '#64748B', marginTop: 12 }}>Зареждане на обяви...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <ArrowLeft size={24} color="#1E293B" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Сравнение</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Empty state — prompt user to add cars */}
        {selectedCars.length === 0 && showPicker === null && (
          <View style={styles.emptyState}>
            <Trophy size={48} color="#CBD5E1" />
            <Text style={styles.emptyTitle}>Сравнете автомобили</Text>
            <Text style={styles.emptySubtitle}>Добавете поне 2 автомобила, за да ги сравните наред</Text>
            <TouchableOpacity style={styles.emptyAddBtn} onPress={() => openPicker(0)}>
              <Plus size={20} color="#FFF" />
              <Text style={styles.emptyAddBtnText}>Добави първа кола</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Car Selector Row */}
        {(selectedCars.length > 0 || showPicker !== null) && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.carSelector}>
            {selectedCars.map((car, idx) => (
              <Animated.View key={car.id + idx} entering={FadeInDown.delay(idx * 100)} style={styles.carCard}>
                <TouchableOpacity style={styles.removeBtn} onPress={() => removeCar(idx)}>
                  <X size={14} color="#FFF" />
                </TouchableOpacity>
                {getCarImage(car) ? (
                  <Image source={{ uri: getCarImage(car) }} style={styles.carImage} contentFit="cover" />
                ) : (
                  <View style={[styles.carImage, { backgroundColor: '#E2E8F0', justifyContent: 'center', alignItems: 'center' }]}>
                    <Text style={{ fontSize: 24 }}>🚗</Text>
                  </View>
                )}
                <Text style={styles.carName} numberOfLines={1}>{getCarTitle(car)}</Text>
                <Text style={styles.carPrice}>
                  {car.price ? `€${Number(car.price).toLocaleString()}` : '—'}
                </Text>
              </Animated.View>
            ))}

            {selectedCars.length < 3 && (
              <TouchableOpacity
                style={styles.addCard}
                onPress={() => openPicker(selectedCars.length)}
              >
                <Plus size={28} color="#003366" />
                <Text style={styles.addText}>Добави кола</Text>
              </TouchableOpacity>
            )}
          </ScrollView>
        )}

        {/* Car Picker with Search */}
        {showPicker !== null && (
          <View style={styles.pickerOverlay}>
            <Text style={styles.pickerTitle}>Изберете автомобил:</Text>
            {/* Search input */}
            <View style={styles.searchBox}>
              <Search size={18} color="#94A3B8" />
              <TextInput
                style={styles.searchInput}
                placeholder="Търсене по марка или модел..."
                placeholderTextColor="#94A3B8"
                value={searchQuery}
                onChangeText={handleSearch}
                autoFocus
              />
            </View>

            {searchResults.length === 0 ? (
              <View style={{ alignItems: 'center', paddingVertical: 24 }}>
                <Text style={{ color: '#94A3B8', fontSize: 14 }}>
                  {allListings.length === 0 ? 'Няма налични обяви' : 'Няма резултати за тази марка/модел'}
                </Text>
              </View>
            ) : (
              <ScrollView style={{ maxHeight: 300 }} nestedScrollEnabled>
                {searchResults.slice(0, 20).map((car) => (
                  <TouchableOpacity key={car.id} style={styles.pickerItem} onPress={() => addCar(car, showPicker)}>
                    {getCarImage(car) ? (
                      <Image source={{ uri: getCarImage(car) }} style={styles.pickerImage} contentFit="cover" />
                    ) : (
                      <View style={[styles.pickerImage, { backgroundColor: '#E2E8F0', justifyContent: 'center', alignItems: 'center' }]}>
                        <Text>🚗</Text>
                      </View>
                    )}
                    <View style={{ flex: 1 }}>
                      <Text style={styles.pickerName}>{getCarTitle(car)}</Text>
                      <Text style={styles.pickerPrice}>
                        {car.price ? `€${Number(car.price).toLocaleString()}` : '—'}
                        {car.year ? ` · ${car.year}` : ''}
                        {car.mileage ? ` · ${(Number(car.mileage) / 1000).toFixed(0)}K км` : ''}
                      </Text>
                    </View>
                    <Plus size={20} color="#003366" />
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}
            <TouchableOpacity style={styles.pickerCancel} onPress={() => setShowPicker(null)}>
              <Text style={styles.pickerCancelText}>Отказ</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Comparison Table */}
        {selectedCars.length >= 2 && (
          <View style={styles.tableContainer}>
            <Text style={styles.tableTitle}>Подробно сравнение</Text>
            {SPECS.map((spec, idx) => {
              const Icon = spec.icon;
              const best = getBestValue(spec);
              return (
                <Animated.View key={spec.key} entering={FadeInDown.delay(200 + idx * 50)}>
                  <View style={[styles.specRow, idx % 2 === 0 && styles.specRowAlt]}>
                    <View style={styles.specLabel}>
                      <Icon size={16} color="#64748B" />
                      <Text style={styles.specLabelText}>{spec.label}</Text>
                    </View>
                    <View style={styles.specValues}>
                      {selectedCars.map((car, ci) => {
                        const rawVal = spec.extract(car);
                        const formatted = spec.format ? spec.format(rawVal) : String(rawVal ?? '—');
                        const numVal = typeof rawVal === 'number' ? rawVal : Number(rawVal);
                        const isBest = best !== null && !isNaN(numVal) && numVal === best;
                        return (
                          <View key={ci} style={styles.specValue}>
                            <Text style={[styles.specValueText, isBest && styles.specValueBest]}>
                              {formatted}
                            </Text>
                            {isBest && <Trophy size={12} color="#7B2FBE" style={{ marginLeft: 4 }} />}
                          </View>
                        );
                      })}
                    </View>
                  </View>
                </Animated.View>
              );
            })}
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F4F4F4' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12, backgroundColor: '#FFF', borderBottomWidth: 1, borderBottomColor: '#E2E8F0' },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#F1F5F9', alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#1E293B' },
  carSelector: { paddingHorizontal: 16, paddingVertical: 20, gap: 12 },
  carCard: { width: 140, backgroundColor: '#FFF', borderRadius: 12, overflow: 'hidden', borderWidth: 1, borderColor: '#E2E8F0' },
  removeBtn: { position: 'absolute', top: 6, right: 6, zIndex: 2, width: 24, height: 24, borderRadius: 12, backgroundColor: 'rgba(0,0,0,0.5)', alignItems: 'center', justifyContent: 'center' },
  carImage: { width: 140, height: 90 },
  carName: { fontSize: 13, fontWeight: '700', color: '#1E293B', paddingHorizontal: 8, paddingTop: 8 },
  carPrice: { fontSize: 14, fontWeight: '800', color: '#003366', paddingHorizontal: 8, paddingBottom: 8, paddingTop: 2 },
  addCard: { width: 140, height: 140, backgroundColor: '#FFF', borderRadius: 12, borderWidth: 2, borderColor: '#003366', borderStyle: 'dashed', alignItems: 'center', justifyContent: 'center', gap: 8 },
  addText: { fontSize: 13, fontWeight: '600', color: '#003366' },
  pickerOverlay: { backgroundColor: '#FFF', marginHorizontal: 16, borderRadius: 12, padding: 16, borderWidth: 1, borderColor: '#E2E8F0', marginBottom: 16 },
  pickerTitle: { fontSize: 16, fontWeight: '700', color: '#1E293B', marginBottom: 12 },
  pickerItem: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  pickerImage: { width: 60, height: 40, borderRadius: 6 },
  pickerName: { fontSize: 14, fontWeight: '600', color: '#1E293B' },
  pickerPrice: { fontSize: 13, color: '#003366', fontWeight: '700' },
  pickerCancel: { alignItems: 'center', paddingTop: 12 },
  pickerCancelText: { fontSize: 14, fontWeight: '600', color: '#CC0000' },
  searchBox: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#F1F5F9', borderRadius: 10, paddingHorizontal: 12, marginBottom: 12 },
  searchInput: { flex: 1, height: 42, fontSize: 14, color: '#1E293B' },
  emptyState: { alignItems: 'center', justifyContent: 'center', paddingVertical: 60, paddingHorizontal: 32 },
  emptyTitle: { fontSize: 20, fontWeight: '800', color: '#1E293B', marginTop: 16 },
  emptySubtitle: { fontSize: 14, color: '#64748B', textAlign: 'center', marginTop: 8, lineHeight: 20 },
  emptyAddBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#003366', paddingHorizontal: 24, paddingVertical: 14, borderRadius: 12, marginTop: 20 },
  emptyAddBtnText: { fontSize: 15, fontWeight: '700', color: '#FFF' },
  tableContainer: { marginHorizontal: 16, backgroundColor: '#FFF', borderRadius: 16, overflow: 'hidden', marginBottom: 20, borderWidth: 1, borderColor: '#E2E8F0' },
  tableTitle: { fontSize: 16, fontWeight: '700', color: '#1E293B', padding: 16, borderBottomWidth: 1, borderBottomColor: '#E2E8F0' },
  specRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, paddingHorizontal: 16 },
  specRowAlt: { backgroundColor: '#F8FAFC' },
  specLabel: { flexDirection: 'row', alignItems: 'center', gap: 8, width: 120 },
  specLabelText: { fontSize: 13, color: '#64748B', fontWeight: '500' },
  specValues: { flex: 1, flexDirection: 'row', justifyContent: 'space-around' },
  specValue: { flexDirection: 'row', alignItems: 'center' },
  specValueText: { fontSize: 13, fontWeight: '600', color: '#1E293B' },
  specValueBest: { color: '#7B2FBE', fontWeight: '800' },
});
