import React from 'react';
import styled from 'styled-components/native';
import { View, Text, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MessageSquare } from 'lucide-react-native';
import { useTheme } from 'styled-components/native';
import { useRouter } from 'expo-router';

const Container = styled(LinearGradient)`
  margin: 24px 16px;
  border-radius: 12px;
  padding: 20px;
  border-width: 1px;
  border-color: #333;
`;

const Header = styled.View`
  flex-direction: row;
  align-items: center;
  margin-bottom: 8px;
`;

const Title = styled.Text`
  font-size: 20px;
  font-weight: 800;
  color: ${props => props.theme.colors.mobileDe.text};
`;

const Plus = styled.Text`
  color: ${props => props.theme.colors.mobileDe.primary};
`;

const BetaTag = styled.View`
  background-color: #374151;
  padding: 2px 6px;
  border-radius: 4px;
  margin-left: 8px;
`;

const BetaText = styled.Text`
  color: #D1D5DB;
  font-size: 10px;
  font-weight: 600;
`;

const Description = styled.Text`
  color: ${props => props.theme.colors.mobileDe.textSecondary};
  font-size: 14px;
  line-height: 20px;
  margin-bottom: 16px;
`;

const Button = styled.TouchableOpacity`
  background-color: ${props => props.theme.colors.mobileDe.purple};
  padding: 12px;
  border-radius: 8px;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  gap: 8px;
`;

const ButtonText = styled.Text`
  color: white;
  font-weight: 600;
  font-size: 14px;
`;

export const MobeeBanner = () => {
  const theme = useTheme();
  const router = useRouter();

  return (
    <Container colors={['#1E1E1E', '#2A2A2A']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
      <Header>
        <Title><Plus>+</Plus> Koli AI</Title>
        <BetaTag>
          <BetaText>Beta</BetaText>
        </BetaTag>
      </Header>

      <Description>
        I'm your personal AI guide! I'll help you find the perfect car.
      </Description>

      <Button activeOpacity={0.8} onPress={() => router.push('/ai/advisor' as any)}>
        <MessageSquare size={18} color="white" />
        <ButtonText>Ask Koli anything!</ButtonText>
      </Button>
    </Container>
  );
};
