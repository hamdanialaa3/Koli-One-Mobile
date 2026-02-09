/**
 * Onboarding Screen 1: User Intent Selection
 * "What are you looking for?" → Buy / Sell / Browse
 */

import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import styled from 'styled-components/native';
import { Ionicons } from '@expo/vector-icons';
import { UserIntent } from '../../constants/onboarding';

interface OnboardingScreen1Props {
  onSelect: (intent: UserIntent) => void;
}

const Container = styled.View`
  flex: 1;
  background-color: #FFFFFF;
  padding: 40px 24px;
`;

const Header = styled.View`
  margin-bottom: 60px;
  align-items: center;
`;

const Title = styled.Text`
  font-size: 28px;
  font-weight: bold;
  color: #1A1A1A;
  text-align: center;
  margin-bottom: 12px;
`;

const Subtitle = styled.Text`
  font-size: 16px;
  color: #666666;
  text-align: center;
`;

const OptionsContainer = styled.View`
  flex: 1;
  justify-content: center;
  gap: 20px;
`;

const OptionCard = styled.TouchableOpacity`
  background-color: #F5F5F5;
  border-radius: 16px;
  padding: 24px;
  flex-direction: row;
  align-items: center;
  border: 2px solid #F5F5F5;
  elevation: 2;
  shadow-color: #000;
  shadow-offset: 0px 2px;
  shadow-opacity: 0.1;
  shadow-radius: 4px;
`;

const IconContainer = styled.View<{ bgColor: string }>`
  width: 56px;
  height: 56px;
  border-radius: 28px;
  background-color: ${props => props.bgColor};
  justify-content: center;
  align-items: center;
  margin-right: 16px;
`;

const TextContainer = styled.View`
  flex: 1;
`;

const OptionTitle = styled.Text`
  font-size: 20px;
  font-weight: 600;
  color: #1A1A1A;
  margin-bottom: 4px;
`;

const OptionDescription = styled.Text`
  font-size: 14px;
  color: #666666;
`;

const ProgressIndicator = styled.View`
  flex-direction: row;
  justify-content: center;
  gap: 8px;
  margin-top: 40px;
`;

const ProgressDot = styled.View<{ active: boolean }>`
  width: ${props => props.active ? '24px' : '8px'};
  height: 8px;
  border-radius: 4px;
  background-color: ${props => props.active ? '#667EEA' : '#E0E0E0'};
`;

const OnboardingScreen1: React.FC<OnboardingScreen1Props> = ({ onSelect }) => {
  return (
    <Container>
      <Header>
        <Title>Какво търсите?</Title>
        <Subtitle>Изберете вашата цел, за да персонализираме търсенето</Subtitle>
      </Header>

      <OptionsContainer>
        <OptionCard onPress={() => onSelect('buy')} activeOpacity={0.7}>
          <IconContainer bgColor="#E8F5E9">
            <Ionicons name="search" size={28} color="#4CAF50" />
          </IconContainer>
          <TextContainer>
            <OptionTitle>Купувам</OptionTitle>
            <OptionDescription>Търся автомобил за покупка</OptionDescription>
          </TextContainer>
          <Ionicons name="chevron-forward" size={24} color="#CCCCCC" />
        </OptionCard>

        <OptionCard onPress={() => onSelect('sell')} activeOpacity={0.7}>
          <IconContainer bgColor="#FFF3E0">
            <Ionicons name="cash-outline" size={28} color="#FF9800" />
          </IconContainer>
          <TextContainer>
            <OptionTitle>Продавам</OptionTitle>
            <OptionDescription>Искам да продам моя автомобил</OptionDescription>
          </TextContainer>
          <Ionicons name="chevron-forward" size={24} color="#CCCCCC" />
        </OptionCard>

        <OptionCard onPress={() => onSelect('browse')} activeOpacity={0.7}>
          <IconContainer bgColor="#E3F2FD">
            <Ionicons name="eye-outline" size={28} color="#2196F3" />
          </IconContainer>
          <TextContainer>
            <OptionTitle>Разглеждам</OptionTitle>
            <OptionDescription>Само гледам какво има на пазара</OptionDescription>
          </TextContainer>
          <Ionicons name="chevron-forward" size={24} color="#CCCCCC" />
        </OptionCard>
      </OptionsContainer>

      <ProgressIndicator>
        <ProgressDot active={true} />
        <ProgressDot active={false} />
        <ProgressDot active={false} />
      </ProgressIndicator>
    </Container>
  );
};

export default OnboardingScreen1;
