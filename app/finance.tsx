import React, { useState } from 'react';
import styled from 'styled-components/native';
import { MobileHeader } from '../src/components/common/MobileHeader';
import { theme } from '../src/styles/theme';
import {
    View,
    ScrollView,
    TextInput,
    TouchableOpacity,
    Text,
    Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const Container = styled.SafeAreaView`
  flex: 1;
  background-color: ${props => props.theme.colors.background.default};
`;

const CalculatorCard = styled.View`
  background-color: ${props => props.theme.colors.background.paper};
  margin: 20px;
  border-radius: 24px;
  padding: 24px;
  elevation: 4;
  ${Platform.OS === 'web' ? 'box-shadow: 0px 4px 12px rgba(0,0,0,0.1);' : ''}
`;

const Title = styled.Text`
  font-size: 20px;
  font-weight: 800;
  color: ${props => props.theme.colors.text.primary};
  margin-bottom: 24px;
`;

const InputLabel = styled.Text`
  font-size: 14px;
  font-weight: 600;
  color: ${props => props.theme.colors.text.secondary};
  margin-bottom: 8px;
`;

const InputField = styled.View`
  flex-direction: row;
  align-items: center;
  background-color: ${props => props.theme.colors.background.default};
  border-radius: 12px;
  padding: 0 16px;
  height: 54px;
  margin-bottom: 20px;
  border-width: 1px;
  border-color: ${props => props.theme.colors.border.muted};
`;

const StyledTextInput = styled.TextInput`
  flex: 1;
  font-size: 18px;
  font-weight: 700;
  color: ${props => props.theme.colors.text.primary};
`;

const Currency = styled.Text`
  font-size: 16px;
  font-weight: 700;
  color: ${props => props.theme.colors.text.disabled};
  margin-left: 8px;
`;

const ResultSection = styled.View`
  background-color: ${props => props.theme.colors.primary.main}10;
  padding: 20px;
  border-radius: 16px;
  align-items: center;
  margin-top: 10px;
`;

const MonthlyPayment = styled.Text`
  font-size: 32px;
  font-weight: 900;
  color: ${props => props.theme.colors.primary.main};
`;

const PaymentLabel = styled.Text`
  font-size: 14px;
  color: ${props => props.theme.colors.text.secondary};
  margin-bottom: 4px;
`;

export default function FinanceScreen() {
    const [price, setPrice] = useState('50000');
    const [downPayment, setDownPayment] = useState('10000');
    const [term, setTerm] = useState('60'); // months
    const [rate, setRate] = useState('5.5');

    const calculatePayment = () => {
        const p = parseFloat(price) - parseFloat(downPayment);
        const r = parseFloat(rate) / 100 / 12;
        const n = parseInt(term);

        if (isNaN(p) || isNaN(r) || isNaN(n) || p <= 0 || n <= 0) return '0.00';

        // Handle 0% interest rate (simple division)
        if (r === 0) return (p / n).toFixed(2);

        const payment = (p * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
        return isFinite(payment) ? payment.toFixed(2) : '0.00';
    };

    return (
        <Container theme={theme}>
            <MobileHeader title="Auto Finance" back />
            <ScrollView showsVerticalScrollIndicator={false}>
                <CalculatorCard theme={theme}>
                    <Title theme={theme}>Loan Calculator</Title>

                    <InputLabel theme={theme}>Car Price</InputLabel>
                    <InputField theme={theme}>
                        <StyledTextInput
                            value={price}
                            onChangeText={setPrice}
                            keyboardType="numeric"
                        />
                        <Currency>EUR</Currency>
                    </InputField>

                    <InputLabel theme={theme}>Down Payment</InputLabel>
                    <InputField theme={theme}>
                        <StyledTextInput
                            value={downPayment}
                            onChangeText={setDownPayment}
                            keyboardType="numeric"
                        />
                        <Currency>EUR</Currency>
                    </InputField>

                    <View style={{ flexDirection: 'row', gap: 16 }}>
                        <View style={{ flex: 1 }}>
                            <InputLabel theme={theme}>Term (Months)</InputLabel>
                            <InputField theme={theme}>
                                <StyledTextInput
                                    value={term}
                                    onChangeText={setTerm}
                                    keyboardType="numeric"
                                />
                            </InputField>
                        </View>
                        <View style={{ flex: 1 }}>
                            <InputLabel theme={theme}>Interest Rate (%)</InputLabel>
                            <InputField theme={theme}>
                                <StyledTextInput
                                    value={rate}
                                    onChangeText={setRate}
                                    keyboardType="numeric"
                                />
                            </InputField>
                        </View>
                    </View>

                    <ResultSection theme={theme}>
                        <PaymentLabel theme={theme}>Estimated Monthly Payment</PaymentLabel>
                        <MonthlyPayment theme={theme}>€{calculatePayment()}</MonthlyPayment>
                    </ResultSection>
                </CalculatorCard>

                <View style={{ padding: 24 }}>
                    <Text style={{ fontSize: 18, fontWeight: '800', marginBottom: 16 }}>Why Finance with Koli One?</Text>
                    <BenefitItem icon="flash-outline" title="Instant Approval" text="Get a decision in minutes from our partner banks." />
                    <BenefitItem icon="shield-checkmark-outline" title="Trusted Partners" text="We work with Bulgaria's leading financial institutions." />
                    <BenefitItem icon="pricetag-outline" title="Lowest Rates" text="Competitive interest rates starting from 3.5%." />
                </View>

                <View style={{ height: 40 }} />
            </ScrollView>
        </Container>
    );
}

function BenefitItem({ icon, title, text }: { icon: any, title: string, text: string }) {
    return (
        <View style={{ flexDirection: 'row', marginBottom: 20, gap: 16 }}>
            <View style={{ width: 44, height: 44, borderRadius: 12, backgroundColor: theme.colors.primary.main + '15', justifyContent: 'center', alignItems: 'center' }}>
                <Ionicons name={icon} size={24} color={theme.colors.primary.main} />
            </View>
            <View style={{ flex: 1 }}>
                <Text style={{ fontWeight: '700', fontSize: 16, marginBottom: 2 }}>{title}</Text>
                <Text style={{ fontSize: 14, color: theme.colors.text.secondary }}>{text}</Text>
            </View>
        </View>
    );
}
