import React, { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components/native';
import { MobileHeader } from '../src/components/common/MobileHeader';
import { theme } from '../src/styles/theme';
import {
    View,
    FlatList,
    TextInput,
    TouchableOpacity,
    Image,
    ActivityIndicator,
    Text,
    RefreshControl
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { collection, getDocs, query, where, orderBy, limit } from 'firebase/firestore';
import { db } from '../src/services/firebase';

// ==================== Types ====================

interface Dealer {
    id: string;
    name: string;
    city: string;
    verified: boolean;
    featuredDealer: boolean;
    verificationStatus: 'pending' | 'in_review' | 'verified' | 'rejected';
    logoUrl?: string;
    listingCount: number;
}

// ==================== Styled Components ====================

const Container = styled.SafeAreaView`
  flex: 1;
  background-color: ${props => props.theme.colors.background.default};
`;

const SearchHeader = styled.View`
  background-color: ${props => props.theme.colors.background.paper};
  padding: 16px 20px;
  border-bottom-width: 1px;
  border-bottom-color: ${props => props.theme.colors.border.muted};
`;

const SearchInput = styled.View`
  flex-direction: row;
  align-items: center;
  background-color: ${props => props.theme.colors.background.default};
  border-radius: 12px;
  padding: 0 12px;
  height: 48px;
`;

const DealerCard = styled.TouchableOpacity`
  background-color: ${props => props.theme.colors.background.paper};
  margin: 10px 20px;
  border-radius: 16px;
  padding: 16px;
  flex-direction: row;
  align-items: center;
  border-width: 1px;
  border-color: ${props => props.theme.colors.border.muted};
`;

const DealerLogo = styled.Image`
  width: 60px;
  height: 60px;
  border-radius: 30px;
  background-color: #eee;
`;

const DealerInfo = styled.View`
  flex: 1;
  margin-left: 16px;
`;

const DealerName = styled.Text`
  font-size: 16px;
  font-weight: 700;
  color: ${props => props.theme.colors.text.primary};
`;

const DealerMeta = styled.Text`
  font-size: 13px;
  color: ${props => props.theme.colors.text.secondary};
  margin-top: 2px;
`;

const BadgeRow = styled.View`
  flex-direction: row;
  margin-top: 8px;
  gap: 8px;
`;

const Badge = styled.View<{ color: string }>`
  background-color: ${props => props.color}15;
  padding: 4px 8px;
  border-radius: 6px;
`;

const BadgeText = styled.Text<{ color: string }>`
  font-size: 10px;
  font-weight: 800;
  color: ${props => props.color};
  text-transform: uppercase;
`;

const CenterMessage = styled.View`
  flex: 1;
  justify-content: center;
  align-items: center;
  padding: 40px 20px;
`;

const CenterMessageText = styled.Text`
  font-size: 15px;
  color: ${props => props.theme.colors.text.secondary};
  text-align: center;
  margin-top: 12px;
`;

const RetryButton = styled.TouchableOpacity`
  margin-top: 16px;
  padding: 10px 24px;
  border-radius: 8px;
  background-color: ${props => props.theme.colors.primary.main};
`;

const RetryButtonText = styled.Text`
  color: #fff;
  font-size: 14px;
  font-weight: 600;
`;

// ==================== Helpers ====================

/** Map a Firestore dealership document to our local Dealer shape */
function mapDocToDealer(docSnap: any): Dealer {
    const data = docSnap.data();
    const name =
        data.dealershipNameBG ||
        data.dealershipNameEN ||
        data.name ||
        'Без име';

    const city =
        data.address?.city ||
        data.city ||
        '';

    const logoUrl =
        data.media?.logo?.url ||
        data.logoUrl ||
        undefined;

    const listingCount =
        typeof data.totalCarsAvailable === 'number'
            ? data.totalCarsAvailable
            : typeof data.listings === 'number'
                ? data.listings
                : 0;

    return {
        id: docSnap.id,
        name,
        city,
        verified: data.verified === true,
        featuredDealer: data.featuredDealer === true,
        verificationStatus: data.verification?.status || 'pending',
        logoUrl,
        listingCount,
    };
}

function dealerBadgeLabel(dealer: Dealer): string {
    if (dealer.featuredDealer) return 'Препоръчан';
    if (dealer.verified) return 'Верифициран';
    return 'Стандартен';
}

function dealerBadgeColor(dealer: Dealer): string {
    if (dealer.featuredDealer) return '#F59E0B'; // amber
    if (dealer.verified) return theme.colors.status.success;
    return theme.colors.text.secondary;
}

// ==================== Screen ====================

export default function DealersScreen() {
    const router = useRouter();
    const [search, setSearch] = useState('');
    const [dealers, setDealers] = useState<Dealer[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchDealers = useCallback(async (isRefresh = false) => {
        try {
            if (isRefresh) {
                setRefreshing(true);
            } else {
                setLoading(true);
            }
            setError(null);

            const dealershipsRef = collection(db, 'dealerships');
            const snapshot = await getDocs(dealershipsRef);

            const results: Dealer[] = snapshot.docs.map(mapDocToDealer);

            // Sort: featured first, then verified, then alphabetically
            results.sort((a, b) => {
                if (a.featuredDealer !== b.featuredDealer) return a.featuredDealer ? -1 : 1;
                if (a.verified !== b.verified) return a.verified ? -1 : 1;
                return a.name.localeCompare(b.name, 'bg');
            });

            setDealers(results);
        } catch (err: any) {
            setError('Неуспешно зареждане на дилъри. Моля, опитайте отново.');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useEffect(() => {
        fetchDealers();
    }, [fetchDealers]);

    const filteredDealers = dealers.filter(d => {
        const term = search.toLowerCase();
        return (
            d.name.toLowerCase().includes(term) ||
            d.city.toLowerCase().includes(term)
        );
    });

    // ---- Error state ----
    if (error && !loading) {
        return (
            <Container theme={theme}>
                <MobileHeader title="Партньорски дилъри" back />
                <CenterMessage>
                    <Ionicons name="alert-circle-outline" size={48} color={theme.colors.status.error} />
                    <CenterMessageText theme={theme}>{error}</CenterMessageText>
                    <RetryButton theme={theme} onPress={() => fetchDealers()}>
                        <RetryButtonText>Опитай отново</RetryButtonText>
                    </RetryButton>
                </CenterMessage>
            </Container>
        );
    }

    return (
        <Container theme={theme}>
            <MobileHeader title="Партньорски дилъри" back />
            <SearchHeader theme={theme}>
                <SearchInput theme={theme}>
                    <Ionicons name="search" size={20} color="#999" />
                    <TextInput
                        style={{ flex: 1, marginLeft: 10, fontSize: 16 }}
                        placeholder="Търсене по име или град..."
                        placeholderTextColor="#999"
                        value={search}
                        onChangeText={setSearch}
                    />
                    {search.length > 0 && (
                        <TouchableOpacity onPress={() => setSearch('')}>
                            <Ionicons name="close-circle" size={20} color="#999" />
                        </TouchableOpacity>
                    )}
                </SearchInput>
            </SearchHeader>

            {loading ? (
                <CenterMessage>
                    <ActivityIndicator size="large" color={theme.colors.primary.main} />
                    <CenterMessageText theme={theme}>Зареждане на дилъри...</CenterMessageText>
                </CenterMessage>
            ) : (
                <FlatList
                    data={filteredDealers}
                    keyExtractor={item => item.id}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={() => fetchDealers(true)}
                            tintColor={theme.colors.primary.main}
                        />
                    }
                    renderItem={({ item }) => (
                        <DealerCard theme={theme} onPress={() => router.push(`/profile/${item.id}` as any)}>
                            <DealerLogo
                                source={{
                                    uri: item.logoUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(item.name)}&background=003366&color=fff`
                                }}
                            />
                            <DealerInfo>
                                <DealerName theme={theme}>{item.name}</DealerName>
                                <DealerMeta theme={theme}>
                                    {item.city ? `${item.city} • ` : ''}{item.listingCount} обяви
                                </DealerMeta>
                                <BadgeRow>
                                    <Badge color={dealerBadgeColor(item)}>
                                        <BadgeText color={dealerBadgeColor(item)}>
                                            {dealerBadgeLabel(item)}
                                        </BadgeText>
                                    </Badge>
                                </BadgeRow>
                            </DealerInfo>
                            <Ionicons name="chevron-forward" size={20} color="#ccc" />
                        </DealerCard>
                    )}
                    ListEmptyComponent={
                        <CenterMessage>
                            <Ionicons name="business-outline" size={48} color="#ccc" />
                            <CenterMessageText theme={theme}>
                                {search.length > 0
                                    ? 'Няма намерени дилъри за тази заявка.'
                                    : 'Все още няма регистрирани дилъри.'}
                            </CenterMessageText>
                        </CenterMessage>
                    }
                    contentContainerStyle={filteredDealers.length === 0 ? { flex: 1 } : { paddingVertical: 10 }}
                />
            )}
        </Container>
    );
}
