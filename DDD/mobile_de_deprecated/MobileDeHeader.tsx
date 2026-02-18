import React from 'react';
import styled from 'styled-components/native';
import { View, Text, TouchableOpacity, Platform, StatusBar } from 'react-native';
import { User, MessageSquare, Bell } from 'lucide-react-native';
import { useTheme } from 'styled-components/native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

const HeaderContainer = styled.View`
  background-color: ${props => props.theme.colors.mobileDe.background};
  padding-top: ${Platform.OS === 'android' ? (StatusBar.currentHeight || 0) + 10 : 0}px;
  width: 100%;
  z-index: 100;
`;

const Content = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  height: 60px;
`;

const UserIconContainer = styled.TouchableOpacity`
  background-color: #2C2C2C;
  padding: 8px;
  border-radius: 999px;
`;

const LogoText = styled.Text`
  font-size: 24px;
  font-weight: 800;
  color: ${props => props.theme.colors.mobileDe.text};
  letter-spacing: -0.5px;
`;

const LogoSuffix = styled.Text`
  color: ${props => props.theme.colors.mobileDe.primary};
`;

const ActionsContainer = styled.View`
  flex-direction: row;
  align-items: center;
  gap: 16px;
`;

export const MobileDeHeader = () => {
  const theme = useTheme();
  const router = useRouter();

  return (
    <HeaderContainer>
      <Content>
        <UserIconContainer onPress={() => router.push('/(tabs)/profile')}>
          <User size={20} color={theme.colors.mobileDe.text} />
        </UserIconContainer>

        <LogoText>
          KOLI<LogoSuffix> ONE</LogoSuffix>
        </LogoText>

        <ActionsContainer>
          <TouchableOpacity onPress={() => router.push('/(tabs)/messages')}>
            <MessageSquare size={24} color={theme.colors.mobileDe.text} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.push('/notifications' as any)}>
            <Bell size={24} color={theme.colors.mobileDe.text} />
          </TouchableOpacity>
        </ActionsContainer>
      </Content>
    </HeaderContainer>
  );
};
