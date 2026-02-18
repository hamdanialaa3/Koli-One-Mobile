/**
 * AIAnalysisBanner.tsx (Mobile)
 * AI Car Analysis Flow Explanation Banner
 */

import React from 'react';
import { Platform } from 'react-native';
import styled from 'styled-components/native';
import { LinearGradient } from 'expo-linear-gradient';
import { Sparkles, Camera, Zap, CheckCircle } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { theme } from '../../styles/theme';

const Container = styled(LinearGradient).attrs({
  colors: ['#8b5cf6', '#6366f1'],
  start: { x: 0, y: 0 },
  end: { x: 1, y: 1 }
})`
  padding: 24px 16px;
  margin: 16px 0;
  border-radius: 20px;
  ${Platform.OS === 'web' ? `
    box-shadow: 0px 8px 20px rgba(139, 92, 246, 0.3);
  ` : `
    shadow-color: #8b5cf6;
    shadow-offset: 0px 8px;
    shadow-opacity: 0.3;
    shadow-radius: 20px;
    elevation: 8;
  `}
`;

const Header = styled.View`
  align-items: center;
  margin-bottom: 24px;
`;

const IconBadge = styled.View`
  width: 56px;
  height: 56px;
  border-radius: 28px;
  background-color: rgba(255, 255, 255, 0.2);
  align-items: center;
  justify-content: center;
  margin-bottom: 12px;
`;

const Title = styled.Text`
  font-size: 24px;
  font-weight: 800;
  color: #ffffff;
  text-align: center;
  margin-bottom: 8px;
`;

const Subtitle = styled.Text`
  font-size: 14px;
  color: rgba(255, 255, 255, 0.9);
  text-align: center;
  line-height: 20px;
`;

const StepsContainer = styled.View`
  gap: 16px;
`;

const StepCard = styled.View`
  flex-direction: row;
  align-items: center;
  background-color: rgba(255, 255, 255, 0.15);
  padding: 16px;
  border-radius: 12px;
  border-width: 1px;
  border-color: rgba(255, 255, 255, 0.2);
`;

const StepNumber = styled.View`
  width: 32px;
  height: 32px;
  border-radius: 16px;
  background-color: rgba(255, 255, 255, 0.25);
  align-items: center;
  justify-content: center;
  margin-right: 12px;
`;

const StepNumberText = styled.Text`
  font-size: 14px;
  font-weight: 800;
  color: #ffffff;
`;

const StepContent = styled.View`
  flex: 1;
`;

const StepTitle = styled.Text`
  font-size: 15px;
  font-weight: 700;
  color: #ffffff;
  margin-bottom: 4px;
`;

const StepDescription = styled.Text`
  font-size: 13px;
  color: rgba(255, 255, 255, 0.85);
  line-height: 18px;
`;

const CTAButton = styled.Pressable`
  margin-top: 20px;
  background-color: #ffffff;
  padding: 16px;
  border-radius: 12px;
  flex-direction: row;
  align-items: center;
  justify-content: center;
`;

const CTAText = styled.Text`
  font-size: 16px;
  font-weight: 700;
  color: #8b5cf6;
  margin-left: 8px;
`;

export default function AIAnalysisBanner() {
  const router = useRouter();

  return (
    <Container colors={['#8b5cf6', '#6366f1']}>
      <Header>
        <IconBadge>
          <Sparkles color="#ffffff" size={28} />
        </IconBadge>
        <Title>AI Car Analysis</Title>
        <Subtitle>
          Get instant expert-level car analysis powered by AI
        </Subtitle>
      </Header>

      <StepsContainer>
        <StepCard>
          <StepNumber>
            <StepNumberText>1</StepNumberText>
          </StepNumber>
          <StepContent>
            <StepTitle>Take or Upload Photo</StepTitle>
            <StepDescription>
              Snap a photo or choose from gallery
            </StepDescription>
          </StepContent>
        </StepCard>

        <StepCard>
          <StepNumber>
            <StepNumberText>2</StepNumberText>
          </StepNumber>
          <StepContent>
            <StepTitle>AI Analyzes Instantly</StepTitle>
            <StepDescription>
              Our AI identifies make, model, condition & value
            </StepDescription>
          </StepContent>
        </StepCard>

        <StepCard>
          <StepNumber>
            <StepNumberText>3</StepNumberText>
          </StepNumber>
          <StepContent>
            <StepTitle>Get Expert Report</StepTitle>
            <StepDescription>
              Receive detailed analysis with price estimate
            </StepDescription>
          </StepContent>
        </StepCard>
      </StepsContainer>

      <CTAButton onPress={() => router.push('/ai/analysis')}>
        <Camera color="#8b5cf6" size={20} />
        <CTAText>Try AI Analysis Now</CTAText>
      </CTAButton>
    </Container>
  );
}
