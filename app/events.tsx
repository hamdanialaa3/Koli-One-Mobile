/**
 * events.tsx - Car Events & Meetups
 * Car shows, racing events, exhibitions, meetups, workshops
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Linking,
} from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import styled from 'styled-components/native';
import { LinearGradient } from 'expo-linear-gradient';
import { theme } from '../src/styles/theme';
import MobileHeader from '../src/components/common/MobileHeader';
import { useAuth } from '../src/contexts/AuthContext';
import { collection, query, orderBy, getDocs, limit, doc, setDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../src/services/firebase';
import { logger } from '../src/services/logger-service';

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

const EventCard = styled.TouchableOpacity`
  margin: 8px 16px;
  border-radius: 16px;
  overflow: hidden;
  background-color: ${props => props.theme.colors.background.paper};
  border-width: 1px;
  border-color: ${props => props.theme.colors.border.muted};
`;

const EventImage = styled(Image)`
  width: 100%;
  height: 180px;
`;

const DateBadge = styled(LinearGradient).attrs({
  colors: ['#6366f1', '#8b5cf6'],
})`
  position: absolute;
  top: 12px;
  left: 12px;
  padding: 8px 12px;
  border-radius: 12px;
  align-items: center;
  min-width: 56px;
`;

const DateDay = styled.Text`
  font-size: 20px;
  font-weight: 800;
  color: #fff;
`;

const DateMonth = styled.Text`
  font-size: 11px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.9);
  text-transform: uppercase;
`;

const CategoryBadge = styled.View`
  position: absolute;
  top: 12px;
  right: 12px;
  background-color: rgba(0, 0, 0, 0.7);
  padding: 4px 10px;
  border-radius: 8px;
`;

const CategoryText = styled.Text`
  font-size: 11px;
  font-weight: 700;
  color: #fff;
  text-transform: uppercase;
`;

const EventInfo = styled.View`
  padding: 16px;
`;

const EventTitle = styled.Text`
  font-size: 17px;
  font-weight: 700;
  color: ${props => props.theme.colors.text.primary};
  margin-bottom: 8px;
`;

const EventMeta = styled.View`
  flex-direction: row;
  align-items: center;
  gap: 6px;
  margin-bottom: 6px;
`;

const MetaText = styled.Text`
  font-size: 13px;
  color: ${props => props.theme.colors.text.secondary};
`;

const EventFooter = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  margin-top: 12px;
  padding-top: 12px;
  border-top-width: 1px;
  border-top-color: ${props => props.theme.colors.border.muted};
`;

const AttendeesRow = styled.View`
  flex-direction: row;
  align-items: center;
  gap: 6px;
`;

type EventCategory = 'all' | 'car_show' | 'racing' | 'meetup' | 'exhibition' | 'workshop';

interface CarEvent {
  id: string;
  title: string;
  description: string;
  category: EventCategory;
  date: string;
  location: string;
  imageUrl: string;
  attendeesCount: number;
  isFree: boolean;
  price?: number;
  organizer: string;
}

const MONTHS = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];

const CATEGORY_ICONS: Record<string, string> = {
  car_show: 'car-sport',
  racing: 'speedometer',
  meetup: 'people',
  exhibition: 'grid',
  workshop: 'construct',
  auction: 'hammer',
};



export default function EventsScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [events, setEvents] = useState<CarEvent[]>([]);
  const [category, setCategory] = useState<EventCategory>('all');
  const [savedEvents, setSavedEvents] = useState<Set<string>>(new Set());
  const [refreshing, setRefreshing] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  // Fetch events from Firestore on mount
  useEffect(() => {
    (async () => {
      try {
        const q = query(collection(db, 'events'), orderBy('date', 'asc'), limit(20));
        const snap = await getDocs(q);
        if (snap.docs.length > 0) {
          setEvents(snap.docs.map(d => ({ id: d.id, ...d.data() } as unknown as CarEvent)));
        }
      } catch (err) {
        logger.error('Failed to load events on mount', err);
      } finally {
        setInitialLoading(false);
      }
    })();
  }, []);

  const filtered = category === 'all'
    ? events
    : events.filter(e => e.category === category);

  const handleSaveEvent = async (eventId: string) => {
    if (!user) return;
    const newSaved = new Set(savedEvents);
    try {
      if (savedEvents.has(eventId)) {
        newSaved.delete(eventId);
        await deleteDoc(doc(db, `users/${user.uid}/saved_events`, eventId));
      } else {
        newSaved.add(eventId);
        await setDoc(doc(db, `users/${user.uid}/saved_events`, eventId), {
          savedAt: new Date().toISOString(),
        });
      }
      setSavedEvents(newSaved);
    } catch (err) {
      logger.error('Failed to save event', err);
    }
  };

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      const q = query(collection(db, 'events'), orderBy('date', 'asc'), limit(20));
      const snap = await getDocs(q);
      if (snap.docs.length > 0) {
        setEvents(snap.docs.map(d => ({ id: d.id, ...d.data() } as unknown as CarEvent)));
      }
    } catch (err) {
      logger.error('Failed to fetch events', err);
    } finally {
      setRefreshing(false);
    }
  }, []);

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return { day: d.getDate(), month: MONTHS[d.getMonth()] };
  };

  return (
    <Container theme={theme}>
      <Stack.Screen options={{ headerShown: false }} />
      <MobileHeader title="Events" back />

      <TabBar>
        {(['all', 'car_show', 'racing', 'meetup', 'workshop'] as EventCategory[]).map(c => (
          <Tab key={c} theme={theme} active={category === c} onPress={() => setCategory(c)}>
            <TabText theme={theme} active={category === c}>
              {c === 'all' ? 'All' : c === 'car_show' ? 'Shows' : c === 'racing' ? 'Racing' : c === 'meetup' ? 'Meetups' : 'Workshops'}
            </TabText>
          </Tab>
        ))}
      </TabBar>

      <FlatList
        data={filtered}
        keyExtractor={item => item.id}
        contentContainerStyle={{ paddingBottom: 20 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={theme.colors.primary.main} />
        }
        renderItem={({ item }) => {
          const { day, month } = formatDate(item.date);
          return (
            <EventCard theme={theme} activeOpacity={0.8}>
              <View>
                <EventImage source={{ uri: item.imageUrl }} contentFit="cover" transition={200} />
                <DateBadge colors={['#6366f1', '#8b5cf6']}>
                  <DateDay>{day}</DateDay>
                  <DateMonth>{month}</DateMonth>
                </DateBadge>
                <CategoryBadge>
                  <CategoryText>{item.category.replace('_', ' ')}</CategoryText>
                </CategoryBadge>
              </View>
              <EventInfo>
                <EventTitle theme={theme}>{item.title}</EventTitle>
                <EventMeta>
                  <Ionicons name="location-outline" size={14} color={theme.colors.text.secondary} />
                  <MetaText theme={theme}>{item.location}</MetaText>
                </EventMeta>
                <EventMeta>
                  <Ionicons name="time-outline" size={14} color={theme.colors.text.secondary} />
                  <MetaText theme={theme}>{new Date(item.date).toLocaleDateString('bg-BG', { weekday: 'long', month: 'long', day: 'numeric' })}</MetaText>
                </EventMeta>
                <EventFooter theme={theme}>
                  <AttendeesRow>
                    <Ionicons name="people-outline" size={16} color={theme.colors.text.secondary} />
                    <MetaText theme={theme}>{item.attendeesCount} attending</MetaText>
                  </AttendeesRow>
                  <View style={{ flexDirection: 'row', gap: 12, alignItems: 'center' }}>
                    <Text style={{ fontSize: 14, fontWeight: '700', color: item.isFree ? '#22c55e' : theme.colors.primary.main }}>
                      {item.isFree ? 'FREE' : `€${item.price}`}
                    </Text>
                    <TouchableOpacity onPress={() => handleSaveEvent(item.id)}>
                      <Ionicons
                        name={savedEvents.has(item.id) ? 'bookmark' : 'bookmark-outline'}
                        size={22}
                        color={theme.colors.primary.main}
                      />
                    </TouchableOpacity>
                  </View>
                </EventFooter>
              </EventInfo>
            </EventCard>
          );
        }}
        ListEmptyComponent={
          initialLoading ? (
            <View style={{ alignItems: 'center', padding: 60 }}>
              <ActivityIndicator size="large" color={theme.colors.primary.main} />
              <Text style={{ color: theme.colors.text.secondary, marginTop: 12, fontSize: 15 }}>Loading events...</Text>
            </View>
          ) : (
            <View style={{ alignItems: 'center', padding: 40 }}>
              <Ionicons name="calendar-outline" size={48} color={theme.colors.text.disabled} />
              <Text style={{ color: theme.colors.text.secondary, marginTop: 12, fontSize: 15 }}>
                No upcoming events
              </Text>
            </View>
          )
        }
      />
    </Container>
  );
}
