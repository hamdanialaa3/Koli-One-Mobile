import React, { useState, useCallback, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList, Platform, Dimensions, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { ArrowLeft, SlidersHorizontal, Grid3X3, List, MapPin, Fuel, Gauge, Search } from 'lucide-react-native';
import { colors } from '../src/styles/theme';
import { useMobileSearch } from '../src/hooks/useMobileSearch';
import { FilterState } from '../src/services/search/UnifiedFilterTypes';
import { CarCard } from '../src/components/CarCard';

const { width } = Dimensions.get('window');

const SORT_OPTIONS = ['Нови', 'Цена ↑', 'Цена ↓', 'Години ↑', 'Км ↓'];
const SORT_KEYS: Array<'recent' | 'price_asc' | 'price_desc' | 'year_desc' | 'mileage_asc'> = [
  'recent', 'price_asc', 'price_desc', 'year_desc', 'mileage_asc',
];

export default function AllCarsScreen() {
  const router = useRouter();
  const searchParams = useLocalSearchParams();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortIdx, setSortIdx] = useState(0);

  // Initialize search with params from URL — including default sort
  const initialFilters: FilterState = {
    sort: SORT_KEYS[0],
    make: (searchParams.make as string) || undefined,
    model: (searchParams.model as string) || undefined,
    fuelType: (searchParams.fuelType as string) || undefined,
    transmission: (searchParams.transmission as string) || undefined,
    color: (searchParams.color as string) || undefined,
    bodyType: (searchParams.bodyType as string) || undefined,
    location: (searchParams.location as string) || undefined,
    priceMin: searchParams.priceMin ? Number(searchParams.priceMin) : undefined,
    priceMax: searchParams.priceMax ? Number(searchParams.priceMax) : undefined,
    yearMin: searchParams.yearMin ? Number(searchParams.yearMin) : undefined,
    yearMax: searchParams.yearMax ? Number(searchParams.yearMax) : undefined,
  };

  const {
    filters,
    results,
    loading,
    totalCount,
    search,
    updateFilter,
  } = useMobileSearch(initialFilters);

  // Re-search when sort changes
  useEffect(() => {
    updateFilter('sort', SORT_KEYS[sortIdx]);
  }, [sortIdx, updateFilter]);

  useEffect(() => {
    search();
  }, [search]);

  const renderItem = useCallback(({ item, index }: { item: any; index: number }) => (
    <Animated.View entering={FadeInDown.delay(index * 40)} style={{ marginBottom: 16 }}>
      <CarCard listing={item} />
    </Animated.View>
  ), []);

  const ITEM_HEIGHT = 320 + 16; // CarCard height + marginBottom
  const getItemLayout = useCallback((_: any, index: number) => ({
    length: ITEM_HEIGHT,
    offset: ITEM_HEIGHT * index,
    index,
  }), []);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.iconBtn}><ArrowLeft size={24} color={colors.text.primary} /></TouchableOpacity>
        <Text style={styles.headerTitle}>{loading && results.length === 0 ? '...' : totalCount} автомобила</Text>
        <TouchableOpacity onPress={() => router.push('/advanced-search' as any)} style={styles.iconBtn}><SlidersHorizontal size={22} color={colors.text.primary} /></TouchableOpacity>
      </View>

      {/* Sort + View toggle (simplified for now as CarCard is best full-width) */}
      <View style={styles.controlsBar}>
        <FlatList
          horizontal data={SORT_OPTIONS} keyExtractor={s => s}
          renderItem={({ item, index }) => (
            <TouchableOpacity style={[styles.sortChip, sortIdx === index && styles.sortActive]} onPress={() => setSortIdx(index)}>
              <Text style={[styles.sortText, sortIdx === index && styles.sortTextActive]}>{item}</Text>
            </TouchableOpacity>
          )}
          contentContainerStyle={{ gap: 6, paddingLeft: 16 }} showsHorizontalScrollIndicator={false}
        />
      </View>

      {loading && results.length === 0 ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator color={colors.brand.orange} size="large" />
        </View>
      ) : results.length === 0 ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40 }}>
          <Search size={64} color={colors.text.disabled} strokeWidth={1} />
          <Text style={{ marginTop: 16, fontSize: 18, color: colors.text.secondary, textAlign: 'center' }}>
            Няма намерени автомобили
          </Text>
          <TouchableOpacity
            style={{ marginTop: 24, padding: 12, backgroundColor: colors.brand.orange, borderRadius: 12 }}
            onPress={() => router.push('/advanced-search' as any)}
          >
            <Text style={{ color: '#FFF', fontWeight: '700' }}>Промени филтрите</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={results} keyExtractor={item => item.id}
          renderItem={renderItem}
          getItemLayout={getItemLayout}
          removeClippedSubviews
          maxToRenderPerBatch={8}
          windowSize={5}
          contentContainerStyle={styles.listList}
          showsVerticalScrollIndicator={false}
        />
      )}
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
  controlsBar: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10 },
  sortChip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, backgroundColor: colors.background.paper, borderWidth: 1, borderColor: colors.border.default },
  sortActive: { backgroundColor: colors.brand.orange, borderColor: colors.brand.orange },
  sortText: { fontSize: 13, fontWeight: '500', color: colors.text.secondary },
  sortTextActive: { color: '#FFF', fontWeight: '600' },
  listList: { paddingHorizontal: 16, paddingBottom: 100, paddingTop: 8 },
});
