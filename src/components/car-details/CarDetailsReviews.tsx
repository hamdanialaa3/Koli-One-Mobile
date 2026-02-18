import React, { useState, useEffect } from 'react';
import styled from 'styled-components/native';
import { logger } from '../../services/logger-service';
import { TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';
import { ReviewsList, ReviewComposer } from '../reviews';
import { ReviewService, ReviewStats as ReviewStatsType } from '../../services/ReviewService';
import { CarListing } from '../../types/CarListing';

interface Props {
  car: CarListing;
}

const Container = styled.View`
  margin-top: 20px;
`;

const Header = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px 16px;
`;

const TitleRow = styled.View`
  flex-direction: row;
  align-items: center;
`;

const Title = styled.Text`
  font-size: 20px;
  font-weight: 900;
  color: ${props => props.theme.colors.text.primary};
`;

const StatsContainer = styled.View`
  flex-direction: row;
  align-items: center;
  margin-left: 12px;
`;

const AverageRating = styled.Text`
  font-size: 18px;
  font-weight: 700;
  color: ${props => props.theme.colors.text.primary};
  margin-left: 6px;
`;

const ReviewCount = styled.Text`
  font-size: 14px;
  color: ${props => props.theme.colors.text.secondary};
  margin-left: 4px;
`;

const WriteReviewButton = styled(TouchableOpacity)`
  flex-direction: row;
  align-items: center;
  background-color: ${props => props.theme.colors.primary.main};
  padding: 10px 16px;
  border-radius: 24px;
`;

const WriteReviewText = styled.Text`
  font-size: 14px;
  font-weight: 700;
  color: #fff;
  margin-left: 6px;
`;

const Divider = styled.View`
  height: 1px;
  background-color: ${props => props.theme.colors.border.muted};
  margin: 0 20px 16px;
`;

const EmptyState = styled.View`
  padding: 40px 20px;
  align-items: center;
`;

const EmptyTitle = styled.Text`
  font-size: 16px;
  font-weight: 700;
  color: ${props => props.theme.colors.text.secondary};
  margin-bottom: 8px;
  text-align: center;
`;

const EmptyText = styled.Text`
  font-size: 14px;
  color: ${props => props.theme.colors.text.disabled};
  text-align: center;
  line-height: 20px;
`;

export const CarDetailsReviews: React.FC<Props> = ({ car }) => {
  const { user } = useAuth();
  const [stats, setStats] = useState<ReviewStatsType | null>(null);
  const [showComposer, setShowComposer] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    loadStats();
  }, [car.sellerId, refreshKey]);

  const loadStats = async () => {
    try {
      const data = await ReviewService.getSellerStats(car.sellerId);
      setStats(data);
    } catch (error) {
      logger.error('Failed to load review stats', error);
    }
  };

  const handleWriteReview = () => {
    if (!user) {
      Alert.alert(
        'Влезте в акаунта си',
        'Трябва да влезете в акаунта си, за да напишете отзив.',
        [{ text: 'ОК' }]
      );
      return;
    }

    if (user.uid === car.sellerId) {
      Alert.alert(
        'Не можете да пишете отзив',
        'Не можете да напишете отзив за собствена обява.',
        [{ text: 'ОК' }]
      );
      return;
    }

    setShowComposer(true);
  };

  const handleReviewSubmitted = () => {
    setRefreshKey(prev => prev + 1); // Refresh reviews list
  };

  return (
    <Container>
      <Header>
        <TitleRow>
          <Title>Отзиви</Title>
          {stats && stats.totalReviews > 0 && (
            <StatsContainer>
              <Ionicons name="star" size={20} color="#FFB800" />
              <AverageRating>{stats.averageRating.toFixed(1)}</AverageRating>
              <ReviewCount>({stats.totalReviews})</ReviewCount>
            </StatsContainer>
          )}
        </TitleRow>
        <WriteReviewButton onPress={handleWriteReview}>
          <Ionicons name="create-outline" size={18} color="#fff" />
          <WriteReviewText>Напишете</WriteReviewText>
        </WriteReviewButton>
      </Header>

      <Divider />

      {stats && stats.totalReviews === 0 ? (
        <EmptyState>
          <Ionicons name="star-outline" size={48} color="#BDBDBD" style={{ marginBottom: 12 }} />
          <EmptyTitle>Няма отзиви все още</EmptyTitle>
          <EmptyText>
            Бъдете първият, който ще сподели мнението си{'\n'}
            за този продавач.
          </EmptyText>
        </EmptyState>
      ) : (
        <ReviewsList 
          sellerId={car.sellerId} 
          limit={10}
          key={refreshKey}
        />
      )}

      <ReviewComposer
        visible={showComposer}
        onClose={() => setShowComposer(false)}
        sellerId={car.sellerId}
        carId={car.id}
        onSubmitted={handleReviewSubmitted}
      />
    </Container>
  );
};
