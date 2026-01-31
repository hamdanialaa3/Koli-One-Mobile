import React, { useEffect, useState } from 'react';
import styled from 'styled-components/native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../src/contexts/AuthContext';
import { ListingService } from '../../src/services/ListingService';
import { ListingBase } from '../../src/types/ListingBase';
import { MobileHeader } from '../../src/components/common/MobileHeader';
import { SkeletonListingCard } from '../../src/components/skeleton/SkeletonListingCard';
import { theme } from '../../src/styles/theme';
import { FlatList, RefreshControl, Alert } from 'react-native';
import { CarCard } from '../../src/components/CarCard';
import { Ionicons } from '@expo/vector-icons';

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

const AdCard = styled.View`
  background-color: ${props => props.theme.colors.background.paper};
  border-radius: 12px;
  margin-bottom: 16px;
  overflow: hidden;
  border-width: 1px;
  border-color: ${props => props.theme.colors.border.default};
`;

const AdActions = styled.View`
  flex-direction: row;
  border-top-width: 1px;
  border-top-color: ${props => props.theme.colors.border.default};
`;

const ActionButton = styled.TouchableOpacity`
  flex: 1;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  padding: 12px;
  gap: 8px;
`;

const ActionText = styled.Text<{ danger?: boolean }>`
  font-size: 14px;
  font-weight: 600;
  color: ${props => props.danger ? props.theme.colors.status.error : props.theme.colors.primary.main};
`;

export default function MyAdsScreen() {
    const { user } = useAuth();
    const router = useRouter();
    const [listings, setListings] = useState<ListingBase[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchMyAds = async () => {
        if (!user) return;
        try {
            const ads = await ListingService.getUserListings(user.uid);
            setListings(ads);
        } catch (error) {
            console.error("Error fetching my ads:", error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const handleDelete = async (id: string) => {
        const { Alert } = require('react-native');
        Alert.alert(
            "Delete Listing",
            "Are you sure you want to delete this listing?",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Delete",
                    style: "destructive",
                    onPress: async () => {
                        await ListingService.deleteListing(id);
                        fetchMyAds();
                    }
                }
            ]
        );
    };

    useEffect(() => {
        fetchMyAds();
    }, [user]);

    const onRefresh = React.useCallback(() => {
        setRefreshing(true);
        fetchMyAds();
    }, []);

    if (loading) {
        return (
            <Container theme={theme}>
                <MobileHeader title="My Listings" back />
                <Content theme={theme}>
                    {[1, 2, 3].map((i) => <SkeletonListingCard key={i} />)}
                </Content>
            </Container>
        );
    }

    return (
        <Container theme={theme}>
            <MobileHeader title="My Listings" showBack />
            <FlatList
                data={listings}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <AdCard theme={theme}>
                        <CarCard listing={item} onPress={() => router.push(`/car/${item.id}`)} />
                        <AdActions theme={theme}>
                            <ActionButton onPress={() => router.push({ pathname: '/profile/edit-listing/[id]' as any, params: { id: item.id } })}>
                                <Ionicons name="create-outline" size={18} color={theme.colors.primary.main} />
                                <ActionText theme={theme}>Edit</ActionText>
                            </ActionButton>
                            <ActionButton onPress={() => handleDelete(item.id)}>
                                <Ionicons name="trash-outline" size={18} color={theme.colors.status.error} />
                                <ActionText theme={theme} danger>Delete</ActionText>
                            </ActionButton>
                        </AdActions>
                    </AdCard>
                )}
                contentContainerStyle={{ padding: 16 }}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.colors.primary.main} />
                }
                ListEmptyComponent={
                    <EmptyStateContainer>
                        <EmptyStateText theme={theme}>No listings found</EmptyStateText>
                        <EmptyStateSubtext theme={theme}>You haven't posted any cars for sale yet.</EmptyStateSubtext>
                    </EmptyStateContainer>
                }
            />
        </Container>
    );
}
