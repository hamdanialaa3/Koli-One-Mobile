import React from 'react';
import styled from 'styled-components/native';
import { BlurView } from 'expo-blur';
import { Platform, SafeAreaView, View, TouchableOpacity, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { theme } from '../../styles/theme';

const HeaderContainer = styled.View`
  width: 100%;
  background-color: ${props => props.theme.colors.background.paper}; 
  border-bottom-width: 1px;
  border-bottom-color: ${props => props.theme.colors.border.muted};
  padding-top: ${Platform.OS === 'android' ? (StatusBar.currentHeight || 0) + 10 : 0}px; 
  /* iOS SafeArea handled by SafeAreaView if used, but BlurView usually needs absolute positioning or specific handling */
`;

const Content = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  padding: 12px 20px;
  height: 60px;
`;

const LogoContainer = styled.TouchableOpacity`
  flex-direction: row;
  align-items: center;
`;

const LogoText = styled.Text`
  font-size: 18px;
  font-weight: 800;
  color: ${props => props.theme.colors.primary.main};
  letter-spacing: 0.5px;
`;

const Actions = styled.View`
  flex-direction: row;
  align-items: center;
  gap: 16px;
`;

const IconButton = styled.TouchableOpacity`
  width: 40px;
  height: 40px;
  align-items: center;
  justify-content: center;
  border-radius: 20px;
  background-color: ${props => props.theme.colors.background.default};
`;

const StatusDot = styled.View`
  width: 8px;
  height: 8px;
  border-radius: 4px;
  background-color: #10b981;
  position: absolute;
  top: 10px;
  right: 12px;
  border-width: 1px;
  border-color: #fff;
`;

export default function MobileHeader() {
    const router = useRouter();

    return (
        <HeaderContainer theme={theme}>
            <Content>
                <LogoContainer onPress={() => router.push('/(tabs)/')}>
                    <Ionicons name="car-sport" size={24} color={theme.colors.primary.main} style={{ marginRight: 8 }} />
                    <LogoText theme={theme}>Koli One</LogoText>
                </LogoContainer>

                <Actions>
                    <IconButton theme={theme} onPress={() => router.push('/notifications' as any)}>
                        <Ionicons name="notifications-outline" size={22} color={theme.colors.text.primary} />
                        <StatusDot />
                    </IconButton>

                    <IconButton theme={theme} onPress={() => router.push('/(tabs)/profile')}>
                        <Ionicons name="person-circle-outline" size={26} color={theme.colors.text.primary} />
                    </IconButton>
                </Actions>
            </Content>
        </HeaderContainer>
    );
}
