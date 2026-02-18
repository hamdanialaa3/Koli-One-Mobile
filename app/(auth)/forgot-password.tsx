/**
 * Koli One — Forgot Password Screen
 * Glass-morphism design matching web LoginPageGlassFixed
 */
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { Mail, ArrowLeft, CheckCircle, Send } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { getAuth, sendPasswordResetEmail } from 'firebase/auth';
import { colors } from '../../src/styles/theme';

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleReset = async () => {
    if (!email.trim()) {
      setError('Моля, въведете вашия имейл адрес');
      return;
    }

    try {
      setLoading(true);
      setError('');
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      const auth = getAuth();
      await sendPasswordResetEmail(auth, email.trim());
      setSent(true);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (err: any) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      if (err.code === 'auth/user-not-found') {
        setError('Не е намерен акаунт с този имейл');
      } else if (err.code === 'auth/invalid-email') {
        setError('Невалиден имейл адрес');
      } else {
        setError('Възникна грешка. Моля, опитайте отново.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient
      colors={['#001a33', '#003366', '#004488']}
      style={styles.container}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        {/* Back Button */}
        <Animated.View entering={FadeInDown.delay(100)} style={styles.backRow}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <ArrowLeft size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </Animated.View>

        {sent ? (
          /* Success State */
          <Animated.View entering={FadeInUp.duration(500)} style={styles.successContainer}>
            <View style={styles.successIcon}>
              <CheckCircle size={64} color={colors.accent.main} />
            </View>
            <Text style={styles.successTitle}>Имейлът е изпратен!</Text>
            <Text style={styles.successSubtitle}>
              Изпратихме линк за нулиране на паролата на{'\n'}
              <Text style={styles.emailHighlight}>{email}</Text>
            </Text>
            <Text style={styles.successHint}>
              Проверете и папка "Спам" ако не виждате имейла
            </Text>
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={() => router.replace('/(auth)/login')}
            >
              <Text style={styles.primaryButtonText}>Обратно към вход</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.resendButton}
              onPress={handleReset}
            >
              <Send size={16} color={colors.brand.orange} />
              <Text style={styles.resendText}>Изпрати отново</Text>
            </TouchableOpacity>
          </Animated.View>
        ) : (
          /* Form State */
          <Animated.View entering={FadeInUp.delay(200)} style={styles.formContainer}>
            {/* Glass Card */}
            <View style={styles.glassCard}>
              <View style={styles.iconContainer}>
                <Mail size={48} color={colors.brand.orange} />
              </View>
              <Text style={styles.title}>Забравена парола</Text>
              <Text style={styles.subtitle}>
                Въведете имейл адреса си и ще ви изпратим линк за нулиране на паролата
              </Text>

              {/* Email Input */}
              <View style={styles.inputContainer}>
                <Mail size={20} color={colors.text.secondary} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Имейл адрес"
                  placeholderTextColor={colors.text.tertiary}
                  value={email}
                  onChangeText={(t) => {
                    setEmail(t);
                    setError('');
                  }}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoComplete="email"
                  returnKeyType="send"
                  onSubmitEditing={handleReset}
                />
              </View>

              {error ? (
                <Animated.Text entering={FadeInDown.duration(300)} style={styles.errorText}>
                  {error}
                </Animated.Text>
              ) : null}

              {/* Submit Button */}
              <TouchableOpacity
                style={[styles.primaryButton, loading && styles.disabledButton]}
                onPress={handleReset}
                disabled={loading}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={['#7B2FBE', '#9C5FE0']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.gradientButton}
                >
                  <Text style={styles.primaryButtonText}>
                    {loading ? 'Изпращане...' : 'Изпрати линк'}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>

              {/* Back to Login */}
              <TouchableOpacity
                onPress={() => router.replace('/(auth)/login')}
                style={styles.linkButton}
              >
                <Text style={styles.linkText}>
                  Помните паролата си?{' '}
                  <Text style={styles.linkTextBold}>Влезте</Text>
                </Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        )}
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  keyboardView: { flex: 1 },
  backRow: {
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingHorizontal: 20,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  formContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  glassCard: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 24,
    padding: 32,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.7)',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 28,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  inputIcon: { marginRight: 12 },
  input: {
    flex: 1,
    height: 52,
    fontSize: 16,
    color: '#FFFFFF',
  },
  errorText: {
    color: colors.status.error,
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 12,
  },
  primaryButton: {
    borderRadius: 14,
    overflow: 'hidden',
    marginTop: 8,
  },
  gradientButton: {
    paddingVertical: 16,
    alignItems: 'center',
    borderRadius: 14,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  disabledButton: { opacity: 0.6 },
  linkButton: {
    marginTop: 20,
    alignItems: 'center',
  },
  linkText: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 14,
  },
  linkTextBold: {
    color: colors.brand.orange,
    fontWeight: '700',
  },
  // Success state
  successContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 40,
    alignItems: 'center',
  },
  successIcon: {
    marginBottom: 24,
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(0,212,170,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  successTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  successSubtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.7)',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 8,
  },
  emailHighlight: {
    color: colors.brand.orange,
    fontWeight: '700',
  },
  successHint: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.4)',
    textAlign: 'center',
    marginBottom: 32,
  },
  resendButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    gap: 8,
  },
  resendText: {
    color: colors.brand.orange,
    fontSize: 15,
    fontWeight: '600',
  },
});
