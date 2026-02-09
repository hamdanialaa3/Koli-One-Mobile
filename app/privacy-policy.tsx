import React from 'react';
import styled from 'styled-components/native';
import { MobileHeader } from '../src/components/common/MobileHeader';
import { theme } from '../src/styles/theme';
import { ScrollView, Text, View } from 'react-native';

const Container = styled.SafeAreaView`
  flex: 1;
  background-color: ${props => props.theme.colors.background.default};
`;

const Content = styled.ScrollView`
  padding: 24px;
`;

const Title = styled.Text`
  font-size: 24px;
  font-weight: 800;
  color: ${props => props.theme.colors.text.primary};
  margin-bottom: 24px;
`;

const Paragraph = styled.Text`
  font-size: 15px;
  color: ${props => props.theme.colors.text.secondary};
  line-height: 24px;
  margin-bottom: 20px;
`;

const Subtitle = styled.Text`
  font-size: 18px;
  font-weight: 700;
  color: ${props => props.theme.colors.text.primary};
  margin-bottom: 12px;
  margin-top: 8px;
`;

export default function PrivacyPolicyScreen() {
    return (
        <Container theme={theme}>
            <MobileHeader title="Privacy Policy" back />
            <Content showsVerticalScrollIndicator={false}>
                <Title theme={theme}>Privacy Policy</Title>
                <Paragraph theme={theme}>
                    At Koli One, we value your privacy and are committed to protecting your personal data.
                    This policy explains how we collect, use, and safeguard your information.
                </Paragraph>

                <Subtitle theme={theme}>1. Data Collection</Subtitle>
                <Paragraph theme={theme}>
                    We collect information you provide directly to us when you create an account, list a car,
                    or communicate with other users. This includes your name, email, phone number, and location.
                </Paragraph>

                <Subtitle theme={theme}>2. Use of Information</Subtitle>
                <Paragraph theme={theme}>
                    Your information is used to facilitate car sales, provide customer support,
                    and improve our services. We do not sell your personal data to third parties.
                </Paragraph>

                <Subtitle theme={theme}>3. Data Security</Subtitle>
                <Paragraph theme={theme}>
                    We implement industry-standard security measures to protect your data from unauthorized access or disclosure.
                </Paragraph>

                <View style={{ height: 60 }} />
            </Content>
        </Container>
    );
}
