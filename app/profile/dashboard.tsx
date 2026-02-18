import React, { useEffect, useState, useCallback } from 'react';
import styled from 'styled-components/native';
import { MobileHeader } from '../../src/components/common/MobileHeader';
import { theme } from '../../src/styles/theme';
import {
    View,
    Text,
    TouchableOpacity,
    Dimensions,
    ActivityIndicator,
    RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../../src/contexts/AuthContext';
import { db } from '../../src/services/firebase';
import {
    collection,
    query,
    where,
    orderBy,
    limit,
    getDocs,
    getCountFromServer,
} from 'firebase/firestore';

/** All vehicle collections to aggregate across */
const VEHICLE_COLLECTIONS = [
    'passenger_cars',
    'cars',
    'suvs',
    'vans',
    'motorcycles',
    'trucks',
    'buses',
] as const;

interface RecentListing {
    id: string;
    collection: string;
    title: string;
    status: string;
    createdAt: number;
}

const Container = styled.SafeAreaView`
  flex: 1;
  background-color: ${props => props.theme.colors.background.default};
`;

const Content = styled.ScrollView`
  flex: 1;
`;

const WelcomeSection = styled.View`
  padding: 24px 20px;
`;

const Title = styled.Text`
  font-size: 28px;
  font-weight: 800;
  color: ${props => props.theme.colors.text.primary};
`;

const Subtitle = styled.Text`
  font-size: 16px;
  color: ${props => props.theme.colors.text.secondary};
  margin-top: 4px;
`;

const SummaryGrid = styled.View`
  flex-direction: row;
  flex-wrap: wrap;
    padding: 0px 20px;
  gap: 16px;
`;

const SummaryCard = styled.View`
  width: ${(Dimensions.get('window').width - 56) / 2}px;
  background-color: ${props => props.theme.colors.background.paper};
  padding: 20px;
  border-radius: 20px;
  border-width: 1px;
  border-color: ${props => props.theme.colors.border.muted};
`;

const CardLabel = styled.Text`
  font-size: 12px;
  font-weight: 700;
  color: ${props => props.theme.colors.text.secondary};
  text-transform: uppercase;
  margin-bottom: 8px;
`;

const CardValue = styled.Text`
  font-size: 24px;
  font-weight: 800;
  color: ${props => props.theme.colors.primary.main};
`;

const ActivitySection = styled.View`
  padding: 32px 20px;
`;

const SectionHeader = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
`;

const SectionTitle = styled.Text`
  font-size: 18px;
  font-weight: 800;
  color: ${props => props.theme.colors.text.primary};
`;

const ActivityItem = styled.View`
  background-color: ${props => props.theme.colors.background.paper};
  padding: 16px;
  border-radius: 16px;
  margin-bottom: 12px;
  flex-direction: row;
  align-items: center;
  border-width: 1px;
  border-color: ${props => props.theme.colors.border.muted};
`;

const IconBox = styled.View<{ color: string }>`
  width: 44px;
  height: 44px;
  border-radius: 12px;
  background-color: ${props => props.color}15;
  justify-content: center;
  align-items: center;
`;

const CenterBox = styled.View`
  flex: 1;
  justify-content: center;
  align-items: center;
  padding: 40px 20px;
`;

const ErrorText = styled.Text`
  font-size: 14px;
  color: #ef4444;
  text-align: center;
  margin-top: 12px;
`;

// ── Helpers ──────────────────────────────────────────────

/** Build a display title from Firestore doc data */
function buildTitle(data: any): string {
    if (data.title) return data.title;
    const parts = [data.make, data.model, data.year].filter(Boolean);
    return parts.length > 0 ? parts.join(' ') : 'Без заглавие';
}

/** Human-readable relative date in Bulgarian */
function timeAgo(ts: number): string {
    const diffMs = Date.now() - ts;
    const mins = Math.floor(diffMs / 60000);
    if (mins < 1) return 'Току-що';
    if (mins < 60) return `Преди ${mins} мин`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `Преди ${hours} ч`;
    const days = Math.floor(hours / 24);
    return `Преди ${days} дни`;
}

/** Status label & colour */
function statusMeta(status: string) {
    switch (status) {
        case 'active':
            return { label: 'Активна', color: '#10b981', icon: 'checkmark-circle' as const };
        case 'sold':
            return { label: 'Продадена', color: '#3b82f6', icon: 'pricetag' as const };
        case 'draft':
            return { label: 'Чернова', color: '#f59e0b', icon: 'create-outline' as const };
        default:
            return { label: status, color: '#6b7280', icon: 'ellipse-outline' as const };
    }
}

// ── Component ────────────────────────────────────────────

export default function DashboardScreen() {
    const { user, profile } = useAuth();

    const [activeCount, setActiveCount] = useState<number | null>(null);
    const [totalCount, setTotalCount] = useState<number | null>(null);
    const [draftCount, setDraftCount] = useState<number | null>(null);
    const [soldCount, setSoldCount] = useState<number | null>(null);
    const [recentListings, setRecentListings] = useState<RecentListing[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [refreshing, setRefreshing] = useState(false);

    const fetchDashboardData = useCallback(async () => {
        if (!user) return;

        try {
            setError(null);
            let active = 0;
            let total = 0;
            let drafts = 0;
            let sold = 0;
            const allRecent: RecentListing[] = [];

            // Query all vehicle collections in parallel
            const promises = VEHICLE_COLLECTIONS.map(async (coll) => {
                // Count active listings
                const activeQ = query(
                    collection(db, coll),
                    where('sellerId', '==', user.uid),
                    where('status', '==', 'active'),
                );
                const activeSnap = await getCountFromServer(activeQ);
                const activeN = activeSnap.data().count;

                // Count draft listings
                const draftQ = query(
                    collection(db, coll),
                    where('sellerId', '==', user.uid),
                    where('status', '==', 'draft'),
                );
                const draftSnap = await getCountFromServer(draftQ);
                const draftN = draftSnap.data().count;

                // Count sold listings
                const soldQ = query(
                    collection(db, coll),
                    where('sellerId', '==', user.uid),
                    where('status', '==', 'sold'),
                );
                const soldSnap = await getCountFromServer(soldQ);
                const soldN = soldSnap.data().count;

                // Recent listings (last 5 per collection, we'll merge & sort later)
                const recentQ = query(
                    collection(db, coll),
                    where('sellerId', '==', user.uid),
                    orderBy('createdAt', 'desc'),
                    limit(5),
                );
                const recentSnap = await getDocs(recentQ);
                const items: RecentListing[] = recentSnap.docs.map((d) => ({
                    id: d.id,
                    collection: coll,
                    title: buildTitle(d.data()),
                    status: d.data().status || 'active',
                    createdAt: typeof d.data().createdAt === 'number'
                        ? d.data().createdAt
                        : d.data().createdAt?.toMillis?.() ?? 0,
                }));

                return { activeN, draftN, soldN, items };
            });

            const results = await Promise.all(promises);

            for (const r of results) {
                active += r.activeN;
                drafts += r.draftN;
                sold += r.soldN;
                total += r.activeN + r.draftN + r.soldN;
                allRecent.push(...r.items);
            }

            // Sort merged recent by createdAt desc, take top 5
            allRecent.sort((a, b) => b.createdAt - a.createdAt);

            setActiveCount(active);
            setTotalCount(total);
            setDraftCount(drafts);
            setSoldCount(sold);
            setRecentListings(allRecent.slice(0, 5));
        } catch (err: any) {
            setError(err?.message || 'Грешка при зареждане на данните');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [user]);

    useEffect(() => {
        fetchDashboardData();
    }, [fetchDashboardData]);

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        fetchDashboardData();
    }, [fetchDashboardData]);

    // ── Loading state ──
    if (loading) {
        return (
            <Container theme={theme}>
                <MobileHeader title="Табло" back />
                <CenterBox>
                    <ActivityIndicator size="large" color={theme.colors.primary.main} />
                    <Text style={{ marginTop: 12, color: theme.colors.text.secondary }}>
                        Зареждане…
                    </Text>
                </CenterBox>
            </Container>
        );
    }

    // ── Not logged in ──
    if (!user) {
        return (
            <Container theme={theme}>
                <MobileHeader title="Табло" back />
                <CenterBox>
                    <Ionicons name="log-in-outline" size={48} color={theme.colors.text.secondary} />
                    <Text style={{ marginTop: 12, color: theme.colors.text.secondary, fontSize: 16 }}>
                        Моля влезте в профила си
                    </Text>
                </CenterBox>
            </Container>
        );
    }

    const displayName = profile?.displayName || user.displayName || 'Потребител';

    return (
        <Container theme={theme}>
            <MobileHeader title="Табло" back />
            <Content
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
            >
                <WelcomeSection>
                    <Title theme={theme}>Здравей, {displayName}</Title>
                    <Subtitle theme={theme}>
                        {error ? 'Грешка при зареждане' : 'Преглед на вашите обяви'}
                    </Subtitle>
                </WelcomeSection>

                {error && (
                    <View style={{ paddingHorizontal: 20 }}>
                        <ErrorText>{error}</ErrorText>
                    </View>
                )}

                <SummaryGrid>
                    <SummaryCard theme={theme}>
                        <CardLabel theme={theme}>Активни обяви</CardLabel>
                        <CardValue theme={theme}>
                            {activeCount ?? '—'}
                        </CardValue>
                    </SummaryCard>
                    <SummaryCard theme={theme}>
                        <CardLabel theme={theme}>Общо обяви</CardLabel>
                        <CardValue theme={theme}>
                            {totalCount ?? '—'}
                        </CardValue>
                    </SummaryCard>
                    <SummaryCard theme={theme}>
                        <CardLabel theme={theme}>Чернови</CardLabel>
                        <CardValue theme={theme}>
                            {draftCount ?? '—'}
                        </CardValue>
                    </SummaryCard>
                    <SummaryCard theme={theme}>
                        <CardLabel theme={theme}>Продадени</CardLabel>
                        <CardValue theme={theme}>
                            {soldCount ?? '—'}
                        </CardValue>
                    </SummaryCard>
                </SummaryGrid>

                <ActivitySection>
                    <SectionHeader>
                        <SectionTitle theme={theme}>Последни обяви</SectionTitle>
                    </SectionHeader>

                    {recentListings.length === 0 && !error && (
                        <View style={{ alignItems: 'center', paddingVertical: 24 }}>
                            <Ionicons name="car-outline" size={40} color={theme.colors.text.secondary} />
                            <Text style={{ color: theme.colors.text.secondary, marginTop: 8 }}>
                                Нямате публикувани обяви
                            </Text>
                        </View>
                    )}

                    {recentListings.map((item) => {
                        const meta = statusMeta(item.status);
                        return (
                            <ActivityItem key={`${item.collection}-${item.id}`} theme={theme}>
                                <IconBox color={meta.color}>
                                    <Ionicons name={meta.icon} size={24} color={meta.color} />
                                </IconBox>
                                <View style={{ flex: 1, marginLeft: 16 }}>
                                    <Text
                                        style={{
                                            fontWeight: '700',
                                            fontSize: 14,
                                            color: theme.colors.text.primary,
                                        }}
                                        numberOfLines={1}
                                    >
                                        {item.title}
                                    </Text>
                                    <Text style={{ fontSize: 12, color: theme.colors.text.secondary }}>
                                        {meta.label} • {timeAgo(item.createdAt)}
                                    </Text>
                                </View>
                            </ActivityItem>
                        );
                    })}
                </ActivitySection>

                <View style={{ padding: 20 }}>
                    <LinearGradient
                        colors={[theme.colors.primary.main, theme.colors.primary.dark || theme.colors.primary.main]}
                        style={{ padding: 24, borderRadius: 24 }}
                    >
                        <Text style={{ color: 'white', fontSize: 20, fontWeight: '900', marginBottom: 8 }}>
                            Преминете на Премиум
                        </Text>
                        <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 14, marginBottom: 20 }}>
                            Отключете разширена статистика и пазарни анализи.
                        </Text>
                        <TouchableOpacity style={{ backgroundColor: 'white', padding: 12, borderRadius: 12, alignSelf: 'flex-start' }}>
                            <Text style={{ color: theme.colors.primary.main, fontWeight: '800' }}>Надградете</Text>
                        </TouchableOpacity>
                    </LinearGradient>
                </View>

                <View style={{ height: 40 }} />
            </Content>
        </Container>
    );
}
