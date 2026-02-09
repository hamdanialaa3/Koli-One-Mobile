import React, { useEffect, useState } from 'react';
import styled from 'styled-components/native';
import { View, Image, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../styles/theme';
import { CarListing } from '../../types/CarListing';
import { ReviewService, ReviewStats } from '../../services/ReviewService';

const Section = styled.View`
  padding: 20px;
  background-color: ${props => props.theme.colors.background.paper};
  margin-top: 12px;
`;

const SectionTitle = styled.Text`
  font-size: 18px;
  font-weight: 700;
  color: ${props => props.theme.colors.text.primary};
  margin-bottom: 16px;
`;

const SellerCard = styled.View`
  flex-direction: row;
  align-items: center;
  gap: 16px;
`;

const Avatar = styled.View`
  width: 60px;
  height: 60px;
  border-radius: 30px;
  background-color: ${props => props.theme.colors.background.dark};
  justify-content: center;
  align-items: center;
`;

const Info = styled.View`
  flex: 1;
`;

const Name = styled.Text`
  font-size: 16px;
  font-weight: 700;
  color: ${props => props.theme.colors.text.primary};
  margin-bottom: 4px;
`;

const Type = styled.Text`
  font-size: 13px;
  color: ${props => props.theme.colors.text.secondary};
  text-transform: capitalize;
  margin-bottom: 6px;
`;

const RatingRow = styled.View`
  flex-direction: row;
  align-items: center;
  gap: 4px;
`;

const RatingText = styled.Text`
  font-size: 13px;
  font-weight: 600;
  color: ${props => props.theme.colors.accent.main};
`;

interface CarDetailsSellerProps {
    car: CarListing;
}

export const CarDetailsSeller: React.FC<CarDetailsSellerProps> = ({ car }) => {
    const [stats, setStats] = useState<ReviewStats | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadSellerStats();
    }, [car.sellerId]);

    const loadSellerStats = async () => {
        try {
            const data = await ReviewService.getSellerStats(car.sellerId);
            setStats(data);
        } catch (error) {
            console.error('Failed to load seller stats:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Section theme={theme}>
            <SectionTitle theme={theme}>Seller</SectionTitle>
            <SellerCard>
                <Avatar theme={theme}>
                    <Ionicons name="person" size={30} color={theme.colors.text.secondary} />
                </Avatar>
                <Info>
                    <Name theme={theme}>{car.sellerName || 'Private Seller'}</Name>
                    <Type theme={theme}>{car.sellerType || 'Private'}</Type>
                    {loading ? (
                        <ActivityIndicator size="small" color={theme.colors.accent.main} />
                    ) : stats && stats.totalReviews > 0 ? (
                        <RatingRow>
                            <Ionicons name="star" size={14} color="#FFB800" />
                            <RatingText theme={theme}>
                                {stats.averageRating.toFixed(1)} ({stats.totalReviews} {stats.totalReviews === 1 ? 'отзив' : 'отзива'})
                            </RatingText>
                        </RatingRow>
                    ) : (
                        <RatingRow>
                            <RatingText theme={theme} style={{ color: theme.colors.text.disabled }}>
                                Няма отзиви
                            </RatingText>
                        </RatingRow>
                    )}
                </Info>
                <Ionicons name="chevron-forward" size={24} color={theme.colors.text.disabled} />
            </SellerCard>
        </Section>
    );
};
