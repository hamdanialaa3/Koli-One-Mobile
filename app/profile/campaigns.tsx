import React from 'react';
import styled from 'styled-components/native';
import { MobileHeader } from '../../src/components/common/MobileHeader';
import { theme } from '../../src/styles/theme';
import { View, ScrollView, TouchableOpacity, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

const Container = styled.SafeAreaView`
  flex: 1;
  background-color: ${props => props.theme.colors.background.default};
`;

const Content = styled.ScrollView`
  flex: 1;
  padding: 20px;
`;

const PromoCard = styled.View`
  background-color: ${props => props.theme.colors.primary.main};
  padding: 24px;
  border-radius: 24px;
  margin-bottom: 24px;
  overflow: hidden;
  position: relative;
`;

const PromoTitle = styled.Text`
  font-size: 20px;
  font-weight: 800;
  color: white;
  margin-bottom: 8px;
`;

const PromoText = styled.Text`
  font-size: 14px;
  color: rgba(255, 255, 255, 0.8);
  margin-bottom: 20px;
  line-height: 20px;
`;

const CreateBtn = styled.TouchableOpacity`
  background-color: white;
  padding: 12px 24px;
  border-radius: 12px;
  align-self: flex-start;
`;

const CreateBtnText = styled.Text`
  color: ${props => props.theme.colors.primary.main};
  font-weight: 700;
  font-size: 14px;
`;

const Glow = styled.View`
  position: absolute;
  top: -40px;
  right: -40px;
  width: 150px;
  height: 150px;
  border-radius: 75px;
  background-color: white;
  opacity: 0.1;
`;

const CampaignList = styled.View`
  margin-top: 12px;
`;

const CampaignItem = styled.View`
  background-color: ${props => props.theme.colors.background.paper};
  padding: 16px;
  border-radius: 16px;
  margin-bottom: 12px;
  flex-direction: row;
  align-items: center;
  border-width: 1px;
  border-color: ${props => props.theme.colors.border.muted};
`;

const StatusBadge = styled.View<{ active?: boolean }>`
  background-color: ${props => props.active ? props.theme.colors.status.success : props.theme.colors.text.disabled}22;
  padding: 4px 8px;
  border-radius: 6px;
  margin-top: 4px;
`;

const StatusText = styled.Text<{ active?: boolean }>`
  font-size: 10px;
  font-weight: 800;
  color: ${props => props.active ? props.theme.colors.status.success : props.theme.colors.text.disabled};
  text-transform: uppercase;
`;

export default function CampaignsScreen() {
  const router = useRouter();

  const mockCampaigns = [
    { id: '1', name: 'Premium Highlight', target: 'Audi RS6 Avant', status: 'Active', active: true },
    { id: '2', name: 'Homepage Slider', target: 'Mercedes-Benz G63', status: 'Completed', active: false },
  ];

  return (
    <Container theme={theme}>
      <MobileHeader title="Campaigns" back />
      <Content showsVerticalScrollIndicator={false}>

        <PromoCard theme={theme}>
          <Glow />
          <PromoTitle>Boost Your Sales</PromoTitle>
          <PromoText>Reach 10x more potential buyers by highlighting your listings in premium slots.</PromoText>
          <CreateBtn theme={theme} onPress={() => router.push('/sell' as any)}>
            <CreateBtnText theme={theme}>New Campaign</CreateBtnText>
          </CreateBtn>
        </PromoCard>

        <SectionTitle>My Campaigns</SectionTitle>
        <CampaignList>
          {mockCampaigns.map(cp => (
            <CampaignItem key={cp.id} theme={theme}>
              <View style={{ width: 44, height: 44, borderRadius: 10, backgroundColor: theme.colors.background.default, justifyContent: 'center', alignItems: 'center' }}>
                <Ionicons name="megaphone-outline" size={24} color={theme.colors.primary.main} />
              </View>
              <View style={{ flex: 1, marginLeft: 16 }}>
                <Text style={{ fontWeight: '700', fontSize: 16, color: theme.colors.text.primary }}>{cp.name}</Text>
                <Text style={{ fontSize: 12, color: theme.colors.text.secondary }}>Target: {cp.target}</Text>
                <StatusBadge theme={theme} active={cp.active}>
                  <StatusText theme={theme} active={cp.active}>{cp.status}</StatusText>
                </StatusBadge>
              </View>
              <Ionicons name="ellipsis-vertical" size={20} color={theme.colors.text.disabled} />
            </CampaignItem>
          ))}
        </CampaignList>

        <View style={{ height: 40 }} />
      </Content>
    </Container>
  );
}

const SectionTitle = styled.Text`
  font-size: 18px;
  font-weight: 800;
  color: ${props => props.theme.colors.text.primary};
  margin-bottom: 16px;
`;
