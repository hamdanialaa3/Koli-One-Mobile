/**
 * Koli One — AI Photo Analysis (snap a car photo → get AI insights)
 */
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Platform, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import Animated, { FadeInUp, BounceIn } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowLeft, Camera, ImageIcon, Scan, Car, AlertTriangle, CheckCircle, Sparkles } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import * as Haptics from 'expo-haptics';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { app } from '../../src/services/firebase';
import { logger } from '../../src/services/logger-service';
import { colors } from '../../src/styles/theme';

export default function AIAnalysisScreen() {
  const router = useRouter();
  const [image, setImage] = useState<string | null>(null);
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<any>(null);

  const functions = getFunctions(app, 'europe-west1');

  const pickImage = async (fromCamera: boolean) => {
    const fn = fromCamera ? ImagePicker.launchCameraAsync : ImagePicker.launchImageLibraryAsync;
    const res = await fn({ quality: 0.8, allowsEditing: true, aspect: [16, 9], base64: true });
    if (!res.canceled) {
      setImage(res.assets[0].uri);
      setImageBase64(res.assets[0].base64 || null);
      setResult(null);
    }
  };

  const analyze = async () => {
    if (!image) return;
    setAnalyzing(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      if (!imageBase64) {
        throw new Error('Няма данни за изображението. Моля, изберете снимка отново.');
      }

      // Call the same Cloud Function the web uses (analyzeCarImage — Gemini 1.5 Flash)
      const analyzeCarImageFn = httpsCallable(functions, 'analyzeCarImage');
      const response = await analyzeCarImageFn({
        imageBase64: imageBase64,
        mimeType: 'image/jpeg',
      });

      const data = response.data as any;

      if (!data || !data.make) {
        throw new Error('AI не можа да разпознае автомобила. Опитайте с по-ясна снимка.');
      }

      logger.info('AI analysis completed', { make: data.make, model: data.model, confidence: data.confidence });

      setResult({
        make: data.make || 'Неизвестна',
        model: data.model || 'Неизвестен',
        year: data.year || '—',
        confidence: data.confidence || 0,
        color: data.color || '—',
        condition: data.condition || '—',
        suggestions: data.suggestions || [],
      });

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error: any) {
      logger.error('AI analysis failed', error);
      Alert.alert(
        'Грешка при анализа',
        error.message || 'Неуспешен анализ. Моля, опитайте отново.',
        [{ text: 'OK' }]
      );
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.iconBtn}><ArrowLeft size={24} color={colors.text.primary} /></TouchableOpacity>
        <Text style={styles.headerTitle}>AI Анализ</Text>
        <Sparkles size={22} color={colors.brand.orange} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Photo upload */}
        {!image ? (
          <Animated.View entering={FadeInUp} style={styles.uploadArea}>
            <LinearGradient colors={['rgba(255,121,0,0.08)', 'rgba(255,121,0,0.02)']} style={styles.uploadGrad}>
              <Scan size={48} color={colors.brand.orange} />
              <Text style={styles.uploadTitle}>Снимайте автомобил</Text>
              <Text style={styles.uploadDesc}>AI ще разпознае марката, модела, цвета и ще оцени стойността</Text>
              <View style={styles.uploadRow}>
                <TouchableOpacity style={styles.uploadBtn} onPress={() => pickImage(true)}>
                  <Camera size={20} color="#FFF" />
                  <Text style={styles.uploadBtnText}>Камера</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.uploadBtn, styles.galleryBtn]} onPress={() => pickImage(false)}>
                  <ImageIcon size={20} color={colors.brand.orange} />
                  <Text style={[styles.uploadBtnText, { color: colors.brand.orange }]}>Галерия</Text>
                </TouchableOpacity>
              </View>
            </LinearGradient>
          </Animated.View>
        ) : (
          <Animated.View entering={FadeInUp}>
            <Image source={{ uri: image }} style={styles.previewImage} contentFit="cover" />
            <View style={styles.previewActions}>
              <TouchableOpacity style={styles.changeBtn} onPress={() => setImage(null)}>
                <Text style={styles.changeBtnText}>Смени снимка</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.analyzeBtn} onPress={analyze} disabled={analyzing}>
                <Sparkles size={18} color="#FFF" />
                <Text style={styles.analyzeBtnText}>{analyzing ? 'Анализирам...' : 'Анализирай'}</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        )}

        {/* Results */}
        {result && (
          <>
            {/* Identification */}
            <Animated.View entering={FadeInUp.delay(100)} style={styles.resultCard}>
              <View style={styles.resultHeader}>
                <Car size={20} color={colors.primary.main} />
                <Text style={styles.resultTitle}>Идентификация</Text>
                <View style={styles.confBadge}><Text style={styles.confText}>{result.confidence}%</Text></View>
              </View>
              <View style={styles.resultGrid}>
                {[
                  { l: 'Марка', v: result.make },
                  { l: 'Модел', v: result.model },
                  { l: 'Год. модел', v: result.year },
                  { l: 'Цвят', v: result.color },
                ].map((r, i) => (
                  <View key={i} style={styles.resultRow}>
                    <Text style={styles.resultLabel}>{r.l}</Text>
                    <Text style={styles.resultValue}>{r.v}</Text>
                  </View>
                ))}
              </View>
            </Animated.View>

            {/* Condition */}
            <Animated.View entering={FadeInUp.delay(200)} style={styles.resultCard}>
              <View style={styles.resultHeader}>
                <CheckCircle size={20} color={colors.status.success} />
                <Text style={styles.resultTitle}>Състояние</Text>
              </View>
              <View style={[styles.condBadge, { backgroundColor: '#ECFDF5' }]}>
                <CheckCircle size={18} color={colors.status.success} />
                <Text style={styles.condText}>{result.condition}</Text>
              </View>
            </Animated.View>

            {/* Suggestions */}
            {result.suggestions && result.suggestions.length > 0 && (
              <Animated.View entering={FadeInUp.delay(300)} style={styles.resultCard}>
                <View style={styles.resultHeader}>
                  <Sparkles size={20} color={colors.brand.orange} />
                  <Text style={styles.resultTitle}>Препоръки от AI</Text>
                </View>
                <View style={styles.featureGrid}>
                  {result.suggestions.map((s: string, i: number) => (
                    <View key={i} style={styles.featureChip}>
                      <AlertTriangle size={14} color={colors.accent.gold} />
                      <Text style={styles.featureText}>{s}</Text>
                    </View>
                  ))}
                </View>
              </Animated.View>
            )}
          </>
        )}

        <View style={{ height: 60 }} />
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
  uploadArea: { borderRadius: 20, overflow: 'hidden', borderWidth: 2, borderStyle: 'dashed', borderColor: colors.brand.orange + '40' },
  uploadGrad: { alignItems: 'center', padding: 40 },
  uploadTitle: { fontSize: 22, fontWeight: '700', color: colors.text.primary, marginTop: 16 },
  uploadDesc: { fontSize: 14, color: colors.text.secondary, textAlign: 'center', marginTop: 8, lineHeight: 20 },
  uploadRow: { flexDirection: 'row', gap: 12, marginTop: 20 },
  uploadBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 20, paddingVertical: 12,
    borderRadius: 12, backgroundColor: colors.brand.orange,
  },
  galleryBtn: { backgroundColor: '#FFF', borderWidth: 1, borderColor: colors.brand.orange },
  uploadBtnText: { color: '#FFF', fontSize: 15, fontWeight: '600' },
  previewImage: { width: '100%', height: 220, borderRadius: 16 },
  previewActions: { flexDirection: 'row', gap: 10, marginTop: 12 },
  changeBtn: { flex: 1, height: 46, borderRadius: 12, borderWidth: 1, borderColor: colors.border.default, alignItems: 'center', justifyContent: 'center' },
  changeBtnText: { color: colors.text.secondary, fontSize: 15, fontWeight: '600' },
  analyzeBtn: { flex: 2, flexDirection: 'row', gap: 6, height: 46, borderRadius: 12, backgroundColor: colors.brand.orange, alignItems: 'center', justifyContent: 'center' },
  analyzeBtnText: { color: '#FFF', fontSize: 15, fontWeight: '700' },
  resultCard: {
    marginTop: 16, backgroundColor: colors.background.paper, borderRadius: 14, padding: 16,
    ...Platform.select({ ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 6 }, android: { elevation: 2 } }),
  },
  resultHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 14 },
  resultTitle: { fontSize: 17, fontWeight: '700', color: colors.text.primary, flex: 1 },
  confBadge: { backgroundColor: colors.status.success + '20', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  confText: { color: colors.status.success, fontSize: 13, fontWeight: '700' },
  resultGrid: { gap: 8 },
  resultRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6 },
  resultLabel: { fontSize: 14, color: colors.text.secondary },
  resultValue: { fontSize: 14, fontWeight: '600', color: colors.text.primary },
  condBadge: { flexDirection: 'row', alignItems: 'center', gap: 8, padding: 12, borderRadius: 10, marginBottom: 10 },
  condText: { fontSize: 15, fontWeight: '600', color: colors.status.success },
  featureGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  featureChip: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8, backgroundColor: colors.background.default },
  featureText: { fontSize: 13, color: colors.text.primary, fontWeight: '500' },
});
