import React from 'react';
import styled from 'styled-components/native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Dimensions, Platform } from 'react-native';

const { width } = Dimensions.get('window');

const Container = styled.TouchableOpacity`
  margin: 24px 20px;
  height: 80px;
  border-radius: 20px;
  overflow: hidden;
  elevation: 8;
  ${Platform.OS !== 'web' ? `
    shadow-color: #60a5fa;
    shadow-offset: 0px 8px;
    shadow-opacity: 0.3;
    shadow-radius: 16px;
  ` : `
    box-shadow: 0px 8px 16px rgba(96, 165, 250, 0.3);
  `}
`;

const Content = styled(LinearGradient).attrs({
  colors: ['#2563eb', '#1e40af'],
  start: { x: 0, y: 0 },
  end: { x: 1, y: 1 },
})`
  flex: 1;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
`;

const TextContainer = styled.View`
  flex: 1;
`;

const Title = styled.Text`
  font-size: 18px;
  font-weight: 800;
  color: #fff;
  margin-bottom: 4px;
`;

const Subtitle = styled.Text`
  font-size: 13px;
  color: rgba(255, 255, 255, 0.8);
  font-weight: 500;
`;

const IconCircle = styled.View`
  width: 48px;
  height: 48px;
  border-radius: 24px;
  background-color: rgba(255, 255, 255, 0.2);
  align-items: center;
  justify-content: center;
  border-width: 1px;
  border-color: rgba(255, 255, 255, 0.3);
`;

export default function AISmartSellButton() {
  const router = useRouter();

  return (
    <Container onPress={() => router.push('/(tabs)/sell' as any)} activeOpacity={0.9}>
      <Content colors={['#2563eb', '#1e40af']}>
        <TextContainer>
          <Title>Sell with AI ✨</Title>
          <Subtitle>Scan your car & get a price instantly</Subtitle>
        </TextContainer>
        <IconCircle>
          <Ionicons name="camera" size={24} color="#fff" />
        </IconCircle>
      </Content>
    </Container>
  );
}
