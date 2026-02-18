/**
 * phone-login.tsx — Phone Number Authentication Screen
 * Firebase Phone Auth with OTP verification
 */

import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Phone, ShieldCheck } from 'lucide-react-native';
import { colors } from '../../src/styles/theme';
import { auth } from '../../src/services/firebase';
import {
  PhoneAuthProvider,
  signInWithCredential,
} from 'firebase/auth';
import { FirebaseRecaptchaVerifierModal } from 'expo-firebase-recaptcha';
import { logger } from '../../src/services/logger-service';

const COUNTRY_CODE = '+359'; // Bulgaria

export default function PhoneLoginScreen() {
  const router = useRouter();
  const recaptchaRef = useRef<any>(null);

  const [phone, setPhone] = useState('');
  const [verificationId, setVerificationId] = useState<string | null>(null);
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'phone' | 'otp'>('phone');

  const handleSendOTP = async () => {
    const formatted = phone.startsWith('+') ? phone : `${COUNTRY_CODE}${phone.replace(/^0/, '')}`;

    if (formatted.length < 10) {
      Alert.alert('Грешка', 'Моля, въведете валиден телефонен номер.');
      return;
    }

    setLoading(true);
    try {
      const phoneProvider = new PhoneAuthProvider(auth);
      const verId = await phoneProvider.verifyPhoneNumber(
        formatted,
        recaptchaRef.current!
      );
      setVerificationId(verId);
      setStep('otp');
      Alert.alert('Изпратено', 'SMS кодът е изпратен на вашия номер.');
    } catch (err: any) {
      logger.error('Phone OTP send failed', err);
      Alert.alert('Грешка', err?.message || 'Неуспешно изпращане на SMS код.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (!verificationId || otp.length < 6) {
      Alert.alert('Грешка', 'Моля, въведете 6-цифрения код.');
      return;
    }

    setLoading(true);
    try {
      const credential = PhoneAuthProvider.credential(verificationId, otp);
      await signInWithCredential(auth, credential);
      // AuthContext will detect the sign-in and redirect
      router.replace('/(tabs)');
    } catch (err: any) {
      logger.error('Phone OTP verify failed', err);
      Alert.alert('Грешка', err?.message || 'Невалиден код. Опитайте отново.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />

      <FirebaseRecaptchaVerifierModal
        ref={recaptchaRef}
        firebaseConfig={auth.app.options}
        attemptInvisibleVerification
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
              <ArrowLeft size={24} color={colors.text.primary} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Вход с телефон</Text>
            <View style={{ width: 44 }} />
          </View>

          {/* Icon */}
          <View style={styles.iconWrap}>
            {step === 'phone' ? (
              <Phone size={48} color={colors.brand.orange} />
            ) : (
              <ShieldCheck size={48} color={colors.brand.orange} />
            )}
          </View>

          <Text style={styles.subtitle}>
            {step === 'phone'
              ? 'Въведете телефонния си номер, за да получите SMS код за вход.'
              : 'Въведете 6-цифрения код, изпратен на вашия номер.'}
          </Text>

          {step === 'phone' ? (
            <>
              <View style={styles.inputRow}>
                <View style={styles.prefixBox}>
                  <Text style={styles.prefixText}>🇧🇬 {COUNTRY_CODE}</Text>
                </View>
                <TextInput
                  style={styles.input}
                  placeholder="888 123 456"
                  placeholderTextColor={colors.text.disabled}
                  keyboardType="phone-pad"
                  value={phone}
                  onChangeText={setPhone}
                  maxLength={15}
                  autoFocus
                />
              </View>

              <TouchableOpacity
                style={[styles.primaryBtn, loading && styles.btnDisabled]}
                onPress={handleSendOTP}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.primaryBtnText}>Изпрати SMS код</Text>
                )}
              </TouchableOpacity>
            </>
          ) : (
            <>
              <TextInput
                style={[styles.input, styles.otpInput]}
                placeholder="• • • • • •"
                placeholderTextColor={colors.text.disabled}
                keyboardType="number-pad"
                value={otp}
                onChangeText={setOtp}
                maxLength={6}
                autoFocus
                textAlign="center"
              />

              <TouchableOpacity
                style={[styles.primaryBtn, loading && styles.btnDisabled]}
                onPress={handleVerifyOTP}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.primaryBtnText}>Потвърди</Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.linkBtn}
                onPress={() => {
                  setStep('phone');
                  setOtp('');
                  setVerificationId(null);
                }}
              >
                <Text style={styles.linkText}>Изпрати нов код</Text>
              </TouchableOpacity>
            </>
          )}

          {/* Back to email login */}
          <TouchableOpacity
            style={styles.linkBtn}
            onPress={() => router.replace('/(auth)/login')}
          >
            <Text style={styles.linkText}>Вход с имейл</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background.default },
  scroll: { padding: 24, paddingBottom: 60 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 32,
  },
  backBtn: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 20, fontWeight: '700', color: colors.text.primary },
  iconWrap: { alignItems: 'center', marginBottom: 16 },
  subtitle: {
    fontSize: 15,
    color: colors.text.secondary,
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 22,
  },
  inputRow: { flexDirection: 'row', marginBottom: 24 },
  prefixBox: {
    backgroundColor: colors.background.paper,
    borderWidth: 1,
    borderColor: colors.border.default,
    borderRadius: 12,
    paddingHorizontal: 14,
    justifyContent: 'center',
    marginRight: 8,
  },
  prefixText: { fontSize: 15, color: colors.text.primary, fontWeight: '600' },
  input: {
    flex: 1,
    backgroundColor: colors.background.paper,
    borderWidth: 1,
    borderColor: colors.border.default,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: colors.text.primary,
  },
  otpInput: {
    fontSize: 28,
    letterSpacing: 12,
    fontWeight: '700',
    marginBottom: 24,
  },
  primaryBtn: {
    backgroundColor: colors.brand.orange,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 16,
  },
  btnDisabled: { opacity: 0.6 },
  primaryBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  linkBtn: { alignItems: 'center', paddingVertical: 12 },
  linkText: { color: colors.brand.orange, fontSize: 14, fontWeight: '600' },
});
