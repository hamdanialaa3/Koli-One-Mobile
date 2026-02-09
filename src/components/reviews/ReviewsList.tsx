import React, { useEffect, useState } from 'react';
import styled from 'styled-components/native';
import { FlatList, View, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../styles/theme';
import { ReviewService, Review } from '../../services/ReviewService';
import ReviewStars from './ReviewStars';
import { logger } from '../../services/logger-service';

/**
 * TASK-08: Reviews List Component
 * Displays list of reviews for a seller or car
 */

interface ReviewsListProps {
    sellerId?: string;
    carId?: string;
    limit?: number;
}

const Container = styled.View`
  flex: 1;
`;

const ReviewCard = styled.View`
  background-color: ${props => props.theme.colors.background.paper};
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 12px;
  border-width: 1px;
  border-color: ${props => props.theme.colors.border.muted};
  shadow-color: #000;
  shadow-offset: 0px 2px;
  shadow-opacity: 0.05;
  shadow-radius: 4px;
  elevation: 2;
`;

const ReviewHeader = styled.View`
  flex-direction: row;
  align-items: center;
  margin-bottom: 12px;
`;

const Avatar = styled.View<{ hasImage?: boolean }>`
  width: 40px;
  height: 40px;
  border-radius: 20px;
  background-color: ${props => props.theme.colors.primary.light};
  align-items: center;
  justify-content: center;
  margin-right: 12px;
`;

const AvatarText = styled.Text`
  font-size: 16px;
  font-weight: 700;
  color: #fff;
`;

const ReviewerInfo = styled.View`
  flex: 1;
`;

const ReviewerName = styled.Text`
  font-size: 15px;
  font-weight: 600;
  color: ${props => props.theme.colors.text.primary};
  margin-bottom: 2px;
`;

const ReviewDate = styled.Text`
  font-size: 12px;
  color: ${props => props.theme.colors.text.disabled};
`;

const VerifiedBadge = styled.View`
  flex-direction: row;
  align-items: center;
  background-color: ${props => props.theme.colors.status.success}15;
  padding: 4px 8px;
  border-radius: 4px;
  margin-left: 8px;
`;

const BadgeText = styled.Text`
  font-size: 11px;
  font-weight: 600;
  color: ${props => props.theme.colors.status.success};
  margin-left: 4px;
`;

const RatingRow = styled.View`
  flex-direction: row;
  align-items: center;
  margin-bottom: 8px;
`;

const ReviewTitle = styled.Text`
  font-size: 16px;
  font-weight: 700;
  color: ${props => props.theme.colors.text.primary};
  margin-bottom: 8px;
`;

const ReviewText = styled.Text`
  font-size: 14px;
  line-height: 20px;
  color: ${props => props.theme.colors.text.secondary};
  margin-bottom: 12px;
`;

const ReviewFooter = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  padding-top: 12px;
  border-top-width: 1px;
  border-top-color: ${props => props.theme.colors.border.muted};
`;

const RecommendBadge = styled.View<{ recommend: boolean }>`
  flex-direction: row;
  align-items: center;
  padding: 6px 12px;
  border-radius: 6px;
  background-color: ${props => props.recommend 
    ? props.theme.colors.status.success + '15' 
    : props.theme.colors.status.warning + '15'};
`;

const RecommendText = styled.Text<{ recommend: boolean }>`
  font-size: 12px;
  font-weight: 600;
  color: ${props => props.recommend 
    ? props.theme.colors.status.success 
    : props.theme.colors.status.warning};
  margin-left: 4px;
`;

const ActionButtons = styled.View`
  flex-direction: row;
  gap: 12px;
`;

const ActionButton = styled.TouchableOpacity`
  flex-direction: row;
  align-items: center;
  gap: 4px;
`;

const ActionText = styled.Text`
  font-size: 13px;
  color: ${props => props.theme.colors.text.secondary};
`;

const EmptyState = styled.View`
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
`;

const EmptyIcon = styled.View`
  width: 60px;
  height: 60px;
  border-radius: 30px;
  background-color: ${props => props.theme.colors.background.paper};
  align-items: center;
  justify-content: center;
  margin-bottom: 16px;
`;

const EmptyTitle = styled.Text`
  font-size: 16px;
  font-weight: 700;
  color: ${props => props.theme.colors.text.primary};
  margin-bottom: 4px;
`;

const EmptySubtitle = styled.Text`
  font-size: 14px;
  color: ${props => props.theme.colors.text.secondary};
  text-align: center;
`;

const LoadingContainer = styled.View`
  align-items: center;
  justify-content: center;
  padding: 40px;
`;

const ReviewsList: React.FC<ReviewsListProps> = ({ sellerId, carId, limit = 20 }) => {
    const [reviews, setReviews] = useState<Review[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadReviews();
    }, [sellerId, carId]);

    const loadReviews = async () => {
        setLoading(true);
        try {
            let data: Review[];
            if (sellerId) {
                data = await ReviewService.getSellerReviews(sellerId, limit);
            } else if (carId) {
                data = await ReviewService.getCarReviews(carId, limit);
            } else {
                data = [];
            }
            setReviews(data);
        } catch (error) {
            logger.error('Error loading reviews', error);
        } finally {
            setLoading(false);
        }
    };

    const handleHelpful = async (reviewId: string, helpful: boolean) => {
        try {
            await ReviewService.markHelpful(reviewId, helpful);
            // Update local state
            setReviews(prev => prev.map(r => 
                r.id === reviewId 
                    ? { ...r, [helpful ? 'helpful' : 'notHelpful']: (r[helpful ? 'helpful' : 'notHelpful'] || 0) + 1 }
                    : r
            ));
        } catch (error) {
            logger.error('Error marking review helpful', error);
        }
    };

    const formatDate = (date: Date): string => {
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffDays = Math.floor(diffMs / 86400000);
        
        if (diffDays === 0) return 'Днес';
        if (diffDays === 1) return 'Вчера';
        if (diffDays < 7) return `Преди ${diffDays} дни`;
        if (diffDays < 30) return `Преди ${Math.floor(diffDays / 7)} седмици`;
        
        return date.toLocaleDateString('bg-BG', { day: 'numeric', month: 'short', year: 'numeric' });
    };

    const getInitials = (name: string): string => {
        return name
            .split(' ')
            .map(n => n[0])
            .join('')
            .toUpperCase()
            .substring(0, 2);
    };

    const renderReview = ({ item }: { item: Review }) => (
        <ReviewCard theme={theme}>
            <ReviewHeader>
                <Avatar theme={theme}>
                    <AvatarText>{getInitials(item.reviewerName || 'Анонимен')}</AvatarText>
                </Avatar>
                <ReviewerInfo>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <ReviewerName theme={theme}>{item.reviewerName || 'Анонимен'}</ReviewerName>
                        {item.verifiedPurchase && (
                            <VerifiedBadge theme={theme}>
                                <Ionicons name="checkmark-circle" size={12} color={theme.colors.status.success} />
                                <BadgeText theme={theme}>Потвърдена</BadgeText>
                            </VerifiedBadge>
                        )}
                    </View>
                    <ReviewDate theme={theme}>{formatDate(item.createdAt as Date)}</ReviewDate>
                </ReviewerInfo>
            </ReviewHeader>

            <RatingRow>
                <ReviewStars rating={item.rating} size="small" />
            </RatingRow>

            {item.title && (
                <ReviewTitle theme={theme}>{item.title}</ReviewTitle>
            )}

            <ReviewText theme={theme}>{item.comment}</ReviewText>

            <ReviewFooter theme={theme}>
                <RecommendBadge theme={theme} recommend={item.wouldRecommend}>
                    <Ionicons 
                        name={item.wouldRecommend ? "thumbs-up" : "thumbs-down"} 
                        size={14} 
                        color={item.wouldRecommend ? theme.colors.status.success : theme.colors.status.warning} 
                    />
                    <RecommendText theme={theme} recommend={item.wouldRecommend}>
                        {item.wouldRecommend ? 'Препоръчва' : 'Не препоръчва'}
                    </RecommendText>
                </RecommendBadge>

                <ActionButtons>
                    <ActionButton onPress={() => handleHelpful(item.id!, true)}>
                        <Ionicons name="thumbs-up-outline" size={16} color={theme.colors.text.secondary} />
                        <ActionText theme={theme}>{item.helpful || 0}</ActionText>
                    </ActionButton>
                    <ActionButton onPress={() => handleHelpful(item.id!, false)}>
                        <Ionicons name="thumbs-down-outline" size={16} color={theme.colors.text.secondary} />
                        <ActionText theme={theme}>{item.notHelpful || 0}</ActionText>
                    </ActionButton>
                </ActionButtons>
            </ReviewFooter>
        </ReviewCard>
    );

    const renderEmpty = () => (
        <EmptyState>
            <EmptyIcon theme={theme}>
                <Ionicons name="chatbox-outline" size={28} color={theme.colors.text.disabled} />
            </EmptyIcon>
            <EmptyTitle theme={theme}>Няма отзиви</EmptyTitle>
            <EmptySubtitle theme={theme}>
                Бъдете първият, който ще напише отзив
            </EmptySubtitle>
        </EmptyState>
    );

    if (loading) {
        return (
            <LoadingContainer>
                <ActivityIndicator size="large" color={theme.colors.primary.main} />
            </LoadingContainer>
        );
    }

    return (
        <Container>
            <FlatList
                data={reviews}
                keyExtractor={(item) => item.id!}
                renderItem={renderReview}
                ListEmptyComponent={renderEmpty}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 20 }}
            />
        </Container>
    );
};

export default ReviewsList;
