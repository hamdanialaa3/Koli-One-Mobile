import React from 'react';
import styled from 'styled-components/native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Platform } from 'react-native';

const Container = styled.TouchableOpacity`
  margin: 16px 20px;
  border-radius: 16px;
  overflow: hidden;
  elevation: 4;
  ${Platform.OS !== 'web' ? `
    shadow-color: #000;
    shadow-offset: 0px 4px;
    shadow-opacity: 0.1;
    shadow-radius: 8px;
  ` : `
    box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.1);
  `}
`;

const GradientBackground = styled(LinearGradient).attrs({
  colors: ['#1e1e1e', '#2d2d2d'],
  start: { x: 0, y: 0 },
  end: { x: 1, y: 0 },
})`
  padding: 20px;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
`;

const Content = styled.View`
  flex: 1;
  margin-right: 16px;
`;

const Title = styled.Text`
  font-size: 18px;
  font-weight: 700;
  color: #fff;
  margin-bottom: 4px;
`;

const Subtitle = styled.Text`
  font-size: 13px;
  color: #aaa;
  line-height: 18px;
`;

const ActionButton = styled.View`
  width: 44px;
  height: 44px;
  border-radius: 22px;
  background-color: rgba(255, 255, 255, 0.1);
  align-items: center;
  justify-content: center;
  border-width: 1px;
  border-color: rgba(255, 255, 255, 0.2);
`;

export default function SmartSellStrip() {
  const router = useRouter();

  return (
    <Container onPress={() => router.push('/(tabs)/sell' as any)} activeOpacity={0.9}>
      <GradientBackground colors={['#1e1e1e', '#2d2d2d']}>
        <Content>
          <Title>Selling your car?</Title>
          <Subtitle>Get a fair AI valuation in seconds. No hassle, just results.</Subtitle>
        </Content>
        <ActionButton>
          <Ionicons name="arrow-forward" size={24} color="#fff" />
        </ActionButton>
      </GradientBackground>
    </Container>
  );
}
