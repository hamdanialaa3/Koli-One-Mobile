/**
 * Koli One — Top Brands (replaces web top-brands SEO page)
 */
import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList, Platform, ActivityIndicator, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowLeft, Trophy, TrendingUp, ChevronRight, Star } from 'lucide-react-native';
import { colors } from '../src/styles/theme';
import { collection, getDocs, query, orderBy, limit } from 'firebase/firestore';
import { db } from '../src/services/firebase';
import { logger } from '../src/services/logger-service';

interface BrandStat {
  rank: number;
  name: string;
  listings: number;
  avgPrice: number;
  satisfaction: number;
  change: string;
}

export default function TopBrandsScreen() {
  const router = useRouter();
  const [brands, setBrands] = useState<BrandStat[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadBrands = useCallback(async () => {
    try {
      const snap = await getDocs(
        query(collection(db, 'brand_stats'), orderBy('listings', 'desc'), limit(20))
      );
      if (snap.docs.length > 0) {
        setBrands(snap.docs.map((d, i) => ({
          rank: i + 1,
          name: d.id,
          listings: (d.data() as any).listings || 0,
          avgPrice: (d.data() as any).avgPrice || 0,
          satisfaction: (d.data() as any).satisfaction || 0,
          change: (d.data() as any).change || '0%',
        })));
      }
    } catch (err) {
      logger.error('Failed to load brand stats', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { loadBrands(); }, [loadBrands]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadBrands();
  }, [loadBrands]);

  const renderBrand = ({ item, index }: { item: BrandStat; index: number }) => {
    const rankColors = index === 0 ? '#FFD700' : index === 1 ? '#C0C0C0' : index === 2 ? '#CD7F32' : colors.text.secondary;
    const isPositive = item.change.startsWith('+');

    return (
      <Animated.View entering={FadeInDown.delay(index * 60)}>
        <TouchableOpacity style={styles.brandCard} onPress={() => router.push('/all-cars' as any)} activeOpacity={0.7}>
          <View style={[styles.rankBadge, index < 3 && { backgroundColor: rankColors + '20' }]}>
            {index < 3 ? <Trophy size={18} color={rankColors} /> : <Text style={styles.rankText}>{item.rank}</Text>}
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.brandName}>{item.name}</Text>
            <View style={styles.brandMeta}>
              <Text style={styles.metaText}>{item.listings} обяви</Text>
              <Text style={styles.metaDot}>·</Text>
              <Text style={styles.metaText}>~€{(item.avgPrice / 1000).toFixed(1)}K</Text>
              <Text style={styles.metaDot}>·</Text>
              <Star size={12} color={colors.accent.gold} fill={colors.accent.gold} />
              <Text style={styles.metaText}>{item.satisfaction}</Text>
            </View>
          </View>
          <View style={{ alignItems: 'flex-end', gap: 4 }}>
            <View style={[styles.changeBadge, { backgroundColor: isPositive ? '#ECFDF5' : '#FEF2F2' }]}>
              <TrendingUp size={12} color={isPositive ? colors.status.success : colors.status.error} style={!isPositive ? { transform: [{ rotate: '180deg' }] } : {}} />
              <Text style={[styles.changeText, { color: isPositive ? colors.status.success : colors.status.error }]}>{item.change}</Text>
            </View>
            <ChevronRight size={16} color={colors.text.disabled} />
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.iconBtn}><ArrowLeft size={24} color={colors.text.primary} /></TouchableOpacity>
        <Text style={styles.headerTitle}>Топ марки</Text>
        <View style={{ width: 44 }} />
      </View>

      <FlatList
        data={brands}
        keyExtractor={item => item.name}
        renderItem={renderBrand}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={colors.primary.main} />
        }
        ListEmptyComponent={
          loading ? (
            <View style={{ alignItems: 'center', padding: 60 }}>
              <ActivityIndicator size="large" color={colors.primary.main} />
              <Text style={{ color: colors.text.secondary, marginTop: 12, fontSize: 15 }}>Loading brands...</Text>
            </View>
          ) : (
            <View style={{ alignItems: 'center', padding: 40 }}>
              <Trophy size={40} color={colors.text.disabled} />
              <Text style={{ color: colors.text.secondary, marginTop: 12, fontSize: 15 }}>
                No brand data available yet
              </Text>
            </View>
          )
        }
        ListHeaderComponent={
          <Animated.View entering={FadeInUp}>
            <LinearGradient colors={[colors.primary.main, '#004488']} style={styles.heroCard}>
              <Trophy size={28} color={colors.accent.gold} />
              <Text style={styles.heroTitle}>Класация БГ {new Date().getFullYear()}</Text>
              <Text style={styles.heroDesc}>Най-търсените марки автомобили в България по брой обяви, среден рейтинг и тенденция</Text>
            </LinearGradient>
          </Animated.View>
        }
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
  heroCard: { marginHorizontal: 16, marginTop: 16, borderRadius: 16, padding: 24, alignItems: 'center', marginBottom: 8 },
  heroTitle: { fontSize: 22, fontWeight: '800', color: '#FFF', marginTop: 10 },
  heroDesc: { fontSize: 14, color: 'rgba(255,255,255,0.7)', textAlign: 'center', marginTop: 8, lineHeight: 20 },
  list: { paddingBottom: 100 },
  brandCard: {
    flexDirection: 'row', alignItems: 'center', gap: 12, marginHorizontal: 16, marginTop: 10,
    backgroundColor: colors.background.paper, borderRadius: 14, padding: 14,
    ...Platform.select({ ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 6 }, android: { elevation: 2 } }),
  },
  rankBadge: {
    width: 42, height: 42, borderRadius: 12, backgroundColor: colors.background.default,
    alignItems: 'center', justifyContent: 'center',
  },
  rankText: { fontSize: 16, fontWeight: '700', color: colors.text.secondary },
  brandName: { fontSize: 16, fontWeight: '700', color: colors.text.primary },
  brandMeta: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 3 },
  metaText: { fontSize: 12, color: colors.text.secondary },
  metaDot: { fontSize: 12, color: colors.text.disabled },
  changeBadge: { flexDirection: 'row', alignItems: 'center', gap: 3, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  changeText: { fontSize: 12, fontWeight: '700' },
});
