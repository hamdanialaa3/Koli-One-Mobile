/**
 * Koli One — Billing & Payment History
 */
import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList, Platform, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { ArrowLeft, CreditCard, Receipt, Download, ChevronRight, Plus, CheckCircle, XCircle, Clock } from 'lucide-react-native';
import { colors } from '../../src/styles/theme';
import { collection, query, orderBy, getDocs, limit } from 'firebase/firestore';
import { db } from '../../src/services/firebase';
import { getAuth } from 'firebase/auth';
import { logger } from '../../src/services/logger-service';

interface Transaction {
  id: string;
  type: string;
  label: string;
  amount: number;
  date: string;
  status: string;
}

interface PaymentMethod {
  id: string;
  type: string;
  label: string;
  last4: string;
  primary: boolean;
}

export default function BillingScreen() {
  const router = useRouter();
  const [tab, setTab] = useState<'history' | 'methods'>('history');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const uid = getAuth().currentUser?.uid;
    if (!uid) { setLoading(false); return; }

    (async () => {
      try {
        // Fetch billing history
        const txSnap = await getDocs(
          query(collection(db, 'users', uid, 'billing_history'), orderBy('createdAt', 'desc'), limit(30))
        );
        setTransactions(txSnap.docs.map(d => {
          const data = d.data();
          const ts = data.createdAt?.toDate?.();
          return {
            id: d.id,
            type: data.type || 'payment',
            label: data.label || data.description || '',
            amount: data.amount || 0,
            date: ts ? ts.toLocaleDateString('bg-BG') : (data.date || ''),
            status: data.status || 'paid',
          };
        }));

        // Fetch payment methods
        const pmSnap = await getDocs(collection(db, 'users', uid, 'payment_methods'));
        setPaymentMethods(pmSnap.docs.map(d => {
          const data = d.data();
          return {
            id: d.id,
            type: data.type || 'card',
            label: data.label || data.brand || 'Карта',
            last4: data.last4 ? `•••• ${data.last4}` : '',
            primary: data.primary || false,
          };
        }));
      } catch (err) {
        logger.error('Failed to load billing data', err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const statusIcon = (status: string) => {
    switch (status) {
      case 'paid': return <CheckCircle size={16} color={colors.status.success} />;
      case 'refunded': return <Clock size={16} color={colors.accent.gold} />;
      default: return <XCircle size={16} color={colors.status.error} />;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.iconBtn}><ArrowLeft size={24} color={colors.text.primary} /></TouchableOpacity>
        <Text style={styles.headerTitle}>Плащания</Text>
        <View style={{ width: 44 }} />
      </View>

      {/* Summary Card */}
      <Animated.View entering={FadeInUp} style={styles.summaryCard}>
        <View>
          <Text style={styles.sumLabel}>Текущ план</Text>
          <Text style={styles.sumPlan}>Premium</Text>
        </View>
        <View style={{ alignItems: 'flex-end' }}>
          <Text style={styles.sumLabel}>Следващо плащане</Text>
          <Text style={styles.sumDate}>01.07.2025</Text>
          <Text style={styles.sumAmount}>€19.99</Text>
        </View>
      </Animated.View>

      {/* Tabs */}
      <View style={styles.tabs}>
        <TouchableOpacity style={[styles.tab, tab === 'history' && styles.tabActive]} onPress={() => setTab('history')}>
          <Receipt size={16} color={tab === 'history' ? colors.brand.orange : colors.text.secondary} />
          <Text style={[styles.tabText, tab === 'history' && styles.tabTextActive]}>История</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.tab, tab === 'methods' && styles.tabActive]} onPress={() => setTab('methods')}>
          <CreditCard size={16} color={tab === 'methods' ? colors.brand.orange : colors.text.secondary} />
          <Text style={[styles.tabText, tab === 'methods' && styles.tabTextActive]}>Методи</Text>
        </TouchableOpacity>
      </View>

      {tab === 'history' ? (
        <FlatList
          data={transactions}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <View style={{ alignItems: 'center', padding: 40 }}>
              <Text style={{ fontSize: 16, color: colors.text.secondary, textAlign: 'center' }}>
                Няма налична история на плащанията
              </Text>
            </View>
          }
          renderItem={({ item, index }) => (
            <Animated.View entering={FadeInDown.delay(index * 50)}>
              <TouchableOpacity style={styles.transCard}>
                {statusIcon(item.status)}
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={styles.transLabel}>{item.label}</Text>
                  <Text style={styles.transDate}>{item.date}</Text>
                </View>
                <Text style={[styles.transAmount, item.amount > 0 && styles.refundAmount]}>
                  {item.amount > 0 ? '+' : ''}€{Math.abs(item.amount).toFixed(2)}
                </Text>
              </TouchableOpacity>
            </Animated.View>
          )}
        />
      ) : (
        <View style={styles.methodsContainer}>
          {paymentMethods.map((method, i) => (
            <Animated.View key={method.id} entering={FadeInDown.delay(i * 60)}>
              <TouchableOpacity style={styles.methodCard}>
                <CreditCard size={22} color={method.primary ? colors.brand.orange : colors.text.secondary} />
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={styles.methodLabel}>{method.label}</Text>
                  <Text style={styles.methodLast4}>{method.last4}</Text>
                </View>
                {method.primary && <View style={styles.primaryBadge}><Text style={styles.primaryText}>Основен</Text></View>}
                <ChevronRight size={18} color={colors.text.disabled} />
              </TouchableOpacity>
            </Animated.View>
          ))}
          <TouchableOpacity style={styles.addMethodBtn}>
            <Plus size={20} color={colors.brand.orange} />
            <Text style={styles.addMethodText}>Добави метод за плащане</Text>
          </TouchableOpacity>
        </View>
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
  summaryCard: {
    flexDirection: 'row', justifyContent: 'space-between', marginHorizontal: 16, marginTop: 16,
    backgroundColor: colors.primary.main, borderRadius: 16, padding: 20,
  },
  sumLabel: { fontSize: 12, color: 'rgba(255,255,255,0.6)' },
  sumPlan: { fontSize: 22, fontWeight: '800', color: '#FFF', marginTop: 2 },
  sumDate: { fontSize: 14, fontWeight: '600', color: '#FFF', marginTop: 2 },
  sumAmount: { fontSize: 18, fontWeight: '800', color: colors.brand.orange, marginTop: 2 },
  tabs: { flexDirection: 'row', marginHorizontal: 16, marginTop: 16, backgroundColor: colors.background.paper, borderRadius: 12, padding: 4 },
  tab: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 10, borderRadius: 10 },
  tabActive: { backgroundColor: '#F3E8FF' },
  tabText: { fontSize: 14, fontWeight: '500', color: colors.text.secondary },
  tabTextActive: { fontWeight: '700', color: colors.brand.orange },
  list: { padding: 16, gap: 8 },
  transCard: {
    flexDirection: 'row', alignItems: 'center', padding: 14, backgroundColor: colors.background.paper,
    borderRadius: 12, ...Platform.select({ ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 4 }, android: { elevation: 1 } }),
  },
  transLabel: { fontSize: 14, fontWeight: '600', color: colors.text.primary },
  transDate: { fontSize: 12, color: colors.text.secondary, marginTop: 2 },
  transAmount: { fontSize: 16, fontWeight: '700', color: colors.text.primary },
  refundAmount: { color: colors.status.success },
  methodsContainer: { padding: 16, gap: 10 },
  methodCard: {
    flexDirection: 'row', alignItems: 'center', padding: 16, backgroundColor: colors.background.paper,
    borderRadius: 14, ...Platform.select({ ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 4 }, android: { elevation: 1 } }),
  },
  methodLabel: { fontSize: 15, fontWeight: '600', color: colors.text.primary },
  methodLast4: { fontSize: 13, color: colors.text.secondary, marginTop: 2 },
  primaryBadge: { backgroundColor: '#F3E8FF', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6, marginRight: 8 },
  primaryText: { color: colors.brand.orange, fontSize: 11, fontWeight: '700' },
  addMethodBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    borderWidth: 1.5, borderStyle: 'dashed', borderColor: colors.brand.orange, borderRadius: 14,
    paddingVertical: 16, marginTop: 4,
  },
  addMethodText: { color: colors.brand.orange, fontSize: 15, fontWeight: '600' },
});
