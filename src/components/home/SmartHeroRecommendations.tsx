import React, { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components/native';
import { View, Text, TouchableOpacity, ScrollView, Dimensions } from 'react-native';
import { Sparkles, RefreshCw, ChevronRight } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';

import { theme } from '../../styles/theme';
import { getFeaturedListings } from '../../services/api/homeStrips';
import { ListingBase } from '../../types/ListingBase';
import { CarCard } from '../CarCard';
import { SkeletonListingCard } from '../skeleton/SkeletonListingCard';

const { width } = Dimensions.get('window');

const SectionContainer = styled.View`
  margin-top: 24px;
  margin-bottom: 24px;
`;

const Header = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  padding: 0 16px;
  margin-bottom: 16px;
`;

const TitleContainer = styled.View`
  flex: 1;
`;

const TitleRow = styled.View`
  flex-direction: row;
  align-items: center;
  gap: 8px;
`;

const Title = styled.Text`
  font-size: 20px;
  font-weight: 800;
  color: ${props => props.theme.colors.text.primary};
`;

const Subtitle = styled.Text`
  font-size: 13px;
  color: ${props => props.theme.colors.text.secondary};
  margin-top: 4px;
  line-height: 18px;
`;

const Actions = styled.View`
  flex-direction: row;
  gap: 12px;
  align-items: center;
`;

const IconButton = styled.TouchableOpacity`
  width: 36px;
  height: 36px;
  border-radius: 18px;
  background-color: ${props => props.theme.colors.background.paper};
  justify-content: center;
  align-items: center;
  border-width: 1px;
  border-color: ${props => props.theme.colors.border.default};
`;

const ViewAllButton = styled.TouchableOpacity`
  flex-direction: row;
  align-items: center;
  background-color: ${props => props.theme.colors.accent.main}20;
  padding: 6px 12px;
  border-radius: 20px;
`;

const ViewAllText = styled.Text`
  color: ${props => props.theme.colors.accent.main};
  font-size: 12px;
  font-weight: 700;
  margin-right: 4px;
`;

const ScrollContent = styled.ScrollView`
  padding-left: 16px;
`;

const CardWrapper = styled.View`
  width: 280px;
  margin-right: 16px;
`;

// Helper component for Brand Badge
const BrandBadge = styled(LinearGradient).attrs({
    colors: ['#FF8F10', '#FF6B00'],
    start: { x: 0, y: 0 },
    end: { x: 1, y: 1 }
})`
  padding: 2px 8px;
  border-radius: 10px;
  margin-left: 8px;
`;

const BrandText = styled.Text`
  color: #fff;
  font-size: 10px;
  font-weight: 700;
`;

export default function SmartHeroRecommendations() {
    const router = useRouter();
    const [listings, setListings] = useState<ListingBase[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [isPersonalized, setIsPersonalized] = useState(false); // Mock logic for now

    const loadRecommendations = useCallback(async (isRefresh = false) => {
        if (isRefresh) setRefreshing(true);
        else setLoading(true);

        try {
            // Fetch real featured listings for "Popular"
            // For "Personalized", we would use getSimilarCars based on history, but for now we fallback to featured
            const data = await getFeaturedListings(8);
            setListings(data);

            // Simulate personalized check logic (stub for future enhancement)
            setIsPersonalized(false);
        } catch (error) {
            console.error('Failed to load recommendations', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useEffect(() => {
        loadRecommendations();
    }, [loadRecommendations]);

    const handleRefresh = () => {
        loadRecommendations(true);
    };

    const handleViewAll = () => {
        router.push('/(tabs)/search');
    };

    return (
        <SectionContainer theme={theme}>
            <Header>
                <TitleContainer>
                    <TitleRow>
                        <Sparkles color="#FF8F10" size={20} />
                        <Title theme={theme}>
                            {isPersonalized ? 'Picked for you' : 'Popular cars'}
                        </Title>
                        {/* Optional Dominant Brand Badge - Parity with Web */}
                        {isPersonalized && (
                            <BrandBadge>
                                <BrandText>BMW</BrandText>
                            </BrandBadge>
                        )}
                    </TitleRow>
                    <Subtitle theme={theme}>
                        {isPersonalized
                            ? 'Based on your searches and interests'
                            : 'Most searched cars right now'}
                    </Subtitle>
                </TitleContainer>

                <Actions>
                    <IconButton theme={theme} onPress={handleRefresh} disabled={refreshing}>
                        <RefreshCw
                            color={theme.colors.text.primary}
                            size={18}
                            style={{ opacity: refreshing ? 0.5 : 1 }}
                        />
                    </IconButton>
                </Actions>
            </Header>

            {loading ? (
                <ScrollContent horizontal showsHorizontalScrollIndicator={false}>
                    {[1, 2, 3].map(i => (
                        <CardWrapper key={i}>
                            <SkeletonListingCard />
                        </CardWrapper>
                    ))}
                </ScrollContent>
            ) : (
                <ScrollContent horizontal showsHorizontalScrollIndicator={false}>
                    {listings.map((car) => (
                        <CardWrapper key={car.id}>
                            <CarCard listing={car} />
                        </CardWrapper>
                    ))}

                    <ViewAllButton
                        style={{
                            height: 320,
                            width: 100,
                            justifyContent: 'center',
                            backgroundColor: 'transparent'
                        }}
                        onPress={handleViewAll}
                        theme={theme}
                    >
                        <View style={{ alignItems: 'center' }}>
                            <View style={{
                                width: 48,
                                height: 48,
                                borderRadius: 24,
                                backgroundColor: theme.colors.accent.main + '20',
                                alignItems: 'center',
                                justifyContent: 'center',
                                marginBottom: 8
                            }}>
                                <ChevronRight color={theme.colors.accent.main} size={24} />
                            </View>
                            <ViewAllText theme={theme} style={{ color: theme.colors.text.primary }}>View All</ViewAllText>
                        </View>
                    </ViewAllButton>

                    <View style={{ width: 16 }} />
                </ScrollContent>
            )}
        </SectionContainer>
    );
}
