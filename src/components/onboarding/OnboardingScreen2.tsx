/**
 * Onboarding Screen 2: Vehicle Type Selection
 * "What type of car?" → Car / SUV / Motorcycle (with images)
 */

import React from 'react';
import { View, Text, TouchableOpacity, Dimensions } from 'react-native';
import styled from 'styled-components/native';
import { Ionicons } from '@expo/vector-icons';
import { VehicleType } from '../../constants/onboarding';

interface OnboardingScreen2Props {
  onSelect: (vehicleType: VehicleType) => void;
  onBack: () => void;
}

const Container = styled.View`
  flex: 1;
  background-color: #FFFFFF;
  padding: 40px 24px;
`;

const Header = styled.View`
  margin-bottom: 40px;
`;

const BackButton = styled.TouchableOpacity`
  width: 40px;
  height: 40px;
  border-radius: 20px;
  background-color: #F5F5F5;
  justify-content: center;
  align-items: center;
  margin-bottom: 20px;
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

const VehicleOptionsContainer = styled.View`
  flex: 1;
  justify-content: center;
  gap: 16px;
`;

const VehicleCard = styled.TouchableOpacity`
  background-color: #F9F9F9;
  border-radius: 20px;
  padding: 24px;
  align-items: center;
  border: 3px solid #F9F9F9;
  elevation: 3;
  shadow-color: #000;
  shadow-offset: 0px 4px;
  shadow-opacity: 0.1;
  shadow-radius: 8px;
`;

const VehicleIconContainer = styled.View<{ bgColor: string }>`
  width: 100px;
  height: 100px;
  border-radius: 50px;
  background-color: ${props => props.bgColor};
  justify-content: center;
  align-items: center;
  margin-bottom: 16px;
`;

const VehicleTitle = styled.Text`
  font-size: 22px;
  font-weight: 600;
  color: #1A1A1A;
  margin-bottom: 6px;
`;

const VehicleDescription = styled.Text`
  font-size: 14px;
  color: #666666;
  text-align: center;
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

const OnboardingScreen2: React.FC<OnboardingScreen2Props> = ({ onSelect, onBack }) => {
  return (
    <Container>
      <Header>
        <BackButton onPress={onBack}>
          <Ionicons name="arrow-back" size={24} color="#666666" />
        </BackButton>
        <Title>Какъв тип превозно средство?</Title>
        <Subtitle>Изберете категорията, която ви интересува</Subtitle>
      </Header>

      <VehicleOptionsContainer>
        <VehicleCard onPress={() => onSelect('car')} activeOpacity={0.8}>
          <VehicleIconContainer bgColor="#E8F5E9">
            <Ionicons name="car-outline" size={50} color="#4CAF50" />
          </VehicleIconContainer>
          <VehicleTitle>Лек автомобил</VehicleTitle>
          <VehicleDescription>Седан, хечбек, комби</VehicleDescription>
        </VehicleCard>

        <VehicleCard onPress={() => onSelect('suv')} activeOpacity={0.8}>
          <VehicleIconContainer bgColor="#FFF3E0">
            <Ionicons name="car-sport-outline" size={50} color="#FF9800" />
          </VehicleIconContainer>
          <VehicleTitle>SUV / Джип</VehicleTitle>
          <VehicleDescription>Всъдеход, кросоувър</VehicleDescription>
        </VehicleCard>

        <VehicleCard onPress={() => onSelect('motorcycle')} activeOpacity={0.8}>
          <VehicleIconContainer bgColor="#E3F2FD">
            <Ionicons name="bicycle-outline" size={50} color="#2196F3" />
          </VehicleIconContainer>
          <VehicleTitle>Мотоциклет</VehicleTitle>
          <VehicleDescription>Мотор, скутер, ATV</VehicleDescription>
        </VehicleCard>
      </VehicleOptionsContainer>

      <ProgressIndicator>
        <ProgressDot active={false} />
        <ProgressDot active={true} />
        <ProgressDot active={false} />
      </ProgressIndicator>
    </Container>
  );
};

export default OnboardingScreen2;
