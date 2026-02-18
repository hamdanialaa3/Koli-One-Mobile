// app/(auth)/login.tsx
// Koli One - Professional Login Screen
// Validated for Web & Mobile Rendering - Fixed Blank Screen Issue

import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
  Alert,
  KeyboardAvoidingView,
  ScrollView,
  StyleSheet,
  Dimensions,
  TextInput,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import {
  Mail,
  Eye,
  EyeOff,
  Check,
  Globe,
  Facebook,
  Apple,
  User,
  AlertCircle,
  CheckCircle,
  ArrowRight
} from 'lucide-react-native';
import {
  signInWithEmailAndPassword,
  signInAnonymously
} from 'firebase/auth';
import { auth } from '../../src/services/firebase';
import { logger } from '../../src/services/logger-service';

// --- Google Sign-In Setup ---
let GoogleSignin: any = null;
if (Platform.OS !== 'web') {
  try {
    const googleSignInModule = require('@react-native-google-signin/google-signin');
    GoogleSignin = googleSignInModule.GoogleSignin;
    GoogleSignin.configure({
      webClientId: '973379297533-auto.apps.googleusercontent.com',
      offlineAccess: true,
    });
  } catch (e) {
    logger.info('Google Sign-In not available or failed to load');
  }
}

export default function LoginScreen() {
  const router = useRouter();

  // State
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Handlers
  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError(null);
  };

  const handleEmailLogin = async () => {
    if (!formData.email || !formData.password) {
      setError('Моля, попълнете всички полета');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await signInWithEmailAndPassword(auth, formData.email, formData.password);
      setSuccess('Входът е успешен!');
      setTimeout(() => router.replace('/(tabs)'), 500);
    } catch (err: any) {
      logger.error('Login error:', err);
      if (err.code === 'auth/invalid-email') setError('Невалиден имейл адрес');
      else if (err.code === 'auth/wrong-password') setError('Грешна парола');
      else setError('Грешка при влизане.');
    } finally {
      setLoading(false);
    }
  };

  const handleGuestLogin = async () => {
    setLoading(true);
    try {
      await signInAnonymously(auth);
      router.replace('/(tabs)');
    } catch (err: any) {
      setError('Грешка: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.mainContainer}>
      <LinearGradient
        colors={['#0f172a', '#1e293b']}
        style={styles.gradientBackground}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.glassWrapper}>

              <Text style={styles.title}>Влезте с Koli One</Text>
              <Text style={styles.subtitle}>Добре дошли обратно</Text>

              {/* Messages */}
              {error && (
                <View style={[styles.messageBox, styles.errorBox]}>
                  <AlertCircle size={20} color="#f87171" style={{ marginRight: 10 }} />
                  <Text style={styles.errorText}>{error}</Text>
                </View>
              )}
              {success && (
                <View style={[styles.messageBox, styles.successBox]}>
                  <CheckCircle size={20} color="#4ade80" style={{ marginRight: 10 }} />
                  <Text style={styles.successText}>{success}</Text>
                </View>
              )}

              {/* Inputs */}
              <View style={styles.inputBox}>
                <TextInput
                  style={[styles.input, success ? styles.verifiedInput : null]}
                  placeholder="Имейл адрес"
                  placeholderTextColor="rgba(203, 213, 225, 0.5)"
                  value={formData.email}
                  onChangeText={(text) => handleInputChange('email', text)}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
                <View style={styles.inputIcon}>
                  <Mail size={20} color="#94a3b8" />
                </View>
              </View>

              <View style={styles.inputBox}>
                <TextInput
                  style={[styles.input, success ? styles.verifiedInput : null]}
                  placeholder="Парола"
                  placeholderTextColor="rgba(203, 213, 225, 0.5)"
                  value={formData.password}
                  onChangeText={(text) => handleInputChange('password', text)}
                  secureTextEntry={!showPassword}
                />
                <TouchableOpacity
                  style={styles.inputIcon}
                  onPress={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={20} color="#94a3b8" /> : <Eye size={20} color="#94a3b8" />}
                </TouchableOpacity>
              </View>

              {/* Remember & Forgot */}
              <View style={styles.rowBetween}>
                <TouchableOpacity
                  style={styles.rowCenter}
                  onPress={() => handleInputChange('rememberMe', !formData.rememberMe)}
                >
                  <View style={[styles.checkbox, formData.rememberMe && styles.checkboxChecked]}>
                    {formData.rememberMe && <Check size={14} color="white" strokeWidth={3} />}
                  </View>
                  <Text style={styles.rememberText}>Запомни ме</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => router.push('/(auth)/forgot-password')}>
                  <Text style={styles.forgotText}>Забравена парола?</Text>
                </TouchableOpacity>
              </View>

              {/* Submit Button */}
              <TouchableOpacity
                style={styles.submitButton}
                onPress={handleEmailLogin}
                disabled={loading}
              >
                <LinearGradient
                  colors={['#FF8F10', '#ff7900']}
                  style={styles.gradientButton}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  {loading ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <>
                      <Text style={styles.buttonText}>Влизане</Text>
                      <ArrowRight size={20} color="#fff" style={{ marginLeft: 8 }} />
                    </>
                  )}
                </LinearGradient>
              </TouchableOpacity>

              {/* Socials Divider */}
              <View style={styles.divider}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>или продължи с</Text>
                <View style={styles.dividerLine} />
              </View>

              <View style={styles.socialButtons}>
                <TouchableOpacity 
                  style={styles.socialBtn} 
                  onPress={() => Alert.alert('Google Sign-In', 'В процес на внедряване. Очаквайте скоро!')}
                >
                  <Globe size={20} color="#cbd5e1" style={{ marginRight: 8 }} />
                  <Text style={styles.socialBtnText}>Google</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.socialBtn} 
                  onPress={() => Alert.alert('Apple Sign-In', 'В процес на внедряване. Очаквайте скоро!')}
                >
                  <Apple size={20} color="#cbd5e1" style={{ marginRight: 8 }} />
                  <Text style={styles.socialBtnText}>Apple</Text>
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                style={[styles.socialBtn, styles.guestBtn]}
                onPress={handleGuestLogin}
              >
                <User size={20} color="#FF8F10" style={{ marginRight: 8 }} />
                <Text style={[styles.socialBtnText, { color: '#FF8F10' }]}>Продължи като гост</Text>
              </TouchableOpacity>

              {/* Register Link */}
              <View style={styles.registerRow}>
                <Text style={styles.registerText}>Нямате акаунт? </Text>
                <TouchableOpacity onPress={() => router.push('/(auth)/register')}>
                  <Text style={styles.registerLink}>Регистрирай се</Text>
                </TouchableOpacity>
              </View>

            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </LinearGradient>
    </View>
  );
}

const _styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: '#0f172a',
    // Web-specific fix for full height
    ...(Platform.select({
      web: {
        height: '100vh',
        width: '100vw',
        overflow: 'hidden'
      }
    }) as any)
  },
  gradientBackground: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  keyboardView: {
    flex: 1,
    width: '100%',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    minHeight: 600,
  },
  glassWrapper: {
    width: '100%',
    maxWidth: 480,
    backgroundColor: 'rgba(30, 41, 59, 0.85)',
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.3)',
    borderRadius: 24,
    paddingVertical: 30,
    paddingHorizontal: 20,
    alignItems: 'center',
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.4, shadowRadius: 16 },
      android: { elevation: 10 },
      default: { boxShadow: '0px 8px 16px rgba(0, 0, 0, 0.4)' },
    }),
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#f8fafc',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    textAlign: 'center',
    color: '#cbd5e1',
    fontSize: 15,
    marginBottom: 30,
  },
  inputBox: {
    width: '100%',
    marginBottom: 20,
    position: 'relative',
  },
  input: {
    width: '100%',
    height: 52,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 2,
    borderColor: 'rgba(148, 163, 184, 0.2)',
    borderRadius: 50,
    fontSize: 16,
    color: '#f8fafc',
    paddingLeft: 20,
    paddingRight: 50,
  },
  verifiedInput: {
    backgroundColor: '#334155',
    borderColor: '#475569',
  },
  inputIcon: {
    position: 'absolute',
    right: 20,
    top: 16,
    zIndex: 10,
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 24,
    alignItems: 'center',
  },
  rowCenter: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: 'rgba(148, 163, 184, 0.3)',
    marginRight: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#22c55e',
    borderColor: '#22c55e',
  },
  rememberText: { color: '#cbd5e1' },
  forgotText: { color: '#FF8F10', fontWeight: '600' },
  submitButton: {
    width: '100%',
    height: 52,
    borderRadius: 50,
    overflow: 'hidden',
    marginBottom: 25,
    ...Platform.select({
      ios: { shadowColor: '#FF8F10', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 12 },
      android: { elevation: 6 },
      default: { boxShadow: '0px 4px 12px rgba(255, 143, 16, 0.3)' },
    }),
  },
  gradientButton: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 25,
    width: '100%',
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(148, 163, 184, 0.3)',
  },
  dividerText: {
    paddingHorizontal: 15,
    color: '#94a3b8',
    fontSize: 14,
  },
  socialButtons: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
    width: '100%',
    justifyContent: 'space-between',
  },
  socialBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.2)',
    borderRadius: 50,
  },
  guestBtn: {
    width: '100%',
    backgroundColor: 'rgba(255, 143, 16, 0.15)',
    borderColor: '#FF8F10',
    marginTop: 10,
    flex: 0,
    minWidth: '100%'
  },
  socialBtnText: {
    color: '#cbd5e1',
    fontWeight: '500',
  },
  messageBox: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    marginBottom: 20,
    borderWidth: 1,
  },
  errorBox: {
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
    borderColor: 'rgba(239, 68, 68, 0.6)',
  },
  successBox: {
    backgroundColor: 'rgba(34, 197, 94, 0.2)',
    borderColor: 'rgba(34, 197, 94, 0.6)',
  },
  errorText: { color: '#f87171', flex: 1 },
  successText: { color: '#4ade80', flex: 1 },
  registerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  registerText: {
    color: '#94a3b8',
    fontSize: 15,
  },
  registerLink: {
    color: '#FF8F10',
    fontSize: 15,
    fontWeight: '700',
  },
});
// Fix TS 5.9: StyleSheet.create returns ViewStyle | TextStyle | ImageStyle union per key,
// causing cursor type conflicts. Intersection type narrows correctly for both View and Text.
const styles = _styles as { [K in keyof typeof _styles]: ViewStyle & TextStyle };
