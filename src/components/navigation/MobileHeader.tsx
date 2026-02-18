import React from 'react';
import styled from 'styled-components/native';
import { BlurView } from 'expo-blur';
import { Platform, SafeAreaView, View, TouchableOpacity, StatusBar, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { theme } from '../../styles/theme';

const HeaderContainer = styled.View`
  width: 100%;
  background-color: ${props => props.theme.colors.background.default}; 
  border-bottom-width: 1px;
  border-bottom-color: ${props => props.theme.colors.border.default};
  padding-top: ${Platform.OS === 'android' ? (StatusBar.currentHeight || 0) + 10 : 0}px; 
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
  font-size: 20px;
  font-weight: 900;
  color: ${props => props.theme.colors.primary.main};
  letter-spacing: -0.5px;
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
  background-color: ${props => props.theme.colors.background.paper};
`;

const StatusDot = styled.View`
  width: 8px;
  height: 8px;
  border-radius: 4px;
  background-color: ${props => props.theme.colors.status.success};
  position: absolute;
  top: 10px;
  right: 12px;
  border-width: 1px;
  border-color: ${props => props.theme.colors.background.paper};
`;

export default function MobileHeader() {
  const router = useRouter();

  return (
    <HeaderContainer theme={theme}>
      <StatusBar barStyle="light-content" backgroundColor={theme.colors.background.default} />
      <Content>
        <LogoContainer onPress={() => router.push('/(tabs)/' as any)}>
          <LogoText theme={theme}>
            mobile<Text style={{ color: theme.colors.primary.main }}>.de</Text> clone
          </LogoText>
        </LogoContainer>

        <Actions>
          <IconButton theme={theme} onPress={() => router.push('/notifications' as any)}>
            <Ionicons name="notifications-outline" size={22} color={theme.colors.text.primary} />
            <StatusDot theme={theme} />
          </IconButton>

          <IconButton theme={theme} onPress={() => router.push('/profile/settings')}>
            <Ionicons name="settings-outline" size={22} color={theme.colors.text.primary} />
          </IconButton>

          <IconButton theme={theme} onPress={() => router.push('/(tabs)/profile')}>
            <Ionicons name="person-circle-outline" size={26} color={theme.colors.text.primary} />
          </IconButton>
        </Actions>
      </Content>
    </HeaderContainer>
  );
}
