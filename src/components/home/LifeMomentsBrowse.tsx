/**
 * LifeMomentsBrowse.tsx (Mobile)
 * 🎯 EMOTIONAL CAR DISCOVERY
 * Find the perfect car for your life moment
 */

import React from 'react';
import styled from 'styled-components/native';
import { LinearGradient } from 'expo-linear-gradient';
import { Users, Briefcase, Mountain, Leaf, Building2, Crown } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { theme } from '../../styles/theme';
import { ScrollView, Platform } from 'react-native';

interface LifeMoment {
  key: string;
  icon: React.ReactNode;
  gradient: string;
  titleEn: string;
  titleAr: string;
  searchQuery: string;
}

const MOMENTS: LifeMoment[] = [
  {
    key: 'family',
    icon: <Users color="#ffffff" size={32} />,
    gradient: '#f97316',
    titleEn: 'Growing Family',
    titleAr: 'Растящо семейство',
    searchQuery: 'category=suv,van'
  },
  {
    key: 'work',
    icon: <Briefcase color="#ffffff" size={32} />,
    gradient: '#3b82f6',
    titleEn: 'Daily Commute',
    titleAr: 'Ежедневно пътуване',
    searchQuery: 'fuelType=hybrid,diesel'
  },
  {
    key: 'adventure',
    icon: <Mountain color="#ffffff" size={32} />,
    gradient: '#10b981',
    titleEn: 'Adventure',
    titleAr: 'Приключение',
    searchQuery: 'driveType=4x4'
  },
  {
    key: 'eco',
    icon: <Leaf color="#ffffff" size={32} />,
    gradient: '#22c55e',
    titleEn: 'Eco-Friendly',
    titleAr: 'Екологични',
    searchQuery: 'fuelType=electric,hybrid'
  },
  {
    key: 'city',
    icon: <Building2 color="#ffffff" size={32} />,
    gradient: '#8b5cf6',
    titleEn: 'City Life',
    titleAr: 'Градски живот',
    searchQuery: 'category=hatchback,compact'
  },
  {
    key: 'luxury',
    icon: <Crown color="#ffffff" size={32} />,
    gradient: '#eab308',
    titleEn: 'Luxury',
    titleAr: 'Лукс',
    searchQuery: 'priceRange=50000-500000'
  }
];

const Container = styled.View`
  padding: 24px 0;
  margin: 16px 0;
`;

const Header = styled.View`
  padding: 0 16px;
  margin-bottom: 20px;
`;

const Badge = styled(LinearGradient).attrs({
  colors: ['#ff8c61', '#ff5c00'],
  start: { x: 0, y: 0 },
  end: { x: 1, y: 1 }
})`
  align-self: center;
  flex-direction: row;
  align-items: center;
  padding: 8px 18px;
  border-radius: 30px;
  margin-bottom: 12px;
`;

const BadgeText = styled.Text`
  color: #ffffff;
  font-size: 11px;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 1px;
  margin-left: 8px;
`;

const Title = styled.Text`
  font-size: 32px;
  font-weight: 900;
  color: #ffffff;
  text-align: center;
  margin-bottom: 8px;
  letter-spacing: -1px;
`;

const Subtitle = styled.Text`
  font-size: 15px;
  color: #94a3b8;
  text-align: center;
  line-height: 22px;
  padding: 0 20px;
`;

const GridContainer = styled.View`
  flex-direction: row;
  flex-wrap: wrap;
  padding: 0 8px;
  gap: 12px;
`;

const MomentCard = styled.Pressable<{ gradient: string }>`
  flex: 1;
  min-width: 160px;
  max-width: 48%;
  aspect-ratio: 1;
  background-color: ${({ gradient }) => `${gradient}cc`};
  border-radius: 20px;
  padding: 20px;
  align-items: center;
  justify-content: center;
  border-width: 1px;
  border-color: rgba(255, 255, 255, 0.2);
  ${({ gradient }) => Platform.OS === 'web' ? {
    boxShadow: `0px 8px 24px ${gradient}66`
  } : {
    shadowColor: gradient,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8
  }}
`;

const IconWrapper = styled.View`
  width: 70px;
  height: 70px;
  border-radius: 35px;
  background-color: rgba(255, 255, 255, 0.2);
  align-items: center;
  justify-content: center;
  margin-bottom: 16px;
`;

const CardTitle = styled.Text`
  font-size: 15px;
  font-weight: 800;
  color: #ffffff;
  text-align: center;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

export default function LifeMomentsBrowse() {
  const navigation = useNavigation();

  const handleMomentPress = (moment: LifeMoment) => {
    // @ts-ignore - navigation typing
    navigation.navigate('Search', { query: moment.searchQuery });
  };

  return (
    <Container>
      <Header>
        <Badge colors={['#ff8c61', '#ff5c00']}>
          <Leaf color="#ffffff" size={14} />
          <BadgeText>EMOTIONAL DISCOVERY</BadgeText>
        </Badge>

        <Title theme={theme}>Find Your Perfect Match</Title>

        <Subtitle theme={theme}>
          Choose the car that fits your lifestyle and life moment
        </Subtitle>
      </Header>

      <GridContainer>
        {MOMENTS.map((moment, index) => (
          <MomentCard
            key={moment.key}
            gradient={moment.gradient}
            onPress={() => handleMomentPress(moment)}
            android_ripple={{ color: 'rgba(255, 255, 255, 0.2)' }}
          >
            <IconWrapper>{moment.icon}</IconWrapper>
            <CardTitle>{moment.titleEn}</CardTitle>
          </MomentCard>
        ))}
      </GridContainer>
    </Container>
  );
}
