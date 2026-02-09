import React, { useEffect, useState } from 'react';
import styled from 'styled-components/native';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { GoogleAuthProvider, FacebookAuthProvider, signInWithCredential, signInWithPopup } from 'firebase/auth';
import { auth } from '../../src/services/firebase';
import { useAuth } from '../../src/contexts/AuthContext';
import { theme } from '../../src/styles/theme';
import { Ionicons } from '@expo/vector-icons';
import MobileHeader from '../../src/components/common/MobileHeader';
import { Alert, ActivityIndicator, View, Linking, Platform, ScrollView, TouchableOpacity } from 'react-native';
import { PlatformSyncService } from '../../src/services/PlatformSyncService';
import { SOCIAL_LINKS } from '../../src/constants/SocialLinks';
import { useRouter } from 'expo-router';
import { GoogleLoginButton } from '../../src/components/auth/GoogleLoginButton';
import { FacebookLoginButton } from '../../src/components/auth/FacebookLoginButton';

const Container = styled.SafeAreaView`
  flex: 1;
  background-color: ${props => props.theme.colors.background.default};
`;

const ContentContainer = styled.View`
  flex: 1;
  justify-content: center;
  align-items: center;
  padding: ${props => props.theme.spacing.xl};
`;

const LogoText = styled.Text`
  font-size: 32px;
  font-weight: 900;
  color: ${props => props.theme.colors.primary.main};
  margin-bottom: 8px;
`;

const Tagline = styled.Text`
  font-size: 16px;
  color: ${props => props.theme.colors.text.secondary};
  margin-bottom: 48px;
  text-align: center;
`;

const LoginCard = styled.View`
  width: 100%;
  background-color: ${props => props.theme.colors.background.paper};
  padding: 32px;
  border-radius: 24px;
  elevation: 10;
  ${Platform.OS !== 'web' ? `
    shadow-color: #000;
    shadow-offset: 0px 10px;
    shadow-opacity: 0.1;
    shadow-radius: 20px;
  ` : `
    box-shadow: 0px 10px 20px rgba(0, 0, 0, 0.1);
  `}
  align-items: center;
`;

const WelcomeText = styled.Text`
  font-size: 20px;
  font-weight: 700;
  color: ${props => props.theme.colors.text.primary};
  margin-bottom: 24px;
`;

// --- Authenticated Header ---

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

const MenuGroup = styled.View`
  margin-bottom: 24px;
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
    trustScore: 10 // Mock default
  });

  useEffect(() => {
    if (user) {
      const unsubscribe = PlatformSyncService.subscribeToUserStats(user.uid, (newStats) => {
        setStats(prev => ({ ...prev, ...newStats }));
      });
      return unsubscribe;
    }
  }, [user]);

  const handleGoogleLogin = async () => {
    try {
      if (Platform.OS === 'web') {
        const provider = new GoogleAuthProvider();
        if (auth) {
          await signInWithPopup(auth, provider);
        }
      } else {
        await GoogleSignin.hasPlayServices();
        const userInfo = await GoogleSignin.signIn();
        const idToken = (userInfo as any).data?.idToken || (userInfo as any).idToken;

        if (idToken) {
          const credential = GoogleAuthProvider.credential(idToken);
          if (auth) {
            await signInWithCredential(auth, credential);
          }
        }
      }
    } catch (error: any) {
      console.error("Login Error:", error);
      Alert.alert("Login Failed", error.message);
    }
  };

  const handleFacebookLogin = async () => {
    try {
      if (Platform.OS === 'web') {
        const provider = new FacebookAuthProvider();
        if (auth) {
          await signInWithPopup(auth, provider);
        }
      } else {
        Alert.alert("Social Login", "Facebook Login on mobile is being updated for maximum security.");
      }
    } catch (error: any) {
      console.error("Facebook Login Error:", error);
      Alert.alert("Login Failed", error.message);
    }
  };

  const menuItems = [
    {
      title: 'Dashboard',
      items: [
        { label: 'Executive Stats', icon: 'grid-outline', route: '/profile/dashboard' },
        { label: 'My Ads', icon: 'car-sport-outline', route: '/profile/my-ads' },
        { label: 'My Drafts', icon: 'document-text-outline', route: '/profile/drafts' },
        { label: 'Social Feed', icon: 'people-outline', route: '/social' },
      ]
    },
    {
      title: 'Activity',
      items: [
        { label: 'My Reviews', icon: 'star-outline', route: '/my-reviews' },
        { label: 'Favorites', icon: 'heart-outline', route: '/profile/favorites' },
        { label: 'Saved Searches', icon: 'search-outline', route: '/profile/saved-searches' },
        { label: 'Consultations', icon: 'chatbubbles-outline', route: '/profile/consultations' },
        { label: 'Analytics', icon: 'bar-chart-outline', route: '/profile/analytics' },
        { label: 'Campaigns', icon: 'megaphone-outline', route: '/profile/campaigns' },
      ]
    },
    {
      title: 'Account & Community',
      items: [
        { label: 'User Directory', icon: 'people-circle-outline', route: '/profile/users' },
        { label: 'Settings', icon: 'settings-outline', route: '/profile/settings' },
      ]
    }
  ];

  if (loading) {
    return (
      <Container theme={theme} style={{ justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={theme.colors.primary.main} />
      </Container>
    );
  }

  if (!user) {
    return (
      <Container theme={theme}>
        <ContentContainer theme={theme}>
          <LogoText theme={theme}>Koli One</LogoText>
          <Tagline theme={theme}>The Premium Marketplace</Tagline>
          <LoginCard theme={theme}>
            <WelcomeText theme={theme}>Join Koli One</WelcomeText>
            <GoogleLoginButton onPress={handleGoogleLogin} />
            <FacebookLoginButton onPress={handleFacebookLogin} />
          </LoginCard>
        </ContentContainer>
      </Container>
    );
  }

  return (
    <Container theme={theme}>
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
            {/* Trust Score Mock (Web Parity) */}
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

        <View style={{ height: '20px' as any }} />
      </ScrollView>

    </Container>
  );
}
