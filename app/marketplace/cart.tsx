/**
 * Koli One — Shopping Cart
 */
import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList, Platform, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import Animated, { FadeInDown, SlideOutRight } from 'react-native-reanimated';
import { ArrowLeft, Trash2, ShoppingBag, Plus, Minus } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors } from '../../src/styles/theme';
import { logger } from '../../src/services/logger-service';

const CART_STORAGE_KEY = 'koli_one_cart';

interface CartItem {
  id: string; name: string; price: number; qty: number; image: string;
}

export default function CartScreen() {
  const router = useRouter();
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Load cart from AsyncStorage on mount
  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(CART_STORAGE_KEY);
        if (raw) setItems(JSON.parse(raw));
      } catch (err) {
        logger.error('Failed to load cart', err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Persist cart on every change
  useEffect(() => {
    if (!loading) {
      AsyncStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items)).catch(err =>
        logger.error('Failed to save cart', err)
      );
    }
  }, [items, loading]);

  const updateQty = (id: string, delta: number) => {
    setItems(prev => prev.map(i => i.id === id ? { ...i, qty: Math.max(1, i.qty + delta) } : i));
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const removeItem = (id: string) => {
    setItems(prev => prev.filter(i => i.id !== id));
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
  };

  const subtotal = items.reduce((s, i) => s + i.price * i.qty, 0);
  const delivery = subtotal > 100 ? 0 : 8;
  const total = subtotal + delivery;

  const renderItem = ({ item, index }: { item: CartItem; index: number }) => (
    <Animated.View entering={FadeInDown.delay(index * 80)} exiting={SlideOutRight} style={styles.itemCard}>
      <Image source={{ uri: item.image }} style={styles.itemImg} contentFit="cover" />
      <View style={styles.itemInfo}>
        <Text style={styles.itemName} numberOfLines={2}>{item.name}</Text>
        <Text style={styles.itemPrice}>€{item.price}</Text>
        <View style={styles.qtyRow}>
          <TouchableOpacity onPress={() => updateQty(item.id, -1)} style={styles.qtyBtn}><Minus size={16} color={colors.text.secondary} /></TouchableOpacity>
          <Text style={styles.qtyVal}>{item.qty}</Text>
          <TouchableOpacity onPress={() => updateQty(item.id, 1)} style={styles.qtyBtn}><Plus size={16} color={colors.text.secondary} /></TouchableOpacity>
        </View>
      </View>
      <TouchableOpacity onPress={() => removeItem(item.id)} style={styles.removeBtn}>
        <Trash2 size={18} color={colors.status.error} />
      </TouchableOpacity>
    </Animated.View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.iconBtn}><ArrowLeft size={24} color={colors.text.primary} /></TouchableOpacity>
        <Text style={styles.headerTitle}>Кошница ({items.length})</Text>
        <View style={{ width: 44 }} />
      </View>

      {items.length === 0 ? (
        <View style={styles.empty}>
          <ShoppingBag size={64} color={colors.text.disabled} />
          <Text style={styles.emptyTitle}>Кошницата е празна</Text>
          <Text style={styles.emptyDesc}>Добавете продукти от маркетплейса</Text>
          <TouchableOpacity style={styles.shopBtn} onPress={() => router.push('/marketplace' as any)}>
            <Text style={styles.shopBtnText}>Разгледай продукти</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <FlatList data={items} renderItem={renderItem} keyExtractor={i => i.id} contentContainerStyle={styles.list} />
          {/* Summary */}
          <View style={styles.summary}>
            <View style={styles.sumRow}><Text style={styles.sumLabel}>Подсума</Text><Text style={styles.sumVal}>€{subtotal}</Text></View>
            <View style={styles.sumRow}>
              <Text style={styles.sumLabel}>Доставка</Text>
              <Text style={[styles.sumVal, delivery === 0 && { color: colors.status.success }]}>{delivery === 0 ? 'Безплатна' : `€${delivery}`}</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.sumRow}><Text style={styles.totalLabel}>Общо</Text><Text style={styles.totalVal}>€{total}</Text></View>
            <TouchableOpacity
              style={styles.checkoutBtn}
              onPress={() => router.push('/marketplace/checkout' as any)}
              activeOpacity={0.8}
            >
              <Text style={styles.checkoutText}>Към плащане</Text>
            </TouchableOpacity>
          </View>
        </>
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
  headerTitle: { fontSize: 20, fontWeight: '700', color: colors.text.primary },
  list: { padding: 16, gap: 12, paddingBottom: 16 },
  itemCard: {
    flexDirection: 'row', padding: 12, backgroundColor: colors.background.paper, borderRadius: 14,
    ...Platform.select({ ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 6 }, android: { elevation: 2 } }),
  },
  itemImg: { width: 80, height: 80, borderRadius: 10 },
  itemInfo: { flex: 1, marginLeft: 12 },
  itemName: { fontSize: 15, fontWeight: '600', color: colors.text.primary },
  itemPrice: { fontSize: 16, fontWeight: '700', color: colors.brand.orange, marginTop: 4 },
  qtyRow: { flexDirection: 'row', alignItems: 'center', marginTop: 8, gap: 6 },
  qtyBtn: { width: 30, height: 30, borderRadius: 8, borderWidth: 1, borderColor: colors.border.default, alignItems: 'center', justifyContent: 'center' },
  qtyVal: { fontSize: 15, fontWeight: '700', color: colors.text.primary, minWidth: 24, textAlign: 'center' },
  removeBtn: { padding: 8 },
  summary: {
    paddingHorizontal: 16, paddingVertical: 16, paddingBottom: Platform.OS === 'ios' ? 28 : 16,
    backgroundColor: colors.background.paper, borderTopWidth: 1, borderTopColor: colors.border.light,
  },
  sumRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  sumLabel: { fontSize: 15, color: colors.text.secondary },
  sumVal: { fontSize: 15, fontWeight: '600', color: colors.text.primary },
  divider: { height: 1, backgroundColor: colors.border.light, marginVertical: 8 },
  totalLabel: { fontSize: 18, fontWeight: '700', color: colors.text.primary },
  totalVal: { fontSize: 22, fontWeight: '800', color: colors.brand.orange },
  checkoutBtn: { marginTop: 14, backgroundColor: colors.brand.orange, height: 52, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  checkoutText: { color: '#FFF', fontSize: 17, fontWeight: '700' },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12, padding: 32 },
  emptyTitle: { fontSize: 20, fontWeight: '700', color: colors.text.primary },
  emptyDesc: { fontSize: 15, color: colors.text.secondary },
  shopBtn: { marginTop: 12, paddingHorizontal: 24, paddingVertical: 12, backgroundColor: colors.primary.main, borderRadius: 12 },
  shopBtnText: { color: '#FFF', fontSize: 15, fontWeight: '600' },
});
