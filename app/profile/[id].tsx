import React, { useEffect, useState } from 'react';
import styled from 'styled-components/native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { View, ScrollView, ActivityIndicator, Platform, TouchableOpacity, Share, Modal, Switch, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../src/styles/theme';
import { MobileHeader } from '../../src/components/common/MobileHeader';
import { ListingService } from '../../src/services/ListingService';
import { getUserProfile } from '../../src/services/userService';
import { CarCard } from '../../src/components/CarCard';
import { useAuth } from '../../src/contexts/AuthContext';
import { logger } from '../../src/services/logger-service';
import { doc, getDoc, setDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../src/services/firebase';

const Container = styled.SafeAreaView`
  flex: 1;
  background-color: ${props => props.theme.colors.background.default};
`;

const CommanderHero = styled.View`
  padding: 24px;
  background-color: ${props => props.theme.colors.background.dark};
  border-bottom-width: 1px;
  border-bottom-color: ${props => props.theme.colors.primary.main}44;
  align-items: center;
  position: relative;
  overflow: hidden;
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


const AvatarContainer = styled.View`
  position: relative;
  margin-bottom: 16px;
`;

const Avatar = styled.Image`
  width: 100px;
  height: 100px;
  border-radius: 50px;
  border-width: 4px;
  border-color: ${props => props.theme.colors.primary.main};
`;

const VerifiedBadge = styled.View`
  position: absolute;
  bottom: 0;
  right: 0;
  background-color: ${props => props.theme.colors.primary.main};
  width: 28px;
  height: 28px;
  border-radius: 14px;
  align-items: center;
  justify-content: center;
  border-width: 2px;
  border-color: ${props => props.theme.colors.background.dark};
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
  margin-bottom: 12px;
  opacity: 0.8;
`;

const StatsRow = styled.View`
  flex-direction: row;
  justify-content: space-around;
  width: 100%;
  padding: 20px;
  background-color: ${props => props.theme.colors.background.paper};
  border-bottom-width: 1px;
  border-bottom-color: ${props => props.theme.colors.border.muted};
`;

const StatItem = styled.View`
  align-items: center;
`;

const StatValue = styled.Text`
  font-size: 18px;
  font-weight: 800;
  color: ${props => props.theme.colors.primary.main};
`;

const StatLabel = styled.Text`
  font-size: 12px;
  color: ${props => props.theme.colors.text.secondary};
  text-transform: uppercase;
  letter-spacing: 1px;
  margin-top: 4px;
`;

const ActionButtons = styled.View`
  flex-direction: row;
  padding: 16px;
  gap: 12px;
`;

const PrimaryButton = styled.TouchableOpacity`
  flex: 1;
  background-color: ${props => props.theme.colors.primary.main};
  height: 50px;
  border-radius: 12px;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  gap: 8px;
`;

const ButtonText = styled.Text`
  color: #fff;
  font-size: 16px;
  font-weight: 700;
`;

const SecondaryButton = styled.TouchableOpacity`
  width: 50px;
  height: 50px;
  border-radius: 12px;
  border-width: 1.5px;
  border-color: ${props => props.theme.colors.border.muted};
  align-items: center;
  justify-content: center;
`;

const SectionTitle = styled.Text`
  font-size: 18px;
  font-weight: 800;
  color: ${props => props.theme.colors.text.primary};
  margin: 24px 20px 16px;
`;

const ListingsGrid = styled.View`
  padding: 0px 20px 40px;
  gap: 16px;
`;

const SettingsBackdrop = styled.View`
  flex: 1;
  background-color: rgba(0, 0, 0, 0.45);
  justify-content: flex-end;
`;

const SettingsSheet = styled.View`
  background-color: ${props => props.theme.colors.background.paper};
  border-top-left-radius: 20px;
  border-top-right-radius: 20px;
  padding: 20px;
`;

const SettingsTitle = styled.Text`
  font-size: 18px;
  font-weight: 800;
  color: ${props => props.theme.colors.text.primary};
  margin-bottom: 16px;
`;

const SettingsRow = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  padding: 12px 0px;
`;

const SettingsLabel = styled.Text`
  font-size: 14px;
  color: ${props => props.theme.colors.text.primary};
`;

const LanguageRow = styled.View`
  flex-direction: row;
  gap: 10px;
`;

const LanguageChip = styled.TouchableOpacity<{ $active?: boolean }>`
  padding: 8px 12px;
  border-radius: 12px;
  border-width: 1px;
  border-color: ${props => (props.$active ? props.theme.colors.primary.main : props.theme.colors.border.muted)};
  background-color: ${props => (props.$active ? `${props.theme.colors.primary.main}22` : 'transparent')};
`;

const LanguageChipText = styled.Text`
  font-size: 13px;
  font-weight: 700;
  color: ${props => props.theme.colors.text.primary};
`;

const CloseButton = styled.TouchableOpacity`
  margin-top: 12px;
  align-self: flex-end;
`;

export default function PublicProfileScreen() {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const { user: currentUser } = useAuth();
    const [profile, setProfile] = useState<any>(null);
    const [listings, setListings] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [settingsOpen, setSettingsOpen] = useState(false);
    const [isDarkMode, setIsDarkMode] = useState(false);
    const [language, setLanguage] = useState<'bg' | 'en'>('en');
    const [notificationsEnabled, setNotificationsEnabled] = useState(true);
    const [appSoundsEnabled, setAppSoundsEnabled] = useState(true);

    useEffect(() => {
        const fetchProfileData = async () => {
            try {
                if (!id) return;
                const profileData = await getUserProfile(id as string);
                setProfile(profileData);

                const userListings = await ListingService.getUserListings(id as string);
                setListings(userListings);
            } catch (error) {
                logger.error('Error fetching public profile', error);
            } finally {
                setLoading(false);
            }
        };

        fetchProfileData();
    }, [id]);

    const handleShare = async () => {
        try {
            await Share.share({
                message: `Check out ${profile?.displayName}'s profile on Koli One!`,
                url: `https://koli.one/profile/${id}`,
            });
        } catch (error) {
            logger.error('Error sharing profile', error);
        }
    };

    if (loading) {
        return (
            <Container theme={theme}>
          <MobileHeader
            title="Profile"
            back
            rightComponent={
              <TouchableOpacity onPress={() => setSettingsOpen(true)}>
                <Ionicons name="settings-outline" size={22} color={theme.colors.text.primary} />
              </TouchableOpacity>
            }
          />
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <ActivityIndicator size="large" color={theme.colors.primary.main} />
                </View>
            </Container>
        );
    }

    return (
        <Container theme={theme}>
        <MobileHeader
          title={profile?.displayName || "Profile"}
          back
          rightComponent={
            <TouchableOpacity onPress={() => setSettingsOpen(true)}>
              <Ionicons name="settings-outline" size={22} color={theme.colors.text.primary} />
            </TouchableOpacity>
          }
        />
            <ScrollView showsVerticalScrollIndicator={false}>
                <CommanderHero theme={theme}>
                    <GlowCircle theme={theme} />
                    <AvatarContainer>
                        <Avatar source={{ uri: profile?.photoURL || undefined }} />
                        <VerifiedBadge theme={theme}>
                            <Ionicons name="checkmark" size={16} color="#fff" />
                        </VerifiedBadge>
                    </AvatarContainer>
                    <UserName theme={theme}>{profile?.displayName}</UserName>
                    <UserEmail theme={theme}>{profile?.email}</UserEmail>
                </CommanderHero>

                <StatsRow theme={theme}>
                    <StatItem>
                        <StatValue theme={theme}>{listings.length}</StatValue>
                        <StatLabel theme={theme}>Ads</StatLabel>
                    </StatItem>
                    <StatItem>
                        <StatValue theme={theme}>{profile?.stats?.followers || 0}</StatValue>
                        <StatLabel theme={theme}>Followers</StatLabel>
                    </StatItem>
                    <StatItem>
                        <StatValue theme={theme}>{profile?.verification?.trustScore || 100}%</StatValue>
                        <StatLabel theme={theme}>Trust</StatLabel>
                    </StatItem>
                </StatsRow>

                <ActionButtons>
                    <PrimaryButton theme={theme} onPress={async () => {
                        if (!currentUser) { Alert.alert('Вход', 'Влезте в профила си, за да следвате.'); return; }
                        if (currentUser.uid === id) return;
                        try {
                            const followRef = doc(db, `users/${currentUser.uid}/following/${id}`);
                            const snap = await getDoc(followRef);
                            if (snap.exists()) {
                                await deleteDoc(followRef);
                                Alert.alert('Готово', 'Спряхте да следвате този потребител.');
                            } else {
                                await setDoc(followRef, { followedAt: serverTimestamp() });
                                Alert.alert('Готово', 'Следвате този потребител.');
                            }
                        } catch (err) {
                            logger.error('Follow toggle failed', err);
                            Alert.alert('Грешка', 'Неуспешно следване.');
                        }
                    }}>
                        <Ionicons name="add-circle-outline" size={20} color="#fff" />
                        <ButtonText>Следвай</ButtonText>
                    </PrimaryButton>
                    <SecondaryButton theme={theme} onPress={() => router.push({ pathname: '/chat/[id]', params: { id: id as string } })}>
                        <Ionicons name="chatbubble-outline" size={22} color={theme.colors.text.primary} />
                    </SecondaryButton>
                    <SecondaryButton theme={theme} onPress={handleShare}>
                        <Ionicons name="share-social-outline" size={22} color={theme.colors.text.primary} />
                    </SecondaryButton>
                </ActionButtons>

                <SectionTitle theme={theme}>Active Listings</SectionTitle>
                <ListingsGrid>
                    {listings.length > 0 ? (
                        listings.map(item => (
                            <CarCard key={item.id} listing={item} />
                        ))
                    ) : (
                        <UserEmail theme={theme} style={{ textAlign: 'center', marginTop: 20 }}>
                            No active listings found.
                        </UserEmail>
                    )}
                </ListingsGrid>
            </ScrollView>

              <Modal
                visible={settingsOpen}
                transparent
                animationType="slide"
                onRequestClose={() => setSettingsOpen(false)}
              >
                <SettingsBackdrop>
                  <SettingsSheet theme={theme}>
                    <SettingsTitle theme={theme}>Настройки</SettingsTitle>
                    <SettingsRow>
                      <SettingsLabel theme={theme}>Тъмен / Светъл режим</SettingsLabel>
                      <Switch
                        value={isDarkMode}
                        onValueChange={setIsDarkMode}
                      />
                    </SettingsRow>
                    <SettingsRow>
                      <SettingsLabel theme={theme}>Език</SettingsLabel>
                      <LanguageRow>
                        <LanguageChip theme={theme} $active={language === 'bg'} onPress={() => setLanguage('bg')}>
                          <LanguageChipText theme={theme}>Български</LanguageChipText>
                        </LanguageChip>
                        <LanguageChip theme={theme} $active={language === 'en'} onPress={() => setLanguage('en')}>
                          <LanguageChipText theme={theme}>English</LanguageChipText>
                        </LanguageChip>
                      </LanguageRow>
                    </SettingsRow>
                    <SettingsRow>
                      <SettingsLabel theme={theme}>Известия</SettingsLabel>
                      <Switch
                        value={notificationsEnabled}
                        onValueChange={setNotificationsEnabled}
                      />
                    </SettingsRow>
                    <SettingsRow>
                      <SettingsLabel theme={theme}>Звуци</SettingsLabel>
                      <Switch value={appSoundsEnabled} onValueChange={setAppSoundsEnabled} />
                    </SettingsRow>
                    <CloseButton onPress={() => setSettingsOpen(false)}>
                      <SettingsLabel theme={theme}>Затвори</SettingsLabel>
                    </CloseButton>
                  </SettingsSheet>
                </SettingsBackdrop>
              </Modal>
        </Container>
    );
}
