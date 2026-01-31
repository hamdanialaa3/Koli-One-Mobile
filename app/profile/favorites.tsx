import React, { useEffect, useState } from 'react';
import styled from 'styled-components/native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../src/contexts/AuthContext';
import { ListingService } from '../../src/services/ListingService';
import { ListingBase } from '../../src/types/ListingBase';
import { MobileHeader } from '../../src/components/common/MobileHeader';
import { SkeletonListingCard } from '../../src/components/skeleton/SkeletonListingCard';
import { theme } from '../../src/styles/theme';
import { FlatList, RefreshControl } from 'react-native';
import { CarCard } from '../../src/components/CarCard';

const Container = styled.SafeAreaView`
  flex: 1;
  background-color: ${props => props.theme.colors.background.default};
`;

const Content = styled.View`
  flex: 1;
  padding: ${props => props.theme.spacing.md};
`;

const EmptyStateContainer = styled.View`
  flex: 1;
  justify-content: center;
  align-items: center;
  padding: 40px;
`;

const EmptyStateText = styled.Text`
  font-size: 18px;
  color: ${props => props.theme.colors.text.secondary};
  text-align: center;
  margin-top: 20px;
`;

const EmptyStateSubtext = styled.Text`
  font-size: 14px;
  color: ${props => props.theme.colors.text.disabled};
  text-align: center;
  margin-top: 10px;
`;

export default function FavoritesScreen() {
    const { user, profile } = useAuth();
    const router = useRouter();
    const [listings, setListings] = useState<ListingBase[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchFavorites = async () => {
        if (!user || !profile?.favorites || profile.favorites.length === 0) {
            setListings([]);
            setLoading(false);
            setRefreshing(false);
            return;
        }
        try {
            const ads = await ListingService.getListingsByIds(profile.favorites);
            setListings(ads);
        } catch (error) {
            console.error("Error fetching favorites:", error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchFavorites();
    }, [user, profile?.favorites]);

    const onRefresh = React.useCallback(() => {
        setRefreshing(true);
        fetchFavorites();
    }, []);

    if (loading) {
        return (
            <Container theme={theme}>
                <MobileHeader title="Favorites" showBack />
                <Content theme={theme}>
                    {[1, 2, 3].map((i) => <SkeletonListingCard key={i} />)}
                </Content>
            </Container>
        );
    }

    return (
        <Container theme={theme}>
            <MobileHeader title="Favorites" showBack />
            <FlatList
                data={listings}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <CarCard listing={item} onPress={() => router.push(`/car/${item.id}`)} />
                )}
                contentContainerStyle={{ padding: 16 }}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.colors.primary.main} />
                }
                ListEmptyComponent={
                    <EmptyStateContainer>
                        <EmptyStateText theme={theme}>No favorites yet</EmptyStateText>
                        <EmptyStateSubtext theme={theme}>Save cars you like to check them later.</EmptyStateSubtext>
                    </EmptyStateContainer>
                }
            />
        </Container>
    );
}
