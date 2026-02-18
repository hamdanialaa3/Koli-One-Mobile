/**
 * Koli One — Car History (VIN check + history timeline for a specific car)
 */
import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Platform, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import Animated, { FadeInUp, FadeInDown } from 'react-native-reanimated';
import { ArrowLeft, Shield, AlertTriangle, CheckCircle, Clock, FileText, Wrench, Users, Car, Download } from 'lucide-react-native';
import { colors } from '../../../src/styles/theme';
import { vinCheckService } from '../../../src/services/VinCheckService';
import { db } from '../../../src/services/firebase';
import { doc, getDoc } from 'firebase/firestore';

const typeIcon = (type: string) => {
  switch (type) {
    case 'inspection': return { icon: FileText, color: colors.status.success };
    case 'service': return { icon: Wrench, color: colors.primary.main };
    case 'owner': return { icon: Users, color: colors.brand.orange };
    case 'accident': return { icon: AlertTriangle, color: colors.status.error };
    case 'registration': return { icon: Car, color: colors.accent.gold };
    default: return { icon: Clock, color: colors.text.secondary };
  }
};

export default function CarHistoryScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [historyData, setHistoryData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        // Get VIN from listing doc
        const listingDoc = await getDoc(doc(db, 'listings', id || ''));
        const listing = listingDoc.data();
        const vin = listing?.vin;
        if (!vin) {
          setError('Няма VIN номер за този автомобил');
          setLoading(false);
          return;
        }
        const result = await vinCheckService.checkVin(vin) as any;
        const hi = result.historyInfo || {};
        const vi = result.vehicleInfo || {};
        setHistoryData({
          vin,
          stolenCheck: hi.stolen ?? false,
          accidents: hi.accidents ?? 0,
          owners: hi.owners ?? 0,
          mileage: {
            current: listing?.mileage || 0,
            verified: hi.mileageVerified ?? false,
          },
          recalls: hi.recalls?.length ?? 0,
          timeline: (hi.serviceHistory || []).map((s: any) => ({
            date: s.date || '',
            event: s.type || 'Service',
            type: 'service',
            detail: s.km ? `${s.km.toLocaleString()} km` : '',
          })),
          trustScore: result.trustScore,
        });
      } catch (e: any) {
        setError(e?.message || 'Грешка при зареждане на история');
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.iconBtn}><ArrowLeft size={24} color={colors.text.primary} /></TouchableOpacity>
        <Text style={styles.headerTitle}>История на автомобила</Text>
        <TouchableOpacity style={styles.iconBtn}><Download size={22} color={colors.text.primary} /></TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {loading ? (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: 60 }}>
            <ActivityIndicator size="large" color={colors.primary.main} />
            <Text style={{ marginTop: 12, color: colors.text.secondary }}>Проверка на история...</Text>
          </View>
        ) : error ? (
          <View style={{ alignItems: 'center', paddingTop: 60 }}>
            <AlertTriangle size={48} color={colors.status.error} />
            <Text style={{ marginTop: 16, color: colors.text.primary, fontSize: 16, fontWeight: '600', textAlign: 'center' }}>{error}</Text>
          </View>
        ) : historyData ? (
          <>
        {/* VIN */}
        <Animated.View entering={FadeInUp} style={styles.vinCard}>
          <Text style={styles.vinLabel}>VIN номер</Text>
          <Text style={styles.vinValue}>{historyData.vin}</Text>
        </Animated.View>

        {/* Quick Stats */}
        <Animated.View entering={FadeInUp.delay(100)} style={styles.statsGrid}>
          <View style={[styles.statCard, { borderLeftColor: historyData.stolenCheck ? colors.status.error : colors.status.success }]}>
            <Shield size={20} color={historyData.stolenCheck ? colors.status.error : colors.status.success} />
            <Text style={styles.statLabel}>Откраднат</Text>
            <Text style={[styles.statValue, { color: historyData.stolenCheck ? colors.status.error : colors.status.success }]}>
              {historyData.stolenCheck ? 'ДА!' : 'Не'}
            </Text>
          </View>
          <View style={[styles.statCard, { borderLeftColor: historyData.accidents > 0 ? colors.accent.gold : colors.status.success }]}>
            <AlertTriangle size={20} color={historyData.accidents > 0 ? colors.accent.gold : colors.status.success} />
            <Text style={styles.statLabel}>Инциденти</Text>
            <Text style={styles.statValue}>{historyData.accidents}</Text>
          </View>
          <View style={[styles.statCard, { borderLeftColor: colors.primary.main }]}>
            <Users size={20} color={colors.primary.main} />
            <Text style={styles.statLabel}>Собственици</Text>
            <Text style={styles.statValue}>{historyData.owners}</Text>
          </View>
          <View style={[styles.statCard, { borderLeftColor: historyData.mileage.verified ? colors.status.success : colors.status.error }]}>
            <CheckCircle size={20} color={historyData.mileage.verified ? colors.status.success : colors.status.error} />
            <Text style={styles.statLabel}>Километраж</Text>
            <Text style={styles.statValue}>{historyData.mileage.current > 0 ? (historyData.mileage.current / 1000).toFixed(0) + 'K км' : '-'}</Text>
          </View>
        </Animated.View>

        {/* Mileage Verification */}
        <Animated.View entering={FadeInUp.delay(200)} style={[styles.mileageCard, historyData.mileage.verified ? styles.mileageOk : styles.mileageWarn]}>
          <CheckCircle size={20} color={historyData.mileage.verified ? colors.status.success : colors.status.error} />
          <View style={{ flex: 1, marginLeft: 10 }}>
            <Text style={styles.mileageTitle}>
              {historyData.mileage.verified ? 'Км. верифициран ✓' : 'Км. НЕ е верифициран'}
            </Text>
            <Text style={styles.mileageDesc}>
              {historyData.mileage.verified
                ? 'Историята на км показва последователно нарастване'
                : 'Открито е несъответствие в записите за километраж'}
            </Text>
          </View>
        </Animated.View>

        {/* Timeline */}
        {historyData.timeline.length > 0 && (
        <Animated.View entering={FadeInUp.delay(300)}>
          <Text style={styles.sectionTitle}>Хронология</Text>
          {historyData.timeline.map((event: any, i: number) => {
            const { icon: Icon, color } = typeIcon(event.type);
            return (
              <Animated.View key={i} entering={FadeInDown.delay(350 + i * 60)} style={styles.timelineItem}>
                {i < historyData.timeline.length - 1 && <View style={styles.timelineLine} />}
                <View style={[styles.timelineDot, { backgroundColor: color + '20', borderColor: color }]}>
                  <Icon size={16} color={color} />
                </View>
                <View style={styles.timelineContent}>
                  <Text style={styles.timelineDate}>{event.date}</Text>
                  <Text style={styles.timelineEvent}>{event.event}</Text>
                  <Text style={styles.timelineDetail}>{event.detail}</Text>
                </View>
              </Animated.View>
            );
          })}
        </Animated.View>
        )}
          </>
        ) : null}

        <View style={{ height: 100 }} />
      </ScrollView>
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
  content: { padding: 16 },
  vinCard: {
    backgroundColor: colors.primary.main, borderRadius: 14, padding: 18, alignItems: 'center',
  },
  vinLabel: { fontSize: 12, color: 'rgba(255,255,255,0.6)', letterSpacing: 1, textTransform: 'uppercase' },
  vinValue: { fontSize: 18, fontWeight: '700', color: '#FFF', marginTop: 4, letterSpacing: 2, fontFamily: Platform.select({ ios: 'Menlo', android: 'monospace' }) },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 16 },
  statCard: {
    width: '47%', backgroundColor: colors.background.paper, borderRadius: 12, padding: 14,
    borderLeftWidth: 3, gap: 6,
    ...Platform.select({ ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 4 }, android: { elevation: 1 } }),
  },
  statLabel: { fontSize: 12, color: colors.text.secondary },
  statValue: { fontSize: 20, fontWeight: '800', color: colors.text.primary },
  mileageCard: {
    flexDirection: 'row', alignItems: 'center', borderRadius: 12, padding: 16, marginTop: 14,
  },
  mileageOk: { backgroundColor: '#ECFDF5', borderWidth: 1, borderColor: '#86EFAC' },
  mileageWarn: { backgroundColor: '#FEF2F2', borderWidth: 1, borderColor: '#FCA5A5' },
  mileageTitle: { fontSize: 15, fontWeight: '700', color: colors.text.primary },
  mileageDesc: { fontSize: 13, color: colors.text.secondary, marginTop: 2 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: colors.text.primary, marginTop: 24, marginBottom: 16 },
  timelineItem: { flexDirection: 'row', marginBottom: 0, minHeight: 80 },
  timelineLine: {
    position: 'absolute', left: 19, top: 40, width: 2, bottom: 0, backgroundColor: colors.border.light,
  },
  timelineDot: {
    width: 40, height: 40, borderRadius: 20, borderWidth: 2, alignItems: 'center', justifyContent: 'center',
  },
  timelineContent: { flex: 1, marginLeft: 14, paddingBottom: 20 },
  timelineDate: { fontSize: 12, color: colors.text.secondary, fontWeight: '500' },
  timelineEvent: { fontSize: 15, fontWeight: '700', color: colors.text.primary, marginTop: 2 },
  timelineDetail: { fontSize: 13, color: colors.text.secondary, marginTop: 4, lineHeight: 18 },
});
