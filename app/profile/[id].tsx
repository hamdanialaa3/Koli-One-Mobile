import React, { useEffect, useState } from 'react';
import styled from 'styled-components/native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { View, ScrollView, ActivityIndicator, Platform, TouchableOpacity, Share } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../src/styles/theme';
import { MobileHeader } from '../../src/components/common/MobileHeader';
import { ListingService } from '../../src/services/ListingService';
import { getUserProfile } from '../../src/services/userService';
import { CarCard } from '../../src/components/CarCard';
import { useAuth } from '../../src/contexts/AuthContext';

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
  padding: 0 20px 40px;
  gap: 16px;
`;

export default function PublicProfileScreen() {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const { user: currentUser } = useAuth();
    const [profile, setProfile] = useState<any>(null);
    const [listings, setListings] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProfileData = async () => {
            try {
                if (!id) return;
                const profileData = await getUserProfile(id as string);
                setProfile(profileData);

                const userListings = await ListingService.getUserListings(id as string);
                setListings(userListings);
            } catch (error) {
                console.error('Error fetching public profile:', error);
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
            console.error('Error sharing profile:', error);
        }
    };

    if (loading) {
        return (
            <Container theme={theme}>
                <MobileHeader title="Profile" back />
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <ActivityIndicator size="large" color={theme.colors.primary.main} />
                </View>
            </Container>
        );
    }

    return (
        <Container theme={theme}>
            <MobileHeader title={profile?.displayName || "Profile"} back />
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
                    <PrimaryButton theme={theme}>
                        <Ionicons name="add-circle-outline" size={20} color="#fff" />
                        <ButtonText>Follow User</ButtonText>
                    </PrimaryButton>
                    <SecondaryButton theme={theme} onPress={() => router.push(`/messages/${id}` as any)}>
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
        </Container>
    );
}
