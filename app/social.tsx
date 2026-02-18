import React, { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components/native';
import { MobileHeader } from '../src/components/common/MobileHeader';
import { theme } from '../src/styles/theme';
import {
    View,
    FlatList,
    Text,
    Image,
    TouchableOpacity,
    ActivityIndicator,
    RefreshControl,
    Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { db } from '../src/services/firebase';
import {
    collection,
    query,
    where,
    getDocs,
    orderBy,
    limit,
    Timestamp,
} from 'firebase/firestore';

// ── Types ──────────────────────────────────────────────────────────
interface FeedItem {
    id: string;
    collectionName: string;
    make: string;
    model: string;
    year: number;
    price: number;
    currency: string;
    image: string | null;
    city: string;
    createdAt: Date;
    sellerId: string;
}

// ── Vehicle collections to query ───────────────────────────────────
const FEED_COLLECTIONS = [
    'passenger_cars',
    'suvs',
    'vans',
    'motorcycles',
    'trucks',
    'buses',
] as const;

// ── Helpers ────────────────────────────────────────────────────────
function timeAgo(date: Date): string {
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    if (seconds < 60) return 'току-що';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `преди ${minutes} мин`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `преди ${hours} ч`;
    const days = Math.floor(hours / 24);
    if (days < 30) return `преди ${days} дни`;
    const months = Math.floor(days / 30);
    return `преди ${months} мес`;
}

function formatPrice(price: number, currency: string): string {
    const value = price.toLocaleString('bg-BG');
    switch (currency?.toUpperCase()) {
        case 'EUR': return `€${value}`;
        case 'USD': return `$${value}`;
        case 'BGN': return `${value} лв`;
        default: return `€${value}`;
    }
}

// ── Styled Components ──────────────────────────────────────────────
const { width: SCREEN_WIDTH } = Dimensions.get('window');

const Container = styled.SafeAreaView`
  flex: 1;
  background-color: ${(props: any) => props.theme.colors.background.default};
`;

const ListingCard = styled.TouchableOpacity`
  background-color: ${(props: any) => props.theme.colors.background.paper};
  margin-horizontal: 12px;
  margin-bottom: 10px;
  border-radius: 12px;
  overflow: hidden;
  elevation: 2;
  shadow-color: #000;
  shadow-offset: 0px 1px;
  shadow-opacity: 0.1;
  shadow-radius: 3px;
`;

const ListingImage = styled.Image`
  width: 100%;
  height: 200px;
  background-color: #e8e8e8;
`;

const ImagePlaceholder = styled.View`
  width: 100%;
  height: 200px;
  background-color: #e0e0e0;
  align-items: center;
  justify-content: center;
`;

const CardBody = styled.View`
  padding: 12px 14px 14px;
`;

const TitleRow = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 6px;
`;

const ListingTitle = styled.Text`
  font-size: 16px;
  font-weight: 700;
  color: ${(props: any) => props.theme.colors.text.primary};
  flex: 1;
  margin-right: 8px;
`;

const PriceTag = styled.Text`
  font-size: 16px;
  font-weight: 800;
  color: ${(props: any) => props.theme.colors.primary?.main || '#1976d2'};
`;

const MetaRow = styled.View`
  flex-direction: row;
  align-items: center;
  margin-top: 4px;
`;

const MetaText = styled.Text`
  font-size: 13px;
  color: ${(props: any) => props.theme.colors.text.secondary};
  margin-left: 4px;
  margin-right: 14px;
`;

const CenterBox = styled.View`
  flex: 1;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
`;

const EmptyText = styled.Text`
  font-size: 15px;
  color: ${(props: any) => props.theme.colors.text.secondary};
  text-align: center;
  margin-top: 12px;
  line-height: 22px;
`;

const ErrorText = styled.Text`
  font-size: 15px;
  color: #d32f2f;
  text-align: center;
  margin-top: 12px;
  line-height: 22px;
`;

const RetryButton = styled.TouchableOpacity`
  margin-top: 16px;
  padding: 10px 24px;
  border-radius: 8px;
  background-color: ${(props: any) => props.theme.colors.primary?.main || '#1976d2'};
`;

const RetryText = styled.Text`
  color: #fff;
  font-size: 14px;
  font-weight: 600;
`;

const CollectionBadge = styled.View`
  position: absolute;
  top: 10px;
  left: 10px;
  background-color: rgba(0,0,0,0.6);
  padding: 3px 8px;
  border-radius: 6px;
`;

const BadgeText = styled.Text`
  color: #fff;
  font-size: 11px;
  font-weight: 600;
`;

// ── Collection label map (Bulgarian) ───────────────────────────────
const COLLECTION_LABELS: Record<string, string> = {
    passenger_cars: 'Леки коли',
    suvs: 'Джипове',
    vans: 'Бусове',
    motorcycles: 'Мотори',
    trucks: 'Камиони',
    buses: 'Автобуси',
};

// ── Main Component ─────────────────────────────────────────────────
export default function SocialScreen() {
    const router = useRouter();
    const [items, setItems] = useState<FeedItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchFeed = useCallback(async () => {
        try {
            setError(null);
            const allItems: FeedItem[] = [];

            // Query each collection in parallel
            const promises = FEED_COLLECTIONS.map(async (collName) => {
                try {
                    const q = query(
                        collection(db, collName),
                        where('status', '==', 'active'),
                        orderBy('createdAt', 'desc'),
                        limit(5),
                    );
                    const snapshot = await getDocs(q);
                    snapshot.forEach((docSnap) => {
                        const data = docSnap.data();
                        // Resolve primary image
                        let image: string | null = null;
                        if (data.primaryImage) {
                            image = data.primaryImage;
                        } else if (data.images && data.images.length > 0) {
                            const idx = data.featuredImageIndex ?? 0;
                            image = data.images[idx] || data.images[0];
                        }
                        // Resolve city
                        const city =
                            data.location?.cityName ||
                            data.location?.cityNameBg ||
                            data.locationData?.cityName ||
                            '';
                        // Resolve createdAt
                        let createdAt: Date;
                        if (data.createdAt instanceof Timestamp) {
                            createdAt = data.createdAt.toDate();
                        } else if (data.createdAt?.seconds) {
                            createdAt = new Date(data.createdAt.seconds * 1000);
                        } else if (data.createdAt) {
                            createdAt = new Date(data.createdAt);
                        } else {
                            createdAt = new Date();
                        }

                        allItems.push({
                            id: docSnap.id,
                            collectionName: collName,
                            make: data.make || '',
                            model: data.model || '',
                            year: data.year || 0,
                            price: data.price || 0,
                            currency: data.currency || 'EUR',
                            image,
                            city,
                            createdAt,
                            sellerId: data.sellerId || '',
                        });
                    });
                } catch {
                    // Collection may not exist yet – skip silently
                }
            });

            await Promise.all(promises);

            // Sort all results by createdAt desc, take top 20
            allItems.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
            setItems(allItems.slice(0, 20));
        } catch (err: any) {
            setError(err?.message || 'Грешка при зареждане');
        }
    }, []);

    useEffect(() => {
        setLoading(true);
        fetchFeed().finally(() => setLoading(false));
    }, [fetchFeed]);

    const handleRefresh = useCallback(async () => {
        setRefreshing(true);
        await fetchFeed();
        setRefreshing(false);
    }, [fetchFeed]);

    const handleCardPress = (item: FeedItem) => {
        router.push({ pathname: '/car/[id]', params: { id: item.id } });
    };

    // ── Render helpers ─────────────────────────────────────────────

    const renderCard = ({ item }: { item: FeedItem }) => {
        const title = [item.make, item.model, item.year].filter(Boolean).join(' ');
        return (
            <ListingCard theme={theme} onPress={() => handleCardPress(item)} activeOpacity={0.85}>
                {item.image ? (
                    <View>
                        <ListingImage source={{ uri: item.image }} resizeMode="cover" />
                        <CollectionBadge>
                            <BadgeText>{COLLECTION_LABELS[item.collectionName] || item.collectionName}</BadgeText>
                        </CollectionBadge>
                    </View>
                ) : (
                    <View>
                        <ImagePlaceholder>
                            <Ionicons name="car-outline" size={48} color="#bbb" />
                        </ImagePlaceholder>
                        <CollectionBadge>
                            <BadgeText>{COLLECTION_LABELS[item.collectionName] || item.collectionName}</BadgeText>
                        </CollectionBadge>
                    </View>
                )}

                <CardBody>
                    <TitleRow>
                        <ListingTitle theme={theme} numberOfLines={1}>{title || 'Без заглавие'}</ListingTitle>
                        <PriceTag theme={theme}>{formatPrice(item.price, item.currency)}</PriceTag>
                    </TitleRow>

                    <MetaRow>
                        {item.city ? (
                            <>
                                <Ionicons name="location-outline" size={14} color={theme.colors.text.secondary} />
                                <MetaText theme={theme}>{item.city}</MetaText>
                            </>
                        ) : null}
                        <Ionicons name="time-outline" size={14} color={theme.colors.text.secondary} />
                        <MetaText theme={theme}>{timeAgo(item.createdAt)}</MetaText>
                    </MetaRow>
                </CardBody>
            </ListingCard>
        );
    };

    // ── Loading state ──────────────────────────────────────────────
    if (loading) {
        return (
            <Container theme={theme}>
                <MobileHeader title="Последни обяви" back />
                <CenterBox>
                    <ActivityIndicator size="large" color={theme.colors.primary?.main || '#1976d2'} />
                    <EmptyText theme={theme}>Зареждане...</EmptyText>
                </CenterBox>
            </Container>
        );
    }

    // ── Error state ────────────────────────────────────────────────
    if (error) {
        return (
            <Container theme={theme}>
                <MobileHeader title="Последни обяви" back />
                <CenterBox>
                    <Ionicons name="alert-circle-outline" size={48} color="#d32f2f" />
                    <ErrorText>{error}</ErrorText>
                    <RetryButton theme={theme} onPress={() => { setLoading(true); fetchFeed().finally(() => setLoading(false)); }}>
                        <RetryText>Опитай отново</RetryText>
                    </RetryButton>
                </CenterBox>
            </Container>
        );
    }

    // ── Empty state ────────────────────────────────────────────────
    if (items.length === 0) {
        return (
            <Container theme={theme}>
                <MobileHeader title="Последни обяви" back />
                <CenterBox>
                    <Ionicons name="car-sport-outline" size={56} color={theme.colors.text.disabled} />
                    <EmptyText theme={theme}>Няма налични обяви в момента.{'\n'}Дръпнете надолу за обновяване.</EmptyText>
                </CenterBox>
            </Container>
        );
    }

    // ── Main list ──────────────────────────────────────────────────
    return (
        <Container theme={theme}>
            <MobileHeader title="Последни обяви" back />
            <FlatList
                data={items}
                keyExtractor={(item) => `${item.collectionName}_${item.id}`}
                renderItem={renderCard}
                contentContainerStyle={{ paddingVertical: 12 }}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={handleRefresh}
                        tintColor={theme.colors.primary?.main || '#1976d2'}
                    />
                }
            />
        </Container>
    );
}
