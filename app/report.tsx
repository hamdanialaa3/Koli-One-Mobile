/**
 * Koli One — Report Listing — Flag inappropriate content (Google Play required)
 */
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, StyleSheet, ScrollView, Platform, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { ArrowLeft, AlertTriangle, CheckCircle, Flag, Shield } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { db, auth } from '../src/services/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

const REASONS = [
  { id: 'fake', label: 'Фалшива обява', desc: 'Обявата не е истинска или е подвеждаща' },
  { id: 'scam', label: 'Измама', desc: 'Подозрителна дейност или опит за измама' },
  { id: 'duplicate', label: 'Дублирана обява', desc: 'Вече съществува същата обява' },
  { id: 'wrong_category', label: 'Грешна категория', desc: 'Обявата е в грешна категория' },
  { id: 'offensive', label: 'Обидно съдържание', desc: 'Неподходящ текст или снимки' },
  { id: 'stolen', label: 'Откраднат автомобил', desc: 'Подозирам, че автомобилът е откраднат' },
  { id: 'wrong_info', label: 'Невярна информация', desc: 'Грешни характеристики или цена' },
  { id: 'other', label: 'Друго', desc: 'Друга причина за докладване' },
];

export default function ReportScreen() {
  const router = useRouter();
  const { listingId, title } = useLocalSearchParams();
  const [selectedReason, setSelectedReason] = useState<string | null>(null);
  const [details, setDetails] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!selectedReason) {
      Alert.alert('Изберете причина', 'Моля, изберете причина за докладване.');
      return;
    }
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setSubmitting(true);
    try {
      await addDoc(collection(db, 'reports'), {
        listingId: listingId || null,
        reason: selectedReason,
        description: details.trim() || null,
        reporterId: auth.currentUser?.uid || 'anonymous',
        status: 'pending',
        createdAt: serverTimestamp(),
      });
      setSubmitted(true);
    } catch (error: any) {
      Alert.alert('Грешка', 'Неуспешно изпращане на доклад. Опитайте отново.');
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.successContainer}>
          <Animated.View entering={FadeInDown.delay(200)}>
            <View style={styles.successIcon}>
              <CheckCircle size={64} color="#22C55E" />
            </View>
            <Text style={styles.successTitle}>Благодарим!</Text>
            <Text style={styles.successDesc}>
              Вашият доклад е получен. Нашият екип ще прегледа обявата в рамките на 24 часа.
            </Text>
            <TouchableOpacity style={styles.successBtn} onPress={() => router.back()}>
              <Text style={styles.successBtnText}>Обратно</Text>
            </TouchableOpacity>
          </Animated.View>
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
        <Text style={styles.headerTitle}>Докладване</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 20 }}>
        {/* Warning Banner */}
        <Animated.View entering={FadeInDown.delay(100)} style={styles.warningBanner}>
          <Shield size={20} color="#003366" />
          <Text style={styles.warningText}>
            Докладвайте обяви, които нарушават правилата ни. Вашата самоличност остава поверителна.
          </Text>
        </Animated.View>

        {/* Listing Info */}
        {title && (
          <View style={styles.listingInfo}>
            <Flag size={16} color="#64748B" />
            <Text style={styles.listingTitle} numberOfLines={1}>{title}</Text>
          </View>
        )}

        {/* Reasons */}
        <Text style={styles.sectionLabel}>Изберете причина:</Text>
        {REASONS.map((reason, idx) => (
          <Animated.View key={reason.id} entering={FadeInDown.delay(150 + idx * 50)}>
            <TouchableOpacity
              style={[styles.reasonCard, selectedReason === reason.id && styles.reasonCardActive]}
              onPress={() => {
                setSelectedReason(reason.id);
                Haptics.selectionAsync();
              }}
            >
              <View style={[styles.radio, selectedReason === reason.id && styles.radioActive]}>
                {selectedReason === reason.id && <View style={styles.radioInner} />}
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.reasonLabel, selectedReason === reason.id && { color: '#003366' }]}>
                  {reason.label}
                </Text>
                <Text style={styles.reasonDesc}>{reason.desc}</Text>
              </View>
            </TouchableOpacity>
          </Animated.View>
        ))}

        {/* Details */}
        <Text style={[styles.sectionLabel, { marginTop: 24 }]}>Допълнителни детайли (по желание):</Text>
        <TextInput
          style={styles.textArea}
          placeholder="Опишете проблема..."
          placeholderTextColor="#94A3B8"
          value={details}
          onChangeText={setDetails}
          multiline
          numberOfLines={4}
          maxLength={500}
        />
        <Text style={styles.charCount}>{details.length}/500</Text>

        {/* Submit */}
        <TouchableOpacity
          style={[styles.submitBtn, !selectedReason && styles.submitBtnDisabled]}
          onPress={handleSubmit}
          disabled={!selectedReason || submitting}
        >
          <AlertTriangle size={20} color="#FFF" />
          <Text style={styles.submitBtnText}>
            {submitting ? 'Изпращане...' : 'Изпрати доклад'}
          </Text>
        </TouchableOpacity>

        <Text style={styles.disclaimer}>
          Фалшивите доклади могат да доведат до ограничения на вашия акаунт.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F4F4F4' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12, backgroundColor: '#FFF', borderBottomWidth: 1, borderBottomColor: '#E2E8F0' },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#F1F5F9', alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#1E293B' },
  warningBanner: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: '#EFF6FF', padding: 16, borderRadius: 12, marginBottom: 20, borderWidth: 1, borderColor: '#BFDBFE' },
  warningText: { flex: 1, fontSize: 13, color: '#1E40AF', lineHeight: 18 },
  listingInfo: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#FFF', padding: 12, borderRadius: 8, marginBottom: 20 },
  listingTitle: { flex: 1, fontSize: 14, fontWeight: '600', color: '#334155' },
  sectionLabel: { fontSize: 14, fontWeight: '700', color: '#1E293B', marginBottom: 12 },
  reasonCard: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: '#FFF', padding: 16, borderRadius: 12, marginBottom: 8, borderWidth: 1.5, borderColor: '#E2E8F0' },
  reasonCardActive: { borderColor: '#003366', backgroundColor: '#F0F7FF' },
  radio: { width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: '#CBD5E1', alignItems: 'center', justifyContent: 'center' },
  radioActive: { borderColor: '#003366' },
  radioInner: { width: 12, height: 12, borderRadius: 6, backgroundColor: '#003366' },
  reasonLabel: { fontSize: 15, fontWeight: '600', color: '#334155' },
  reasonDesc: { fontSize: 12, color: '#64748B', marginTop: 2 },
  textArea: { backgroundColor: '#FFF', borderRadius: 12, padding: 16, fontSize: 15, color: '#1E293B', borderWidth: 1, borderColor: '#E2E8F0', textAlignVertical: 'top', minHeight: 100 },
  charCount: { fontSize: 12, color: '#94A3B8', textAlign: 'right', marginTop: 4 },
  submitBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: '#CC0000', paddingVertical: 16, borderRadius: 12, marginTop: 24, ...Platform.select({ ios: { shadowColor: '#CC0000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8 }, android: { elevation: 6 } }) },
  submitBtnDisabled: { opacity: 0.5 },
  submitBtnText: { fontSize: 16, fontWeight: '700', color: '#FFF' },
  successContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 },
  successIcon: { alignSelf: 'center', marginBottom: 24 },
  successTitle: { fontSize: 28, fontWeight: '800', color: '#1E293B', textAlign: 'center', marginBottom: 12 },
  successDesc: { fontSize: 15, color: '#64748B', textAlign: 'center', lineHeight: 22, marginBottom: 32 },
  successBtn: { backgroundColor: '#003366', paddingVertical: 14, paddingHorizontal: 32, borderRadius: 12, alignSelf: 'center' },
  successBtnText: { fontSize: 16, fontWeight: '700', color: '#FFF' },
  disclaimer: { fontSize: 12, color: '#94A3B8', textAlign: 'center', marginTop: 16, marginBottom: 40 },
});
