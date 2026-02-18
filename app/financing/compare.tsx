/**
 * Koli One — Financing Compare
 */
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Platform, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Animated, { FadeInUp, FadeInDown } from 'react-native-reanimated';
import { ArrowLeft, Calculator, TrendingDown, Percent, Clock, Building2, ChevronRight, DollarSign, Info } from 'lucide-react-native';
import { colors } from '../../src/styles/theme';

const BANKS = [
  { name: 'UniCredit Bulbank', rate: 6.5, maxTerm: 84, minDown: 20, logo: '🏦' },
  { name: 'DSK Bank', rate: 7.2, maxTerm: 96, minDown: 15, logo: '🏦' },
  { name: 'Fibank', rate: 6.9, maxTerm: 72, minDown: 20, logo: '🏦' },
  { name: 'PostBank', rate: 7.5, maxTerm: 84, minDown: 10, logo: '🏦' },
  { name: 'Raiffeisen', rate: 6.8, maxTerm: 60, minDown: 25, logo: '🏦' },
];

export default function FinancingCompareScreen() {
  const router = useRouter();
  const [carPrice, setCarPrice] = useState('30000');
  const [downPayment, setDownPayment] = useState('6000');
  const [termMonths, setTermMonths] = useState('60');

  const price = parseFloat(carPrice) || 0;
  const down = parseFloat(downPayment) || 0;
  const term = parseInt(termMonths) || 60;
  const loanAmount = price - down;

  const calcMonthly = (rate: number) => {
    const r = rate / 100 / 12;
    if (r === 0) return loanAmount / term;
    return (loanAmount * r * Math.pow(1 + r, term)) / (Math.pow(1 + r, term) - 1);
  };

  const sortedBanks = [...BANKS].sort((a, b) => calcMonthly(a.rate) - calcMonthly(b.rate));

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.iconBtn}><ArrowLeft size={24} color={colors.text.primary} /></TouchableOpacity>
        <Text style={styles.headerTitle}>Сравни финансиране</Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Calculator */}
        <Animated.View entering={FadeInUp} style={styles.calcCard}>
          <View style={styles.calcHeader}>
            <Calculator size={20} color={colors.brand.orange} />
            <Text style={styles.calcTitle}>Калкулатор</Text>
          </View>

          <View style={styles.fields}>
            <View style={styles.field}>
              <Text style={styles.fieldLabel}>Цена на автомобила (EUR)</Text>
              <View style={styles.inputRow}>
                <DollarSign size={16} color={colors.text.secondary} />
                <TextInput style={styles.input} value={carPrice} onChangeText={setCarPrice} keyboardType="numeric" />
              </View>
            </View>
            <View style={styles.field}>
              <Text style={styles.fieldLabel}>Самоучастие (EUR)</Text>
              <View style={styles.inputRow}>
                <DollarSign size={16} color={colors.text.secondary} />
                <TextInput style={styles.input} value={downPayment} onChangeText={setDownPayment} keyboardType="numeric" />
              </View>
              <Text style={styles.fieldHint}>{down > 0 ? `${((down / price) * 100).toFixed(0)}% от цената` : ''}</Text>
            </View>
            <View style={styles.field}>
              <Text style={styles.fieldLabel}>Срок (месеци)</Text>
              <View style={styles.termRow}>
                {[36, 48, 60, 72, 84].map(t => (
                  <TouchableOpacity
                    key={t}
                    style={[styles.termChip, term === t && styles.termActive]}
                    onPress={() => setTermMonths(t.toString())}
                  >
                    <Text style={[styles.termText, term === t && styles.termTextActive]}>{t}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>

          {/* Loan Summary */}
          <View style={styles.loanSummary}>
            <View style={styles.loanRow}><Text style={styles.loanLabel}>Необходим кредит</Text><Text style={styles.loanValue}>€{loanAmount.toLocaleString()}</Text></View>
            <View style={styles.loanRow}><Text style={styles.loanLabel}>Срок</Text><Text style={styles.loanValue}>{term} мес. ({(term / 12).toFixed(1)} г.)</Text></View>
          </View>
        </Animated.View>

        {/* Bank Offers */}
        <Text style={styles.sectionTitle}>Оферти от банки</Text>
        <Text style={styles.sectionDesc}>Сортирани по най-ниска месечна вноска</Text>

        {sortedBanks.map((bank, i) => {
          const monthly = calcMonthly(bank.rate);
          const totalPaid = monthly * term;
          const totalInterest = totalPaid - loanAmount;

          return (
            <Animated.View key={bank.name} entering={FadeInDown.delay(100 + i * 60)}>
              <TouchableOpacity style={[styles.bankCard, i === 0 && styles.bestCard]} activeOpacity={0.7}>
                {i === 0 && <View style={styles.bestBadge}><Text style={styles.bestText}>Най-добра оферта</Text></View>}
                <View style={styles.bankHeader}>
                  <Text style={styles.bankLogo}>{bank.logo}</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.bankName}>{bank.name}</Text>
                    <View style={styles.bankMeta}>
                      <Percent size={12} color={colors.text.secondary} />
                      <Text style={styles.bankMetaText}>{bank.rate}% годишно</Text>
                      <Clock size={12} color={colors.text.secondary} />
                      <Text style={styles.bankMetaText}>до {bank.maxTerm} мес.</Text>
                    </View>
                  </View>
                </View>
                <View style={styles.bankResults}>
                  <View style={styles.bankResult}>
                    <Text style={styles.bankResLabel}>Месечна вноска</Text>
                    <Text style={styles.bankResMain}>€{monthly.toFixed(0)}</Text>
                  </View>
                  <View style={styles.bankResult}>
                    <Text style={styles.bankResLabel}>Общо лихва</Text>
                    <Text style={styles.bankResVal}>€{totalInterest.toFixed(0)}</Text>
                  </View>
                  <View style={styles.bankResult}>
                    <Text style={styles.bankResLabel}>Общо</Text>
                    <Text style={styles.bankResVal}>€{totalPaid.toFixed(0)}</Text>
                  </View>
                </View>
                <TouchableOpacity style={styles.applyBtn}>
                  <Text style={styles.applyText}>Кандидатствай</Text>
                  <ChevronRight size={16} color={colors.brand.orange} />
                </TouchableOpacity>
              </TouchableOpacity>
            </Animated.View>
          );
        })}

        {/* Disclaimer */}
        <View style={styles.disclaimerCard}>
          <Info size={16} color={colors.text.secondary} />
          <Text style={styles.disclaimerText}>Изчисленията са приблизителни и не представляват обвързваща оферта. Крайните условия зависят от банката.</Text>
        </View>

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
  calcCard: {
    backgroundColor: colors.background.paper, borderRadius: 16, padding: 18,
    ...Platform.select({ ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8 }, android: { elevation: 2 } }),
  },
  calcHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 16 },
  calcTitle: { fontSize: 18, fontWeight: '700', color: colors.text.primary },
  fields: { gap: 14 },
  field: {},
  fieldLabel: { fontSize: 13, fontWeight: '600', color: colors.text.secondary, marginBottom: 6 },
  inputRow: {
    flexDirection: 'row', alignItems: 'center', gap: 8, height: 48, borderRadius: 12,
    borderWidth: 1, borderColor: colors.border.default, paddingHorizontal: 14,
  },
  input: { flex: 1, fontSize: 16, fontWeight: '600', color: colors.text.primary },
  fieldHint: { fontSize: 12, color: colors.brand.orange, marginTop: 4 },
  termRow: { flexDirection: 'row', gap: 8 },
  termChip: {
    flex: 1, height: 40, borderRadius: 10, borderWidth: 1, borderColor: colors.border.default,
    alignItems: 'center', justifyContent: 'center',
  },
  termActive: { backgroundColor: colors.brand.orange, borderColor: colors.brand.orange },
  termText: { fontSize: 14, fontWeight: '600', color: colors.text.secondary },
  termTextActive: { color: '#FFF' },
  loanSummary: { marginTop: 16, backgroundColor: colors.background.default, borderRadius: 10, padding: 12, gap: 6 },
  loanRow: { flexDirection: 'row', justifyContent: 'space-between' },
  loanLabel: { fontSize: 14, color: colors.text.secondary },
  loanValue: { fontSize: 14, fontWeight: '700', color: colors.text.primary },
  sectionTitle: { fontSize: 20, fontWeight: '700', color: colors.text.primary, marginTop: 24 },
  sectionDesc: { fontSize: 13, color: colors.text.secondary, marginTop: 2, marginBottom: 12 },
  bankCard: {
    backgroundColor: colors.background.paper, borderRadius: 16, padding: 16, marginBottom: 12,
    borderWidth: 1.5, borderColor: 'transparent',
    ...Platform.select({ ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 6 }, android: { elevation: 2 } }),
  },
  bestCard: { borderColor: colors.brand.orange },
  bestBadge: { position: 'absolute', top: 0, right: 16, backgroundColor: colors.brand.orange, paddingHorizontal: 10, paddingVertical: 4, borderBottomLeftRadius: 8, borderBottomRightRadius: 8 },
  bestText: { color: '#FFF', fontSize: 11, fontWeight: '700' },
  bankHeader: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  bankLogo: { fontSize: 28 },
  bankName: { fontSize: 16, fontWeight: '700', color: colors.text.primary },
  bankMeta: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 },
  bankMetaText: { fontSize: 12, color: colors.text.secondary },
  bankResults: { flexDirection: 'row', gap: 8, marginTop: 14 },
  bankResult: { flex: 1, backgroundColor: colors.background.default, borderRadius: 10, padding: 10, alignItems: 'center' },
  bankResLabel: { fontSize: 11, color: colors.text.secondary },
  bankResMain: { fontSize: 22, fontWeight: '800', color: colors.brand.orange, marginTop: 2 },
  bankResVal: { fontSize: 16, fontWeight: '700', color: colors.text.primary, marginTop: 2 },
  applyBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4, marginTop: 12,
    height: 42, borderRadius: 12, borderWidth: 1.5, borderColor: colors.brand.orange,
  },
  applyText: { color: colors.brand.orange, fontSize: 14, fontWeight: '600' },
  disclaimerCard: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 8, marginTop: 16,
    backgroundColor: colors.background.paper, borderRadius: 12, padding: 14,
  },
  disclaimerText: { flex: 1, fontSize: 12, color: colors.text.secondary, lineHeight: 18 },
});
