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

export default function TermsOfServiceScreen() {
    return (
        <Container theme={theme}>
            <MobileHeader title="Terms of Service" back />
            <Content showsVerticalScrollIndicator={false}>
                <Title theme={theme}>Terms of Service</Title>
                <Paragraph theme={theme}>
                    Welcome to Koli One. By using our application, you agree to comply with the following terms and conditions.
                </Paragraph>

                <Subtitle theme={theme}>1. Acceptance of Terms</Subtitle>
                <Paragraph theme={theme}>
                    By accessing or using Koli One, you agree to be bound by these Terms of Service and all applicable laws and regulations.
                </Paragraph>

                <Subtitle theme={theme}>2. Listing Rules</Subtitle>
                <Paragraph theme={theme}>
                    Users must provide accurate information when listing a vehicle.
                    Fraudulent listings or misrepresentation of vehicle condition will result in account suspension.
                </Paragraph>

                <Subtitle theme={theme}>3. User Conduct</Subtitle>
                <Paragraph theme={theme}>
                    You agree not to use the service for any illegal purposes or to harass other users.
                    We reserve the right to terminate accounts that violate these rules.
                </Paragraph>

                <View style={{ height: 60 }} />
            </Content>
        </Container>
    );
}
