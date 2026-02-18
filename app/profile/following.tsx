/**
 * Koli One — Following / Followers
 */
import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList, Platform, ActivityIndicator, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { ArrowLeft, UserPlus, UserMinus } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { colors } from '../../src/styles/theme';
import { collection, getDocs, doc, setDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../../src/services/firebase';
import { useAuth } from '../../src/contexts/AuthContext';
import { logger } from '../../src/services/logger-service';

const TABS = ['Следвани', 'Последователи'] as const;

interface FollowUser {
  id: string;
  name: string;
  username: string;
  avatar: string;
  isFollowing: boolean;
  cars: number;
  dealer?: boolean;
}

export default function FollowingScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [tab, setTab] = useState<typeof TABS[number]>('Следвани');
  const [users, setUsers] = useState<FollowUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadUsers = useCallback(async () => {
    if (!user) { setLoading(false); return; }
    try {
      const subCol = tab === 'Следвани' ? 'following' : 'followers';
      const snap = await getDocs(collection(db, `users/${user.uid}/${subCol}`));
      const items: FollowUser[] = snap.docs.map(d => ({
        id: d.id,
        name: (d.data() as any).name || 'User',
        username: (d.data() as any).username || '',
        avatar: (d.data() as any).avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent((d.data() as any).name || 'U')}&background=random`,
        isFollowing: tab === 'Следвани',
        cars: (d.data() as any).cars || 0,
        dealer: (d.data() as any).dealer || false,
      }));
      setUsers(items);
    } catch (err) {
      logger.error('Failed to load follow list', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user, tab]);

  useEffect(() => {
    setLoading(true);
    loadUsers();
  }, [loadUsers]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadUsers();
  }, [loadUsers]);

  const toggleFollow = async (id: string) => {
    if (!user) return;
    const target = users.find(u => u.id === id);
    if (!target) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    try {
      if (target.isFollowing) {
        await deleteDoc(doc(db, `users/${user.uid}/following`, id));
      } else {
        await setDoc(doc(db, `users/${user.uid}/following`, id), {
          name: target.name,
          username: target.username,
          avatar: target.avatar,
          cars: target.cars,
          dealer: target.dealer || false,
          followedAt: new Date().toISOString(),
        });
      }
      setUsers(prev => prev.map(u => u.id === id ? { ...u, isFollowing: !u.isFollowing } : u));
    } catch (err) {
      logger.error('Failed to toggle follow', err);
    }
  };

  const filtered = users;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.iconBtn}><ArrowLeft size={24} color={colors.text.primary} /></TouchableOpacity>
        <Text style={styles.headerTitle}>{tab}</Text>
        <View style={{ width: 44 }} />
      </View>

      {/* Tabs */}
      <View style={styles.tabs}>
        {TABS.map(t => (
          <TouchableOpacity key={t} style={[styles.tab, tab === t && styles.tabActive]} onPress={() => setTab(t)}>
            <Text style={[styles.tabText, tab === t && styles.tabTextActive]}>{t}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={filtered}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={colors.brand.orange} />
        }
        ListEmptyComponent={
          loading ? (
            <View style={{ alignItems: 'center', padding: 60 }}>
              <ActivityIndicator size="large" color={colors.brand.orange} />
            </View>
          ) : (
            <View style={{ alignItems: 'center', padding: 40 }}>
              <UserPlus size={40} color={colors.text.disabled} />
              <Text style={{ color: colors.text.secondary, marginTop: 12, fontSize: 15 }}>
                {tab === 'Следвани' ? 'Все още не следвате никого' : 'Все още нямате последователи'}
              </Text>
            </View>
          )
        }
        renderItem={({ item, index }) => (
          <Animated.View entering={FadeInDown.delay(index * 50)}>
            <TouchableOpacity style={styles.userCard} activeOpacity={0.7}>
              <Image source={{ uri: item.avatar }} style={styles.avatar} contentFit="cover" />
              <View style={{ flex: 1 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                  <Text style={styles.userName}>{item.name}</Text>
                  {item.dealer && <View style={styles.dealerBadge}><Text style={styles.dealerText}>Дилър</Text></View>}
                </View>
                <Text style={styles.userMeta}>{item.username} · {item.cars} обяви</Text>
              </View>
              <TouchableOpacity
                style={[styles.followBtn, item.isFollowing && styles.followingBtn]}
                onPress={() => toggleFollow(item.id)}
              >
                {item.isFollowing ? (
                  <><UserMinus size={16} color={colors.text.secondary} /><Text style={styles.followingText}>Следвате</Text></>
                ) : (
                  <><UserPlus size={16} color="#FFF" /><Text style={styles.followText}>Следвай</Text></>
                )}
              </TouchableOpacity>
            </TouchableOpacity>
          </Animated.View>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background.default },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 12, paddingVertical: 10, backgroundColor: colors.background.paper,
    borderBottomWidth: 1, borderBottomColor: colors.border.light,
  },
  iconBtn: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 20, fontWeight: '700', color: colors.text.primary },
  tabs: { flexDirection: 'row', backgroundColor: colors.background.paper, borderBottomWidth: 1, borderBottomColor: colors.border.light },
  tab: { flex: 1, alignItems: 'center', paddingVertical: 14 },
  tabActive: { borderBottomWidth: 2, borderBottomColor: colors.brand.orange },
  tabText: { fontSize: 15, fontWeight: '500', color: colors.text.secondary },
  tabTextActive: { fontWeight: '700', color: colors.brand.orange },
  list: { padding: 16, gap: 10 },
  userCard: {
    flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14,
    backgroundColor: colors.background.paper, borderRadius: 14,
    ...Platform.select({ ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 4 }, android: { elevation: 1 } }),
  },
  avatar: { width: 50, height: 50, borderRadius: 25 },
  userName: { fontSize: 15, fontWeight: '600', color: colors.text.primary },
  userMeta: { fontSize: 13, color: colors.text.secondary, marginTop: 2 },
  dealerBadge: { backgroundColor: colors.brand.orange, paddingHorizontal: 6, paddingVertical: 1, borderRadius: 4 },
  dealerText: { color: '#FFF', fontSize: 10, fontWeight: '700' },
  followBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 14, paddingVertical: 8,
    borderRadius: 10, backgroundColor: colors.brand.orange,
  },
  followingBtn: { backgroundColor: colors.background.default, borderWidth: 1, borderColor: colors.border.default },
  followText: { color: '#FFF', fontSize: 13, fontWeight: '600' },
  followingText: { color: colors.text.secondary, fontSize: 13, fontWeight: '500' },
});
