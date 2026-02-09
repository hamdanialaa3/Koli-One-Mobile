import React, { useEffect, useState } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import styled from 'styled-components/native';
import {
  ScrollView,
  View,
  Dimensions,
  TouchableOpacity,
  ActivityIndicator,
  Linking,
  Share,
  Alert,
  Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../src/styles/theme';
import { AnalyticsService } from '../../src/services/AnalyticsService';
import { ListingService } from '../../src/services/ListingService';
import { PlatformSyncService } from '../../src/services/PlatformSyncService';
import { CarListing } from '../../src/types/CarListing';
import { useAuth } from '../../src/contexts/AuthContext';
import { AnimatedImage } from '../../src/components/ui/AnimatedImage';
import { AnimatedButton } from '../../src/components/ui/AnimatedButton';
// import { PriceRating } from '../../src/components/car-details/PriceRating'; // REMOVED
// import { CarDetailsSpecs } from '../../src/components/car-details/CarDetailsSpecs'; // REMOVED
import { CarDetailsGermanStyle } from '../../src/components/car-details/CarDetailsGermanStyle'; // ADDED
import { CarDetailsSeller } from '../../src/components/car-details/CarDetailsSeller';
import { CarDetailsReviews } from '../../src/components/car-details/CarDetailsReviews';
import { PriceEstimatorCard } from '../../src/components/pricing';
import VinCheckCard from '../../src/components/vin/VinCheckCard'; // TASK-12: VIN Check
import { SimilarCars } from '../../src/components/car-details/SimilarCars';

const { width } = Dimensions.get('window');

const Container = styled.View`
  flex: 1;
  background-color: ${props => props.theme.colors.background.default};
`;

const Header = styled.View`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  z-index: 10;
  flex-direction: row;
  justify-content: space-between;
  padding: 50px 20px 20px;
`;

const CircleButton = styled(AnimatedButton)`
  width: 40px;
  height: 40px;
  border-radius: 20px;
  background-color: rgba(0,0,0,0.3);
  align-items: center;
  justify-content: center;
`;

const ImageGallery = styled.ScrollView`
  height: 350px;
`;

const StatsGrid = styled.View`
  flex-direction: row;
  flex-wrap: wrap;
  padding: 20px;
  gap: 12px;
`;

const StatCard = styled.View`
  width: ${(width - 52) / 2}px;
  background-color: ${props => props.theme.colors.background.paper};
  padding: 16px;
  border-radius: 16px;
  border-width: 1px;
  border-color: ${props => props.theme.colors.border.muted};
`;

const StatLabel = styled.Text`
  font-size: 12px;
  color: ${props => props.theme.colors.text.secondary};
  margin-bottom: 4px;
`;

const StatValue = styled.Text`
  font-size: 16px;
  font-weight: 700;
  color: ${props => props.theme.colors.text.primary};
`;

const ContentSection = styled.View`
  padding: 20px;
`;

const Title = styled.Text`
  font-size: 24px;
  font-weight: 900;
  color: ${props => props.theme.colors.text.primary};
`;

const Price = styled.Text`
  font-size: 28px;
  font-weight: 900;
  color: ${props => props.theme.colors.primary.main};
  margin-top: 10px;
`;

const Description = styled.Text`
  font-size: 16px;
  line-height: 24px;
  color: ${props => props.theme.colors.text.secondary};
  margin-top: 20px;
`;

const ActionBar = styled.View`
  flex-direction: row;
  padding: 20px;
  background-color: ${props => props.theme.colors.background.paper};
  border-top-width: 1px;
  border-top-color: ${props => props.theme.colors.border.muted};
  gap: 12px;
`;

const ActionButton = styled(AnimatedButton) <{ variant?: 'primary' | 'outline' | 'whatsapp' }>`
  flex: 1;
  height: 56px;
  border-radius: 16px;
  align-items: center;
  justify-content: center;
  flex-direction: row;
  background-color: ${props =>
    props.variant === 'primary' ? props.theme.colors.primary.main :
      props.variant === 'whatsapp' ? '#25D366' : 'transparent'};
  border-width: ${props => props.variant === 'outline' ? '1.5px' : '0'};
  border-color: ${props => props.theme.colors.border.muted};
`;

const ActionButtonText = styled.Text<{ light?: boolean }>`
  font-size: 16px;
  font-weight: 700;
  color: ${props => props.light ? '#fff' : props.theme.colors.text.primary};
  margin-left: 8px;
`;

export default function CarDetailsScreen() {
  const { id } = useLocalSearchParams();
  const { user } = useAuth();
  const router = useRouter();
  const [car, setCar] = useState<CarListing | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFav, setIsFav] = useState(false);

  useEffect(() => {
    if (id) {
      fetchCar();
      PlatformSyncService.trackCarView(id as string);
    }
  }, [id]);

  const fetchCar = async () => {
    const data = await ListingService.getListingById(id as string);
    setCar(data as any);
    if (data && id) {
      const favStatus = await PlatformSyncService.isFavorite(id as string);
      setIsFav(favStatus);
    }
    setLoading(false);
  };

  const handleToggleFavorite = async () => {
    if (!user) {
      Alert.alert("Login Required", "Please sign in to save cars to your favorites.");
      return;
    }
    if (!car) return;

    try {
      const newStatus = await PlatformSyncService.toggleFavorite(car);
      setIsFav(newStatus);
    } catch (e) {
      console.error(e);
    }
  };

  const handleShare = async () => {
    if (!car) return;
    await Share.share({
      message: `Check out this ${car.make} ${car.model} on Koli One! Price: ${car.price} ${car.currency}`,
      url: `https://koli.one/car/${car.id}`
    });
  };

  useEffect(() => {
    if (car) {
      // Log view event for analytics
      AnalyticsService.logViewListing(car.id!, car.make!, car.model!);
    }
  }, [car]);

  if (loading) return (
    <Container theme={theme} style={{ justifyContent: 'center' }}>
      <ActivityIndicator size="large" color={theme.colors.primary.main} />
    </Container>
  );

  if (!car) return <Container theme={theme}><Title>Car not found</Title></Container>;

  return (
    <Container theme={theme}>
      <Header>
        <CircleButton onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={24} color="#fff" />
        </CircleButton>
        <View style={{ flexDirection: 'row', gap: 10 }}>
          <CircleButton onPress={handleShare}>
            <Ionicons name="share-outline" size={20} color="#fff" />
          </CircleButton>
          <CircleButton onPress={handleToggleFavorite}>
            <Ionicons
              name={isFav ? "heart" : "heart-outline"}
              size={20}
              color={isFav ? theme.colors.status.error : "#fff"}
            />
          </CircleButton>
        </View>
      </Header>

      <ScrollView showsVerticalScrollIndicator={false}>
        <ImageGallery horizontal pagingEnabled showsHorizontalScrollIndicator={false}>
          {car.images && car.images.length > 0 ? (
            car.images.map((img, i) => (
              <AnimatedImage
                key={i}
                source={{ uri: img }}
                style={{ width, height: 350 }}
                contentFit="cover"
              />
            ))
          ) : (
            <AnimatedImage
              source={require('../../assets/images/placeholder-car.png')}
              style={{ width, height: 350 }}
              contentFit="cover"
            />
          )}
        </ImageGallery>

        <CarDetailsGermanStyle car={car} />
        
        {/* AI Price Estimator */}
        {car.make && car.model && car.year && car.mileage && (
          <PriceEstimatorCard
            carData={{
              make: car.make,
              model: car.model,
              year: car.year,
              mileage: car.mileage,
              fuelType: car.fuelType,
              transmission: car.transmission,
              location: car.location || car.city,
              currentPrice: car.price
            }}
            currency={car.currency === 'BGN' ? 'лв' : '€'}
          />
        )}
        
        {/* VIN Check - TASK-12 */}
        {car.vin && (
          <VinCheckCard theme={theme} initialVin={car.vin} />
        )}
        
        <CarDetailsSeller car={car} />
        <CarDetailsReviews car={car} />

        <SimilarCars currentCarId={car.id} make={car.make} price={car.price} />

        <View style={{ height: 100 }} />
      </ScrollView>

      <ActionBar theme={theme}>
        <ActionButton variant="outline" theme={theme} onPress={() => Linking.openURL(`tel:${car.sellerPhone}`)}>
          <Ionicons name="call-outline" size={20} color={theme.colors.text.primary} />
          <ActionButtonText theme={theme}>Call</ActionButtonText>
        </ActionButton>
        <ActionButton
          variant="primary"
          theme={theme}
          onPress={() => router.push({ pathname: '/chat/[id]', params: { id: car.id as any } })}
        >
          <Ionicons name="chatbubble-ellipses-outline" size={20} color="#fff" />
          <ActionButtonText theme={theme} light>Message</ActionButtonText>
        </ActionButton>
        <ActionButton variant="whatsapp" theme={theme} onPress={() => Linking.openURL(`whatsapp://send?phone=${car.sellerPhone}`)}>
          <Ionicons name="logo-whatsapp" size={20} color="#fff" />
        </ActionButton>
      </ActionBar>
    </Container>
  );
}
