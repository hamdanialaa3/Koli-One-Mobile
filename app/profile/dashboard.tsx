import React, { useState } from 'react';
import styled from 'styled-components/native';
import { MobileHeader } from '../../src/components/common/MobileHeader';
import { theme } from '../../src/styles/theme';
import {
    View,
    ScrollView,
    Text,
    TouchableOpacity,
    Dimensions
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const Container = styled.SafeAreaView`
  flex: 1;
  background-color: ${props => props.theme.colors.background.default};
`;

const Content = styled.ScrollView`
  flex: 1;
`;

const WelcomeSection = styled.View`
  padding: 24px 20px;
`;

const Title = styled.Text`
  font-size: 28px;
  font-weight: 800;
  color: ${props => props.theme.colors.text.primary};
`;

const Subtitle = styled.Text`
  font-size: 16px;
  color: ${props => props.theme.colors.text.secondary};
  margin-top: 4px;
`;

const SummaryGrid = styled.View`
  flex-direction: row;
  flex-wrap: wrap;
  padding: 0 20px;
  gap: 16px;
`;

const SummaryCard = styled.View`
  width: ${(Dimensions.get('window').width - 56) / 2}px;
  background-color: ${props => props.theme.colors.background.paper};
  padding: 20px;
  border-radius: 20px;
  border-width: 1px;
  border-color: ${props => props.theme.colors.border.muted};
`;

const CardLabel = styled.Text`
  font-size: 12px;
  font-weight: 700;
  color: ${props => props.theme.colors.text.secondary};
  text-transform: uppercase;
  margin-bottom: 8px;
`;

const CardValue = styled.Text`
  font-size: 24px;
  font-weight: 800;
  color: ${props => props.theme.colors.primary.main};
`;

const ActivitySection = styled.View`
  padding: 32px 20px;
`;

const SectionHeader = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
`;

const SectionTitle = styled.Text`
  font-size: 18px;
  font-weight: 800;
  color: ${props => props.theme.colors.text.primary};
`;

const ActivityItem = styled.View`
  background-color: ${props => props.theme.colors.background.paper};
  padding: 16px;
  border-radius: 16px;
  margin-bottom: 12px;
  flex-direction: row;
  align-items: center;
  border-width: 1px;
  border-color: ${props => props.theme.colors.border.muted};
`;

const IconBox = styled.View<{ color: string }>`
  width: 44px;
  height: 44px;
  border-radius: 12px;
  background-color: ${props => props.color}15;
  justify-content: center;
  align-items: center;
`;

export default function DashboardScreen() {
    return (
        <Container theme={theme}>
            <MobileHeader title="Executive Dashboard" back />
            <Content showsVerticalScrollIndicator={false}>
                <WelcomeSection>
                    <Title theme={theme}>System Status</Title>
                    <Subtitle theme={theme}>Operational • Neural Link 100%</Subtitle>
                </WelcomeSection>

                <SummaryGrid>
                    <SummaryCard theme={theme}>
                        <CardLabel theme={theme}>Ad Pulse</CardLabel>
                        <CardValue theme={theme}>12 active</CardValue>
                    </SummaryCard>
                    <SummaryCard theme={theme}>
                        <CardLabel theme={theme}>Impression</CardLabel>
                        <CardValue theme={theme}>8.4k</CardValue>
                    </SummaryCard>
                    <SummaryCard theme={theme}>
                        <CardLabel theme={theme}>Conversion</CardLabel>
                        <CardValue theme={theme}>2.1%</CardValue>
                    </SummaryCard>
                    <SummaryCard theme={theme}>
                        <CardLabel theme={theme}>Balance</CardLabel>
                        <CardValue theme={theme}>€142.50</CardValue>
                    </SummaryCard>
                </SummaryGrid>

                <ActivitySection>
                    <SectionHeader>
                        <SectionTitle theme={theme}>Real-time Activity</SectionTitle>
                        <TouchableOpacity>
                            <Text style={{ color: theme.colors.primary.main, fontWeight: '700' }}>See all</Text>
                        </TouchableOpacity>
                    </SectionHeader>

                    <ActivityItem theme={theme}>
                        <IconBox color="#10b981">
                            <Ionicons name="trending-up" size={24} color="#10b981" />
                        </IconBox>
                        <View style={{ flex: 1, marginLeft: 16 }}>
                            <Text style={{ fontWeight: '700', fontSize: 14, color: theme.colors.text.primary }}>New Lead Captured</Text>
                            <Text style={{ fontSize: 12, color: theme.colors.text.secondary }}>BMW M5 Competition • 2m ago</Text>
                        </View>
                    </ActivityItem>

                    <ActivityItem theme={theme}>
                        <IconBox color="#3b82f6">
                            <Ionicons name="chatbubbles-outline" size={24} color="#3b82f6" />
                        </IconBox>
                        <View style={{ flex: 1, marginLeft: 16 }}>
                            <Text style={{ fontWeight: '700', fontSize: 14, color: theme.colors.text.primary }}>Inquiry received</Text>
                            <Text style={{ fontSize: 12, color: theme.colors.text.secondary }}>Audi RS6 Avant • 45m ago</Text>
                        </View>
                    </ActivityItem>

                    <ActivityItem theme={theme}>
                        <IconBox color="#f59e0b">
                            <Ionicons name="star-outline" size={24} color="#f59e0b" />
                        </IconBox>
                        <View style={{ flex: 1, marginLeft: 16 }}>
                            <Text style={{ fontWeight: '700', fontSize: 14, color: theme.colors.text.primary }}>Draft Auto-saved</Text>
                            <Text style={{ fontSize: 12, color: theme.colors.text.secondary }}>Mercedes G63 AMG • 1h ago</Text>
                        </View>
                    </ActivityItem>
                </ActivitySection>

                <View style={{ padding: 20 }}>
                    <LinearGradient
                        colors={[theme.colors.primary.main, theme.colors.primary.dark || theme.colors.primary.main]}
                        style={{ padding: 24, borderRadius: 24 }}
                    >
                        <Text style={{ color: 'white', fontSize: 20, fontWeight: '900', marginBottom: 8 }}>Go Premium</Text>
                        <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 14, marginBottom: 20 }}>Unlock deep B2B analytics and AI-driven market insights.</Text>
                        <TouchableOpacity style={{ backgroundColor: 'white', padding: 12, borderRadius: 12, alignSelf: 'flex-start' }}>
                            <Text style={{ color: theme.colors.primary.main, fontWeight: '800' }}>Upgrade Enterprise</Text>
                        </TouchableOpacity>
                    </LinearGradient>
                </View>

                <View style={{ height: 40 }} />
            </Content>
        </Container >
    );
}
