/**
 * Onboarding Screen 3: City Selection
 * "What is your city?" → Dropdown for Bulgarian cities
 */

import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Modal } from 'react-native';
import styled from 'styled-components/native';
import { Ionicons } from '@expo/vector-icons';
import { BULGARIAN_CITIES } from '../../constants/onboarding';

interface OnboardingScreen3Props {
  onComplete: (city: string) => void;
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

const Content = styled.View`
  flex: 1;
  justify-content: center;
`;

const CitySelector = styled.TouchableOpacity`
  background-color: #F5F5F5;
  border-radius: 16px;
  padding: 20px;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  border: 2px solid #E0E0E0;
  margin-bottom: 20px;
`;

const CityText = styled.Text<{ selected: boolean }>`
  font-size: 18px;
  color: ${props => props.selected ? '#1A1A1A' : '#999999'};
  font-weight: ${props => props.selected ? '600' : '400'};
`;

const ContinueButton = styled.TouchableOpacity<{ disabled: boolean }>`
  background-color: ${props => props.disabled ? '#CCCCCC' : '#667EEA'};
  border-radius: 16px;
  padding: 18px;
  align-items: center;
  flex-direction: row;
  justify-content: center;
  elevation: 4;
  shadow-color: #000;
  shadow-offset: 0px 4px;
  shadow-opacity: 0.2;
  shadow-radius: 8px;
`;

const ContinueButtonText = styled.Text`
  color: #FFFFFF;
  font-size: 18px;
  font-weight: 600;
  margin-right: 8px;
`;

const InfoBox = styled.View`
  background-color: #E8F5E9;
  border-radius: 12px;
  padding: 16px;
  flex-direction: row;
  align-items: center;
  margin-bottom: 24px;
`;

const InfoText = styled.Text`
  flex: 1;
  font-size: 14px;
  color: #2E7D32;
  margin-left: 12px;
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

// Modal Styles
const ModalOverlay = styled.View`
  flex: 1;
  background-color: rgba(0, 0, 0, 0.5);
  justify-content: flex-end;
`;

const ModalContent = styled.View`
  background-color: #FFFFFF;
  border-top-left-radius: 24px;
  border-top-right-radius: 24px;
  max-height: 70%;
  padding: 24px;
`;

const ModalHeader = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
`;

const ModalTitle = styled.Text`
  font-size: 20px;
  font-weight: 600;
  color: #1A1A1A;
`;

const CloseButton = styled.TouchableOpacity`
  width: 32px;
  height: 32px;
  border-radius: 16px;
  background-color: #F5F5F5;
  justify-content: center;
  align-items: center;
`;

const CityList = styled.ScrollView``;

const CityOption = styled.TouchableOpacity`
  padding: 16px;
  border-bottom-width: 1px;
  border-bottom-color: #F0F0F0;
`;

const CityOptionText = styled.Text`
  font-size: 16px;
  color: #1A1A1A;
`;

const OnboardingScreen3: React.FC<OnboardingScreen3Props> = ({ onComplete, onBack }) => {
  const [selectedCity, setSelectedCity] = useState<string | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  const handleCitySelect = (city: string) => {
    setSelectedCity(city);
    setModalVisible(false);
  };

  const handleContinue = () => {
    if (selectedCity) {
      onComplete(selectedCity);
    }
  };

  return (
    <Container>
      <Header>
        <BackButton onPress={onBack}>
          <Ionicons name="arrow-back" size={24} color="#666666" />
        </BackButton>
        <Title>Къде се намирате?</Title>
        <Subtitle>Ще ви покажем близки до вас обяви</Subtitle>
      </Header>

      <Content>
        <InfoBox>
          <Ionicons name="location-outline" size={24} color="#4CAF50" />
          <InfoText>
            Вашият град помага за по-добри резултати от търсенето
          </InfoText>
        </InfoBox>

        <CitySelector onPress={() => setModalVisible(true)} activeOpacity={0.7}>
          <CityText selected={!!selectedCity}>
            {selectedCity || 'Изберете град'}
          </CityText>
          <Ionicons name="chevron-down" size={24} color="#666666" />
        </CitySelector>

        <ContinueButton
          disabled={!selectedCity}
          onPress={handleContinue}
          activeOpacity={0.8}
        >
          <ContinueButtonText>Започнете</ContinueButtonText>
          <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
        </ContinueButton>
      </Content>

      <ProgressIndicator>
        <ProgressDot active={false} />
        <ProgressDot active={false} />
        <ProgressDot active={true} />
      </ProgressIndicator>

      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <ModalOverlay>
          <ModalContent>
            <ModalHeader>
              <ModalTitle>Изберете град</ModalTitle>
              <CloseButton onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={20} color="#666666" />
              </CloseButton>
            </ModalHeader>

            <CityList>
              {BULGARIAN_CITIES.map((city) => (
                <CityOption key={city} onPress={() => handleCitySelect(city)}>
                  <CityOptionText>{city}</CityOptionText>
                </CityOption>
              ))}
            </CityList>
          </ModalContent>
        </ModalOverlay>
      </Modal>
    </Container>
  );
};

export default OnboardingScreen3;
