/**
 * Koli One — Brand Gallery (replaces web brand SEO pages)
 */
import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList, Platform, TextInput, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { ArrowLeft, Search, ChevronRight, TrendingUp, Car } from 'lucide-react-native';
import { colors } from '../src/styles/theme';
import { collection, getDocs, query, orderBy, limit } from 'firebase/firestore';
import { db } from '../src/services/firebase';
import { logger } from '../src/services/logger-service';

interface BrandItem {
  name: string;
  count: number;
  logo: string;
  trending: boolean;
}

export default function BrandGalleryScreen() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [brands, setBrands] = useState<BrandItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const snap = await getDocs(
          query(collection(db, 'brand_stats'), orderBy('count', 'desc'), limit(50))
        );
        setBrands(snap.docs.map(d => {
          const data = d.data();
          return {
            name: data.name || d.id,
            count: data.count || data.activeAds || 0,
            logo: data.logo || '🚗',
            trending: data.trending || false,
          };
        }));
      } catch (err) {
        logger.error('Failed to load brands', err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const filtered = brands.filter(b => b.name.toLowerCase().includes(search.toLowerCase()));
  const trending = brands.filter(b => b.trending);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.iconBtn}><ArrowLeft size={24} color={colors.text.primary} /></TouchableOpacity>
        <Text style={styles.headerTitle}>Марки</Text>
        <View style={{ width: 44 }} />
      </View>

      {/* Search */}
      <View style={styles.searchBar}>
        <Search size={18} color={colors.text.tertiary} />
        <TextInput
          style={styles.searchInput} value={search} onChangeText={setSearch}
          placeholder="Търси марка..." placeholderTextColor={colors.text.tertiary}
        />
      </View>

      <FlatList
        data={filtered}
        keyExtractor={item => item.name}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          loading ? (
            <ActivityIndicator style={{ marginTop: 60 }} size="large" color={colors.primary.main} />
          ) : (
            <View style={{ alignItems: 'center', paddingTop: 60, gap: 8 }}>
              <Car size={48} color={colors.text.disabled} />
              <Text style={{ color: colors.text.secondary, fontSize: 16 }}>
                {search ? 'Няма намерена марка' : 'Няма налични марки'}
              </Text>
            </View>
          )
        }
        ListHeaderComponent={
          !search ? (
            <View>
              <Text style={styles.sectionTitle}>🔥 Популярни марки</Text>
              <FlatList
                horizontal data={trending} keyExtractor={i => i.name}
                renderItem={({ item }) => (
                  <TouchableOpacity style={styles.trendCard} onPress={() => router.push('/all-cars' as any)}>
                    <Text style={styles.trendLogo}>{item.logo}</Text>
                    <Text style={styles.trendName}>{item.name}</Text>
                    <View style={styles.trendBadge}><TrendingUp size={10} color={colors.status.success} /><Text style={styles.trendCount}>{item.count}</Text></View>
                  </TouchableOpacity>
                )}
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ gap: 10, paddingBottom: 8 }}
              />
              <Text style={[styles.sectionTitle, { marginTop: 20 }]}>Всички марки</Text>
            </View>
          ) : null
        }
        renderItem={({ item, index }) => (
          <Animated.View entering={FadeInDown.delay(index * 30)}>
            <TouchableOpacity style={styles.brandRow} onPress={() => router.push('/all-cars' as any)} activeOpacity={0.6}>
              <Text style={styles.brandLogo}>{item.logo}</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.brandName}>{item.name}</Text>
                <Text style={styles.brandCount}>{item.count} обяви</Text>
              </View>
              {item.trending && <TrendingUp size={16} color={colors.status.success} style={{ marginRight: 4 }} />}
              <ChevronRight size={18} color={colors.text.disabled} />
            </TouchableOpacity>
          </Animated.View>
        )}
      />
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
  searchBar: {
    flexDirection: 'row', alignItems: 'center', marginHorizontal: 16, marginTop: 12,
    backgroundColor: colors.background.paper, borderRadius: 12, paddingHorizontal: 14,
    height: 46, borderWidth: 1, borderColor: colors.border.default, gap: 10,
  },
  searchInput: { flex: 1, fontSize: 15, color: colors.text.primary },
  list: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 100 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: colors.text.primary, marginBottom: 12 },
  trendCard: {
    alignItems: 'center', backgroundColor: colors.background.paper, borderRadius: 14, padding: 16,
    width: 100, ...Platform.select({ ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 6 }, android: { elevation: 2 } }),
  },
  trendLogo: { fontSize: 28 },
  trendName: { fontSize: 13, fontWeight: '600', color: colors.text.primary, marginTop: 6 },
  trendBadge: { flexDirection: 'row', alignItems: 'center', gap: 3, marginTop: 4 },
  trendCount: { fontSize: 11, color: colors.status.success, fontWeight: '600' },
  brandRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 14,
    borderBottomWidth: 1, borderBottomColor: colors.border.light,
  },
  brandLogo: { fontSize: 24, width: 40, textAlign: 'center' },
  brandName: { fontSize: 16, fontWeight: '600', color: colors.text.primary },
  brandCount: { fontSize: 13, color: colors.text.secondary, marginTop: 1 },
});
