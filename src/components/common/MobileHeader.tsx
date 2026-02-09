import React, { useEffect, useState } from 'react';
import styled from 'styled-components/native';
import { Ionicons } from '@expo/vector-icons';
import { TouchableOpacity, Platform, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { theme } from '../../styles/theme';
import { useAuth } from '../../contexts/AuthContext';
import { PlatformSyncService } from '../../services/PlatformSyncService';
import { useRouter } from 'expo-router';

const HeaderContainer = styled.View<{ transparent?: boolean }>`
  height: 64px;
  background-color: ${props => props.transparent ? 'transparent' : props.theme.colors.background.paper};
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  border-bottom-width: ${props => props.transparent ? '0' : '1px'};
  border-bottom-color: ${props => props.theme.colors.border.muted};
`;

const LogoText = styled.Text`
  font-size: 20px;
  font-weight: 900;
  color: ${props => props.theme.colors.primary.main};
  letter-spacing: -0.5px;
`;

const TitleText = styled.Text`
  font-size: 18px;
  font-weight: 700;
  color: ${props => props.theme.colors.text.primary};
`;

const RightIcons = styled.View`
  flex-direction: row;
  align-items: center;
  gap: 16px;
`;

const Avatar = styled.Image`
  width: 32px;
  height: 32px;
  border-radius: 16px;
  background-color: ${props => props.theme.colors.background.dark};
`;

const Badge = styled.View`
  position: absolute;
  top: -4px;
  right: -4px;
  background-color: ${props => props.theme.colors.secondary.main};
  border-radius: 10px;
  min-width: 18px;
  height: 18px;
  align-items: center;
  justify-content: center;
  border-width: 2px;
  border-color: ${props => props.theme.colors.background.paper};
`;

const BadgeText = styled.Text`
  color: #fff;
  font-size: 10px;
  font-weight: 800;
`;

interface MobileHeaderProps {
    showLogo?: boolean;
    title?: string;
    transparent?: boolean;
    dark?: boolean;
    back?: boolean;
}

export const MobileHeader: React.FC<MobileHeaderProps> = ({
    showLogo = true,
    title,
    transparent = false,
    dark = false,
    back = false
}) => {
    const { user } = useAuth();
    const router = useRouter();
    const [unreadCount, setUnreadCount] = useState(0);
    const iconColor = dark ? '#fff' : theme.colors.text.primary;
    const logoColor = dark ? '#fff' : theme.colors.primary.main;

    useEffect(() => {
        if (user) {
            const unsubscribe = PlatformSyncService.subscribeToUnreadNotifications(user.uid, (count) => {
                setUnreadCount(count);
            });
            return unsubscribe;
        }
    }, [user]);

    return (
        <SafeAreaView
            edges={['top']}
            style={{
                backgroundColor: transparent ? 'transparent' : theme.colors.background.paper,
                position: transparent ? 'absolute' : 'relative',
                top: 0,
                left: 0,
                right: 0,
                zIndex: 100
            }}
        >
            <HeaderContainer transparent={transparent} theme={theme}>
                {back ? (
                    <TouchableOpacity onPress={() => router.back()} style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Ionicons name="arrow-back" size={24} color={iconColor} style={{ marginRight: 8 }} />
                        {title && <TitleText style={{ color: iconColor }} theme={theme}>{title}</TitleText>}
                    </TouchableOpacity>
                ) : (
                    showLogo ? (
                        <LogoText style={{ color: logoColor }} theme={theme}>Koli One</LogoText>
                    ) : (
                        <TitleText style={{ color: iconColor }} theme={theme}>{title}</TitleText>
                    )
                )}

                <RightIcons>
                    <TouchableOpacity onPress={() => router.push('/notifications' as any)}>
                        <Ionicons name="notifications-outline" size={24} color={unreadCount > 0 ? theme.colors.secondary.main : iconColor} />
                        {unreadCount > 0 && (
                            <Badge theme={theme}>
                                <BadgeText>{unreadCount > 9 ? '9+' : unreadCount}</BadgeText>
                            </Badge>
                        )}
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => router.push('/(tabs)/profile')}>
                        {user?.photoURL ? (
                            <Avatar source={{ uri: user.photoURL }} />
                        ) : (
                            <Ionicons name="person-circle-outline" size={28} color={iconColor} />
                        )}
                    </TouchableOpacity>
                </RightIcons>
            </HeaderContainer>
        </SafeAreaView>
    );
};

export default MobileHeader;
