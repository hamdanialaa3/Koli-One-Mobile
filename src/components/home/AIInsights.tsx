import React from 'react';
import styled from 'styled-components/native';
import { View, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../styles/theme';
import { LinearGradient } from 'expo-linear-gradient';

const Container = styled.View`
  margin: 20px;
  padding: 20px;
  border-radius: 24px;
  background-color: ${props => props.theme.colors.background.paper};
  border-width: 1px;
  border-color: ${props => props.theme.colors.border.muted};
  overflow: hidden;
`;

const GlassOverlay = styled(LinearGradient).attrs({
    colors: ['rgba(37, 99, 235, 0.1)', 'transparent'],
    start: { x: 0, y: 0 },
    end: { x: 1, y: 1 }
})`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
`;

const Header = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
`;

const Badge = styled.View`
  background-color: ${props => props.theme.colors.primary.main + '20'};
  padding: 4px 12px;
  border-radius: 20px;
  flex-direction: row;
  align-items: center;
`;

const BadgeText = styled.Text`
  font-size: 12px;
  font-weight: 800;
  color: ${props => props.theme.colors.primary.main};
  margin-left: 4px;
  text-transform: uppercase;
`;

const Title = styled.Text`
  font-size: 18px;
  font-weight: 800;
  color: ${props => props.theme.colors.text.primary};
`;

const InsightCard = styled.View`
  flex-direction: row;
  align-items: center;
  background-color: ${props => props.theme.colors.background.default};
  padding: 16px;
  border-radius: 16px;
  margin-bottom: 12px;
`;

const IconBox = styled.View<{ color: string }>`
  width: 40px;
  height: 40px;
  border-radius: 12px;
  background-color: ${props => props.color + '15'};
  align-items: center;
  justify-content: center;
  margin-right: 16px;
`;

const InsightTextContent = styled.View`
  flex: 1;
`;

const InsightTitle = styled.Text`
  font-size: 14px;
  font-weight: 700;
  color: ${props => props.theme.colors.text.primary};
`;

const InsightDesc = styled.Text`
  font-size: 12px;
  color: ${props => props.theme.colors.text.secondary};
  margin-top: 2px;
`;

export default function AIInsights() {
    const insights = [
        {
            id: 1,
            title: "Market Opportunity",
            desc: "SUVs in Sofia are selling 15% faster this week.",
            icon: "trending-up",
            color: theme.colors.primary.main
        },
        {
            id: 2,
            title: "Price Alert",
            desc: "A car in your favorites dropped by €1,200.",
            icon: "pricetag",
            color: "#34C759"
        },
        {
            id: 3,
            title: "Smart Tip",
            desc: "Adding 5 more interior photos increases views by 40%.",
            icon: "bulb",
            color: "#FF9500"
        }
    ];

    return (
        <Container theme={theme}>
            <GlassOverlay />
            <Header>
                <Title theme={theme}>AI Insights</Title>
                <Badge theme={theme}>
                    <Ionicons name="sparkles" size={14} color={theme.colors.primary.main} />
                    <BadgeText theme={theme}>Live</BadgeText>
                </Badge>
            </Header>

            {insights.map(item => (
                <InsightCard key={item.id} theme={theme}>
                    <IconBox color={item.color}>
                        <Ionicons name={item.icon as any} size={20} color={item.color} />
                    </IconBox>
                    <InsightTextContent>
                        <InsightTitle theme={theme}>{item.title}</InsightTitle>
                        <InsightDesc theme={theme}>{item.desc}</InsightDesc>
                    </InsightTextContent>
                    <Ionicons name="chevron-forward" size={16} color={theme.colors.text.disabled} />
                </InsightCard>
            ))}

            <TouchableOpacity style={{ marginTop: 8 }}>
                <InsightTitle style={{ color: theme.colors.primary.main, textAlign: 'center' }}>
                    View Market Report
                </InsightTitle>
            </TouchableOpacity>
        </Container>
    );
}
