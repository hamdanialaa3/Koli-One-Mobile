/**
 * Koli One — Product Detail
 */
import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Platform, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import Animated, { FadeInUp, FadeInRight } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowLeft, Heart, Share2, Star, ShoppingCart, Truck, Shield, RotateCcw, PackageX } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { colors } from '../../src/styles/theme';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../src/services/firebase';
import { logger } from '../../src/services/logger-service';

interface ProductData {
  id: string;
  name: string;
  price: number;
  oldPrice: number;
  rating: number;
  reviews: number;
  description: string;
  specs: { label: string; value: string }[];
  images: string[];
  seller: { name: string; rating: number; sales: number };
}

export default function ProductDetailScreen() {
  const { productId } = useLocalSearchParams<{ productId: string }>();
  const router = useRouter();
  const [isFav, setIsFav] = useState(false);
  const [qty, setQty] = useState(1);
  const [activeImg, setActiveImg] = useState(0);
  const [product, setProduct] = useState<ProductData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const snap = await getDoc(doc(db, 'marketplace_products', productId || ''));
        if (snap.exists()) {
          const d = snap.data();
          setProduct({
            id: snap.id,
            name: d.name || d.title || '',
            price: d.price || 0,
            oldPrice: d.oldPrice || d.originalPrice || 0,
            rating: d.rating || 0,
            reviews: d.reviewCount || d.reviews || 0,
            description: d.description || '',
            specs: d.specs || [],
            images: d.images || [],
            seller: {
              name: d.sellerName || d.seller?.name || 'Продавач',
              rating: d.sellerRating || d.seller?.rating || 0,
              sales: d.sellerSales || d.seller?.sales || 0,
            },
          });
        }
      } catch (err) {
        logger.error('Failed to load product', err);
      } finally {
        setLoading(false);
      }
    })();
  }, [productId]);

  const toggleFav = () => {
    setIsFav(!isFav);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>  
        <ActivityIndicator size="large" color={colors.primary.main} />
      </View>
    );
  }

  if (!product) {
    return (
      <SafeAreaView style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <PackageX size={48} color={colors.text.disabled} />
        <Text style={{ color: colors.text.secondary, marginTop: 12, fontSize: 16 }}>Продуктът не е намерен</Text>
        <TouchableOpacity onPress={() => router.back()} style={{ marginTop: 16, padding: 12 }}>
          <Text style={{ color: colors.primary.main, fontWeight: '600' }}>Назад</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} bounces={true}>
        {/* Image Gallery */}
        <View style={styles.gallery}>
          <Image source={{ uri: product.images[activeImg] }} style={styles.mainImage} contentFit="cover" transition={300} />
          <LinearGradient colors={['rgba(0,0,0,0.3)', 'transparent']} style={styles.imgOverlay} />
          <SafeAreaView style={styles.imgHeader}>
            <TouchableOpacity onPress={() => router.back()} style={styles.roundBtn}>
              <ArrowLeft size={22} color="#FFF" />
            </TouchableOpacity>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              <TouchableOpacity onPress={toggleFav} style={styles.roundBtn}>
                <Heart size={22} color="#FFF" fill={isFav ? colors.status.error : 'transparent'} />
              </TouchableOpacity>
              <TouchableOpacity style={styles.roundBtn}>
                <Share2 size={22} color="#FFF" />
              </TouchableOpacity>
            </View>
          </SafeAreaView>
          {/* Thumbnails */}
          <View style={styles.thumbRow}>
            {product.images.map((img, i) => (
              <TouchableOpacity key={i} onPress={() => setActiveImg(i)} style={[styles.thumb, activeImg === i && styles.thumbActive]}>
                <Image source={{ uri: img }} style={styles.thumbImg} contentFit="cover" />
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.content}>
          {/* Title & Price */}
          <Animated.View entering={FadeInUp.delay(100)}>
            <Text style={styles.productName}>{product.name}</Text>
            <View style={styles.ratingRow}>
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} size={16} color={colors.accent.gold} fill={i < Math.floor(product.rating) ? colors.accent.gold : 'transparent'} />
              ))}
              <Text style={styles.ratingLabel}>{product.rating} ({product.reviews} отзива)</Text>
            </View>
            <View style={styles.priceRow}>
              <Text style={styles.price}>€{product.price}</Text>
              {product.oldPrice > 0 && <Text style={styles.oldPrice}>€{product.oldPrice}</Text>}
              {product.oldPrice > 0 && <View style={styles.discountBadge}>
                <Text style={styles.discountText}>-{Math.round((1 - product.price / product.oldPrice) * 100)}%</Text>
              </View>}
            </View>
          </Animated.View>

          {/* Quick Benefits */}
          <Animated.View entering={FadeInUp.delay(200)} style={styles.benefits}>
            {[
              { icon: Truck, label: 'Безплатна доставка' },
              { icon: Shield, label: '2г. гаранция' },
              { icon: RotateCcw, label: '30 дни връщане' },
            ].map(({ icon: Icon, label }, i) => (
              <View key={i} style={styles.benefitItem}>
                <Icon size={18} color={colors.status.success} />
                <Text style={styles.benefitText}>{label}</Text>
              </View>
            ))}
          </Animated.View>

          {/* Description */}
          <Animated.View entering={FadeInUp.delay(300)}>
            <Text style={styles.sectionTitle}>Описание</Text>
            <Text style={styles.description}>{product.description}</Text>
          </Animated.View>

          {/* Specs table */}
          <Animated.View entering={FadeInUp.delay(400)}>
            <Text style={styles.sectionTitle}>Характеристики</Text>
            {product.specs.map((spec, i) => (
              <View key={i} style={[styles.specRow, i % 2 === 0 && styles.specRowAlt]}>
                <Text style={styles.specLabel}>{spec.label}</Text>
                <Text style={styles.specValue}>{spec.value}</Text>
              </View>
            ))}
          </Animated.View>

          {/* Seller */}
          <Animated.View entering={FadeInUp.delay(500)} style={styles.sellerCard}>
            <View style={styles.sellerAvatar}><Text style={styles.sellerInitial}>A</Text></View>
            <View style={{ flex: 1 }}>
              <Text style={styles.sellerName}>{product.seller.name}</Text>
              <Text style={styles.sellerMeta}>⭐ {product.seller.rating} · {product.seller.sales} продажби</Text>
            </View>
            <TouchableOpacity style={styles.sellerBtn}><Text style={styles.sellerBtnText}>Профил</Text></TouchableOpacity>
          </Animated.View>

          <View style={{ height: 120 }} />
        </View>
      </ScrollView>

      {/* Bottom Bar — Add to Cart */}
      <View style={styles.bottomBar}>
        {/* Quantity */}
        <View style={styles.qtyRow}>
          <TouchableOpacity onPress={() => qty > 1 && setQty(qty - 1)} style={styles.qtyBtn}><Text style={styles.qtyBtnText}>−</Text></TouchableOpacity>
          <Text style={styles.qtyVal}>{qty}</Text>
          <TouchableOpacity onPress={() => setQty(qty + 1)} style={styles.qtyBtn}><Text style={styles.qtyBtnText}>+</Text></TouchableOpacity>
        </View>
        <TouchableOpacity
          style={styles.addCartBtn}
          onPress={() => { Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); }}
          activeOpacity={0.8}
        >
          <ShoppingCart size={20} color="#FFF" />
          <Text style={styles.addCartText}>Добави · €{product.price * qty}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background.default },
  gallery: { position: 'relative' },
  mainImage: { width: '100%', height: 360 },
  imgOverlay: { position: 'absolute', top: 0, left: 0, right: 0, height: 100 },
  imgHeader: { position: 'absolute', top: 0, left: 0, right: 0, flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 12 },
  roundBtn: { width: 42, height: 42, borderRadius: 21, backgroundColor: 'rgba(0,0,0,0.35)', alignItems: 'center', justifyContent: 'center' },
  thumbRow: { position: 'absolute', bottom: 12, left: 0, right: 0, flexDirection: 'row', justifyContent: 'center', gap: 8 },
  thumb: { width: 56, height: 56, borderRadius: 10, overflow: 'hidden', borderWidth: 2, borderColor: 'transparent' },
  thumbActive: { borderColor: colors.brand.orange },
  thumbImg: { width: '100%', height: '100%' },
  content: { paddingHorizontal: 16, paddingTop: 16 },
  productName: { fontSize: 22, fontWeight: '700', color: colors.text.primary, lineHeight: 28 },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 8 },
  ratingLabel: { fontSize: 13, color: colors.text.secondary, marginLeft: 4 },
  priceRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 10 },
  price: { fontSize: 28, fontWeight: '800', color: colors.brand.orange },
  oldPrice: { fontSize: 18, color: colors.text.disabled, textDecorationLine: 'line-through' },
  discountBadge: { backgroundColor: colors.status.error, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  discountText: { color: '#FFF', fontSize: 13, fontWeight: '700' },
  benefits: { flexDirection: 'row', justifyContent: 'space-around', marginTop: 16, paddingVertical: 12, backgroundColor: colors.background.paper, borderRadius: 12 },
  benefitItem: { alignItems: 'center', gap: 4 },
  benefitText: { fontSize: 11, color: colors.text.secondary, fontWeight: '500' },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: colors.text.primary, marginTop: 24, marginBottom: 10 },
  description: { fontSize: 15, lineHeight: 22, color: colors.text.secondary },
  specRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10, paddingHorizontal: 12 },
  specRowAlt: { backgroundColor: colors.background.paper, borderRadius: 8 },
  specLabel: { fontSize: 14, color: colors.text.secondary },
  specValue: { fontSize: 14, fontWeight: '600', color: colors.text.primary },
  sellerCard: {
    flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 24, padding: 14,
    backgroundColor: colors.background.paper, borderRadius: 14,
    ...Platform.select({ ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 6 }, android: { elevation: 2 } }),
  },
  sellerAvatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: colors.primary.main, alignItems: 'center', justifyContent: 'center' },
  sellerInitial: { color: '#FFF', fontSize: 18, fontWeight: '700' },
  sellerName: { fontSize: 15, fontWeight: '600', color: colors.text.primary },
  sellerMeta: { fontSize: 13, color: colors.text.secondary, marginTop: 2 },
  sellerBtn: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 8, borderWidth: 1, borderColor: colors.primary.main },
  sellerBtnText: { color: colors.primary.main, fontSize: 13, fontWeight: '600' },
  bottomBar: {
    position: 'absolute', bottom: 0, left: 0, right: 0, flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 12, paddingBottom: Platform.OS === 'ios' ? 28 : 12,
    backgroundColor: colors.background.paper, borderTopWidth: 1, borderTopColor: colors.border.light, gap: 12,
  },
  qtyRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  qtyBtn: { width: 34, height: 34, borderRadius: 8, borderWidth: 1, borderColor: colors.border.default, alignItems: 'center', justifyContent: 'center' },
  qtyBtnText: { fontSize: 18, color: colors.text.primary, fontWeight: '600' },
  qtyVal: { fontSize: 16, fontWeight: '700', color: colors.text.primary, minWidth: 24, textAlign: 'center' },
  addCartBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    backgroundColor: colors.brand.orange, height: 50, borderRadius: 14,
  },
  addCartText: { color: '#FFF', fontSize: 16, fontWeight: '700' },
});
