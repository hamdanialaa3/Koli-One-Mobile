import React from 'react';
import styled from 'styled-components/native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useAuth } from '../../contexts/AuthContext';
import { View, Platform } from 'react-native';

const BannerContainer = styled.TouchableOpacity`
  margin: 24px 20px;
  border-radius: 20px;
  overflow: hidden;
  elevation: 8;
  ${Platform.OS !== 'web' ? `
    shadow-color: #000;
    shadow-offset: 0px 4px;
    shadow-opacity: 0.2;
    shadow-radius: 12px;
  ` : `
    box-shadow: 0px 4px 12px rgba(0, 0, 0, 0.2);
  `}
`;

const ContentGradient = styled(LinearGradient)`
  padding: 24px;
`;

const Title = styled.Text`
  font-size: 22px;
  font-weight: 800;
  color: #ffffff;
  margin-bottom: 8px;
`;

const Subtitle = styled.Text`
  font-size: 14px;
  color: rgba(255, 255, 255, 0.9);
  margin-bottom: 20px;
  font-weight: 500;
`;

const BenefitsRow = styled.View`
  flex-direction: row;
  flex-wrap: wrap;
  gap: 12px;
  margin-bottom: 24px;
`;

const BenefitItem = styled.View`
  flex-direction: row;
  align-items: center;
  background-color: rgba(255, 255, 255, 0.15);
  padding: 6px 12px;
  border-radius: 12px;
`;

const BenefitText = styled.Text`
  color: #ffffff;
  font-size: 12px;
  font-weight: 700;
`;

const ActionsRow = styled.View`
  flex-direction: row;
  gap: 12px;
`;

const PrimaryButton = styled.View`
  background-color: #ffffff;
  padding: 12px 24px;
  border-radius: 12px;
  align-items: center;
  justify-content: center;
  flex: 1;
`;

const PrimaryButtonText = styled.Text`
  color: #FF7900;
  font-size: 15px;
  font-weight: 800;
`;

const SecondaryButton = styled.View`
  border-width: 1.5px;
  border-color: rgba(255, 255, 255, 0.5);
  padding: 12px 24px;
  border-radius: 12px;
  align-items: center;
  justify-content: center;
  flex: 1;
`;

const SecondaryButtonText = styled.Text`
  color: #ffffff;
  font-size: 15px;
  font-weight: 800;
`;

export default function LoyaltyBanner() {
  const router = useRouter();
  const { user } = useAuth();

  if (user) return null;

  return (
    <BannerContainer onPress={() => router.push('/profile' as any)} activeOpacity={0.9}>
      <ContentGradient
        colors={['#FF7900', '#FF4500']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <Title>Отключете всички предимства</Title>
        <Subtitle>Регистрирайте се за по-добро преживяване</Subtitle>

        <BenefitsRow>
          <BenefitItem><BenefitText>• Запазени търсения</BenefitText></BenefitItem>
          <BenefitItem><BenefitText>• Известия за цена</BenefitText></BenefitItem>
          <BenefitItem><BenefitText>• Директен чат</BenefitText></BenefitItem>
        </BenefitsRow>

        <ActionsRow>
          <PrimaryButton>
            <PrimaryButtonText>Регистрация</PrimaryButtonText>
          </PrimaryButton>
          <SecondaryButton>
            <SecondaryButtonText>Вход</SecondaryButtonText>
          </SecondaryButton>
        </ActionsRow>
      </ContentGradient>
    </BannerContainer>
  );
}
