/**
 * Koli One — Blocked Users
 */
import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList, Platform, ActivityIndicator, RefreshControl, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import Animated, { FadeInDown, SlideOutRight } from 'react-native-reanimated';
import { ArrowLeft, ShieldOff, UserX } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { colors } from '../../src/styles/theme';
import { collection, getDocs, doc, deleteDoc, getDoc } from 'firebase/firestore';
import { db } from '../../src/services/firebase';
import { useAuth } from '../../src/contexts/AuthContext';
import { logger } from '../../src/services/logger-service';

interface BlockedUser {
  id: string;
  name: string;
  avatar: string;
  blockedAt: string;
}

export default function BlockedUsersScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [users, setUsers] = useState<BlockedUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadBlocked = useCallback(async () => {
    if (!user) { setLoading(false); return; }
    try {
      const snap = await getDocs(collection(db, 'users', user.uid, 'blocked'));
      const blockedList: BlockedUser[] = [];

      for (const d of snap.docs) {
        const data = d.data();
        // Resolve user's display info
        let name = data.displayName || '';
        let avatar = data.photoURL || '';

        if (!name) {
          try {
            const userSnap = await getDoc(doc(db, 'users', d.id));
            if (userSnap.exists()) {
              const u = userSnap.data();
              name = u.displayName || u.name || 'Потребител';
              avatar = u.photoURL || '';
            }
          } catch {
            // silently ignore — use fallback
          }
        }

        const ts = data.blockedAt?.toDate?.();
        blockedList.push({
          id: d.id,
          name: name || 'Потребител',
          avatar,
          blockedAt: ts ? ts.toLocaleDateString('bg-BG') : '',
        });
      }

      setUsers(blockedList);
    } catch (err) {
      logger.error('Failed to load blocked users', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user]);

  useEffect(() => { loadBlocked(); }, [loadBlocked]);

  const onRefresh = () => {
    setRefreshing(true);
    loadBlocked();
  };

  const unblockUser = (blockedUser: BlockedUser) => {
    Alert.alert(
      'Отблокиране',
      `Сигурни ли сте, че искате да отблокирате ${blockedUser.name}?`,
      [
        { text: 'Отказ', style: 'cancel' },
        {
          text: 'Отблокирай',
          style: 'destructive',
          onPress: async () => {
            if (!user) return;
            try {
              await deleteDoc(doc(db, 'users', user.uid, 'blocked', blockedUser.id));
              setUsers(prev => prev.filter(u => u.id !== blockedUser.id));
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            } catch (err) {
              logger.error('Failed to unblock user', err);
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={colors.primary.main} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.iconBtn}>
          <ArrowLeft size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Блокирани ({users.length})</Text>
        <View style={{ width: 44 }} />
      </View>

      <FlatList
        data={users}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary.main} />}
        ListEmptyComponent={
          <View style={styles.empty}>
            <ShieldOff size={56} color={colors.text.disabled} />
            <Text style={styles.emptyTitle}>Няма блокирани потребители</Text>
            <Text style={styles.emptyDesc}>Блокираните потребители не могат да ви пишат или виждат обявите ви</Text>
          </View>
        }
        renderItem={({ item, index }) => (
          <Animated.View entering={FadeInDown.delay(index * 60)} exiting={SlideOutRight}>
            <View style={styles.userCard}>
              <Image
                source={item.avatar ? { uri: item.avatar } : require('../../assets/images/icon.png')}
                style={styles.avatar}
                contentFit="cover"
              />
              <View style={{ flex: 1 }}>
                <Text style={styles.userName}>{item.name}</Text>
                {item.blockedAt ? <Text style={styles.blockedDate}>Блокиран на {item.blockedAt}</Text> : null}
              </View>
              <TouchableOpacity style={styles.unblockBtn} onPress={() => unblockUser(item)}>
                <UserX size={16} color={colors.status.error} />
                <Text style={styles.unblockText}>Отблокирай</Text>
              </TouchableOpacity>
            </View>
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
  list: { padding: 16, gap: 10, paddingBottom: 100 },
  userCard: {
    flexDirection: 'row', alignItems: 'center', padding: 14, gap: 12,
    backgroundColor: colors.background.paper, borderRadius: 14,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 6 },
      android: { elevation: 2 },
    }),
  },
  avatar: { width: 48, height: 48, borderRadius: 24, backgroundColor: colors.background.default },
  userName: { fontSize: 15, fontWeight: '600', color: colors.text.primary },
  blockedDate: { fontSize: 12, color: colors.text.secondary, marginTop: 2 },
  unblockBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10,
    borderWidth: 1, borderColor: colors.status.error,
  },
  unblockText: { fontSize: 12, fontWeight: '600', color: colors.status.error },
  empty: { alignItems: 'center', justifyContent: 'center', paddingTop: 80, gap: 10, paddingHorizontal: 32 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: colors.text.primary },
  emptyDesc: { fontSize: 14, color: colors.text.secondary, textAlign: 'center', lineHeight: 20 },
});
