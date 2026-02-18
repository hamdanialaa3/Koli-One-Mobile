/**
 * Koli One — AI History Report Screen
 */
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Platform, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowLeft, FileSearch, ShieldCheck, AlertTriangle, CheckCircle } from 'lucide-react-native';
import { colors } from '../../src/styles/theme';
import { vinCheckService } from '../../src/services/VinCheckService';
import { Alert } from 'react-native';

export default function AIHistoryScreen() {
  const router = useRouter();
  const [vin, setVin] = useState('');
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<any>(null);

  const [error, setError] = useState<string | null>(null);

  const handleCheck = async () => {
    if (vin.length < 11) return;
    setLoading(true);
    setError(null);
    try {
      const result = await vinCheckService.checkVin(vin.toUpperCase()) as any;
      const historyInfo = result.historyInfo || {};
      const vehicleInfo = result.vehicleInfo || {};
      setReport({
        accidents: historyInfo.accidents ?? 0,
        owners: historyInfo.owners ?? 0,
        recalls: historyInfo.recalls?.length ?? 0,
        mileageVerified: historyInfo.mileageVerified ?? false,
        stolen: historyInfo.stolen ?? false,
        services: historyInfo.serviceHistory ?? [],
        vehicleInfo,
        trustScore: result.trustScore,
        disclaimer: '⚠️ Данните са от NHTSA и crowdsourced източници. Не заменят професионална проверка.',
      });
    } catch (e: any) {
      setError(e?.message || 'Грешка при проверка на VIN');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={['#003366', '#004488']} style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.back}>
          <ArrowLeft size={24} color="#FFF" />
        </TouchableOpacity>
        <FileSearch size={32} color={colors.brand.orange} />
        <Text style={styles.title}>AI История на автомобила</Text>
        <Text style={styles.sub}>Проверка по VIN номер</Text>
      </LinearGradient>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        {!report ? (
          <Animated.View entering={FadeInDown.delay(200)} style={styles.card}>
            <Text style={styles.inputLabel}>VIN номер</Text>
            <TextInput
              style={styles.vinInput} value={vin} onChangeText={setVin}
              placeholder="Въведете VIN (17 символа)" maxLength={17}
              autoCapitalize="characters" placeholderTextColor={colors.text.tertiary}
            />
            <Text style={styles.hint}>VIN номерът се намира на шасито или в талона</Text>
            <TouchableOpacity
              style={[styles.checkBtn, vin.length < 11 && { opacity: 0.4 }]}
              onPress={handleCheck} disabled={vin.length < 11 || loading}
            >
              <LinearGradient colors={['#7B2FBE', '#9C5FE0']} style={styles.gradBtn}>
                {loading ? <ActivityIndicator color="#FFF" /> :
                  <Text style={styles.btnText}>🔍 Провери историята</Text>}
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>
        ) : (
          <>
            <Animated.View entering={FadeInDown.delay(100)} style={styles.card}>
              <Text style={styles.reportTitle}>Резултат от проверката</Text>
              <View style={styles.statusRow}>
                {[
                  { icon: <ShieldCheck size={20} color={colors.status.success} />, label: 'Не е крадена', ok: !report.stolen },
                  { icon: <CheckCircle size={20} color={colors.status.success} />, label: 'Пробег верифициран', ok: report.mileageVerified },
                  { icon: <AlertTriangle size={20} color={report.accidents > 0 ? colors.status.error : colors.status.success} />, label: `${report.accidents} катастрофи`, ok: report.accidents === 0 },
                ].map((item, i) => (
                  <View key={i} style={[styles.statusCard, item.ok && styles.statusOk]}>
                    {item.icon}
                    <Text style={styles.statusText}>{item.label}</Text>
                  </View>
                ))}
              </View>
              <View style={styles.infoRow}>
                <View style={styles.infoItem}>
                  <Text style={styles.infoValue}>{report.owners}</Text>
                  <Text style={styles.infoLabel}>Собственици</Text>
                </View>
                <View style={styles.infoItem}>
                  <Text style={styles.infoValue}>{report.recalls}</Text>
                  <Text style={styles.infoLabel}>Отзовавания</Text>
                </View>
                <View style={styles.infoItem}>
                  <Text style={styles.infoValue}>{report.services.length}</Text>
                  <Text style={styles.infoLabel}>Сервизи</Text>
                </View>
              </View>
            </Animated.View>

            <Animated.View entering={FadeInDown.delay(200)} style={styles.card}>
              <Text style={styles.sectionTitle}>Сервизна история</Text>
              {report.services.map((s: any, i: number) => (
                <View key={i} style={styles.serviceRow}>
                  <View style={styles.serviceDot} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.serviceType}>{s.type}</Text>
                    <Text style={styles.serviceInfo}>{s.date} • {s.km.toLocaleString()} км</Text>
                  </View>
                </View>
              ))}
            </Animated.View>

            <TouchableOpacity style={styles.newBtn} onPress={() => { setReport(null); setVin(''); }}>
              <Text style={styles.newBtnText}>Нова проверка</Text>
            </TouchableOpacity>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background.default },
  header: { alignItems: 'center', paddingVertical: 20, paddingHorizontal: 20, gap: 8 },
  back: { position: 'absolute', left: 16, top: 12, width: 40, height: 40, justifyContent: 'center' },
  title: { fontSize: 24, fontWeight: '800', color: '#FFF' },
  sub: { fontSize: 14, color: 'rgba(255,255,255,0.6)' },
  scroll: { flex: 1 },
  scrollContent: { padding: 20, paddingBottom: 40 },
  card: {
    backgroundColor: colors.background.paper, borderRadius: 16, padding: 20, marginBottom: 16,
    ...Platform.select({ ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 8 }, android: { elevation: 3 } }),
  },
  inputLabel: { fontSize: 14, fontWeight: '600', color: colors.text.secondary, marginBottom: 8 },
  vinInput: {
    height: 56, borderRadius: 14, borderWidth: 2, borderColor: colors.border.default,
    paddingHorizontal: 16, fontSize: 20, fontWeight: '700', letterSpacing: 2,
    color: colors.text.primary, textAlign: 'center', fontFamily: 'SpaceMono',
  },
  hint: { fontSize: 12, color: colors.text.tertiary, textAlign: 'center', marginVertical: 12 },
  checkBtn: { borderRadius: 14, overflow: 'hidden' },
  gradBtn: { paddingVertical: 16, alignItems: 'center', borderRadius: 14 },
  btnText: { color: '#FFF', fontSize: 17, fontWeight: '700' },
  reportTitle: { fontSize: 20, fontWeight: '800', color: colors.text.primary, marginBottom: 16 },
  statusRow: { gap: 10, marginBottom: 20 },
  statusCard: {
    flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, borderRadius: 12,
    backgroundColor: colors.background.subtle, borderWidth: 1, borderColor: colors.border.light,
  },
  statusOk: { borderColor: 'rgba(40,167,69,0.2)', backgroundColor: 'rgba(40,167,69,0.04)' },
  statusText: { fontSize: 15, fontWeight: '600', color: colors.text.primary },
  infoRow: { flexDirection: 'row', justifyContent: 'space-around' },
  infoItem: { alignItems: 'center' },
  infoValue: { fontSize: 24, fontWeight: '800', color: colors.primary.main },
  infoLabel: { fontSize: 12, color: colors.text.secondary, marginTop: 4 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: colors.text.primary, marginBottom: 16 },
  serviceRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, marginBottom: 16 },
  serviceDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: colors.brand.orange, marginTop: 6 },
  serviceType: { fontSize: 15, fontWeight: '600', color: colors.text.primary },
  serviceInfo: { fontSize: 13, color: colors.text.secondary, marginTop: 2 },
  newBtn: { alignItems: 'center', paddingVertical: 14 },
  newBtnText: { color: colors.brand.orange, fontSize: 16, fontWeight: '600' },
});
