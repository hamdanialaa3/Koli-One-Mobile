/**
 * auctions.tsx - Live Car Auctions
 * Real-time bidding on vehicles with push notifications
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import styled from 'styled-components/native';
import { LinearGradient } from 'expo-linear-gradient';
import { theme } from '../src/styles/theme';
import MobileHeader from '../src/components/common/MobileHeader';
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { db } from '../src/services/firebase';
import { logger } from '../src/services/logger-service';

const Container = styled.View`
  flex: 1;
  background-color: ${props => props.theme.colors.background.default};
`;

const FilterRow = styled.View`
  flex-direction: row;
  padding: 12px 16px;
  gap: 8px;
`;

const FilterChip = styled.TouchableOpacity<{ active?: boolean }>`
  padding: 8px 16px;
  border-radius: 20px;
  background-color: ${props => props.active ? props.theme.colors.primary.main : props.theme.colors.background.paper};
  border-width: 1px;
  border-color: ${props => props.active ? props.theme.colors.primary.main : props.theme.colors.border.muted};
`;

const FilterLabel = styled.Text<{ active?: boolean }>`
  font-size: 13px;
  font-weight: 600;
  color: ${props => props.active ? '#fff' : props.theme.colors.text.secondary};
`;

const AuctionCard = styled.TouchableOpacity`
  margin: 8px 16px;
  border-radius: 16px;
  overflow: hidden;
  background-color: ${props => props.theme.colors.background.paper};
  border-width: 1px;
  border-color: ${props => props.theme.colors.border.muted};
`;

const CardImage = styled(Image)`
  width: 100%;
  height: 200px;
`;

const LiveBadge = styled(LinearGradient).attrs({
  colors: ['#ef4444', '#dc2626'],
})`
  position: absolute;
  top: 12px;
  left: 12px;
  flex-direction: row;
  align-items: center;
  padding: 4px 10px;
  border-radius: 8px;
  gap: 4px;
`;

const LiveText = styled.Text`
  color: #fff;
  font-size: 12px;
  font-weight: 800;
`;

const CountdownBadge = styled.View`
  position: absolute;
  top: 12px;
  right: 12px;
  background-color: rgba(0, 0, 0, 0.7);
  padding: 4px 10px;
  border-radius: 8px;
  flex-direction: row;
  align-items: center;
  gap: 4px;
`;

const CountdownText = styled.Text`
  color: #fff;
  font-size: 12px;
  font-weight: 700;
`;

const CardInfo = styled.View`
  padding: 16px;
`;

const CardTitle = styled.Text`
  font-size: 17px;
  font-weight: 700;
  color: ${props => props.theme.colors.text.primary};
  margin-bottom: 8px;
`;

const CardMeta = styled.Text`
  font-size: 13px;
  color: ${props => props.theme.colors.text.secondary};
  margin-bottom: 12px;
`;

const BidRow = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  padding-top: 12px;
  border-top-width: 1px;
  border-top-color: ${props => props.theme.colors.border.muted};
`;

const CurrentBid = styled.View``;

const BidLabel = styled.Text`
  font-size: 11px;
  color: ${props => props.theme.colors.text.secondary};
  text-transform: uppercase;
  font-weight: 600;
`;

const BidValue = styled.Text`
  font-size: 22px;
  font-weight: 800;
  color: ${props => props.theme.colors.primary.main};
`;

const BidCount = styled.View`
  flex-direction: row;
  align-items: center;
  gap: 4px;
`;

const BidCountText = styled.Text`
  font-size: 13px;
  color: ${props => props.theme.colors.text.secondary};
  font-weight: 600;
`;

type AuctionStatus = 'all' | 'live' | 'upcoming' | 'ended';

interface Auction {
  id: string;
  title: string;
  make: string;
  model: string;
  year: number;
  imageUrl: string;
  currentBid: number;
  startingPrice: number;
  bidCount: number;
  status: 'live' | 'upcoming' | 'ended';
  endsAt: string;
  location: string;
}



function getTimeRemaining(endsAt: string): string {
  const diff = new Date(endsAt).getTime() - Date.now();
  if (diff <= 0) return 'Ended';
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  if (hours > 24) return `${Math.floor(hours / 24)}d ${hours % 24}h`;
  return `${hours}h ${mins}m`;
}

export default function AuctionsScreen() {
  const router = useRouter();
  const [auctions, setAuctions] = useState<Auction[]>([]);
  const [filter, setFilter] = useState<AuctionStatus>('all');
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  // Fetch auctions from Firestore on mount
  useEffect(() => {
    (async () => {
      try {
        const q = query(
          collection(db, 'events'),
          where('category', '==', 'auction'),
          orderBy('createdAt', 'desc'),
          limit(20)
        );
        const snap = await getDocs(q);
        if (snap.docs.length > 0) {
          setAuctions(snap.docs.map(d => ({ id: d.id, ...d.data() } as unknown as Auction)));
        }
      } catch (err) {
        logger.error('Failed to load auctions on mount', err);
      } finally {
        setInitialLoading(false);
      }
    })();
  }, []);

  const filtered = filter === 'all'
    ? auctions
    : auctions.filter(a => a.status === filter);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      // Try fetching from Firestore events collection with auction category
      const q = query(
        collection(db, 'events'),
        where('category', '==', 'auction'),
        orderBy('createdAt', 'desc'),
        limit(20)
      );
      const snap = await getDocs(q);
      if (snap.docs.length > 0) {
        const items = snap.docs.map(d => ({ id: d.id, ...d.data() } as unknown as Auction));
        setAuctions(items);
      }
    } catch (err) {
      logger.error('Failed to fetch auctions', err);
      // Keep sample data
    } finally {
      setRefreshing(false);
    }
  }, []);

  return (
    <Container theme={theme}>
      <Stack.Screen options={{ headerShown: false }} />
      <MobileHeader title="Auctions" back />

      <FilterRow>
        {(['all', 'live', 'upcoming', 'ended'] as AuctionStatus[]).map(f => (
          <FilterChip key={f} theme={theme} active={filter === f} onPress={() => setFilter(f)}>
            <FilterLabel theme={theme} active={filter === f}>
              {f === 'all' ? 'All' : f === 'live' ? '🔴 Live' : f === 'upcoming' ? 'Upcoming' : 'Ended'}
            </FilterLabel>
          </FilterChip>
        ))}
      </FilterRow>

      <FlatList
        data={filtered}
        keyExtractor={item => item.id}
        contentContainerStyle={{ paddingBottom: 20 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={theme.colors.primary.main} />
        }
        renderItem={({ item }) => (
          <AuctionCard theme={theme} onPress={() => router.push({ pathname: '/car/[id]', params: { id: item.id } })}>
            <View>
              <CardImage source={{ uri: item.imageUrl }} contentFit="cover" transition={200} />
              {item.status === 'live' && (
                <LiveBadge colors={['#ef4444', '#dc2626']}>
                  <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: '#fff' }} />
                  <LiveText>LIVE</LiveText>
                </LiveBadge>
              )}
              <CountdownBadge>
                <Ionicons name="time-outline" size={14} color="#fff" />
                <CountdownText>{getTimeRemaining(item.endsAt)}</CountdownText>
              </CountdownBadge>
            </View>
            <CardInfo>
              <CardTitle theme={theme}>{item.title}</CardTitle>
              <CardMeta theme={theme}>
                <Ionicons name="location-outline" size={13} /> {item.location}
              </CardMeta>
              <BidRow theme={theme}>
                <CurrentBid>
                  <BidLabel theme={theme}>
                    {item.status === 'upcoming' ? 'Starting Price' : item.status === 'ended' ? 'Final Price' : 'Current Bid'}
                  </BidLabel>
                  <BidValue theme={theme}>
                    €{(item.currentBid || item.startingPrice).toLocaleString()}
                  </BidValue>
                </CurrentBid>
                <BidCount>
                  <Ionicons name="hand-left-outline" size={16} color={theme.colors.text.secondary} />
                  <BidCountText theme={theme}>{item.bidCount} bids</BidCountText>
                </BidCount>
              </BidRow>
            </CardInfo>
          </AuctionCard>
        )}
        ListEmptyComponent={
          initialLoading ? (
            <View style={{ alignItems: 'center', padding: 60 }}>
              <ActivityIndicator size="large" color={theme.colors.primary.main} />
              <Text style={{ color: theme.colors.text.secondary, marginTop: 12, fontSize: 15 }}>Loading auctions...</Text>
            </View>
          ) : (
            <View style={{ alignItems: 'center', padding: 40 }}>
              <Ionicons name="hammer-outline" size={48} color={theme.colors.text.disabled} />
              <Text style={{ color: theme.colors.text.secondary, marginTop: 12, fontSize: 15 }}>
                No {filter !== 'all' ? filter : ''} auctions available
              </Text>
            </View>
          )
        }
      />
    </Container>
  );
}
