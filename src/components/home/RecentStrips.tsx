import React, { useEffect, useState } from 'react';
import styled from 'styled-components/native';
import { ScrollView, View, TouchableOpacity } from 'react-native';
import { theme } from '../../styles/theme';
import { CarCard } from '../CarCard';
import { ListingBase } from '../../types/ListingBase';
import { getRecentlyViewedCars, getTopDealsForUser } from '../../services/api/homeStrips';
import { SkeletonListingCard } from '../skeleton/SkeletonListingCard';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

const Container = styled.View`
  padding-bottom: 24px;
`;

const Section = styled.View`
  margin-bottom: 32px;
`;

const Header = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  padding: 0 16px;
  margin-bottom: 16px;
`;

const TitleRow = styled.View`
  flex-direction: row;
  align-items: center;
`;

const Title = styled.Text`
  font-size: 20px;
  font-weight: 800;
  color: ${props => props.theme.colors.text.primary};
  margin-left: 8px;
`;

const ViewAllButton = styled.TouchableOpacity`
  flex-direction: row;
  align-items: center;
`;

const ViewAllText = styled.Text`
  font-size: 13px;
  font-weight: 600;
  color: ${props => props.theme.colors.accent.main};
  margin-right: 4px;
`;

const ScrollContent = styled.ScrollView`
  padding-left: 16px;
`;

const CardWrapper = styled.View`
  width: 280px;
  margin-right: 16px;
`;

export default function RecentStrips() {
    const router = useRouter();
    const [recent, setRecent] = useState<ListingBase[]>([]);
    const [deals, setDeals] = useState<ListingBase[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let mounted = true;
        async function load() {
            try {
                const [r, d] = await Promise.all([
                    getRecentlyViewedCars(),
                    getTopDealsForUser()
                ]);
                if (mounted) {
                    setRecent(r);
                    setDeals(d);
                }
            } catch (e) {
                console.error("Failed to load strips", e);
            } finally {
                if (mounted) setLoading(false);
            }
        }
        load();
        return () => { mounted = false; };
    }, []);

    if (loading) {
        return (
            <Container>
                <Section>
                    <Header>
                        <TitleRow>
                            <View style={{ width: 24, height: 24, borderRadius: 12, backgroundColor: '#eee' }} />
                            <View style={{ width: 120, height: 24, borderRadius: 4, backgroundColor: '#eee', marginLeft: 8 }} />
                        </TitleRow>
                    </Header>
                    <ScrollContent horizontal showsHorizontalScrollIndicator={false}>
                        {[1, 2].map(i => (
                            <CardWrapper key={i}>
                                <SkeletonListingCard />
                            </CardWrapper>
                        ))}
                    </ScrollContent>
                </Section>
            </Container>
        );
    }

    return (
        <Container>
            {/* RECENTLY VIEWED */}
            {recent.length > 0 && (
                <Section>
                    <Header>
                        <TitleRow>
                            <Ionicons name="time-outline" size={24} color={theme.colors.text.primary} />
                            <Title>Recently viewed</Title>
                        </TitleRow>
                        {/* Optional Clean History button */}
                    </Header>
                    <ScrollContent horizontal showsHorizontalScrollIndicator={false}>
                        {recent.map((car) => (
                            <CardWrapper key={car.id}>
                                <CarCard listing={car} />
                            </CardWrapper>
                        ))}
                    </ScrollContent>
                </Section>
            )}

            {/* TOP DEALS */}
            {deals.length > 0 && (
                <Section>
                    <Header>
                        <TitleRow>
                            <Ionicons name="pricetag-outline" size={24} color={theme.colors.accent.main} />
                            <Title style={{ color: theme.colors.accent.main }}>Top DEALS for you</Title>
                        </TitleRow>
                        <ViewAllButton onPress={() => router.push('/(tabs)/search?sort=price_asc')}>
                            <ViewAllText>View all</ViewAllText>
                            <Ionicons name="chevron-forward" size={16} color={theme.colors.accent.main} />
                        </ViewAllButton>
                    </Header>
                    <ScrollContent horizontal showsHorizontalScrollIndicator={false}>
                        {deals.map((car) => (
                            <CardWrapper key={car.id}>
                                <CarCard listing={car} />
                            </CardWrapper>
                        ))}
                    </ScrollContent>
                </Section>
            )}
        </Container>
    );
}
