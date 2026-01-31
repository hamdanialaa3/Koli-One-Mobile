// src/components/CarCard.tsx
import React from 'react';
import styled from 'styled-components/native';
import { View, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
// import { CarListing } from '../types/CarListing';
import { ListingBase } from '../types/ListingBase';
import { AnalyticsService } from '../services/AnalyticsService';
import { theme } from '../styles/theme';

import { useRouter } from 'expo-router';
import { useAuth } from '../contexts/AuthContext';
import { AnimatedImage } from './ui/AnimatedImage';
import { AnimatedButton } from './ui/AnimatedButton';

interface CarCardProps {
  listing: Partial<ListingBase>;
  onPress?: () => void;
}

const CardContainer = styled(AnimatedButton)`
  background-color: ${props => props.theme.colors.background.paper};
  border-radius: 20px;
  margin-bottom: 24px;
  elevation: 8;
  ${Platform.OS !== 'web' ? `
    shadow-color: #000;
    shadow-offset: 0px 8px;
    shadow-opacity: 0.15;
    shadow-radius: 12px;
  ` : `
    box-shadow: 0px 8px 12px rgba(0, 0, 0, 0.15);
  `}
  overflow: hidden;
  height: 320px;
  position: relative;
`;

const CarImage = styled.ImageBackground`
  width: 100%;
  height: 100%;
  justify-content: flex-end;
`;

const GradientOverlay = styled(LinearGradient).attrs({
  colors: ['transparent', 'rgba(0,0,0,0.2)', 'rgba(0,0,0,0.85)'],
  locations: [0.4, 0.6, 1.0]
})`
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  height: 100%;
`;

const ContentContainer = styled.View`
  padding: 20px;
  z-index: 10;
`;

const TopBadgeRow = styled.View`
  position: absolute;
  top: 16px;
  left: 16px;
  flex-direction: row;
  z-index: 20;
`;

const Badge = styled.View`
  background-color: rgba(255, 255, 255, 0.9);
  padding: 6px 12px;
  border-radius: 12px;
  margin-right: 8px;
`;

const BadgeText = styled.Text`
  font-size: 12px;
  font-weight: 700;
  color: ${props => props.theme.colors.text.primary};
  text-transform: uppercase;
`;

const Title = styled.Text`
  font-size: 24px;
  font-weight: 800;
  color: #fff;
  margin-bottom: 4px;
  text-shadow: 0px 2px 4px rgba(0,0,0,0.3);
`;

const Price = styled.Text`
  font-size: 20px;
  font-weight: 700;
  color: ${props => props.theme.colors.accent.main}; 
  margin-bottom: 12px;
`;

const SpecsRow = styled.View`
  flex-direction: row;
  align-items: center;
`;

const SpecItem = styled.View`
  flex-direction: row;
  align-items: center;
  margin-right: 16px;
  background-color: rgba(255,255,255,0.15);
  padding: 4px 10px;
  border-radius: 8px;
`;

const SpecText = styled.Text`
  font-size: 13px;
  font-weight: 600;
  color: #eee;
  margin-left: 6px;
`;

const FavoriteButton = styled.TouchableOpacity`
  position: absolute;
  top: 16px;
  right: 16px;
  width: 44px;
  height: 44px;
  border-radius: 22px;
  background-color: rgba(255,255,255,0.2);
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(10px);
  z-index: 20;
`;


// ... exports ...

export const CarCard = React.memo(({ listing, onPress }: CarCardProps) => {
  const router = useRouter();
  const displayImage = listing.images?.[0] || '';

  const handleFavorite = (e: any) => {
    e.stopPropagation();
    // Log favorite event for analytics
    AnalyticsService.logAddToFavorites(listing.id!);
  };

  const handlePress = () => {
    if (onPress) {
      onPress();
    } else if (listing.id) {
      router.push({ pathname: '/car/[id]', params: { id: listing.id } });
    }
  };

  return (
    <CardContainer onPress={handlePress} activeOpacity={1} theme={theme}>
      <View style={{ width: '100%', height: '100%', position: 'relative' }}>
        <AnimatedImage
          source={displayImage ? { uri: displayImage } : require('../../assets/images/placeholder-car.png')}
          style={{ width: '100%', height: '100%' }}
          contentFit="cover"
          containerStyle={{ width: '100%', height: '100%' }}
        />
        <GradientOverlay
          colors={['transparent', 'rgba(0,0,0,0.2)', 'rgba(0,0,0,0.85)']}
          locations={[0.4, 0.6, 1.0]}
        />

        <TopBadgeRow>
          <Badge>
            <BadgeText>{listing.year}</BadgeText>
          </Badge>
          {listing.condition === 'new' && (
            <Badge style={{ backgroundColor: theme.colors.accent.main }}>
              <BadgeText style={{ color: '#fff' }}>NEW</BadgeText>
            </Badge>
          )}
        </TopBadgeRow>

        <FavoriteButton activeOpacity={0.7} as={AnimatedButton} onPress={handleFavorite}>
          <Ionicons name="heart-outline" size={24} color="#fff" />
        </FavoriteButton>

        <ContentContainer>
          <Title numberOfLines={1}>{listing.make} {listing.model}</Title>
          <Price>{listing.price?.toLocaleString()} €</Price>

          <SpecsRow>
            <SpecItem>
              <Ionicons name="speedometer-outline" size={14} color="#ddd" />
              <SpecText>{listing.mileage?.toLocaleString()} km</SpecText>
            </SpecItem>
            <SpecItem>
              <Ionicons name="hardware-chip-outline" size={14} color="#ddd" />
              <SpecText>{listing.transmission}</SpecText>
            </SpecItem>
            <SpecItem>
              <Ionicons name="flame-outline" size={14} color="#ddd" />
              <SpecText>{listing.fuelType}</SpecText>
            </SpecItem>
          </SpecsRow>
        </ContentContainer>
      </View>
    </CardContainer>
  );
});
