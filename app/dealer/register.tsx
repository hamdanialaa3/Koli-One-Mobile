/**
 * Koli One — Dealer Registration
 */
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Platform, TextInput, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowLeft, Building2, User, Mail, Phone, MapPin, Camera, FileText, CheckCircle } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { colors } from '../../src/styles/theme';
import { db, auth } from '../../src/services/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

export default function DealerRegisterScreen() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form state
  const [companyName, setCompanyName] = useState('');
  const [eik, setEik] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [contactName, setContactName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [description, setDescription] = useState('');

  const handleSubmit = async () => {
    if (!companyName.trim() || !eik.trim() || !contactName.trim() || !email.trim()) {
      Alert.alert('Непълни данни', 'Моля, попълнете всички задължителни полета.');
      return;
    }
    setSubmitting(true);
    try {
      await addDoc(collection(db, 'dealer_applications'), {
        companyName: companyName.trim(),
        eik: eik.trim(),
        address: address.trim(),
        city: city.trim(),
        contactName: contactName.trim(),
        email: email.trim().toLowerCase(),
        phone: phone.trim(),
        description: description.trim() || null,
        applicantUid: auth.currentUser?.uid || null,
        status: 'pending',
        createdAt: serverTimestamp(),
      });
      setSubmitted(true);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error: any) {
      Alert.alert('Грешка', 'Неуспешно изпращане на заявка. Опитайте отново.');
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <LinearGradient colors={['#001a33', '#003366', '#004488']} style={styles.container}>
        <SafeAreaView style={styles.successSafe}>
          <Animated.View entering={FadeInUp} style={styles.successCenter}>
            <View style={styles.successIcon}>
              <CheckCircle size={64} color="#FFF" />
            </View>
            <Text style={styles.successTitle}>Заявката е изпратена!</Text>
            <Text style={styles.successDesc}>Нашият екип ще прегледа вашата заявка за дилърски акаунт в рамките на 24-48 часа</Text>
            <TouchableOpacity style={styles.successBtn} onPress={() => router.replace('/(tabs)' as any)}>
              <Text style={styles.successBtnText}>Към началото</Text>
            </TouchableOpacity>
          </Animated.View>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => step > 1 ? setStep(step - 1) : router.back()} style={styles.iconBtn}>
          <ArrowLeft size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Регистрация на дилър</Text>
        <View style={{ width: 44 }} />
      </View>

      {/* Progress */}
      <View style={styles.progressRow}>
        {[1, 2, 3].map(s => (
          <View key={s} style={[styles.progressDot, s <= step && styles.progressDotActive]} />
        ))}
      </View>
      <Text style={styles.stepLabel}>Стъпка {step} от 3</Text>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {step === 1 && (
          <Animated.View entering={FadeInUp}>
            <Text style={styles.sectionTitle}>Данни за фирмата</Text>
            <View style={styles.fields}>
              <InputRow icon={Building2} placeholder="Име на фирма / салон" value={companyName} onChangeText={setCompanyName} />
              <InputRow icon={FileText} placeholder="ЕИК / Булстат" value={eik} onChangeText={setEik} />
              <InputRow icon={MapPin} placeholder="Адрес на салона" value={address} onChangeText={setAddress} />
              <InputRow icon={MapPin} placeholder="Град" value={city} onChangeText={setCity} />
            </View>
          </Animated.View>
        )}

        {step === 2 && (
          <Animated.View entering={FadeInUp}>
            <Text style={styles.sectionTitle}>Лице за контакт</Text>
            <View style={styles.fields}>
              <InputRow icon={User} placeholder="Име и фамилия" value={contactName} onChangeText={setContactName} />
              <InputRow icon={Mail} placeholder="Имейл" keyboardType="email-address" value={email} onChangeText={setEmail} />
              <InputRow icon={Phone} placeholder="Телефон" keyboardType="phone-pad" value={phone} onChangeText={setPhone} />
            </View>
          </Animated.View>
        )}

        {step === 3 && (
          <Animated.View entering={FadeInUp}>
            <Text style={styles.sectionTitle}>Допълнителна информация</Text>
            <View style={styles.fields}>
              <TextInput
                style={[styles.input, styles.textarea]}
                placeholder="Опишете вашия бизнес — специализация, марки, опит..."
                placeholderTextColor={colors.text.tertiary}
                multiline numberOfLines={4} textAlignVertical="top"
                value={description}
                onChangeText={setDescription}
              />
              <TouchableOpacity style={styles.uploadBtn}>
                <Camera size={20} color={colors.text.secondary} />
                <Text style={styles.uploadText}>Качете лого на фирмата (по избор)</Text>
              </TouchableOpacity>

              {/* Benefits */}
              <View style={styles.benefitsCard}>
                <Text style={styles.benefitsTitle}>Предимства на дилърски акаунт:</Text>
                {[
                  'Неограничени обяви',
                  'Приоритетно показване в търсенето',
                  'Верифициран бадж',
                  'Статистики и анализи',
                  'Шаблони за обяви',
                ].map((b, i) => (
                  <View key={i} style={styles.benefitRow}>
                    <CheckCircle size={16} color={colors.status.success} />
                    <Text style={styles.benefitText}>{b}</Text>
                  </View>
                ))}
              </View>
            </View>
          </Animated.View>
        )}
      </ScrollView>

      {/* CTA */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={styles.nextBtn}
          disabled={submitting}
          onPress={() => {
            if (step < 3) setStep(step + 1);
            else handleSubmit();
          }}
          activeOpacity={0.8}
        >
          <Text style={styles.nextBtnText}>{step < 3 ? 'Продължи' : 'Изпрати заявка'}</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

function InputRow({ icon: Icon, placeholder, keyboardType, value, onChangeText }: any) {
  return (
    <View style={styles.inputRow}>
      <Icon size={18} color={colors.text.secondary} />
      <TextInput
        style={styles.inputInner}
        placeholder={placeholder}
        placeholderTextColor={colors.text.tertiary}
        keyboardType={keyboardType}
        value={value}
        onChangeText={onChangeText}
      />
    </View>
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
  progressRow: { flexDirection: 'row', justifyContent: 'center', gap: 8, marginTop: 16 },
  progressDot: { width: 36, height: 4, borderRadius: 2, backgroundColor: colors.border.default },
  progressDotActive: { backgroundColor: colors.brand.orange, width: 48 },
  stepLabel: { fontSize: 13, color: colors.text.secondary, textAlign: 'center', marginTop: 6 },
  content: { padding: 16 },
  sectionTitle: { fontSize: 20, fontWeight: '700', color: colors.text.primary, marginBottom: 16 },
  fields: { gap: 12 },
  inputRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12, height: 52, borderRadius: 12,
    borderWidth: 1, borderColor: colors.border.default, backgroundColor: colors.background.paper, paddingHorizontal: 14,
  },
  inputInner: { flex: 1, fontSize: 15, color: colors.text.primary },
  input: {
    height: 52, borderRadius: 12, borderWidth: 1, borderColor: colors.border.default,
    paddingHorizontal: 14, fontSize: 15, color: colors.text.primary, backgroundColor: colors.background.paper,
  },
  textarea: { height: 120, paddingTop: 14, textAlignVertical: 'top' },
  uploadBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 10, borderWidth: 1.5,
    borderColor: colors.border.default, borderStyle: 'dashed', borderRadius: 12,
    paddingVertical: 20, justifyContent: 'center',
  },
  uploadText: { fontSize: 14, color: colors.text.secondary },
  benefitsCard: {
    backgroundColor: colors.background.paper, borderRadius: 14, padding: 16, marginTop: 8,
    borderWidth: 1, borderColor: colors.border.light,
  },
  benefitsTitle: { fontSize: 16, fontWeight: '700', color: colors.text.primary, marginBottom: 12 },
  benefitRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  benefitText: { fontSize: 14, color: colors.text.secondary },
  bottomBar: {
    paddingHorizontal: 16, paddingVertical: 12, paddingBottom: Platform.OS === 'ios' ? 28 : 12,
    backgroundColor: colors.background.paper, borderTopWidth: 1, borderTopColor: colors.border.light,
  },
  nextBtn: { backgroundColor: colors.brand.orange, height: 52, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  nextBtnText: { color: '#FFF', fontSize: 17, fontWeight: '700' },
  successSafe: { flex: 1, justifyContent: 'center', padding: 32 },
  successCenter: { alignItems: 'center' },
  successIcon: {
    width: 120, height: 120, borderRadius: 60, backgroundColor: 'rgba(34,197,94,0.25)',
    alignItems: 'center', justifyContent: 'center', marginBottom: 24,
  },
  successTitle: { fontSize: 26, fontWeight: '800', color: '#FFF', textAlign: 'center' },
  successDesc: { fontSize: 15, color: 'rgba(255,255,255,0.7)', textAlign: 'center', marginTop: 10, lineHeight: 22 },
  successBtn: { marginTop: 32, backgroundColor: colors.brand.orange, paddingHorizontal: 32, paddingVertical: 14, borderRadius: 14 },
  successBtnText: { color: '#FFF', fontSize: 16, fontWeight: '700' },
});
