import React from 'react';
import styled from 'styled-components/native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../styles/theme';
import { BlurView } from 'expo-blur';

const Container = styled.View`
  margin: 32px 20px;
  align-items: center;
`;

const TrustContainer = styled.View`
  flex-direction: row;
  flex-wrap: wrap;
  justify-content: center;
  gap: 12px;
  width: 100%;
`;

const TrustItemContainer = styled.View`
  border-radius: 16px;
  overflow: hidden;
  border-width: 1px;
  border-color: rgba(255, 255, 255, 0.2);
  width: 48%;
`;

const TrustItem = styled(BlurView)`
  flex-direction: row;
  align-items: center;
  padding: 12px 16px;
  background-color: rgba(255, 255, 255, 0.05);
`;

const TrustText = styled.Text`
  font-size: 13px;
  font-weight: 700;
  color: ${props => props.theme.colors.text.primary};
  margin-left: 10px;
  flex: 1;
`;

const StatsCard = styled.View`
  width: 100%;
  background-color: ${props => props.theme.colors.background.paper};
  border-radius: 20px;
  padding: 24px;
  margin-top: 24px;
  border-width: 1px;
  border-color: ${props => props.theme.colors.border.muted};
  flex-direction: row;
  justify-content: space-around;
`;

const StatItem = styled.View`
  align-items: center;
`;

const StatNumber = styled.Text`
  font-size: 22px;
  font-weight: 800;
  color: ${props => props.theme.colors.primary.main};
`;

const StatLabel = styled.Text`
  font-size: 11px;
  color: ${props => props.theme.colors.text.secondary};
  text-transform: uppercase;
  margin-top: 4px;
  font-weight: 600;
`;

export default function TrustAndStats() {
  return (
    <Container>
      <TrustContainer>
        <TrustItemContainer>
          <TrustItem intensity={10} tint="light">
            <Ionicons name="shield-checkmark" size={20} color={theme.colors.status.success} />
            <TrustText>Проверени Продавачи</TrustText>
          </TrustItem>
        </TrustItemContainer>

        <TrustItemContainer>
          <TrustItem intensity={10} tint="light">
            <Ionicons name="lock-closed" size={20} color={theme.colors.primary.main} />
            <TrustText>Сигурни Сделки</TrustText>
          </TrustItem>
        </TrustItemContainer>

        <TrustItemContainer>
          <TrustItem intensity={10} tint="light">
            <Ionicons name="calendar" size={20} color={theme.colors.accent.main} />
            <TrustText>Ежедневни Обяви</TrustText>
          </TrustItem>
        </TrustItemContainer>

        <TrustItemContainer>
          <TrustItem intensity={10} tint="light">
            <Ionicons name="trophy" size={20} color="#fbbf24" />
            <TrustText>#1 в България</TrustText>
          </TrustItem>
        </TrustItemContainer>
      </TrustContainer>

      <StatsCard>
        <StatItem>
          <StatNumber>15k+</StatNumber>
          <StatLabel>Автомобила</StatLabel>
        </StatItem>
        <StatItem>
          <StatNumber>98%</StatNumber>
          <StatLabel>Доверие</StatLabel>
        </StatItem>
        <StatItem>
          <StatNumber>24/7</StatNumber>
          <StatLabel>Поддръжка</StatLabel>
        </StatItem>
      </StatsCard>
    </Container>
  );
}
