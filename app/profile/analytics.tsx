import React from 'react';
import styled from 'styled-components/native';
import { MobileHeader } from '../../src/components/common/MobileHeader';
import { theme } from '../../src/styles/theme';
import { View, ScrollView, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const Container = styled.SafeAreaView`
  flex: 1;
  background-color: ${props => props.theme.colors.background.default};
`;

const Content = styled.ScrollView`
  flex: 1;
  padding: 20px;
`;

const OverviewCard = styled.View`
  background-color: ${props => props.theme.colors.background.paper};
  padding: 24px;
  border-radius: 20px;
  margin-bottom: 24px;
  border-width: 1px;
  border-color: ${props => props.theme.colors.border.muted};
`;

const CardTitle = styled.Text`
  font-size: 14px;
  font-weight: 700;
  color: ${props => props.theme.colors.text.secondary};
  text-transform: uppercase;
  margin-bottom: 20px;
  letter-spacing: 1px;
`;

const StatGrid = styled.View`
  flex-direction: row;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: 16px;
`;

const StatBox = styled.View`
  width: 47%;
  background-color: ${props => props.theme.colors.background.default};
  padding: 16px;
  border-radius: 16px;
`;

const StatValue = styled.Text`
  font-size: 20px;
  font-weight: 800;
  color: ${props => props.theme.colors.primary.main};
`;

const StatLabel = styled.Text`
  font-size: 12px;
  color: ${props => props.theme.colors.text.secondary};
  margin-top: 4px;
`;

const ChartPlaceholder = styled.View`
  height: 200px;
  background-color: ${props => props.theme.colors.background.default};
  border-radius: 16px;
  margin-bottom: 24px;
  justify-content: center;
  align-items: center;
  border-width: 1px;
  border-style: dashed;
  border-color: ${props => props.theme.colors.border.muted};
`;

const InfoText = styled.Text`
  font-size: 14px;
  color: ${props => props.theme.colors.text.secondary};
  text-align: center;
  padding: 0 40px;
  line-height: 20px;
`;

import { AnalyticsSystem } from '../../src/components/analytics/AnalyticsSystem';

export default function AnalyticsScreen() {
  // Mock Data mimicking Web
  const viewsData = [
    { value: 45, label: 'Mon', dataPointText: '45' },
    { value: 72, label: 'Tue', dataPointText: '72' },
    { value: 65, label: 'Wed', dataPointText: '65' },
    { value: 98, label: 'Thu', dataPointText: '98' },
    { value: 120, label: 'Fri', dataPointText: '120' },
    { value: 85, label: 'Sat', dataPointText: '85' },
    { value: 55, label: 'Sun', dataPointText: '55' },
  ];

  const deviceData = [
    { value: 65, color: theme.colors.primary.main, text: 'Mobile' },
    { value: 25, color: theme.colors.secondary.main, text: 'Desktop' },
    { value: 10, color: theme.colors.text.disabled, text: 'Tablet' },
  ];

  const locationData = [
    { value: 350, label: 'Sofia', frontColor: theme.colors.primary.main },
    { value: 200, label: 'Plovdiv', frontColor: theme.colors.secondary.main },
    { value: 150, label: 'Varna', frontColor: theme.colors.primary.light },
    { value: 100, label: 'Burgas', frontColor: theme.colors.secondary.light },
  ];

  return (
    <Container theme={theme}>
      <MobileHeader title="Analytics" back />
      <Content showsVerticalScrollIndicator={false}>

        <OverviewCard theme={theme}>
          <CardTitle theme={theme}>Monthly Performance</CardTitle>
          <StatGrid>
            <StatBox theme={theme}>
              <StatValue theme={theme}>1,248</StatValue>
              <StatLabel theme={theme}>Total Views</StatLabel>
            </StatBox>
            <StatBox theme={theme}>
              <StatValue theme={theme}>42</StatValue>
              <StatLabel theme={theme}>Leads</StatLabel>
            </StatBox>
            <StatBox theme={theme}>
              <StatValue theme={theme}>3.4%</StatValue>
              <StatLabel theme={theme}>CTR</StatLabel>
            </StatBox>
            <StatBox theme={theme}>
              <StatValue theme={theme}>12</StatValue>
              <StatLabel theme={theme}>Saves</StatLabel>
            </StatBox>
          </StatGrid>
        </OverviewCard>

        <AnalyticsSystem
          title="Views Trend"
          subtitle="Last 7 Days"
          type="line"
          data={viewsData}
          height={250}
        />

        <AnalyticsSystem
          title="Device Usage"
          subtitle="User devices breakdown"
          type="pie"
          data={deviceData}
          height={250}
        />

        <AnalyticsSystem
          title="Top Locations"
          subtitle="Views by City"
          type="bar"
          data={locationData}
          height={250}
        />

        <OverviewCard theme={theme}>
          <CardTitle theme={theme}>Top Performing Ad</CardTitle>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
            <View style={{ width: 60, height: 60, borderRadius: 12, backgroundColor: '#eee' }} />
            <View style={{ flex: 1 }}>
              <StatValue theme={theme} style={{ fontSize: 16 }}>BMW M5 Competition</StatValue>
              <StatLabel theme={theme}>482 views this week</StatLabel>
            </View>
            <Ionicons name="chevron-forward" size={20} color={theme.colors.text.disabled} />
          </View>
        </OverviewCard>

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
