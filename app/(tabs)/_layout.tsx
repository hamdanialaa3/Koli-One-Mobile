import React, { useEffect, useState } from 'react';
import { Tabs } from 'expo-router';
import { theme } from '@/styles/theme';
import MobileHeader from '../../src/components/navigation/MobileHeader';
import CustomTabBar from '../../src/components/navigation/CustomTabBar';
import { useAuth } from '../../src/contexts/AuthContext';
import { getDatabase, ref, onValue } from 'firebase/database';

export default function TabLayout() {
  const { user } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);

  // Listen for unread messages count
  useEffect(() => {
    if (!user?.uid) {
      setUnreadCount(0);
      return;
    }
    const db = getDatabase();
    const unreadRef = ref(db, `userMeta/${user.uid}/unreadCount`);
    const unsub = onValue(unreadRef, (snapshot) => {
      setUnreadCount(snapshot.val() || 0);
    });
    return () => unsub();
  }, [user?.uid]);

  return (
    <Tabs
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{
        header: () => <MobileHeader />,
        tabBarActiveTintColor: theme.colors.primary.main,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          headerShown: false,
          title: 'Home',
        }}
      />
      <Tabs.Screen
        name="search"
        options={{ title: 'Search' }}
      />
      <Tabs.Screen
        name="sell"
        options={{ title: 'Sell' }}
      />

      <Tabs.Screen
        name="profile"
        options={{ title: 'Profile' }}
      />
      <Tabs.Screen
        name="messages"
        options={{
          title: 'Messages',
          tabBarBadge: unreadCount > 0 ? unreadCount : undefined,
        }}
      />
    </Tabs>
  );
}
