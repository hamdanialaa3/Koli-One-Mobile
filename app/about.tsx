import React from 'react';
import styled from 'styled-components/native';
import { ScrollView, View, Linking, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../src/styles/theme';
import { MobileHeader } from '../src/components/common/MobileHeader';

const Container = styled.SafeAreaView`
  flex: 1;
  background-color: ${props => props.theme.colors.background.default};
`;

const HeroSection = styled.View`
  align-items: center;
  padding: 40px 24px;
  background-color: ${props => props.theme.colors.background.dark};
`;

const LogoText = styled.Text`
  font-size: 36px;
  font-weight: 900;
  color: #fff;
  margin-top: 16px;
`;

const Tagline = styled.Text`
  font-size: 16px;
  color: rgba(255, 255, 255, 0.7);
  margin-top: 8px;
  text-align: center;
`;

const Section = styled.View`
  padding: 24px;
`;

const SectionTitle = styled.Text`
  font-size: 20px;
  font-weight: 800;
  color: ${props => props.theme.colors.text.primary};
  margin-bottom: 12px;
`;

const SectionText = styled.Text`
  font-size: 15px;
  line-height: 24px;
  color: ${props => props.theme.colors.text.secondary};
`;

const FeatureCard = styled.View`
  flex-direction: row;
  align-items: center;
  padding: 16px;
  background-color: ${props => props.theme.colors.background.paper};
  border-radius: 16px;
  margin-bottom: 12px;
  border-width: 1px;
  border-color: ${props => props.theme.colors.border.muted};
`;

const FeatureIcon = styled.View`
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background-color: ${props => props.theme.colors.primary.main}15;
  align-items: center;
  justify-content: center;
  margin-right: 16px;
`;

const FeatureText = styled.View`
  flex: 1;
`;

const FeatureTitle = styled.Text`
  font-size: 16px;
  font-weight: 700;
  color: ${props => props.theme.colors.text.primary};
  margin-bottom: 4px;
`;

const FeatureDesc = styled.Text`
  font-size: 13px;
  color: ${props => props.theme.colors.text.secondary};
`;

const VersionText = styled.Text`
  font-size: 13px;
  color: ${props => props.theme.colors.text.disabled};
  text-align: center;
  padding: 24px;
`;

export default function AboutScreen() {
    const features = [
        { icon: 'search-outline', title: 'Smart Search', desc: 'AI-powered search with advanced filters to find your perfect car.' },
        { icon: 'shield-checkmark-outline', title: 'Verified Listings', desc: 'All listings are verified for authenticity and accuracy.' },
        { icon: 'chatbubble-outline', title: 'Instant Messaging', desc: 'Connect directly with sellers through our secure messaging.' },
        { icon: 'analytics-outline', title: 'Price Analytics', desc: 'AI-driven price estimation and market analysis.' },
        { icon: 'camera-outline', title: 'Visual Search', desc: 'Take a photo of any car and find similar listings instantly.' },
        { icon: 'map-outline', title: 'Map View', desc: 'Find cars near you with our interactive map.' },
    ];

    return (
        <Container theme={theme}>
            <MobileHeader title="About" back />
            <ScrollView showsVerticalScrollIndicator={false}>
                <HeroSection theme={theme}>
                    <Ionicons name="car-sport" size={64} color={theme.colors.secondary.main} />
                    <LogoText>Koli One</LogoText>
                    <Tagline>Bulgaria's Premium Car Marketplace</Tagline>
                </HeroSection>

                <Section>
                    <SectionTitle theme={theme}>Our Mission</SectionTitle>
                    <SectionText theme={theme}>
                        Koli One is Bulgaria's leading digital car marketplace, connecting buyers and sellers with a modern, transparent, and secure platform. We leverage AI technology to make buying and selling cars easier than ever.
                    </SectionText>
                </Section>

                <Section style={{ paddingTop: 0 }}>
                    <SectionTitle theme={theme}>Features</SectionTitle>
                    {features.map((f, i) => (
                        <FeatureCard key={i} theme={theme}>
                            <FeatureIcon theme={theme}>
                                <Ionicons name={f.icon as any} size={24} color={theme.colors.primary.main} />
                            </FeatureIcon>
                            <FeatureText>
                                <FeatureTitle theme={theme}>{f.title}</FeatureTitle>
                                <FeatureDesc theme={theme}>{f.desc}</FeatureDesc>
                            </FeatureText>
                        </FeatureCard>
                    ))}
                </Section>

                <Section style={{ paddingTop: 0 }}>
                    <SectionTitle theme={theme}>Contact Us</SectionTitle>
                    <TouchableOpacity onPress={() => Linking.openURL('mailto:support@koli.one')}>
                        <FeatureCard theme={theme}>
                            <FeatureIcon theme={theme}>
                                <Ionicons name="mail-outline" size={24} color={theme.colors.primary.main} />
                            </FeatureIcon>
                            <FeatureText>
                                <FeatureTitle theme={theme}>Email Support</FeatureTitle>
                                <FeatureDesc theme={theme}>support@koli.one</FeatureDesc>
                            </FeatureText>
                        </FeatureCard>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => Linking.openURL('https://koli.one')}>
                        <FeatureCard theme={theme}>
                            <FeatureIcon theme={theme}>
                                <Ionicons name="globe-outline" size={24} color={theme.colors.primary.main} />
                            </FeatureIcon>
                            <FeatureText>
                                <FeatureTitle theme={theme}>Website</FeatureTitle>
                                <FeatureDesc theme={theme}>www.koli.one</FeatureDesc>
                            </FeatureText>
                        </FeatureCard>
                    </TouchableOpacity>
                </Section>

                <VersionText theme={theme}>Koli One v1.0.0 • © 2026 All Rights Reserved</VersionText>
                <View style={{ height: 40 }} />
            </ScrollView>
        </Container>
    );
}
