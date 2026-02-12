import React from 'react';
import styled from 'styled-components/native';
import { ScrollView, View, Linking, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../src/styles/theme';
import { MobileHeader } from '../src/components/common/MobileHeader';
import { useAuth } from '../src/contexts/AuthContext';
import { useRouter } from 'expo-router';

const Container = styled.SafeAreaView`
  flex: 1;
  background-color: ${props => props.theme.colors.background.default};
`;

const Section = styled.View`
  margin: 16px 20px;
  background-color: ${props => props.theme.colors.background.paper};
  border-radius: 20px;
  overflow: hidden;
  border-width: 1px;
  border-color: ${props => props.theme.colors.border.muted};
`;

const SectionHeader = styled.View`
  padding: 16px 20px;
  border-bottom-width: 1px;
  border-bottom-color: ${props => props.theme.colors.border.muted};
`;

const SectionTitle = styled.Text`
  font-size: 18px;
  font-weight: 800;
  color: ${props => props.theme.colors.text.primary};
`;

const HelpItem = styled.TouchableOpacity`
  flex-direction: row;
  align-items: center;
  padding: 16px 20px;
  border-bottom-width: 1px;
  border-bottom-color: ${props => props.theme.colors.border.muted};
`;

const HelpIcon = styled.View`
  width: 40px;
  height: 40px;
  border-radius: 12px;
  background-color: ${props => props.theme.colors.primary.main}12;
  align-items: center;
  justify-content: center;
  margin-right: 14px;
`;

const HelpText = styled.View`
  flex: 1;
`;

const HelpTitle = styled.Text`
  font-size: 15px;
  font-weight: 700;
  color: ${props => props.theme.colors.text.primary};
`;

const HelpDesc = styled.Text`
  font-size: 13px;
  color: ${props => props.theme.colors.text.secondary};
  margin-top: 2px;
`;

export default function HelpScreen() {
    const router = useRouter();
    const { user } = useAuth();

    const faqItems = [
        {
            icon: 'car-outline',
            title: 'How to list a car?',
            desc: 'Go to the Sell tab and follow the step-by-step process.',
        },
        {
            icon: 'search-outline',
            title: 'How to search for cars?',
            desc: 'Use the Search tab with filters for make, model, price, and more.',
        },
        {
            icon: 'chatbubble-outline',
            title: 'How to contact a seller?',
            desc: 'Open any car listing and tap Call, Message, or WhatsApp.',
        },
        {
            icon: 'heart-outline',
            title: 'How to save favorites?',
            desc: 'Tap the heart icon on any car listing to save it.',
        },
        {
            icon: 'notifications-outline',
            title: 'How to get price drop alerts?',
            desc: 'Save a search and enable notifications for new matches.',
        },
        {
            icon: 'shield-outline',
            title: 'Is my data safe?',
            desc: 'Yes, we use enterprise-grade encryption and follow GDPR.',
        },
    ];

    const supportActions = [
        {
            icon: 'mail-outline',
            title: 'Email Support',
            desc: 'support@koli.one',
            onPress: () => Linking.openURL('mailto:support@koli.one'),
        },
        {
            icon: 'globe-outline',
            title: 'Visit Website',
            desc: 'www.koli.one/help',
            onPress: () => Linking.openURL('https://koli.one/help'),
        },
        {
            icon: 'chatbubbles-outline',
            title: 'Contact Us',
            desc: 'Send us a message',
            onPress: () => router.push('/contact'),
        },
    ];

    return (
        <Container theme={theme}>
            <MobileHeader title="Help & Support" back />
            <ScrollView showsVerticalScrollIndicator={false}>
                <Section theme={theme}>
                    <SectionHeader theme={theme}>
                        <SectionTitle theme={theme}>Frequently Asked Questions</SectionTitle>
                    </SectionHeader>
                    {faqItems.map((item, index) => (
                        <HelpItem key={index} theme={theme} activeOpacity={0.7}>
                            <HelpIcon theme={theme}>
                                <Ionicons name={item.icon as any} size={20} color={theme.colors.primary.main} />
                            </HelpIcon>
                            <HelpText>
                                <HelpTitle theme={theme}>{item.title}</HelpTitle>
                                <HelpDesc theme={theme}>{item.desc}</HelpDesc>
                            </HelpText>
                        </HelpItem>
                    ))}
                </Section>

                <Section theme={theme}>
                    <SectionHeader theme={theme}>
                        <SectionTitle theme={theme}>Contact Support</SectionTitle>
                    </SectionHeader>
                    {supportActions.map((item, index) => (
                        <HelpItem key={index} theme={theme} onPress={item.onPress}>
                            <HelpIcon theme={theme}>
                                <Ionicons name={item.icon as any} size={20} color={theme.colors.primary.main} />
                            </HelpIcon>
                            <HelpText>
                                <HelpTitle theme={theme}>{item.title}</HelpTitle>
                                <HelpDesc theme={theme}>{item.desc}</HelpDesc>
                            </HelpText>
                            <Ionicons name="chevron-forward" size={18} color={theme.colors.text.disabled} />
                        </HelpItem>
                    ))}
                </Section>

                <Section theme={theme}>
                    <SectionHeader theme={theme}>
                        <SectionTitle theme={theme}>Legal</SectionTitle>
                    </SectionHeader>
                    <HelpItem theme={theme} onPress={() => router.push('/privacy-policy')}>
                        <HelpIcon theme={theme}>
                            <Ionicons name="document-text-outline" size={20} color={theme.colors.primary.main} />
                        </HelpIcon>
                        <HelpText>
                            <HelpTitle theme={theme}>Privacy Policy</HelpTitle>
                        </HelpText>
                        <Ionicons name="chevron-forward" size={18} color={theme.colors.text.disabled} />
                    </HelpItem>
                    <HelpItem theme={theme} onPress={() => router.push('/terms-of-service')}>
                        <HelpIcon theme={theme}>
                            <Ionicons name="document-outline" size={20} color={theme.colors.primary.main} />
                        </HelpIcon>
                        <HelpText>
                            <HelpTitle theme={theme}>Terms of Service</HelpTitle>
                        </HelpText>
                        <Ionicons name="chevron-forward" size={18} color={theme.colors.text.disabled} />
                    </HelpItem>
                    <HelpItem theme={theme} onPress={() => router.push('/about')}>
                        <HelpIcon theme={theme}>
                            <Ionicons name="information-circle-outline" size={20} color={theme.colors.primary.main} />
                        </HelpIcon>
                        <HelpText>
                            <HelpTitle theme={theme}>About Koli One</HelpTitle>
                        </HelpText>
                        <Ionicons name="chevron-forward" size={18} color={theme.colors.text.disabled} />
                    </HelpItem>
                </Section>

                <View style={{ height: 40 }} />
            </ScrollView>
        </Container>
    );
}
