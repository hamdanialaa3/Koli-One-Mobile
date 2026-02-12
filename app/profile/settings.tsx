import React, { useState, useEffect } from 'react';
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
import { doc, getDoc, setDoc, addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '../../src/services/firebase';

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
  const { user, profile, signOut } = useAuth();
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

  const [selectedLanguage, setSelectedLanguage] = useState<string>(
    profile?.preferredLanguage || 'bg'
  );

  // Load saved preferences from Firestore on mount
  useEffect(() => {
    if (!user?.uid) return;
    let isActive = true;

    const loadPreferences = async () => {
      try {
        const prefDoc = await getDoc(doc(db, 'users', user.uid, 'preferences', 'settings'));
        if (!isActive) return;
        if (prefDoc.exists()) {
          const data = prefDoc.data();
          if (data.notifications) {
            setNotifications(prev => ({ ...prev, ...data.notifications }));
          }
          if (data.privacy) {
            setPrivacy(prev => ({ ...prev, ...data.privacy }));
          }
          if (data.language) {
            setSelectedLanguage(data.language);
          }
        }
      } catch (_err) {
        // Silently fail — use defaults
      }
    };

    loadPreferences();
    return () => { isActive = false; };
  }, [user?.uid]);

  /** Persist a partial update to the user's preferences doc */
  const savePreferences = async (partial: Record<string, unknown>) => {
    if (!user?.uid) return;
    try {
      await setDoc(
        doc(db, 'users', user.uid, 'preferences', 'settings'),
        { ...partial, updatedAt: serverTimestamp() },
        { merge: true }
      );
    } catch (_err) {
      // Silently fail — local state is already updated
    }
  };

  const handleNotificationChange = (key: keyof typeof notifications, value: boolean) => {
    const updated = { ...notifications, [key]: value };
    setNotifications(updated);
    savePreferences({ notifications: updated });
  };

  const handlePrivacyChange = (key: keyof typeof privacy, value: boolean) => {
    const updated = { ...privacy, [key]: value };
    setPrivacy(updated);
    savePreferences({ privacy: updated });
  };

  const handleLanguageSelect = () => {
    Alert.alert(
      'Изберете език',
      undefined,
      [
        {
          text: 'Български',
          onPress: () => {
            setSelectedLanguage('bg');
            savePreferences({ language: 'bg' });
          }
        },
        {
          text: 'English',
          onPress: () => {
            setSelectedLanguage('en');
            savePreferences({ language: 'en' });
          }
        },
        { text: 'Отказ', style: 'cancel' }
      ]
    );
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Изтриване на акаунт',
      'Това действие е необратимо. Всички ваши обяви и данни ще бъдат премахнати завинаги.',
      [
        { text: 'Отказ', style: 'cancel' },
        {
          text: 'Изтрий',
          style: 'destructive',
          onPress: async () => {
            if (!user?.uid) return;
            try {
              await addDoc(collection(db, 'deletion_requests'), {
                userId: user.uid,
                email: user.email || null,
                reason: 'Потребителят поиска изтриване от настройки',
                status: 'pending',
                createdAt: serverTimestamp()
              });
              Alert.alert(
                'Заявката е изпратена',
                'Вашата заявка за изтриване ще бъде обработена в рамките на 48 часа.'
              );
            } catch (_err) {
              Alert.alert('Грешка', 'Неуспешно изпращане на заявката. Опитайте отново.');
            }
          }
        }
      ]
    );
  };

  return (
    <Container theme={theme}>
      <MobileHeader title="Настройки" back />
      <Content showsVerticalScrollIndicator={false}>

        <SectionTitle theme={theme}>Известия</SectionTitle>
        <Section theme={theme}>
          <SettingRow theme={theme}>
            <SettingInfo>
              <SettingLabel theme={theme}>Push известия</SettingLabel>
              <SettingDescription theme={theme}>Съобщения, намаления и сигнали</SettingDescription>
            </SettingInfo>
            <Switch
              value={notifications.push}
              onValueChange={(v) => handleNotificationChange('push', v)}
              trackColor={{ false: '#ddd', true: theme.colors.primary.main }}
            />
          </SettingRow>
          <SettingRow theme={theme}>
            <SettingInfo>
              <SettingLabel theme={theme}>Имейл известия</SettingLabel>
              <SettingDescription theme={theme}>Седмични обобщения и промени в акаунта</SettingDescription>
            </SettingInfo>
            <Switch
              value={notifications.email}
              onValueChange={(v) => handleNotificationChange('email', v)}
              trackColor={{ false: '#ddd', true: theme.colors.primary.main }}
            />
          </SettingRow>
          <SettingRow theme={theme} last>
            <SettingInfo>
              <SettingLabel theme={theme}>Маркетинг</SettingLabel>
              <SettingDescription theme={theme}>Специални оферти и съвети</SettingDescription>
            </SettingInfo>
            <Switch
              value={notifications.marketing}
              onValueChange={(v) => handleNotificationChange('marketing', v)}
              trackColor={{ false: '#ddd', true: theme.colors.primary.main }}
            />
          </SettingRow>
        </Section>

        <SectionTitle theme={theme}>Поверителност и сигурност</SectionTitle>
        <Section theme={theme}>
          <SettingRow theme={theme}>
            <SettingInfo>
              <SettingLabel theme={theme}>Публичен профил</SettingLabel>
              <SettingDescription theme={theme}>Позволете на другите да виждат вашите обяви</SettingDescription>
            </SettingInfo>
            <Switch
              value={privacy.publicProfile}
              onValueChange={(v) => handlePrivacyChange('publicProfile', v)}
              trackColor={{ false: '#ddd', true: theme.colors.primary.main }}
            />
          </SettingRow>
          <SettingRow theme={theme} last>
            <SettingInfo>
              <SettingLabel theme={theme}>Показване на телефон</SettingLabel>
              <SettingDescription theme={theme}>Показване на контактна информация в обявите</SettingDescription>
            </SettingInfo>
            <Switch
              value={privacy.showPhone}
              onValueChange={(v) => handlePrivacyChange('showPhone', v)}
              disabled={!profile?.phoneNumber}
              trackColor={{ false: '#ddd', true: theme.colors.primary.main }}
            />
          </SettingRow>
        </Section>

        <SectionTitle theme={theme}>Настройки на приложението</SectionTitle>
        <Section theme={theme}>
          <TouchableOpacity onPress={handleLanguageSelect}>
            <SettingRow theme={theme}>
              <SettingLabel theme={theme}>Език</SettingLabel>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <SettingDescription theme={theme}>{selectedLanguage === 'bg' ? 'Български' : 'English'}</SettingDescription>
                <Ionicons name="chevron-forward" size={16} color="#999" style={{ marginLeft: 8 }} />
              </View>
            </SettingRow>
          </TouchableOpacity>
          <SettingRow theme={theme} last>
            <SettingLabel theme={theme}>Тъмен режим</SettingLabel>
            <Switch value={true} disabled trackColor={{ false: '#ddd', true: theme.colors.primary.main }} />
          </SettingRow>
        </Section>

        <SectionTitle theme={theme}>Поддръжка и правни условия</SectionTitle>
        <Section theme={theme}>
          <TouchableOpacity onPress={() => Linking.openURL('https://koli.one/help')}>
            <SettingRow theme={theme}>
              <SettingLabel theme={theme}>Помощен център</SettingLabel>
              <Ionicons name="open-outline" size={18} color="#999" />
            </SettingRow>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.push('/privacy-policy')}>
            <SettingRow theme={theme}>
              <SettingLabel theme={theme}>Политика за поверителност</SettingLabel>
              <Ionicons name="chevron-forward" size={16} color="#999" />
            </SettingRow>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.push('/terms-of-service')}>
            <SettingRow theme={theme}>
              <SettingLabel theme={theme}>Условия за ползване</SettingLabel>
              <Ionicons name="chevron-forward" size={16} color="#999" />
            </SettingRow>
          </TouchableOpacity>
          <SettingRow theme={theme} last>
            <SettingLabel theme={theme}>Версия</SettingLabel>
            <SettingDescription theme={theme}>1.0.0 (Building Build)</SettingDescription>
          </SettingRow>
        </Section>

        <Section theme={theme}>
          <TouchableOpacity onPress={handleDeleteAccount}>
            <SettingRow theme={theme} last>
              <SettingInfo>
                <DangerText theme={theme}>Изтриване на акаунт</DangerText>
                <SettingDescription theme={theme}>Премахване на вашия акаунт и данни завинаги</SettingDescription>
              </SettingInfo>
            </SettingRow>
          </TouchableOpacity>
        </Section>

        <View style={{ height: 40 }} />
      </Content>
    </Container>
  );
}
