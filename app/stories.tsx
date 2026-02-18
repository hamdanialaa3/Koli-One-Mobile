/**
 * stories.tsx - Car Stories / Reels
 * Instagram-style short video/photo stories for car content
 */

import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Dimensions,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import styled from 'styled-components/native';
import { LinearGradient } from 'expo-linear-gradient';
import { theme } from '../src/styles/theme';
import MobileHeader from '../src/components/common/MobileHeader';
import { useAuth } from '../src/contexts/AuthContext';
import { collection, query, orderBy, getDocs, limit } from 'firebase/firestore';
import { db } from '../src/services/firebase';
import { logger } from '../src/services/logger-service';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = (SCREEN_WIDTH - 48) / 2;

const Container = styled.View`
  flex: 1;
  background-color: ${props => props.theme.colors.background.default};
`;

const TabBar = styled.View`
  flex-direction: row;
  padding: 8px 16px;
  gap: 8px;
`;

const Tab = styled.TouchableOpacity<{ active?: boolean }>`
  padding: 8px 16px;
  border-radius: 20px;
  background-color: ${props => props.active ? props.theme.colors.primary.main : props.theme.colors.background.paper};
  border-width: 1px;
  border-color: ${props => props.active ? props.theme.colors.primary.main : props.theme.colors.border.muted};
`;

const TabText = styled.Text<{ active?: boolean }>`
  font-size: 13px;
  font-weight: 600;
  color: ${props => props.active ? '#fff' : props.theme.colors.text.secondary};
`;

const StoryGrid = styled.View`
  flex-direction: row;
  flex-wrap: wrap;
  padding: 8px 16px;
  gap: 8px;
`;

const StoryCard = styled.TouchableOpacity`
  width: ${CARD_WIDTH}px;
  height: ${CARD_WIDTH * 1.5}px;
  border-radius: 16px;
  overflow: hidden;
  margin-bottom: 4px;
`;

const StoryImage = styled(Image)`
  width: 100%;
  height: 100%;
`;

const StoryOverlay = styled(LinearGradient).attrs({
  colors: ['transparent', 'rgba(0,0,0,0.7)'],
  start: { x: 0, y: 0.4 },
  end: { x: 0, y: 1 },
})`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 12px;
`;

const CreatorRow = styled.View`
  flex-direction: row;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
`;

const CreatorAvatar = styled(Image)`
  width: 28px;
  height: 28px;
  border-radius: 14px;
  border-width: 2px;
  border-color: #fff;
`;

const CreatorName = styled.Text`
  font-size: 12px;
  font-weight: 700;
  color: #fff;
`;

const StoryTitle = styled.Text`
  font-size: 13px;
  font-weight: 600;
  color: #fff;
  line-height: 18px;
`;

const StoryMeta = styled.View`
  flex-direction: row;
  align-items: center;
  gap: 12px;
  margin-top: 6px;
`;

const MetaItem = styled.View`
  flex-direction: row;
  align-items: center;
  gap: 3px;
`;

const MetaText = styled.Text`
  font-size: 11px;
  color: rgba(255, 255, 255, 0.8);
`;

const LiveBadge = styled.View`
  position: absolute;
  top: 10px;
  left: 10px;
  background-color: #ef4444;
  padding: 3px 8px;
  border-radius: 6px;
  flex-direction: row;
  align-items: center;
  gap: 4px;
`;

const TypeBadge = styled.View`
  position: absolute;
  top: 10px;
  right: 10px;
  background-color: rgba(0, 0, 0, 0.6);
  padding: 4px 8px;
  border-radius: 6px;
`;

const TypeBadgeText = styled.Text`
  font-size: 10px;
  font-weight: 700;
  color: #fff;
  text-transform: uppercase;
`;

const CreateButton = styled.TouchableOpacity`
  position: absolute;
  bottom: 24px;
  right: 24px;
  width: 56px;
  height: 56px;
  border-radius: 28px;
  background-color: ${props => props.theme.colors.primary.main};
  align-items: center;
  justify-content: center;
  elevation: 6;
  shadow-color: #000;
  shadow-offset: 0px 3px;
  shadow-opacity: 0.25;
  shadow-radius: 4px;
`;

type StoryType = 'all' | 'review' | 'roadtrip' | 'build' | 'tips';

interface CarStory {
  id: string;
  title: string;
  type: StoryType;
  imageUrl: string;
  creatorName: string;
  creatorAvatar: string;
  likes: number;
  views: number;
  isLive?: boolean;
  createdAt: string;
}

const TYPE_LABELS: Record<StoryType, string> = {
  all: 'All',
  review: 'Reviews',
  roadtrip: 'Road Trips',
  build: 'Builds',
  tips: 'Tips',
};

export default function StoriesScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [stories, setStories] = useState<CarStory[]>([]);
  const [storyType, setStoryType] = useState<StoryType>('all');
  const [refreshing, setRefreshing] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  const filtered = storyType === 'all' ? stories : stories.filter(s => s.type === storyType);

  const fetchStories = useCallback(async () => {
    try {
      const q = query(collection(db, 'stories'), orderBy('createdAt', 'desc'), limit(20));
      const snap = await getDocs(q);
      if (snap.docs.length > 0) {
        setStories(snap.docs.map(d => ({ id: d.id, ...d.data() } as unknown as CarStory)));
      }
      // No fallback to SAMPLE_STORIES — show empty state if no real data
    } catch (err) {
      logger.error('Failed to fetch stories', err);
    }
  }, []);

  // Fetch on mount
  useEffect(() => {
    fetchStories().finally(() => setInitialLoading(false));
  }, [fetchStories]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchStories();
    setRefreshing(false);
  }, [fetchStories]);

  const formatViews = (n: number) => {
    if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
    return n.toString();
  };

  return (
    <Container theme={theme}>
      <Stack.Screen options={{ headerShown: false }} />
      <MobileHeader title="Stories" back />

      <TabBar>
        {(Object.keys(TYPE_LABELS) as StoryType[]).map(t => (
          <Tab key={t} theme={theme} active={storyType === t} onPress={() => setStoryType(t)}>
            <TabText theme={theme} active={storyType === t}>{TYPE_LABELS[t]}</TabText>
          </Tab>
        ))}
      </TabBar>

      {initialLoading ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: 40 }}>
          <ActivityIndicator size="large" color={theme.colors.primary.main} />
        </View>
      ) : (
      <FlatList
        data={filtered}
        keyExtractor={item => item.id}
        numColumns={2}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 80 }}
        columnWrapperStyle={{ gap: 10, marginBottom: 10 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={theme.colors.primary.main} />
        }
        renderItem={({ item }) => (
          <StoryCard activeOpacity={0.9}>
            <StoryImage source={{ uri: item.imageUrl }} contentFit="cover" transition={200} />
            {item.isLive && (
              <LiveBadge>
                <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: '#fff' }} />
                <Text style={{ fontSize: 10, fontWeight: '700', color: '#fff' }}>LIVE</Text>
              </LiveBadge>
            )}
            <TypeBadge>
              <TypeBadgeText>{item.type}</TypeBadgeText>
            </TypeBadge>
            <StoryOverlay colors={['transparent', 'rgba(0,0,0,0.7)']}>
              <CreatorRow>
                <CreatorAvatar source={{ uri: item.creatorAvatar }} contentFit="cover" />
                <CreatorName>{item.creatorName}</CreatorName>
              </CreatorRow>
              <StoryTitle numberOfLines={2}>{item.title}</StoryTitle>
              <StoryMeta>
                <MetaItem>
                  <Ionicons name="heart" size={12} color="rgba(255,255,255,0.8)" />
                  <MetaText>{item.likes}</MetaText>
                </MetaItem>
                <MetaItem>
                  <Ionicons name="eye" size={12} color="rgba(255,255,255,0.8)" />
                  <MetaText>{formatViews(item.views)}</MetaText>
                </MetaItem>
              </StoryMeta>
            </StoryOverlay>
          </StoryCard>
        )}
        ListEmptyComponent={
          <View style={{ alignItems: 'center', padding: 40 }}>
            <Ionicons name="film-outline" size={48} color={theme.colors.text.disabled} />
            <Text style={{ color: theme.colors.text.secondary, marginTop: 12, fontSize: 15 }}>
              No stories yet
            </Text>
          </View>
        }
      />
      )}

      {user && (
        <CreateButton theme={theme} onPress={() => router.push('/stories/create' as any)}>
          <Ionicons name="add" size={28} color="#fff" />
        </CreateButton>
      )}
    </Container>
  );
}
