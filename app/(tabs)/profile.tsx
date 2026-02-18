// app/(tabs)/profile.tsx
// Fixed Web Blank Screen & Iframe Issue
import React, { useEffect, useState } from 'react';
import styled from 'styled-components/native';
import { useAuth } from '../../src/contexts/AuthContext';
import { theme } from '../../src/styles/theme';
import { Ionicons } from '@expo/vector-icons';
import MobileHeader from '../../src/components/common/MobileHeader';
import { Alert, ActivityIndicator, View, Linking, Platform, ScrollView, TouchableOpacity, Text, Dimensions } from 'react-native';
import { PlatformSyncService } from '../../src/services/PlatformSyncService';
import { SOCIAL_LINKS } from '../../src/constants/SocialLinks';
import { useRouter, Stack } from 'expo-router';
import { logger } from '../../src/services/logger-service';

// Use standard Views for layout to guarantee Web rendering
const MainContainer = ({ children }: { children: React.ReactNode }) => (
  <View style={{ flex: 1, backgroundColor: theme.colors.background.default, minHeight: Platform.OS === 'web' ? ('100vh' as any) : '100%' }}>
    {children}
  </View>
);

// --- Authenticated Components (Styled ok for inner content) ---

const ProfileHeader = styled.View`
  padding: 24px;
  background-color: ${props => props.theme.colors.background.paper};
  align-items: center;
  border-bottom-width: 1px;
  border-bottom-color: ${props => props.theme.colors.border.default};
`;

const AvatarContainer = styled.View`
  position: relative;
  margin-bottom: 16px;
`;

const Avatar = styled.Image`
  width: 100px;
  height: 100px;
  border-radius: 50px;
  background-color: ${props => props.theme.colors.background.dark};
`;

const VerifiedBadge = styled.View`
  position: absolute;
  bottom: 0;
  right: 0;
  background-color: ${props => props.theme.colors.status.success};
  width: 28px;
  height: 28px;
  border-radius: 14px;
  justify-content: center;
  align-items: center;
  border-width: 2px;
  border-color: ${props => props.theme.colors.background.paper};
`;

const UserName = styled.Text`
  font-size: 24px;
  font-weight: 800;
  color: ${props => props.theme.colors.text.primary};
  margin-bottom: 4px;
`;

const UserEmail = styled.Text`
  font-size: 14px;
  color: ${props => props.theme.colors.text.secondary};
  margin-bottom: 4px;
`;

const UserID = styled.Text`
  font-size: 12px;
  color: ${props => props.theme.colors.text.secondary};
  opacity: 0.7;
`;

// --- Commander UI ---

const CommanderHero = styled.View`
  padding: 24px;
  background-color: ${props => props.theme.colors.background.dark};
  border-bottom-width: 1px;
  border-bottom-color: ${props => props.theme.colors.primary.main}44;
  align-items: center;
  position: relative;
  overflow: hidden;
`;

const AccessGrantedBanner = styled.View`
  background-color: ${props => props.theme.colors.primary.main}22;
  border-width: 1px;
  border-color: ${props => props.theme.colors.primary.main};
  padding: 8px 16px;
  border-radius: 8px;
  margin-top: 16px;
  flex-direction: row;
  align-items: center;
`;

const AccessGrantedText = styled.Text`
  color: ${props => props.theme.colors.primary.main};
  font-size: 12px;
  font-weight: 800;
  letter-spacing: 1px;
  margin-left: 8px;
`;

const GlowCircle = styled.View`
  position: absolute;
  top: -100px;
  right: -100px;
  width: 250px;
  height: 250px;
  border-radius: 125px;
  background-color: ${props => props.theme.colors.primary.main};
  opacity: 0.05;
`;

// --- Stats Row ---

const StatsRow = styled.View`
  flex-direction: row;
  justify-content: space-around;
  padding: 20px 16px;
  background-color: ${props => props.theme.colors.background.default};
  margin-bottom: 12px;
`;

const StatItem = styled.View`
  align-items: center;
`;

const StatValue = styled.Text`
  font-size: 18px;
  font-weight: 900;
  color: ${props => props.theme.colors.primary.main};
`;

const StatLabel = styled.Text`
  font-size: 11px;
  color: ${props => props.theme.colors.text.secondary};
  text-transform: uppercase;
  margin-top: 4px;
`;

// --- Menu ---

const MenuList = styled.ScrollView`
  flex: 1;
  background-color: ${props => props.theme.colors.background.paper};
`;

const MenuHeader = styled.Text`
  font-size: 12px;
  font-weight: 700;
  color: ${props => props.theme.colors.text.secondary};
  text-transform: uppercase;
  margin-left: 24px;
  margin-bottom: 8px;
  margin-top: 16px;
`;

const MenuItem = styled.TouchableOpacity<{ last?: boolean }>`
  flex-direction: row;
  align-items: center;
  padding: 16px 24px;
  border-bottom-width: ${props => props.last ? '0px' : '1px'};
  border-bottom-color: ${props => props.theme.colors.border.muted};
  background-color: ${props => props.theme.colors.background.paper};
`;

const MenuText = styled.Text`
  font-size: 16px;
  font-weight: 600;
  color: ${props => props.theme.colors.text.primary};
  margin-left: 16px;
  flex: 1;
`;

// --- Social ---

const SocialSection = styled.View`
  padding: 24px;
  align-items: center;
  background-color: ${props => props.theme.colors.background.default};
`;

const SocialIconRow = styled.View`
  flex-direction: row;
  justify-content: center;
  flex-wrap: wrap;
  gap: 16px;
`;

const SocialIconCircle = styled.TouchableOpacity`
  width: 40px;
  height: 40px;
  border-radius: 20px;
  background-color: ${props => props.theme.colors.background.paper};
  justify-content: center;
  align-items: center;
  border-width: 1px;
  border-color: ${props => props.theme.colors.border.muted};
`;

export default function ProfileScreen() {
  const { user, profile, loading, signOut } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState({
    activeListings: 0,
    totalViews: 0,
    totalMessages: 0,
    trustScore: 0
  });

  useEffect(() => {
    if (user) {
      const unsubscribe = PlatformSyncService.subscribeToUserStats(user.uid, (newStats) => {
        setStats(prev => ({ ...prev, ...newStats }));
      });
      return unsubscribe;
    }
  }, [user]);

  const menuItems = [
    {
      title: 'Management',
      items: [
        { label: 'My Ads', icon: 'list', route: '/profile/my-ads' },
        { label: 'My Garage', icon: 'car-sport-outline', route: '/garage' },
        { label: 'Drafts', icon: 'document-text-outline', route: '/profile/drafts' },
        { label: 'Favorites', icon: 'heart-outline', route: '/profile/favorites' },
        { label: 'Saved Searches', icon: 'bookmark-outline', route: '/saved-searches' },
        { label: 'My Reviews', icon: 'star-outline', route: '/my-reviews' },
      ]
    },
    {
      title: 'Analytics',
      items: [
        { label: 'Dashboard', icon: 'bar-chart-outline', route: '/profile/dashboard' },
        { label: 'Performance', icon: 'trending-up-outline', route: '/profile/analytics' },
        { label: 'Campaigns', icon: 'megaphone-outline', route: '/profile/campaigns' },
      ]
    },
    {
      title: 'AI Tools',
      items: [
        { label: 'AI Advisor', icon: 'sparkles-outline', route: '/ai/advisor' },
        { label: 'Car Valuation', icon: 'calculator-outline', route: '/ai/valuation' },
        { label: 'AI History', icon: 'time-outline', route: '/ai/history' },
      ]
    },
    {
      title: 'Discover',
      items: [
        { label: 'Events', icon: 'calendar-outline', route: '/events' },
        { label: 'Auctions', icon: 'hammer-outline', route: '/auctions' },
        { label: 'Stories', icon: 'film-outline', route: '/stories' },
        { label: 'Cars Near Me', icon: 'map-outline', route: '/map-search' },
        { label: 'Blog & News', icon: 'newspaper-outline', route: '/blog' },
        { label: 'Financing', icon: 'cash-outline', route: '/finance' },
        { label: 'Community', icon: 'people-outline', route: '/social' },
        { label: 'Compare Cars', icon: 'git-compare-outline', route: '/compare' },
        { label: 'Top Brands', icon: 'trophy-outline', route: '/top-brands' },
      ]
    },
    {
      title: 'Account',
      items: [
        { label: 'Settings', icon: 'settings-outline', route: '/profile/settings' },
        { label: 'Billing', icon: 'card-outline', route: '/profile/billing' },
        { label: 'Subscription', icon: 'diamond-outline', route: '/profile/subscription' },
        { label: 'Following', icon: 'people-circle-outline', route: '/profile/following' },
        { label: 'Help & Support', icon: 'help-circle-outline', route: '/help' },
      ]
    }
  ];

  if (loading) {
    return (
      <MainContainer>
        <Stack.Screen options={{ headerShown: false }} />
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={theme.colors.primary.main} />
        </View>
      </MainContainer>
    );
  }

  // --- GUEST VIEW (Not Logged In) ---
  if (!user) {
    return (
      <MainContainer>
        <Stack.Screen options={{ headerShown: false }} />
        <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', padding: 24, minHeight: 500 }}>
          <View style={{ alignItems: 'center', backgroundColor: theme.colors.background.paper, padding: 32, borderRadius: 24, ...Platform.select({ ios: { shadowColor: '#000', shadowOffset: { height: 4, width: 0 }, shadowOpacity: 0.1, shadowRadius: 10 }, android: { elevation: 5 }, default: { boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.1)' } }) }}>
            <Text style={{ fontSize: 28, fontWeight: '800', color: theme.colors.primary.main, marginBottom: 12 }}>Koli One</Text>
            <Text style={{ fontSize: 16, color: theme.colors.text.secondary, textAlign: 'center', marginBottom: 32 }}>
              Log in to manage your ads, view analytics, and access commander features.
            </Text>

            <TouchableOpacity
              onPress={() => router.push('/(auth)/login')}
              style={{
                width: '100%',
                backgroundColor: theme.colors.primary.main,
                paddingVertical: 16,
                borderRadius: 50,
                alignItems: 'center',
                ...Platform.select({
                  ios: { shadowColor: theme.colors.primary.main, shadowOffset: { height: 4, width: 0 }, shadowOpacity: 0.3, shadowRadius: 8 },
                  android: { elevation: 4 },
                  default: { boxShadow: '0px 4px 8px rgba(230, 80, 0, 0.3)' },
                }),
                marginBottom: 16
              }}
            >
              <Text style={{ color: '#fff', fontSize: 18, fontWeight: 'bold' }}>Sign In / Register</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => router.push('/help')}>
              <Text style={{ color: theme.colors.text.secondary, fontSize: 14 }}>Need Help?</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </MainContainer>
    );
  }

  // --- LOGGED IN VIEW ---
  return (
    <MainContainer>
      <Stack.Screen options={{ headerShown: false }} />
      <MobileHeader title="Command Center" showLogo={false} />

      <ScrollView showsVerticalScrollIndicator={false}>
        <CommanderHero theme={theme}>
          <GlowCircle theme={theme} />
          <AvatarContainer>
            <Avatar source={{ uri: user.photoURL || undefined }} />
            <VerifiedBadge theme={theme}>
              <Ionicons name="checkmark" size={16} color="#fff" />
            </VerifiedBadge>
          </AvatarContainer>
          <UserName theme={theme}>{user.displayName}</UserName>
          <UserEmail theme={theme}>{user.email}</UserEmail>
          {profile?.numericId && (
            <UserID theme={theme}>COMMANDER ID: #{profile.numericId}</UserID>
          )}

          <AccessGrantedBanner theme={theme}>
            <Ionicons name="shield-checkmark" size={14} color={theme.colors.primary.main} />
            <AccessGrantedText theme={theme}>ACCESS GRANTED • NEURAL LINK ACTIVE</AccessGrantedText>
          </AccessGrantedBanner>

          <TouchableOpacity
            onPress={() => router.push('/profile/edit')}
            style={{
              marginTop: 16,
              paddingVertical: 8,
              paddingHorizontal: 20,
              borderRadius: 20,
              backgroundColor: theme.colors.primary.main,
              flexDirection: 'row',
              alignItems: 'center',
              gap: 8
            }}
          >
            <Ionicons name="create-outline" size={16} color="white" />
            <MenuText style={{ color: 'white', marginLeft: 0, fontSize: 14 }}>Edit Profile</MenuText>
          </TouchableOpacity>
        </CommanderHero>

        <StatsRow theme={theme}>
          <StatItem>
            <StatValue theme={theme}>{stats.activeListings || 0}</StatValue>
            <StatLabel theme={theme}>Active Ads</StatLabel>
          </StatItem>
          <StatItem>
            <StatValue theme={theme}>{stats.totalViews || 0}</StatValue>
            <StatLabel theme={theme}>Views</StatLabel>
          </StatItem>
          <StatItem>
            <StatValue theme={theme}>{stats.trustScore}%</StatValue>
            <StatLabel theme={theme}>Trust Score</StatLabel>
          </StatItem>
        </StatsRow>

        <MenuList theme={theme}>
          {menuItems.map((group, gIndex) => (
            <View key={group.title}>
              <MenuHeader theme={theme}>{group.title}</MenuHeader>
              {group.items.map((item, iIndex) => (
                <MenuItem
                  key={item.label}
                  theme={theme}
                  onPress={() => router.push(item.route as any)}
                  last={iIndex === group.items.length - 1}
                >
                  <Ionicons name={item.icon as any} size={22} color={theme.colors.text.primary} />
                  <MenuText theme={theme}>{item.label}</MenuText>
                  <Ionicons name="chevron-forward" size={18} color={theme.colors.text.disabled} />
                </MenuItem>
              ))}
            </View>
          ))}

          <MenuHeader theme={theme}>Session</MenuHeader>
          <MenuItem theme={theme} onPress={signOut} last>
            <Ionicons name="log-out-outline" size={22} color={theme.colors.status.error} />
            <MenuText theme={theme} style={{ color: theme.colors.status.error }}>Sign Out</MenuText>
          </MenuItem>
        </MenuList>

        <SocialSection theme={theme}>
          <StatLabel theme={theme} style={{ marginBottom: 16 }}>JOIN OUR COMMUNITY</StatLabel>
          <SocialIconRow>
            <SocialIconCircle onPress={() => Linking.openURL(SOCIAL_LINKS.INSTAGRAM)}>
              <Ionicons name="logo-instagram" size={20} color={theme.colors.text.primary} />
            </SocialIconCircle>
            <SocialIconCircle onPress={() => Linking.openURL(SOCIAL_LINKS.FACEBOOK)}>
              <Ionicons name="logo-facebook" size={20} color={theme.colors.text.primary} />
            </SocialIconCircle>
            <SocialIconCircle onPress={() => Linking.openURL(SOCIAL_LINKS.TIKTOK)}>
              <Ionicons name="logo-tiktok" size={20} color={theme.colors.text.primary} />
            </SocialIconCircle>
            <SocialIconCircle onPress={() => Linking.openURL(SOCIAL_LINKS.YOUTUBE)}>
              <Ionicons name="logo-youtube" size={20} color={theme.colors.text.primary} />
            </SocialIconCircle>
          </SocialIconRow>
          <StatLabel theme={theme} style={{ marginTop: 24, opacity: 0.5 }}>
            v1.0.0 • Koli One Official
          </StatLabel>
        </SocialSection>

        <View style={{ height: 20 }} />
      </ScrollView>
    </MainContainer>
  );
}
