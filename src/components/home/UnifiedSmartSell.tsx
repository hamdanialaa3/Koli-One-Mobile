import React, { useEffect, useRef } from 'react';
import styled from 'styled-components/native';
import { View, Pressable, Animated, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { theme } from '../../styles/theme';
import {
  Camera,
  ArrowRight,
  Sparkles,
  Target,
  Shield,
  Zap,
  DollarSign
} from 'lucide-react-native';

const Container = styled(LinearGradient)`
  margin: 16px;
  border-radius: 24px;
  padding: 24px;
  border-width: 1px;
  border-color: rgba(255, 143, 16, 0.5);
  overflow: hidden;
  ${Platform.OS === 'web' ? {
    boxShadow: '0 0 20px rgba(255, 143, 16, 0.2)'
  } : {}}
`;

const ContentContainer = styled.View`
  flex-direction: column;
  gap: 20px;
`;

// Left Content
const LeftContent = styled.View`
  gap: 12px;
`;

const Badge = styled.View`
  flex-direction: row;
  align-items: center;
  align-self: flex-start;
  gap: 6px;
  padding: 6px 12px;
  background-color: rgba(255, 143, 16, 0.1);
  border-radius: 20px;
  border-width: 1px;
  border-color: rgba(255, 143, 16, 0.5);
`;

const BadgeText = styled.Text`
  color: white;
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
`;

const Title = styled.Text`
  font-size: 28px;
  font-weight: 800;
  color: white;
  line-height: 34px;
`;

const TitleHighlight = styled.Text`
  color: #8B3FCE;
`;

const Description = styled.Text`
  font-size: 14px;
  line-height: 22px;
  color: #e2e8f0;
`;

const BenefitsList = styled.View`
  flex-direction: row;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 8px;
`;

const BenefitItem = styled.View`
  flex-direction: row;
  align-items: center;
  gap: 6px;
  padding: 6px 10px;
  background-color: rgba(255, 255, 255, 0.1);
  border-radius: 8px;
`;

const BenefitText = styled.Text`
  color: #e2e8f0;
  font-size: 12px;
  font-weight: 600;
`;

// Right Content (Stats & CTA)
const RightContent = styled.View`
  gap: 16px;
  align-items: center;
`;

const StatsGrid = styled.View`
  flex-direction: row;
  justify-content: space-between;
  width: 100%;
  gap: 8px;
`;

const StatCard = styled.View`
  flex: 1;
  align-items: center;
  padding: 12px 6px;
  background-color: rgba(30, 41, 59, 0.4);
  border-radius: 12px;
  border-width: 1px;
  border-color: rgba(255, 255, 255, 0.05);
  ${Platform.OS === 'web' ? {
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
  } : {}}
`;

const StatValue = styled.Text`
  font-size: 20px;
  font-weight: 900;
  color: #8B3FCE;
  margin-bottom: 4px;
`;

const StatLabel = styled.Text`
  font-size: 10px;
  font-weight: 600;
  color: #94a3b8;
  text-align: center;
`;

const CTAButton = styled(Pressable)`
  flex-direction: row;
  align-items: center;
  justify-content: center;
  gap: 10px;
  width: 100%;
  padding: 18px;
  background-color: #8B3FCE;
  border-radius: 16px;
  margin-top: 8px;
  ${Platform.OS === 'web' ? {
    boxShadow: '0px 0px 20px rgba(255, 143, 16, 0.5)'
  } : {}}
`;

const CTAButtonText = styled.Text`
  color: white;
  font-size: 16px;
  font-weight: 800;
`;

const AIBadge = styled.View`
  flex-direction: row;
  align-items: center;
  gap: 4px;
  padding: 2px 6px;
  background-color: rgba(255, 255, 255, 0.25);
  border-radius: 4px;
`;

const AIBadgeText = styled.Text`
  color: white;
  font-size: 10px;
  font-weight: 700;
`;

const SecondaryLink = styled(Pressable)`
  flex-direction: row;
  align-items: center;
  gap: 6px;
  padding: 8px;
`;

const SecondaryLinkText = styled.Text`
  color: #94a3b8;
  font-size: 14px;
  font-weight: 500;
`;

export default function UnifiedSmartSell() {
  const router = useRouter();
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const handleStartSelling = () => {
    router.push('/(tabs)/sell');
  };

  return (
    <Container
      colors={['#1e293b', '#0f172a']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <ContentContainer>
        {/* Left Content */}
        <LeftContent>
          <Badge>
            <Sparkles color="white" size={12} />
            <BadgeText>AI-Powered Selling</BadgeText>
          </Badge>

          <Title>
            Sell Your Car{"\n"}
            <TitleHighlight>Faster</TitleHighlight>
          </Title>

          <Description>
            Our AI helps you price your car perfectly and reach thousands of verified buyers. List in under 5 minutes.
          </Description>

          <BenefitsList>
            <BenefitItem>
              <DollarSign color="#8B3FCE" size={14} />
              <BenefitText>Smart Pricing</BenefitText>
            </BenefitItem>
            <BenefitItem>
              <Target color="#8B3FCE" size={14} />
              <BenefitText>Wide Reach</BenefitText>
            </BenefitItem>
            <BenefitItem>
              <Shield color="#8B3FCE" size={14} />
              <BenefitText>Secure Sale</BenefitText>
            </BenefitItem>
            <BenefitItem>
              <Zap color="#8B3FCE" size={14} />
              <BenefitText>Quick Sale</BenefitText>
            </BenefitItem>
          </BenefitsList>
        </LeftContent>

        {/* Right Content */}
        <RightContent>
          <StatsGrid>
            <StatCard>
              <StatValue>7</StatValue>
              <StatLabel>Avg. Days</StatLabel>
            </StatCard>
            <StatCard>
              <StatValue>94%</StatValue>
              <StatLabel>Success Rate</StatLabel>
            </StatCard>
            <StatCard>
              <StatValue>50K+</StatValue>
              <StatLabel>Buyers</StatLabel>
            </StatCard>
          </StatsGrid>

          <Animated.View style={{ width: '100%', transform: [{ scale: pulseAnim }] }}>
            <CTAButton onPress={handleStartSelling}>
              <Camera color="white" size={20} />
              <CTAButtonText>Start Selling</CTAButtonText>
              <AIBadge>
                <Sparkles color="white" size={10} />
                <AIBadgeText>AI</AIBadgeText>
              </AIBadge>
              <ArrowRight color="white" size={20} />
            </CTAButton>
          </Animated.View>

          <SecondaryLink onPress={() => router.push('/(tabs)/search')}>
            <SecondaryLinkText>Learn how it works</SecondaryLinkText>
            <ArrowRight color="#94a3b8" size={14} />
          </SecondaryLink>
        </RightContent>
      </ContentContainer>
    </Container>
  );
}
