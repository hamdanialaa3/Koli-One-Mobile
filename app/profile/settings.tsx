import React, { useState } from 'react';
import styled from 'styled-components/native';
import { MobileHeader } from '../../src/components/common/MobileHeader';
import { theme } from '../../src/styles/theme';
import {
  View,
  ScrollView,
  Switch,
  TouchableOpacity,
  Alert,
  Platform,
  Linking
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../src/contexts/AuthContext';
import { useRouter } from 'expo-router';

const Container = styled.SafeAreaView`
  flex: 1;
  background-color: ${props => props.theme.colors.background.default};
`;

const Content = styled.ScrollView`
  flex: 1;
`;

const Section = styled.View`
  background-color: ${props => props.theme.colors.background.paper};
  margin-bottom: 24px;
  border-top-width: 1px;
  border-top-color: ${props => props.theme.colors.border.muted};
  border-bottom-width: 1px;
  border-bottom-color: ${props => props.theme.colors.border.muted};
`;

const SectionTitle = styled.Text`
  font-size: 12px;
  font-weight: 700;
  color: ${props => props.theme.colors.text.secondary};
  text-transform: uppercase;
  margin: 16px 20px 8px;
  letter-spacing: 1px;
`;

const SettingRow = styled.View<{ last?: boolean }>`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-bottom-width: ${props => props.last ? '0px' : '1px'};
  border-bottom-color: ${props => props.theme.colors.border.muted};
`;

const SettingInfo = styled.View`
  flex: 1;
`;

const SettingLabel = styled.Text`
  font-size: 16px;
  font-weight: 600;
  color: ${props => props.theme.colors.text.primary};
`;

const SettingDescription = styled.Text`
  font-size: 13px;
  color: ${props => props.theme.colors.text.secondary};
  margin-top: 2px;
`;

const DangerText = styled.Text`
  color: ${props => props.theme.colors.status.error};
  font-weight: 600;
`;

export default function SettingsScreen() {
  const { profile, signOut } = useAuth();
  const router = useRouter();

  const [notifications, setNotifications] = useState({
    push: true,
    email: true,
    marketing: false
  });

  const [privacy, setPrivacy] = useState({
    publicProfile: true,
    showPhone: profile?.phoneNumber ? true : false
  });

  const handleDeleteAccount = () => {
    Alert.alert(
      "Delete Account",
      "This action cannot be undone. All your listings and data will be permanently removed.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => Alert.alert("Request Sent", "Our support team will process your deletion request within 48 hours.")
        }
      ]
    );
  };

  return (
    <Container theme={theme}>
      <MobileHeader title="Settings" back />
      <Content showsVerticalScrollIndicator={false}>

        <SectionTitle theme={theme}>Notifications</SectionTitle>
        <Section theme={theme}>
          <SettingRow theme={theme}>
            <SettingInfo>
              <SettingLabel theme={theme}>Push Notifications</SettingLabel>
              <SettingDescription theme={theme}>Messages, price drops, and alerts</SettingDescription>
            </SettingInfo>
            <Switch
              value={notifications.push}
              onValueChange={(v) => setNotifications(prev => ({ ...prev, push: v }))}
              trackColor={{ false: '#ddd', true: theme.colors.primary.main }}
            />
          </SettingRow>
          <SettingRow theme={theme}>
            <SettingInfo>
              <SettingLabel theme={theme}>Email Notifications</SettingLabel>
              <SettingDescription theme={theme}>Weekly summaries and account updates</SettingDescription>
            </SettingInfo>
            <Switch
              value={notifications.email}
              onValueChange={(v) => setNotifications(prev => ({ ...prev, email: v }))}
              trackColor={{ false: '#ddd', true: theme.colors.primary.main }}
            />
          </SettingRow>
          <SettingRow theme={theme} last>
            <SettingInfo>
              <SettingLabel theme={theme}>Marketing</SettingLabel>
              <SettingDescription theme={theme}>Special offers and tips</SettingDescription>
            </SettingInfo>
            <Switch
              value={notifications.marketing}
              onValueChange={(v) => setNotifications(prev => ({ ...prev, marketing: v }))}
              trackColor={{ false: '#ddd', true: theme.colors.primary.main }}
            />
          </SettingRow>
        </Section>

        <SectionTitle theme={theme}>Privacy & Security</SectionTitle>
        <Section theme={theme}>
          <SettingRow theme={theme}>
            <SettingInfo>
              <SettingLabel theme={theme}>Public Profile</SettingLabel>
              <SettingDescription theme={theme}>Allow others to see your listings</SettingDescription>
            </SettingInfo>
            <Switch
              value={privacy.publicProfile}
              onValueChange={(v) => setPrivacy(prev => ({ ...prev, publicProfile: v }))}
              trackColor={{ false: '#ddd', true: theme.colors.primary.main }}
            />
          </SettingRow>
          <SettingRow theme={theme} last>
            <SettingInfo>
              <SettingLabel theme={theme}>Show Phone Number</SettingLabel>
              <SettingDescription theme={theme}>Show contact info in listings</SettingDescription>
            </SettingInfo>
            <Switch
              value={privacy.showPhone}
              onValueChange={(v) => setPrivacy(prev => ({ ...prev, showPhone: v }))}
              disabled={!profile?.phoneNumber}
              trackColor={{ false: '#ddd', true: theme.colors.primary.main }}
            />
          </SettingRow>
        </Section>

        <SectionTitle theme={theme}>App Settings</SectionTitle>
        <Section theme={theme}>
          <TouchableOpacity onPress={() => Alert.alert("Select Language", "Language options will be added soon.")}>
            <SettingRow theme={theme}>
              <SettingLabel theme={theme}>Language</SettingLabel>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <SettingDescription theme={theme}>{profile?.preferredLanguage === 'bg' ? 'Bulgarian' : 'English'}</SettingDescription>
                <Ionicons name="chevron-forward" size={16} color="#999" style={{ marginLeft: 8 }} />
              </View>
            </SettingRow>
          </TouchableOpacity>
          <SettingRow theme={theme} last>
            <SettingLabel theme={theme}>Dark Mode</SettingLabel>
            <Switch value={true} disabled trackColor={{ false: '#ddd', true: theme.colors.primary.main }} />
          </SettingRow>
        </Section>

        <SectionTitle theme={theme}>Support & Legal</SectionTitle>
        <Section theme={theme}>
          <TouchableOpacity onPress={() => Linking.openURL('https://koli.one/help')}>
            <SettingRow theme={theme}>
              <SettingLabel theme={theme}>Help Center</SettingLabel>
              <Ionicons name="open-outline" size={18} color="#999" />
            </SettingRow>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.push('/privacy-policy')}>
            <SettingRow theme={theme}>
              <SettingLabel theme={theme}>Privacy Policy</SettingLabel>
              <Ionicons name="chevron-forward" size={16} color="#999" />
            </SettingRow>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.push('/terms-of-service')}>
            <SettingRow theme={theme}>
              <SettingLabel theme={theme}>Terms of Service</SettingLabel>
              <Ionicons name="chevron-forward" size={16} color="#999" />
            </SettingRow>
          </TouchableOpacity>
          <SettingRow theme={theme} last>
            <SettingLabel theme={theme}>App Version</SettingLabel>
            <SettingDescription theme={theme}>1.0.0 (Building Build)</SettingDescription>
          </SettingRow>
        </Section>

        <Section theme={theme}>
          <TouchableOpacity onPress={handleDeleteAccount}>
            <SettingRow theme={theme} last>
              <SettingInfo>
                <DangerText theme={theme}>Delete Account</DangerText>
                <SettingDescription theme={theme}>Permanently remove your account and data</SettingDescription>
              </SettingInfo>
            </SettingRow>
          </TouchableOpacity>
        </Section>

        <View style={{ height: 40 }} />
      </Content>
    </Container>
  );
}
