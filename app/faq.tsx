/**
 * Koli One — FAQ — Frequently Asked Questions
 */
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Animated, { FadeInDown, Layout } from 'react-native-reanimated';
import { ArrowLeft, ChevronDown, Search, MessageCircle, HelpCircle, Shield, CreditCard, Car, Users } from 'lucide-react-native';

const CATEGORIES = [
  { id: 'general', label: 'Общи', icon: HelpCircle, color: '#3B82F6' },
  { id: 'buying', label: 'Покупка', icon: Car, color: '#22C55E' },
  { id: 'selling', label: 'Продажба', icon: CreditCard, color: '#7B2FBE' },
  { id: 'safety', label: 'Безопасност', icon: Shield, color: '#CC0000' },
  { id: 'account', label: 'Акаунт', icon: Users, color: '#8B5CF6' },
];

const FAQ_DATA: Record<string, { q: string; a: string }[]> = {
  general: [
    { q: 'Какво е Koli One?', a: 'Koli One е водещата платформа за покупка и продажба на автомобили в България. Предлагаме AI-базирана оценка, верификация на история и безопасни комуникации между купувачи и продавачи.' },
    { q: 'Безплатно ли е използването?', a: 'Да! Безплатният план включва до 3 обяви, AI оценка и пълен достъп до търсенето. Premium планът предлага неограничени обяви и допълнителни функции.' },
    { q: 'Как работи AI оценката?', a: 'Нашият AI анализира пазарни данни, състояние на автомобила, километраж, година и историята на цените, за да даде обективна пазарна оценка в реално време.' },
  ],
  buying: [
    { q: 'Как да намеря кола?', a: 'Използвайте разширеното търсене с филтри за марка, модел, цена, год. на производство, гориво и други. AI препоръчва и коли според вашите предпочитания.' },
    { q: 'Как да проверя историята?', a: 'Въведете VIN номера в раздел "История" и получете пълен доклад: ДТП, собственики, километраж, сервизна история и проверка за кражба.' },
    { q: 'Мога ли да направя оферта?', a: 'Да! В чата натиснете иконата за оферта, въведете сума и я изпратете. Продавачът може да приеме, отхвърли или да прави контра-оферта.' },
    { q: 'Безопасно ли е да купувам онлайн?', a: 'Всеки продавач е верифициран. Препоръчваме лична среща и оглед преди покупка. Никога не правете предварително плащане без да сте видели автомобила.' },
  ],
  selling: [
    { q: 'Как да публикувам обява?', a: 'Натиснете бутона "Продай" в долната навигация. Попълнете данните, качете снимки и публикувайте. AI автоматично предлага оптимална цена.' },
    { q: 'Колко обяви мога да имам?', a: 'Безплатен план: 3 активни обяви. Premium: неограничени обяви + приоритетно показване. Дилърски план: всички функции + аналитика.' },
    { q: 'Как се определя цената?', a: 'AI оценката анализира пазарни данни и предлага конкурентна цена. Вие винаги решавате крайната цена.' },
  ],
  safety: [
    { q: 'Как се гарантира безопасността?', a: 'Верифицираме телефонни номера и email адреси. Съмнителни обяви се преглеждат от модераторския ни екип. Използваме криптирана комуникация.' },
    { q: 'Как да докладвам проблем?', a: 'Натиснете бутона "Докладвай" на всяка обява или потребителски профил. Нашият екип преглежда доклади в рамките на 24 часа.' },
    { q: 'Защитени ли са данните ми?', a: 'Да. Спазваме GDPR. Вашите лични данни се криптират и не се споделят с трети страни без вашето съгласие.' },
  ],
  account: [
    { q: 'Как да променя паролата си?', a: 'Отидете в Профил → Настройки → Промяна на парола. Ще получите email за потвърждение.' },
    { q: 'Как да изтрия акаунта си?', a: 'Отидете в Профил → Настройки → Изтриване на акаунт. Всички ваши данни ще бъдат изтрити необратимо в рамките на 30 дни.' },
    { q: 'Мога ли да стана дилър?', a: 'Да! Отидете в раздел "Дилъри" → "Регистрация като дилър". Попълнете бизнес информацията и нашият екип ще одобри акаунта ви.' },
  ],
};

export default function FAQScreen() {
  const router = useRouter();
  const [activeCategory, setActiveCategory] = useState('general');
  const [expandedIdx, setExpandedIdx] = useState<number | null>(null);

  const questions = FAQ_DATA[activeCategory] || [];

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <ArrowLeft size={24} color="#1E293B" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Въпроси и Отговори</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Categories */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.catScroll}>
          {CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            const isActive = activeCategory === cat.id;
            return (
              <TouchableOpacity
                key={cat.id}
                style={[styles.catChip, isActive && { backgroundColor: cat.color }]}
                onPress={() => { setActiveCategory(cat.id); setExpandedIdx(null); }}
              >
                <Icon size={16} color={isActive ? '#FFF' : cat.color} />
                <Text style={[styles.catLabel, isActive && { color: '#FFF' }]}>{cat.label}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Questions */}
        <View style={styles.questionsContainer}>
          {questions.map((item, idx) => (
            <Animated.View key={idx} entering={FadeInDown.delay(idx * 80)} layout={Layout}>
              <TouchableOpacity
                style={[styles.questionCard, expandedIdx === idx && styles.questionCardActive]}
                onPress={() => setExpandedIdx(expandedIdx === idx ? null : idx)}
                activeOpacity={0.7}
              >
                <View style={styles.questionHeader}>
                  <Text style={styles.questionText}>{item.q}</Text>
                  <ChevronDown
                    size={20}
                    color="#64748B"
                    style={{ transform: [{ rotate: expandedIdx === idx ? '180deg' : '0deg' }] }}
                  />
                </View>
                {expandedIdx === idx && (
                  <Animated.View entering={FadeInDown.duration(200)}>
                    <View style={styles.divider} />
                    <Text style={styles.answerText}>{item.a}</Text>
                  </Animated.View>
                )}
              </TouchableOpacity>
            </Animated.View>
          ))}
        </View>

        {/* Contact Support */}
        <View style={styles.supportCard}>
          <MessageCircle size={32} color="#003366" />
          <Text style={styles.supportTitle}>Не намерихте отговор?</Text>
          <Text style={styles.supportDesc}>Свържете се с нас и ще ви помогнем</Text>
          <TouchableOpacity style={styles.supportBtn} onPress={() => router.push('/contact')}>
            <Text style={styles.supportBtnText}>Свържете се с нас</Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F4F4F4' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12, backgroundColor: '#FFF', borderBottomWidth: 1, borderBottomColor: '#E2E8F0' },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#F1F5F9', alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#1E293B' },
  catScroll: { paddingHorizontal: 16, paddingVertical: 16, gap: 8 },
  catChip: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, backgroundColor: '#FFF', borderWidth: 1, borderColor: '#E2E8F0' },
  catLabel: { fontSize: 13, fontWeight: '600', color: '#334155' },
  questionsContainer: { paddingHorizontal: 16 },
  questionCard: { backgroundColor: '#FFF', borderRadius: 12, marginBottom: 8, padding: 16, borderWidth: 1, borderColor: '#E2E8F0' },
  questionCardActive: { borderColor: '#003366' },
  questionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  questionText: { flex: 1, fontSize: 15, fontWeight: '600', color: '#1E293B', marginRight: 12 },
  divider: { height: 1, backgroundColor: '#E2E8F0', marginVertical: 12 },
  answerText: { fontSize: 14, color: '#475569', lineHeight: 22 },
  supportCard: { alignItems: 'center', backgroundColor: '#FFF', margin: 16, padding: 32, borderRadius: 16, borderWidth: 1, borderColor: '#E2E8F0' },
  supportTitle: { fontSize: 18, fontWeight: '700', color: '#1E293B', marginTop: 16 },
  supportDesc: { fontSize: 14, color: '#64748B', marginTop: 4 },
  supportBtn: { backgroundColor: '#003366', paddingVertical: 12, paddingHorizontal: 24, borderRadius: 10, marginTop: 16 },
  supportBtnText: { fontSize: 14, fontWeight: '700', color: '#FFF' },
});
