import React, { useState, useEffect } from 'react';
import styled from 'styled-components/native';
import { ScrollView, ActivityIndicator, View } from 'react-native';
import { theme } from '../../styles/theme';
import { PlatformSyncService } from '../../services/PlatformSyncService';
import { ListingService } from '../../services/ListingService';
import { CarListing } from '../../types/CarListing';
import { ListingBase } from '../../types/ListingBase';
import { CarCard } from '../CarCard';
import { Ionicons } from '@expo/vector-icons';

import { ActionSheetIOS, Platform } from 'react-native';
import { SkeletonListingCard } from '../skeleton/SkeletonListingCard';

const Container = styled.View`
  padding: 24px 0;
  background-color: ${props => props.theme.colors.background.default};
`;

const Header = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  padding: 0 24px;
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

const ClearButton = styled.TouchableOpacity`
  padding: 4px;
`;

const ClearText = styled.Text`
  color: ${props => props.theme.colors.text.secondary};
  font-size: 13px;
  font-weight: 600;
`;

export default function RecentBrowsingSection() {
    const [history, setHistory] = useState<ListingBase[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadHistory();
    }, []);

    const loadHistory = async () => {
        setLoading(true);
        const ids = await PlatformSyncService.getHistory();

        if (ids.length > 0) {
            try {
                // Use new optimized batch fetch
                const fetchedListings = await ListingService.getListingsByIds(ids);
                setHistory(fetchedListings);
            } catch (error) {
                console.error("Failed to load history", error);
            }
        }
        setLoading(false);
    };

    const handleClear = async () => {
        await PlatformSyncService.clearHistory();
        setHistory([]);
    };

    if (loading) {
        return (
            <Container theme={theme}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 24 }}>
                    {[1, 2].map(i => (
                        <View key={i} style={{ width: '280px' as any, marginRight: 24 }}>
                            <SkeletonListingCard />
                        </View>
                    ))}
                </ScrollView>
            </Container>
        );
    }

    if (history.length === 0) return null;

    return (
        <Container>
            <Header>
                <TitleRow>
                    <Ionicons name="time-outline" size={24} color={theme.colors.primary.main} />
                    <Title>Последно разгледани</Title>
                </TitleRow>
                <ClearButton onPress={handleClear}>
                    <ClearText>Изчисти</ClearText>
                </ClearButton>
            </Header>

            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ paddingRight: 24 }}
            >
                {history.map((car) => (
                    <View key={car.id} style={{ marginLeft: 24, width: '280px' as any }}>
                        <CarCard listing={car} />
                    </View>
                ))}
            </ScrollView>
        </Container>
    );
}
