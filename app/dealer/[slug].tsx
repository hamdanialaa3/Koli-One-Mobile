/**
 * Koli One — Public Dealer Page
 */
import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList, Platform, Linking, ActivityIndicator, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowLeft, MapPin, Phone, Globe, Star, Clock, Car, Shield, MessageCircle } from 'lucide-react-native';
import { colors } from '../../src/styles/theme';
import { doc, getDoc, collection, query, where, getDocs, limit } from 'firebase/firestore';
import { db } from '../../src/services/firebase';
import { logger } from '../../src/services/logger-service';

interface DealerData {
  name: string;
  verified: boolean;
  rating: number;
  reviews: number;
  description: string;
  cover: string;
  logo: string;
  address: string;
  phone: string;
  website: string;
  workHours: string;
  totalCars: number;
  stats: { sold: number; years: number; avgRating: number };
}

interface DealerCar {
  id: string;
  title: string;
  year: number;
  price: number;
  km: number;
  image: string;
}

export default function DealerScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const router = useRouter();
  const [tab, setTab] = useState<'cars' | 'info'>('cars');
  const [dealer, setDealer] = useState<DealerData | null>(null);
  const [cars, setCars] = useState<DealerCar[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        // Try fetching dealer by slug (doc ID)
        const docSnap = await getDoc(doc(db, 'dealerships', slug || ''));
        if (docSnap.exists()) {
          const d = docSnap.data();
          setDealer({
            name: d.name || d.displayName || 'Dealer',
            verified: d.verified || false,
            rating: d.rating || 0,
            reviews: d.reviewCount || 0,
            description: d.description || '',
            cover: d.coverImage || d.cover || '',
            logo: d.logo || d.photoURL || '',
            address: d.address || '',
            phone: d.phone || '',
            website: d.website || '',
            workHours: d.workHours || '',
            totalCars: d.totalCars || d.activeAds || 0,
            stats: {
              sold: d.soldCount || 0,
              years: d.yearsActive || 0,
              avgRating: d.rating || 0,
            },
          });

          // Fetch dealer's listings from vehicle collections
          const carSnap = await getDocs(
            query(collection(db, 'passenger_cars'), where('sellerId', '==', slug), limit(20))
          );
          setCars(carSnap.docs.map(c => {
            const cd = c.data();
            return {
              id: c.id,
              title: `${cd.make || ''} ${cd.model || ''}`.trim() || 'Car',
              year: cd.year || 0,
              price: cd.price || 0,
              km: cd.mileage || cd.km || 0,
              image: (cd.images && cd.images[0]) || '',
            };
          }));
        }
      } catch (err) {
        logger.error('Failed to load dealer', err);
      } finally {
        setLoading(false);
      }
    })();
  }, [slug]);

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={colors.primary.main} />
      </View>
    );
  }

  if (!dealer) {
    return (
      <SafeAreaView style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <Car size={48} color={colors.text.disabled} />
        <Text style={{ color: colors.text.secondary, marginTop: 12, fontSize: 16 }}>Дилърът не е намерен</Text>
        <TouchableOpacity onPress={() => router.back()} style={{ marginTop: 16, padding: 12 }}>
          <Text style={{ color: colors.primary.main, fontWeight: '600' }}>Назад</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={tab === 'cars' ? cars : []}
        keyExtractor={item => item.id}
        numColumns={2}
        columnWrapperStyle={styles.carRow}
        contentContainerStyle={styles.carList}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={{ alignItems: 'center', padding: 40 }}>
            <Text style={{ fontSize: 16, color: colors.text.secondary, textAlign: 'center' }}>
              {tab === 'cars' ? 'Няма налични обяви от този дилър' : ''}
            </Text>
          </View>
        }
        ListHeaderComponent={
          <>
            {/* Cover + Profile */}
            <View>
              <Image source={{ uri: dealer.cover }} style={styles.cover} contentFit="cover" />
              <LinearGradient colors={['transparent', 'rgba(0,0,0,0.6)']} style={styles.coverGrad} />
              <SafeAreaView style={styles.coverHeader}>
                <TouchableOpacity onPress={() => router.back()} style={styles.roundBtn}>
                  <ArrowLeft size={22} color="#FFF" />
                </TouchableOpacity>
              </SafeAreaView>
              <View style={styles.profileOverlay}>
                <Image source={{ uri: dealer.logo }} style={styles.logo} contentFit="cover" />
                <View style={{ flex: 1 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <Text style={styles.dealerName}>{dealer.name}</Text>
                    {dealer.verified && <Shield size={16} color={colors.brand.orange} fill={colors.brand.orange} />}
                  </View>
                  <View style={styles.ratingRow}>
                    <Star size={14} color={colors.accent.gold} fill={colors.accent.gold} />
                    <Text style={styles.ratingText}>{dealer.rating} ({dealer.reviews} отзива)</Text>
                  </View>
                </View>
              </View>
            </View>

            {/* Stats */}
            <Animated.View entering={FadeInUp.delay(100)} style={styles.statsRow}>
              {[
                { val: dealer.stats.sold, label: 'Продадени' },
                { val: `${dealer.stats.years} г.`, label: 'Опит' },
                { val: dealer.totalCars, label: 'Обяви' },
              ].map((s, i) => (
                <View key={i} style={styles.statItem}>
                  <Text style={styles.statVal}>{s.val}</Text>
                  <Text style={styles.statLabel}>{s.label}</Text>
                </View>
              ))}
            </Animated.View>

            {/* Description */}
            <Animated.View entering={FadeInUp.delay(200)} style={styles.descCard}>
              <Text style={styles.descText}>{dealer.description}</Text>
            </Animated.View>

            {/* Contact */}
            <Animated.View entering={FadeInUp.delay(300)} style={styles.contactRow}>
              <TouchableOpacity style={styles.contactBtn} onPress={() => Linking.openURL(`tel:${dealer.phone}`)}>
                <Phone size={18} color="#FFF" />
                <Text style={styles.contactBtnText}>Обади се</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.contactBtn, styles.msgBtn]}>
                <MessageCircle size={18} color={colors.primary.main} />
                <Text style={[styles.contactBtnText, { color: colors.primary.main }]}>Съобщение</Text>
              </TouchableOpacity>
            </Animated.View>

            {/* Info Row */}
            <View style={styles.infoSection}>
              {[
                { icon: MapPin, text: dealer.address },
                { icon: Clock, text: dealer.workHours },
                { icon: Globe, text: dealer.website },
              ].map(({ icon: Icon, text }, i) => (
                <View key={i} style={styles.infoRow}>
                  <Icon size={16} color={colors.text.secondary} />
                  <Text style={styles.infoText}>{text}</Text>
                </View>
              ))}
            </View>

            {/* Tabs */}
            <View style={styles.tabs}>
              {(['cars', 'info'] as const).map(t => (
                <TouchableOpacity key={t} style={[styles.tab, tab === t && styles.tabActive]} onPress={() => setTab(t)}>
                  <Text style={[styles.tabText, tab === t && styles.tabTextActive]}>
                    {t === 'cars' ? `Обяви (${dealer.totalCars})` : 'Информация'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </>
        }
        renderItem={({ item, index }) => (
          <Animated.View entering={FadeInDown.delay(index * 60)} style={styles.carCard}>
            <TouchableOpacity onPress={() => router.push({ pathname: '/car/[id]', params: { id: item.id } })} activeOpacity={0.7}>
              <Image source={{ uri: item.image }} style={styles.carImage} contentFit="cover" transition={200} />
              <View style={styles.carInfo}>
                <Text style={styles.carTitle} numberOfLines={1}>{item.title}</Text>
                <Text style={styles.carMeta}>{item.year} · {(item.km / 1000).toFixed(0)}K км</Text>
                <Text style={styles.carPrice}>€{item.price.toLocaleString()}</Text>
              </View>
            </TouchableOpacity>
          </Animated.View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background.default },
  cover: { width: '100%', height: 200 },
  coverGrad: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 100 },
  coverHeader: { position: 'absolute', top: 0, left: 0, right: 0, paddingHorizontal: 12 },
  roundBtn: { width: 42, height: 42, borderRadius: 21, backgroundColor: 'rgba(0,0,0,0.35)', alignItems: 'center', justifyContent: 'center' },
  profileOverlay: {
    flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16, marginTop: -40,
  },
  logo: { width: 72, height: 72, borderRadius: 36, borderWidth: 3, borderColor: '#FFF' },
  dealerName: { fontSize: 20, fontWeight: '700', color: colors.text.primary },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 },
  ratingText: { fontSize: 13, color: colors.text.secondary },
  statsRow: {
    flexDirection: 'row', justifyContent: 'space-around', marginHorizontal: 16, marginTop: 16,
    backgroundColor: colors.background.paper, borderRadius: 14, padding: 16,
    ...Platform.select({ ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 6 }, android: { elevation: 2 } }),
  },
  statItem: { alignItems: 'center' },
  statVal: { fontSize: 20, fontWeight: '800', color: colors.brand.orange },
  statLabel: { fontSize: 12, color: colors.text.secondary, marginTop: 2 },
  descCard: { marginHorizontal: 16, marginTop: 14 },
  descText: { fontSize: 14, lineHeight: 20, color: colors.text.secondary },
  contactRow: { flexDirection: 'row', gap: 10, marginHorizontal: 16, marginTop: 14 },
  contactBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    backgroundColor: colors.primary.main, height: 46, borderRadius: 12,
  },
  msgBtn: { backgroundColor: colors.background.paper, borderWidth: 1, borderColor: colors.primary.main },
  contactBtnText: { fontSize: 15, fontWeight: '600', color: '#FFF' },
  infoSection: { marginHorizontal: 16, marginTop: 14, gap: 8 },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  infoText: { fontSize: 13, color: colors.text.secondary, flex: 1 },
  tabs: { flexDirection: 'row', marginHorizontal: 16, marginTop: 18, borderBottomWidth: 1, borderBottomColor: colors.border.light },
  tab: { flex: 1, alignItems: 'center', paddingVertical: 12 },
  tabActive: { borderBottomWidth: 2, borderBottomColor: colors.brand.orange },
  tabText: { fontSize: 15, fontWeight: '500', color: colors.text.secondary },
  tabTextActive: { fontWeight: '700', color: colors.brand.orange },
  carList: { paddingHorizontal: 12, paddingBottom: 100 },
  carRow: { gap: 10, marginTop: 10 },
  carCard: {
    flex: 1, backgroundColor: colors.background.paper, borderRadius: 12, overflow: 'hidden',
    ...Platform.select({ ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 6 }, android: { elevation: 2 } }),
  },
  carImage: { width: '100%', height: 120 },
  carInfo: { padding: 10 },
  carTitle: { fontSize: 14, fontWeight: '600', color: colors.text.primary },
  carMeta: { fontSize: 12, color: colors.text.secondary, marginTop: 2 },
  carPrice: { fontSize: 16, fontWeight: '800', color: colors.brand.orange, marginTop: 4 },
});
