/**
 * Koli One — Email Verification Screen
 * Post-registration verification with resend + auto-check
 */
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import Animated, { FadeInUp, FadeInDown, ZoomIn } from 'react-native-reanimated';
import { MailCheck, RefreshCw, ArrowRight, Shield } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { getAuth, sendEmailVerification, reload } from 'firebase/auth';
import { colors } from '../../src/styles/theme';

export default function EmailVerificationScreen() {
  const router = useRouter();
  const [countdown, setCountdown] = useState(0);
  const [checking, setChecking] = useState(false);
  const [verified, setVerified] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval>>(undefined);

  const auth = getAuth();
  const user = auth.currentUser;
  const email = user?.email || '';

  // Auto-check verification every 5 seconds
  useEffect(() => {
    const checkInterval = setInterval(async () => {
      if (user) {
        await reload(user);
        if (user.emailVerified) {
          setVerified(true);
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          clearInterval(checkInterval);
          setTimeout(() => router.replace('/(tabs)'), 2000);
        }
      }
    }, 5000);

    return () => clearInterval(checkInterval);
  }, [user]);

  // Countdown timer for resend
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(c => c - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleResend = async () => {
    if (countdown > 0 || !user) return;
    try {
      await sendEmailVerification(user);
      setCountdown(60);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch (err) {
      // Rate limited
      setCountdown(30);
    }
  };

  const handleManualCheck = async () => {
    if (!user) return;
    setChecking(true);
    try {
      await reload(user);
      if (user.emailVerified) {
        setVerified(true);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        setTimeout(() => router.replace('/(tabs)'), 1500);
      } else {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      }
    } finally {
      setChecking(false);
    }
  };

  return (
    <LinearGradient
      colors={['#001a33', '#003366', '#004488']}
      style={styles.container}
    >
      <View style={styles.content}>
        {verified ? (
          <Animated.View entering={ZoomIn.duration(500)} style={styles.center}>
            <View style={styles.successCircle}>
              <Shield size={64} color={colors.accent.main} />
            </View>
            <Text style={styles.successTitle}>Верифициран!</Text>
            <Text style={styles.successSub}>Вашият акаунт е потвърден успешно</Text>
          </Animated.View>
        ) : (
          <>
            {/* Icon */}
            <Animated.View entering={FadeInDown.delay(200)} style={styles.iconWrap}>
              <View style={styles.iconCircle}>
                <MailCheck size={56} color={colors.brand.orange} />
              </View>
            </Animated.View>

            {/* Title */}
            <Animated.View entering={FadeInUp.delay(300)}>
              <Text style={styles.title}>Потвърдете имейла си</Text>
              <Text style={styles.subtitle}>
                Изпратихме линк за потвърждение на
              </Text>
              <Text style={styles.email}>{email}</Text>
            </Animated.View>

            {/* Steps */}
            <Animated.View entering={FadeInUp.delay(400)} style={styles.stepsCard}>
              {[
                'Отворете пощата си',
                'Натиснете линка за потвърждение',
                'Върнете се тук',
              ].map((step, i) => (
                <View key={i} style={styles.stepRow}>
                  <View style={styles.stepNum}>
                    <Text style={styles.stepNumText}>{i + 1}</Text>
                  </View>
                  <Text style={styles.stepText}>{step}</Text>
                </View>
              ))}
            </Animated.View>

            {/* Buttons */}
            <Animated.View entering={FadeInUp.delay(500)} style={styles.buttonsWrap}>
              <TouchableOpacity
                style={styles.checkButton}
                onPress={handleManualCheck}
                disabled={checking}
              >
                <LinearGradient
                  colors={['#7B2FBE', '#9C5FE0']}
                  style={styles.gradBtn}
                >
                  <Text style={styles.btnText}>
                    {checking ? 'Проверка...' : 'Вече потвърдих'}
                  </Text>
                  <ArrowRight size={20} color="#FFF" />
                </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.resendBtn, countdown > 0 && styles.resendDisabled]}
                onPress={handleResend}
                disabled={countdown > 0}
              >
                <RefreshCw
                  size={18}
                  color={countdown > 0 ? 'rgba(255,255,255,0.3)' : colors.brand.orange}
                />
                <Text
                  style={[
                    styles.resendText,
                    countdown > 0 && styles.resendTextDisabled,
                  ]}
                >
                  {countdown > 0
                    ? `Изпрати отново (${countdown}с)`
                    : 'Изпрати отново'}
                </Text>
              </TouchableOpacity>
            </Animated.View>

            {/* Skip */}
            <TouchableOpacity
              style={styles.skipBtn}
              onPress={() => router.replace('/(tabs)')}
            >
              <Text style={styles.skipText}>Пропусни засега</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 28,
    paddingTop: Platform.OS === 'ios' ? 80 : 60,
    paddingBottom: 40,
  },
  center: { alignItems: 'center' },
  iconWrap: { alignItems: 'center', marginBottom: 24 },
  iconCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255,121,0,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#FFF',
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.6)',
    textAlign: 'center',
  },
  email: {
    fontSize: 16,
    color: colors.brand.orange,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 28,
  },
  stepsCard: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    marginBottom: 28,
    gap: 16,
  },
  stepRow: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  stepNum: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: colors.brand.orange,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepNumText: { color: '#FFF', fontWeight: '800', fontSize: 14 },
  stepText: { color: 'rgba(255,255,255,0.8)', fontSize: 15, flex: 1 },
  buttonsWrap: { gap: 14 },
  checkButton: { borderRadius: 14, overflow: 'hidden' },
  gradBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 8,
    borderRadius: 14,
  },
  btnText: { color: '#FFF', fontSize: 17, fontWeight: '700' },
  resendBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    gap: 8,
  },
  resendDisabled: { opacity: 0.5 },
  resendText: { color: colors.brand.orange, fontSize: 15, fontWeight: '600' },
  resendTextDisabled: { color: 'rgba(255,255,255,0.3)' },
  skipBtn: { marginTop: 20, alignItems: 'center' },
  skipText: { color: 'rgba(255,255,255,0.4)', fontSize: 14 },
  // Success
  successCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(0,212,170,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  successTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: colors.accent.main,
    marginBottom: 8,
  },
  successSub: { fontSize: 16, color: 'rgba(255,255,255,0.6)' },
});
