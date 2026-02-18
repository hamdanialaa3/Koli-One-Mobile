import React, { useState, useEffect } from 'react';
import styled from 'styled-components/native';
import { ActivityIndicator, Alert, View, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../src/contexts/AuthContext';
import MobileHeader from '../src/components/common/MobileHeader';
import ReviewsList from '../src/components/reviews/ReviewsList';
import { ReviewService, ReviewStats } from '../src/services/ReviewService';
import { theme } from '../src/styles/theme';
import { logger } from '../src/services/logger-service';

const Container = styled.SafeAreaView`
  flex: 1;
  background-color: ${props => props.theme.colors.background.default};
`;

const ScrollContainer = styled.ScrollView`
  flex: 1;
`;

const Header = styled.View`
  padding: 24px 20px;
  background-color: ${props => props.theme.colors.background.paper};
  border-bottom-width: 1px;
  border-bottom-color: ${props => props.theme.colors.border.muted};
`;

const Title = styled.Text`
  font-size: 28px;
  font-weight: 900;
  color: ${props => props.theme.colors.text.primary};
  margin-bottom: 8px;
`;

const Subtitle = styled.Text`
  font-size: 14px;
  color: ${props => props.theme.colors.text.secondary};
  line-height: 20px;
`;

const StatsCard = styled.View`
  margin: 16px 20px;
  background-color: ${props => props.theme.colors.background.paper};
  padding: 20px;
  border-radius: 20px;
  elevation: 3;
  shadow-color: #000;
  shadow-offset: 0px 4px;
  shadow-opacity: 0.1;
  shadow-radius: 10px;
`;

const StatsRow = styled.View`
  flex-direction: row;
  justify-content: space-around;
  align-items: center;
`;

const StatItem = styled.View`
  align-items: center;
`;

const StatValue = styled.Text`
  font-size: 32px;
  font-weight: 900;
  color: ${props => props.theme.colors.primary.main};
  margin-bottom: 4px;
`;

const StatLabel = styled.Text`
  font-size: 12px;
  color: ${props => props.theme.colors.text.secondary};
  text-transform: uppercase;
`;

const RatingCircle = styled.View`
  width: 80px;
  height: 80px;
  border-radius: 40px;
  background-color: ${props => props.theme.colors.primary.main}22;
  border-width: 3px;
  border-color: ${props => props.theme.colors.primary.main};
  justify-content: center;
  align-items: center;
  margin-bottom: 8px;
`;

const RatingValue = styled.Text`
  font-size: 28px;
  font-weight: 900;
  color: ${props => props.theme.colors.primary.main};
`;

const RatingStars = styled.View`
  flex-direction: row;
  align-items: center;
  margin-top: 4px;
`;

const DistributionSection = styled.View`
  margin-top: 24px;
`;

const DistributionTitle = styled.Text`
  font-size: 14px;
  font-weight: 700;
  color: ${props => props.theme.colors.text.primary};
  margin-bottom: 12px;
`;

const DistributionBar = styled.View`
  flex-direction: row;
  align-items: center;
  margin-bottom: 8px;
`;

const BarLabel = styled.Text`
  font-size: 12px;
  color: ${props => props.theme.colors.text.secondary};
  width: 20px;
`;

const BarTrack = styled.View`
  flex: 1;
  height: 8px;
  background-color: ${props => props.theme.colors.background.dark};
  border-radius: 4px;
  margin: 0px 12px;
  overflow: hidden;
`;

const BarFill = styled.View<{ width: string }>`
  height: 100%;
  background-color: #FFB800;
  width: ${props => props.width};
`;

const BarCount = styled.Text`
  font-size: 12px;
  color: ${props => props.theme.colors.text.secondary};
  width: 30px;
  text-align: right;
`;

const SectionTitle = styled.Text`
  font-size: 18px;
  font-weight: 700;
  color: ${props => props.theme.colors.text.primary};
  padding: 20px 20px 12px;
`;

const EmptyState = styled.View`
  padding: 60px 40px;
  align-items: center;
`;

const EmptyTitle = styled.Text`
  font-size: 18px;
  font-weight: 700;
  color: ${props => props.theme.colors.text.secondary};
  margin-top: 16px;
  margin-bottom: 8px;
  text-align: center;
`;

const EmptyText = styled.Text`
  font-size: 14px;
  color: ${props => props.theme.colors.text.disabled};
  text-align: center;
  line-height: 20px;
`;

export default function MyReviewsScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<ReviewStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (user) {
      loadStats();
    }
  }, [user]);

  const loadStats = async () => {
    if (!user) return;
    
    try {
      const data = await ReviewService.getSellerStats(user.uid);
      setStats(data);
    } catch (error) {
      logger.error('Failed to load review stats:', error);
      Alert.alert('Грешка', 'Неуспешно зареждане на статистика за отзиви');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadStats();
  };

  if (!user) {
    return (
      <Container theme={theme}>
        <MobileHeader title="Моите отзиви" />
        <EmptyState>
          <Ionicons name="lock-closed-outline" size={64} color={theme.colors.text.disabled} />
          <EmptyTitle>Влезте в акаунта си</EmptyTitle>
          <EmptyText>
            Трябва да влезете в акаунта си, за да видите отзивите.
          </EmptyText>
        </EmptyState>
      </Container>
    );
  }

  if (loading) {
    return (
      <Container theme={theme}>
        <MobileHeader title="Моите отзиви" />
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={theme.colors.primary.main} />
        </View>
      </Container>
    );
  }

  return (
    <Container theme={theme}>
      <MobileHeader title="Моите отзиви" />
      
      <ScrollContainer
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={theme.colors.primary.main}
          />
        }
      >
        <Header theme={theme}>
          <Title theme={theme}>Отзиви за мен</Title>
          <Subtitle theme={theme}>
            Вижте какво казват другите потребители за вашите обяви и транзакции
          </Subtitle>
        </Header>

        {stats && stats.totalReviews > 0 ? (
          <>
            <StatsCard theme={theme}>
              <StatsRow>
                <StatItem>
                  <RatingCircle theme={theme}>
                    <RatingValue theme={theme}>{stats.averageRating.toFixed(1)}</RatingValue>
                  </RatingCircle>
                  <RatingStars>
                    {[1, 2, 3, 4, 5].map(star => (
                      <Ionicons
                        key={star}
                        name={star <= Math.round(stats.averageRating) ? 'star' : 'star-outline'}
                        size={16}
                        color="#FFB800"
                        style={{ marginHorizontal: 2 }}
                      />
                    ))}
                  </RatingStars>
                  <StatLabel theme={theme}>Среден рейтинг</StatLabel>
                </StatItem>

                <View style={{ width: 1, height: 80, backgroundColor: theme.colors.border.muted }} />

                <StatItem>
                  <StatValue theme={theme}>{stats.totalReviews}</StatValue>
                  <StatLabel theme={theme}>Общо отзиви</StatLabel>
                </StatItem>
              </StatsRow>

              <DistributionSection>
                <DistributionTitle theme={theme}>Разпределение на оценките</DistributionTitle>
                {[5, 4, 3, 2, 1].map(rating => {
                  const count = stats.ratingDistribution[rating as keyof typeof stats.ratingDistribution] || 0;
                  const percentage = stats.totalReviews > 0 
                    ? ((count / stats.totalReviews) * 100).toFixed(0) 
                    : '0';
                  return (
                    <DistributionBar key={rating}>
                      <BarLabel theme={theme}>{rating}</BarLabel>
                      <Ionicons name="star" size={12} color="#FFB800" />
                      <BarTrack theme={theme}>
                        <BarFill theme={theme} width={`${percentage}%`} />
                      </BarTrack>
                      <BarCount theme={theme}>{count}</BarCount>
                    </DistributionBar>
                  );
                })}
              </DistributionSection>
            </StatsCard>

            <SectionTitle theme={theme}>Последни отзиви</SectionTitle>
            <ReviewsList sellerId={user.uid} limit={50} />
          </>
        ) : (
          <EmptyState>
            <Ionicons name="star-outline" size={64} color={theme.colors.text.disabled} />
            <EmptyTitle theme={theme}>Все още няма отзиви</EmptyTitle>
            <EmptyText theme={theme}>
              Когато други потребители напишат отзиви за вас,{'\n'}
              те ще се появят тук.
            </EmptyText>
          </EmptyState>
        )}

        <View style={{ height: 40 }} />
      </ScrollContainer>
    </Container>
  );
}
