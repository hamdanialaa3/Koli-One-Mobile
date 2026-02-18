/**
 * MostDemandedCategories.tsx (Mobile)
 * AI-powered trending vehicle categories with real-time stats
 * STYLING: CYBERPUNK / SCI-FI GLASSMORPHISM
 */

import React from 'react';
import styled from 'styled-components/native';
import {
  TrendingUp,
  Sparkles,
  Car,
  CarFront,
  Zap,
  Leaf,
  Crown,
  ArrowUpRight
} from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { theme } from '../../styles/theme';
import { Platform, ScrollView } from 'react-native';

interface TrendingCategory {
  id: string;
  name: string;
  icon: React.ReactNode;
  growth: number;
  listings: string;
  color: string;
  slug: string;
}

const CATEGORIES: TrendingCategory[] = [
  {
    id: 'suv',
    name: 'SUVs',
    icon: <CarFront size={28} color="#00f3ff" />,
    growth: 24,
    listings: '1.2k+',
    color: '#00f3ff', // Cyan
    slug: 'suv'
  },
  {
    id: 'electric',
    name: 'Electric',
    icon: <Zap size={28} color="#bc13fe" />,
    growth: 42,
    listings: '450+',
    color: '#bc13fe', // Purple
    slug: 'electric'
  },
  {
    id: 'sports',
    name: 'Sports',
    icon: <Car size={28} color="#ff0055" />,
    growth: 15,
    listings: '280+',
    color: '#ff0055', // Pink
    slug: 'coupe'
  },
  {
    id: 'eco',
    name: 'Hybrid',
    icon: <Leaf size={28} color="#39ff14" />,
    growth: 31,
    listings: '890+',
    color: '#39ff14', // Neon Green
    slug: 'hybrid'
  },
  {
    id: 'luxury',
    name: 'Luxury',
    icon: <Crown size={28} color="#ffff00" />,
    growth: 12,
    listings: '150+',
    color: '#ffff00', // Yellow
    slug: 'luxury'
  }
];

const Container = styled.View`
  padding: 32px 0;
  margin: 16px 0;
`;

const Header = styled.View`
  padding: 0 20px;
  margin-bottom: 24px;
  align-items: flex-start;
`;

const Badge = styled.View`
  flex-direction: row;
  align-items: center;
  background-color: rgba(0, 243, 255, 0.1);
  border-radius: 20px;
  padding: 6px 14px;
  margin-bottom: 12px;
  border-width: 1px;
  border-color: rgba(0, 243, 255, 0.3);
`;

const BadgeText = styled.Text`
  font-size: 11px;
  font-weight: 800;
  color: #00f3ff;
  margin-left: 6px;
  text-transform: uppercase;
  letter-spacing: 1px;
`;

const Title = styled.Text`
  font-size: 32px;
  font-weight: 900;
  color: #ffffff;
  margin-bottom: 8px;
  letter-spacing: -0.5px;
`;

const Subtitle = styled.Text`
  font-size: 15px;
  color: #94a3b8;
  line-height: 22px;
  max-width: 90%;
`;

const CardList = styled.ScrollView.attrs({
  horizontal: true,
  showsHorizontalScrollIndicator: false,
  contentContainerStyle: {
    paddingHorizontal: 20,
    gap: 16
  }
})``;

const CategoryCard = styled.Pressable<{ accentColor: string }>`
  width: 190px;
  background-color: rgba(30, 41, 59, 0.6);
  border-radius: 24px;
  padding: 24px;
  border-width: 1.5px;
  border-color: ${props => `${props.accentColor}30`};
  position: relative;
  overflow: hidden;
  ${Platform.OS === 'web' ? {
    boxShadow: '0px 10px 25px rgba(0, 0, 0, 0.3)'
  } : {}}
`;

const GlowEffect = styled.View<{ accentColor: string }>`
  position: absolute;
  top: -20px;
  right: -20px;
  width: 80px;
  height: 80px;
  border-radius: 40px;
  background-color: ${props => props.accentColor};
  opacity: 0.1;
`;

const IconContainer = styled.View<{ accentColor: string }>`
  width: 60px;
  height: 60px;
  border-radius: 20px;
  background-color: ${props => `${props.accentColor}15`};
  align-items: center;
  justify-content: center;
  margin-bottom: 24px;
  border-width: 1px;
  border-color: ${props => `${props.accentColor}40`};
`;

const CardLabel = styled.Text`
  font-size: 12px;
  font-weight: 800;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 1.5px;
  margin-bottom: 6px;
`;

const CardName = styled.Text`
  font-size: 22px;
  font-weight: 900;
  color: #ffffff;
  margin-bottom: 16px;
`;

const StatsRow = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  margin-top: auto;
`;

const GrowthBadge = styled.View<{ accentColor: string }>`
  flex-direction: row;
  align-items: center;
  background-color: ${props => `${props.accentColor}20`};
  padding: 4px 10px;
  border-radius: 12px;
`;

const GrowthText = styled.Text<{ accentColor: string }>`
  font-size: 13px;
  font-weight: 800;
  color: ${props => props.accentColor};
  margin-left: 2px;
`;

const ListingsCount = styled.Text`
  font-size: 13px;
  color: #94a3b8;
  font-weight: 600;
`;

export default function MostDemandedCategories() {
  const router = useRouter();

  const handlePress = (slug: string) => {
    router.push({ pathname: '/(tabs)/search', params: { query: `category=${slug}` } });
  };

  return (
    <Container>
      <Header>
        <Badge>
          <Sparkles color="#00f3ff" size={14} />
          <BadgeText>AI Market Trends</BadgeText>
        </Badge>
        <Title>Most Wanted</Title>
        <Subtitle>
          Real-time demand analysis across the digital marketplace
        </Subtitle>
      </Header>

      <CardList>
        {CATEGORIES.map((cat) => (
          <CategoryCard
            key={cat.id}
            accentColor={cat.color}
            onPress={() => handlePress(cat.slug)}
            android_ripple={{ color: `${cat.color}20` }}
          >
            <GlowEffect accentColor={cat.color} />

            <IconContainer accentColor={cat.color}>
              {cat.icon}
            </IconContainer>

            <CardLabel>Category</CardLabel>
            <CardName>{cat.name}</CardName>

            <StatsRow>
              <GrowthBadge accentColor={cat.color}>
                <TrendingUp size={12} color={cat.color} />
                <GrowthText accentColor={cat.color}>+{cat.growth}%</GrowthText>
              </GrowthBadge>

              <ListingsCount>{cat.listings}</ListingsCount>
            </StatsRow>
          </CategoryCard>
        ))}
      </CardList>
    </Container>
  );
}
