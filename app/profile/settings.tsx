import React, { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components/native';
import { MobileHeader } from '../../src/components/common/MobileHeader';
import { theme } from '../../src/styles/theme';
import {
  View,
  Switch,
  TouchableOpacity,
  Alert,
  Platform,
  Linking,
  Appearance,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../src/contexts/AuthContext';
import { useLanguage } from '../../src/contexts/LanguageContext';
import { useRouter } from 'expo-router';
import { doc, getDoc, setDoc, addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '../../src/services/firebase';
import Constants from 'expo-constants';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Image } from 'react-native';

// ─── Styled Components ───────────────────────────

const Container = styled.SafeAreaView`
  flex: 1;
  background-color: ${(p: any) => p.theme.colors.background.default};
`;

const Content = styled.ScrollView`
  flex: 1;
`;

const Section = styled.View`
  background-color: ${(p: any) => p.theme.colors.background.paper};
  margin-bottom: 24px;
  border-top-width: 1px;
  border-top-color: ${(p: any) => p.theme.colors.border.muted};
  border-bottom-width: 1px;
  border-bottom-color: ${(p: any) => p.theme.colors.border.muted};
`;

const SectionTitle = styled.Text`
  font-size: 12px;
  font-weight: 700;
  color: ${(p: any) => p.theme.colors.text.secondary};
  text-transform: uppercase;
  margin: 16px 20px 8px;
  letter-spacing: 1px;
`;

const SettingRow = styled.View<{ last?: boolean }>`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-bottom-width: ${(p: any) => (p.last ? '0px' : '1px')};
  border-bottom-color: ${(p: any) => p.theme.colors.border.muted};
`;

const SettingInfo = styled.View`
  flex: 1;
  margin-right: 12px;
`;

const SettingLabel = styled.Text`
  font-size: 16px;
  font-weight: 600;
  color: ${(p: any) => p.theme.colors.text.primary};
`;

const SettingDescription = styled.Text`
  font-size: 13px;
  color: ${(p: any) => p.theme.colors.text.secondary};
  margin-top: 2px;
`;

const DangerText = styled.Text`
  color: ${(p: any) => p.theme.colors.status.error};
  font-weight: 600;
  font-size: 16px;
`;

const IconBox = styled.View`
  width: 32px;
  height: 32px;
  border-radius: 8px;
  justify-content: center;
  align-items: center;
  margin-right: 12px;
`;

const SegmentContainer = styled.View`
  flex-direction: row;
  background-color: ${(p: any) => p.theme.colors.background.subtle};
  border-radius: 10px;
  padding: 2px;
`;

const SegmentButton = styled.TouchableOpacity<{ active?: boolean }>`
  padding: 8px 16px;
  border-radius: 8px;
  background-color: ${(p: any) =>
    p.active ? p.theme.colors.primary.main : 'transparent'};
`;

const SegmentText = styled.Text<{ active?: boolean }>`
  font-size: 13px;
  font-weight: 700;
  color: ${(p: any) =>
    p.active ? '#FFFFFF' : p.theme.colors.text.secondary};
`;

const BadgeText = styled.Text`
  font-size: 13px;
  font-weight: 600;
  color: ${(p: any) => p.theme.colors.text.secondary};
`;

const FooterNote = styled.Text`
  text-align: center;
  font-size: 12px;
  color: ${(p: any) => p.theme.colors.text.tertiary};
  padding: 0 20px;
  margin-bottom: 8px;
`;

// ─── Types ───────────────────────────────────────

type ThemeMode = 'system' | 'light' | 'dark';
type Currency = 'EUR' | 'BGN' | 'USD';
type Units = 'km' | 'mi';

// ─── Settings Screen ─────────────────────────────

export default function SettingsScreen() {
  const { user, profile, signOut } = useAuth();
  const { language, setLanguage } = useLanguage();
  const router = useRouter();

  // ── State ──
  const [themeMode, setThemeMode] = useState<ThemeMode>('system');
  const [currency, setCurrency] = useState<Currency>('EUR');
  const [units, setUnits] = useState<Units>('km');

  const [notifications, setNotifications] = useState({
    push: true,
    email: true,
    priceAlerts: true,
    marketing: false,
  });

  const [privacy, setPrivacy] = useState({
    publicProfile: true,
    showPhone: !!profile?.phoneNumber,
    activityStatus: true,
  });

  const appVersion = Constants.expoConfig?.version ?? '1.0.0';

  // ── Load saved preferences ──
  useEffect(() => {
    if (!user?.uid) return;
    let active = true;

    const load = async () => {
      try {
        const snap = await getDoc(
          doc(db, 'users', user.uid, 'preferences', 'settings')
        );
        if (!active || !snap.exists()) return;
        const d = snap.data();
        if (d.notifications)
          setNotifications((prev) => ({ ...prev, ...d.notifications }));
        if (d.privacy) setPrivacy((prev) => ({ ...prev, ...d.privacy }));
        if (d.themeMode) setThemeMode(d.themeMode);
        if (d.currency) setCurrency(d.currency);
        if (d.units) setUnits(d.units);
        if (d.language) setLanguage(d.language);
      } catch {
        /* use defaults */
      }
    };
    load();
    return () => {
      active = false;
    };
  }, [user?.uid]);

  // ── Persist helper ──
  const save = useCallback(
    async (partial: Record<string, unknown>) => {
      if (!user?.uid) return;
      try {
        await setDoc(
          doc(db, 'users', user.uid, 'preferences', 'settings'),
          { ...partial, updatedAt: serverTimestamp() },
          { merge: true }
        );
      } catch {
        /* silent */
      }
    },
    [user?.uid]
  );

  // ── Handlers ──

  const handleThemeChange = (mode: ThemeMode) => {
    setThemeMode(mode);
    save({ themeMode: mode });
    // Apply immediately via RN Appearance API
    if (mode === 'system') {
      Appearance.setColorScheme(null);
    } else {
      Appearance.setColorScheme(mode);
    }
  };

  const handleLanguageChange = (lang: 'bg' | 'en') => {
    setLanguage(lang);
    save({ language: lang });
  };

  const handleCurrencyChange = (cur: Currency) => {
    setCurrency(cur);
    save({ currency: cur });
  };

  const handleUnitsChange = (u: Units) => {
    setUnits(u);
    save({ units: u });
  };

  const handleNotificationChange = (
    key: keyof typeof notifications,
    value: boolean
  ) => {
    const updated = { ...notifications, [key]: value };
    setNotifications(updated);
    save({ notifications: updated });
  };

  const handlePrivacyChange = (
    key: keyof typeof privacy,
    value: boolean
  ) => {
    const updated = { ...privacy, [key]: value };
    setPrivacy(updated);
    save({ privacy: updated });
  };

  const handleClearCache = () => {
    Alert.alert(
      language === 'bg' ? 'Изчистване на кеш' : 'Clear Cache',
      language === 'bg'
        ? 'Това ще изтрие временните файлове. Сигурни ли сте?'
        : 'This will delete temporary files. Are you sure?',
      [
        { text: language === 'bg' ? 'Отказ' : 'Cancel', style: 'cancel' },
        {
          text: language === 'bg' ? 'Изчисти' : 'Clear',
          style: 'destructive',
          onPress: async () => {
            try {
              await AsyncStorage.clear();
              // Clear image caches if available
              if (typeof (Image as any).clearDiskCache === 'function') {
                await (Image as any).clearDiskCache();
              }
              if (typeof (Image as any).clearMemoryCache === 'function') {
                await (Image as any).clearMemoryCache();
              }
              Alert.alert(
                '✓',
                language === 'bg'
                  ? 'Кешът е изчистен успешно.'
                  : 'Cache cleared successfully.'
              );
            } catch (error) {
              Alert.alert(
                language === 'bg' ? 'Грешка' : 'Error',
                language === 'bg'
                  ? 'Неуспешно изчистване на кеша.'
                  : 'Failed to clear cache.'
              );
            }
          },
        },
      ]
    );
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      language === 'bg' ? 'Изтриване на акаунт' : 'Delete Account',
      language === 'bg'
        ? 'Това действие е необратимо. Всички ваши обяви и данни ще бъдат премахнати завинаги.'
        : 'This action is irreversible. All your listings and data will be permanently removed.',
      [
        { text: language === 'bg' ? 'Отказ' : 'Cancel', style: 'cancel' },
        {
          text: language === 'bg' ? 'Изтрий' : 'Delete',
          style: 'destructive',
          onPress: async () => {
            if (!user?.uid) return;
            try {
              await addDoc(collection(db, 'deletion_requests'), {
                userId: user.uid,
                email: user.email || null,
                reason: 'User requested deletion from settings',
                status: 'pending',
                createdAt: serverTimestamp(),
              });
              Alert.alert(
                language === 'bg' ? 'Заявката е изпратена' : 'Request Sent',
                language === 'bg'
                  ? 'Вашата заявка ще бъде обработена в рамките на 48 часа.'
                  : 'Your request will be processed within 48 hours.'
              );
            } catch {
              Alert.alert(
                language === 'bg' ? 'Грешка' : 'Error',
                language === 'bg'
                  ? 'Неуспешно изпращане. Опитайте отново.'
                  : 'Failed to send. Please try again.'
              );
            }
          },
        },
      ]
    );
  };

  const handleSignOut = () => {
    Alert.alert(
      language === 'bg' ? 'Излизане' : 'Sign Out',
      language === 'bg'
        ? 'Сигурни ли сте, че искате да излезете?'
        : 'Are you sure you want to sign out?',
      [
        { text: language === 'bg' ? 'Отказ' : 'Cancel', style: 'cancel' },
        {
          text: language === 'bg' ? 'Излизане' : 'Sign Out',
          style: 'destructive',
          onPress: signOut,
        },
      ]
    );
  };

  // ── Labels (bilingual) ──
  const t = {
    title: language === 'bg' ? 'Настройки' : 'Settings',
    appearance: language === 'bg' ? 'Външен вид' : 'Appearance',
    theme: language === 'bg' ? 'Тема' : 'Theme',
    system: language === 'bg' ? 'Системна' : 'System',
    light: language === 'bg' ? 'Светла' : 'Light',
    dark: language === 'bg' ? 'Тъмна' : 'Dark',
    language: language === 'bg' ? 'Език' : 'Language',
    regional: language === 'bg' ? 'Регионални настройки' : 'Regional',
    currency: language === 'bg' ? 'Валута' : 'Currency',
    units: language === 'bg' ? 'Мерни единици' : 'Distance Units',
    notifications: language === 'bg' ? 'Известия' : 'Notifications',
    push: language === 'bg' ? 'Push известия' : 'Push Notifications',
    pushDesc:
      language === 'bg'
        ? 'Съобщения, намаления и сигнали'
        : 'Messages, deals and alerts',
    emailNotif: language === 'bg' ? 'Имейл известия' : 'Email Notifications',
    emailDesc:
      language === 'bg'
        ? 'Седмични обобщения и промени'
        : 'Weekly summaries and changes',
    priceAlerts:
      language === 'bg' ? 'Ценови сигнали' : 'Price Drop Alerts',
    priceAlertsDesc:
      language === 'bg'
        ? 'Известия при намаление на цените'
        : 'Get notified when prices drop',
    marketing: language === 'bg' ? 'Маркетинг' : 'Marketing',
    marketingDesc:
      language === 'bg'
        ? 'Специални оферти и съвети'
        : 'Special offers and tips',
    privacySecurity:
      language === 'bg'
        ? 'Поверителност и сигурност'
        : 'Privacy & Security',
    publicProfile:
      language === 'bg' ? 'Публичен профил' : 'Public Profile',
    publicProfileDesc:
      language === 'bg'
        ? 'Позволете на другите да виждат профила ви'
        : 'Allow others to see your profile',
    showPhone:
      language === 'bg' ? 'Показване на телефон' : 'Show Phone Number',
    showPhoneDesc:
      language === 'bg'
        ? 'В обявите ви'
        : 'Display in your listings',
    activityStatus:
      language === 'bg' ? 'Статус на активност' : 'Activity Status',
    activityStatusDesc:
      language === 'bg'
        ? 'Показва кога сте онлайн'
        : 'Shows when you are online',
    data: language === 'bg' ? 'Данни и съхранение' : 'Data & Storage',
    clearCache: language === 'bg' ? 'Изчистване на кеш' : 'Clear Cache',
    clearCacheDesc:
      language === 'bg'
        ? 'Освобождаване на дисково пространство'
        : 'Free up storage space',
    support:
      language === 'bg'
        ? 'Поддръжка и правни условия'
        : 'Support & Legal',
    helpCenter: language === 'bg' ? 'Помощен център' : 'Help Center',
    privacyPolicy:
      language === 'bg'
        ? 'Политика за поверителност'
        : 'Privacy Policy',
    terms:
      language === 'bg' ? 'Условия за ползване' : 'Terms of Service',
    dataDeletion:
      language === 'bg' ? 'Изтриване на данни' : 'Data Deletion',
    rateApp: language === 'bg' ? 'Оценете приложението' : 'Rate App',
    version: language === 'bg' ? 'Версия' : 'Version',
    account: language === 'bg' ? 'Акаунт' : 'Account',
    signOut: language === 'bg' ? 'Излизане' : 'Sign Out',
    deleteAccount:
      language === 'bg' ? 'Изтриване на акаунт' : 'Delete Account',
    deleteAccountDesc:
      language === 'bg'
        ? 'Премахване на акаунта и данните ви завинаги'
        : 'Permanently remove your account and data',
  };

  // ── Render ──

  const switchTrack = { false: '#ddd', true: theme.colors.primary.main };

  return (
    <Container theme={theme}>
      <MobileHeader title={t.title} back />
      <Content showsVerticalScrollIndicator={false}>
        {/* ───── Appearance ───── */}
        <SectionTitle theme={theme}>{t.appearance}</SectionTitle>
        <Section theme={theme}>
          <SettingRow theme={theme}>
            <IconBox style={{ backgroundColor: '#5856D6' + '22' }}>
              <Ionicons name="color-palette-outline" size={18} color="#5856D6" />
            </IconBox>
            <SettingInfo>
              <SettingLabel theme={theme}>{t.theme}</SettingLabel>
            </SettingInfo>
            <SegmentContainer theme={theme}>
              {(['system', 'light', 'dark'] as ThemeMode[]).map((m) => (
                <SegmentButton
                  key={m}
                  theme={theme}
                  active={themeMode === m}
                  onPress={() => handleThemeChange(m)}
                >
                  <SegmentText theme={theme} active={themeMode === m}>
                    {m === 'system'
                      ? t.system
                      : m === 'light'
                        ? t.light
                        : t.dark}
                  </SegmentText>
                </SegmentButton>
              ))}
            </SegmentContainer>
          </SettingRow>
          <SettingRow theme={theme} last>
            <IconBox style={{ backgroundColor: '#FF9500' + '22' }}>
              <Ionicons name="language-outline" size={18} color="#FF9500" />
            </IconBox>
            <SettingInfo>
              <SettingLabel theme={theme}>{t.language}</SettingLabel>
            </SettingInfo>
            <SegmentContainer theme={theme}>
              {(['bg', 'en'] as const).map((l) => (
                <SegmentButton
                  key={l}
                  theme={theme}
                  active={language === l}
                  onPress={() => handleLanguageChange(l)}
                >
                  <SegmentText theme={theme} active={language === l}>
                    {l === 'bg' ? '🇧🇬 БГ' : '🇬🇧 EN'}
                  </SegmentText>
                </SegmentButton>
              ))}
            </SegmentContainer>
          </SettingRow>
        </Section>

        {/* ───── Regional ───── */}
        <SectionTitle theme={theme}>{t.regional}</SectionTitle>
        <Section theme={theme}>
          <SettingRow theme={theme}>
            <IconBox style={{ backgroundColor: '#34C759' + '22' }}>
              <Ionicons name="cash-outline" size={18} color="#34C759" />
            </IconBox>
            <SettingInfo>
              <SettingLabel theme={theme}>{t.currency}</SettingLabel>
            </SettingInfo>
            <SegmentContainer theme={theme}>
              {(['EUR', 'BGN', 'USD'] as Currency[]).map((c) => (
                <SegmentButton
                  key={c}
                  theme={theme}
                  active={currency === c}
                  onPress={() => handleCurrencyChange(c)}
                >
                  <SegmentText theme={theme} active={currency === c}>
                    {c}
                  </SegmentText>
                </SegmentButton>
              ))}
            </SegmentContainer>
          </SettingRow>
          <SettingRow theme={theme} last>
            <IconBox style={{ backgroundColor: '#007AFF' + '22' }}>
              <Ionicons name="speedometer-outline" size={18} color="#007AFF" />
            </IconBox>
            <SettingInfo>
              <SettingLabel theme={theme}>{t.units}</SettingLabel>
            </SettingInfo>
            <SegmentContainer theme={theme}>
              {(['km', 'mi'] as Units[]).map((u) => (
                <SegmentButton
                  key={u}
                  theme={theme}
                  active={units === u}
                  onPress={() => handleUnitsChange(u)}
                >
                  <SegmentText theme={theme} active={units === u}>
                    {u.toUpperCase()}
                  </SegmentText>
                </SegmentButton>
              ))}
            </SegmentContainer>
          </SettingRow>
        </Section>

        {/* ───── Notifications ───── */}
        <SectionTitle theme={theme}>{t.notifications}</SectionTitle>
        <Section theme={theme}>
          <SettingRow theme={theme}>
            <IconBox style={{ backgroundColor: '#FF3B30' + '22' }}>
              <Ionicons name="notifications-outline" size={18} color="#FF3B30" />
            </IconBox>
            <SettingInfo>
              <SettingLabel theme={theme}>{t.push}</SettingLabel>
              <SettingDescription theme={theme}>{t.pushDesc}</SettingDescription>
            </SettingInfo>
            <Switch
              value={notifications.push}
              onValueChange={(v) => handleNotificationChange('push', v)}
              trackColor={switchTrack}
            />
          </SettingRow>
          <SettingRow theme={theme}>
            <IconBox style={{ backgroundColor: '#5856D6' + '22' }}>
              <Ionicons name="mail-outline" size={18} color="#5856D6" />
            </IconBox>
            <SettingInfo>
              <SettingLabel theme={theme}>{t.emailNotif}</SettingLabel>
              <SettingDescription theme={theme}>{t.emailDesc}</SettingDescription>
            </SettingInfo>
            <Switch
              value={notifications.email}
              onValueChange={(v) => handleNotificationChange('email', v)}
              trackColor={switchTrack}
            />
          </SettingRow>
          <SettingRow theme={theme}>
            <IconBox style={{ backgroundColor: '#FF9500' + '22' }}>
              <Ionicons name="trending-down-outline" size={18} color="#FF9500" />
            </IconBox>
            <SettingInfo>
              <SettingLabel theme={theme}>{t.priceAlerts}</SettingLabel>
              <SettingDescription theme={theme}>
                {t.priceAlertsDesc}
              </SettingDescription>
            </SettingInfo>
            <Switch
              value={notifications.priceAlerts}
              onValueChange={(v) =>
                handleNotificationChange('priceAlerts', v)
              }
              trackColor={switchTrack}
            />
          </SettingRow>
          <SettingRow theme={theme} last>
            <IconBox style={{ backgroundColor: '#34C759' + '22' }}>
              <Ionicons name="megaphone-outline" size={18} color="#34C759" />
            </IconBox>
            <SettingInfo>
              <SettingLabel theme={theme}>{t.marketing}</SettingLabel>
              <SettingDescription theme={theme}>
                {t.marketingDesc}
              </SettingDescription>
            </SettingInfo>
            <Switch
              value={notifications.marketing}
              onValueChange={(v) =>
                handleNotificationChange('marketing', v)
              }
              trackColor={switchTrack}
            />
          </SettingRow>
        </Section>

        {/* ───── Privacy ───── */}
        <SectionTitle theme={theme}>{t.privacySecurity}</SectionTitle>
        <Section theme={theme}>
          <SettingRow theme={theme}>
            <IconBox style={{ backgroundColor: '#007AFF' + '22' }}>
              <Ionicons name="person-outline" size={18} color="#007AFF" />
            </IconBox>
            <SettingInfo>
              <SettingLabel theme={theme}>{t.publicProfile}</SettingLabel>
              <SettingDescription theme={theme}>
                {t.publicProfileDesc}
              </SettingDescription>
            </SettingInfo>
            <Switch
              value={privacy.publicProfile}
              onValueChange={(v) =>
                handlePrivacyChange('publicProfile', v)
              }
              trackColor={switchTrack}
            />
          </SettingRow>
          <SettingRow theme={theme}>
            <IconBox style={{ backgroundColor: '#34C759' + '22' }}>
              <Ionicons name="call-outline" size={18} color="#34C759" />
            </IconBox>
            <SettingInfo>
              <SettingLabel theme={theme}>{t.showPhone}</SettingLabel>
              <SettingDescription theme={theme}>
                {t.showPhoneDesc}
              </SettingDescription>
            </SettingInfo>
            <Switch
              value={privacy.showPhone}
              onValueChange={(v) => handlePrivacyChange('showPhone', v)}
              disabled={!profile?.phoneNumber}
              trackColor={switchTrack}
            />
          </SettingRow>
          <SettingRow theme={theme} last>
            <IconBox style={{ backgroundColor: '#FF9500' + '22' }}>
              <Ionicons name="radio-outline" size={18} color="#FF9500" />
            </IconBox>
            <SettingInfo>
              <SettingLabel theme={theme}>{t.activityStatus}</SettingLabel>
              <SettingDescription theme={theme}>
                {t.activityStatusDesc}
              </SettingDescription>
            </SettingInfo>
            <Switch
              value={privacy.activityStatus}
              onValueChange={(v) =>
                handlePrivacyChange('activityStatus', v)
              }
              trackColor={switchTrack}
            />
          </SettingRow>
        </Section>

        {/* ───── Data ───── */}
        <SectionTitle theme={theme}>{t.data}</SectionTitle>
        <Section theme={theme}>
          <TouchableOpacity onPress={handleClearCache}>
            <SettingRow theme={theme} last>
              <IconBox style={{ backgroundColor: '#FF3B30' + '22' }}>
                <Ionicons name="trash-outline" size={18} color="#FF3B30" />
              </IconBox>
              <SettingInfo>
                <SettingLabel theme={theme}>{t.clearCache}</SettingLabel>
                <SettingDescription theme={theme}>
                  {t.clearCacheDesc}
                </SettingDescription>
              </SettingInfo>
              <Ionicons
                name="chevron-forward"
                size={16}
                color={theme.colors.text.disabled}
              />
            </SettingRow>
          </TouchableOpacity>
        </Section>

        {/* ───── Support & Legal ───── */}
        <SectionTitle theme={theme}>{t.support}</SectionTitle>
        <Section theme={theme}>
          <TouchableOpacity onPress={() => router.push('/help')}>
            <SettingRow theme={theme}>
              <IconBox style={{ backgroundColor: '#007AFF' + '22' }}>
                <Ionicons
                  name="help-circle-outline"
                  size={18}
                  color="#007AFF"
                />
              </IconBox>
              <SettingInfo>
                <SettingLabel theme={theme}>{t.helpCenter}</SettingLabel>
              </SettingInfo>
              <Ionicons
                name="chevron-forward"
                size={16}
                color={theme.colors.text.disabled}
              />
            </SettingRow>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => router.push('/privacy-policy')}>
            <SettingRow theme={theme}>
              <IconBox style={{ backgroundColor: '#5856D6' + '22' }}>
                <Ionicons
                  name="shield-checkmark-outline"
                  size={18}
                  color="#5856D6"
                />
              </IconBox>
              <SettingInfo>
                <SettingLabel theme={theme}>{t.privacyPolicy}</SettingLabel>
              </SettingInfo>
              <Ionicons
                name="chevron-forward"
                size={16}
                color={theme.colors.text.disabled}
              />
            </SettingRow>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.push('/terms-of-service')}
          >
            <SettingRow theme={theme}>
              <IconBox style={{ backgroundColor: '#FF9500' + '22' }}>
                <Ionicons
                  name="document-text-outline"
                  size={18}
                  color="#FF9500"
                />
              </IconBox>
              <SettingInfo>
                <SettingLabel theme={theme}>{t.terms}</SettingLabel>
              </SettingInfo>
              <Ionicons
                name="chevron-forward"
                size={16}
                color={theme.colors.text.disabled}
              />
            </SettingRow>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => router.push('/data-deletion')}>
            <SettingRow theme={theme}>
              <IconBox style={{ backgroundColor: '#FF3B30' + '22' }}>
                <Ionicons
                  name="close-circle-outline"
                  size={18}
                  color="#FF3B30"
                />
              </IconBox>
              <SettingInfo>
                <SettingLabel theme={theme}>{t.dataDeletion}</SettingLabel>
              </SettingInfo>
              <Ionicons
                name="chevron-forward"
                size={16}
                color={theme.colors.text.disabled}
              />
            </SettingRow>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => {
              const storeUrl =
                Platform.OS === 'ios'
                  ? 'https://apps.apple.com/app/koli-one/id0000000000' // Replace with real ID
                  : 'https://play.google.com/store/apps/details?id=com.hamdani.kolione';
              Linking.openURL(storeUrl);
            }}
          >
            <SettingRow theme={theme}>
              <IconBox style={{ backgroundColor: '#34C759' + '22' }}>
                <Ionicons name="star-outline" size={18} color="#34C759" />
              </IconBox>
              <SettingInfo>
                <SettingLabel theme={theme}>{t.rateApp}</SettingLabel>
              </SettingInfo>
              <Ionicons name="open-outline" size={16} color={theme.colors.text.disabled} />
            </SettingRow>
          </TouchableOpacity>

          <SettingRow theme={theme} last>
            <IconBox style={{ backgroundColor: '#8E8E93' + '22' }}>
              <Ionicons
                name="information-circle-outline"
                size={18}
                color="#8E8E93"
              />
            </IconBox>
            <SettingInfo>
              <SettingLabel theme={theme}>{t.version}</SettingLabel>
            </SettingInfo>
            <BadgeText theme={theme}>{appVersion}</BadgeText>
          </SettingRow>
        </Section>

        {/* ───── Admin (visible to all for now — add role check if needed) ───── */}
        {user && (
          <>
            <SectionTitle theme={theme}>
              {language === 'bg' ? 'Администрация' : 'Admin'}
            </SectionTitle>
            <Section theme={theme}>
              <TouchableOpacity
                onPress={() => router.push('/profile/admin-sections' as any)}
              >
                <SettingRow theme={theme} last>
                  <IconBox style={{ backgroundColor: '#7B2FBE' + '22' }}>
                    <Ionicons name="grid-outline" size={18} color="#7B2FBE" />
                  </IconBox>
                  <SettingInfo>
                    <SettingLabel theme={theme}>
                      {language === 'bg'
                        ? 'Управление на секции'
                        : 'Section Manager'}
                    </SettingLabel>
                    <SettingDescription theme={theme}>
                      {language === 'bg'
                        ? 'Показване/скриване на секции от началната страница'
                        : 'Show/hide homepage sections'}
                    </SettingDescription>
                  </SettingInfo>
                  <Ionicons
                    name="chevron-forward"
                    size={16}
                    color={theme.colors.text.disabled}
                  />
                </SettingRow>
              </TouchableOpacity>
            </Section>
          </>
        )}

        {/* ───── Account Zone ───── */}
        {user && (
          <>
            <SectionTitle theme={theme}>{t.account}</SectionTitle>
            <Section theme={theme}>
              <TouchableOpacity onPress={handleSignOut}>
                <SettingRow theme={theme}>
                  <IconBox style={{ backgroundColor: '#FF9500' + '22' }}>
                    <Ionicons name="log-out-outline" size={18} color="#FF9500" />
                  </IconBox>
                  <SettingInfo>
                    <SettingLabel theme={theme}>{t.signOut}</SettingLabel>
                  </SettingInfo>
                  <Ionicons
                    name="chevron-forward"
                    size={16}
                    color={theme.colors.text.disabled}
                  />
                </SettingRow>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleDeleteAccount}>
                <SettingRow theme={theme} last>
                  <IconBox
                    style={{
                      backgroundColor:
                        theme.colors.status.error + '22',
                    }}
                  >
                    <Ionicons
                      name="warning-outline"
                      size={18}
                      color={theme.colors.status.error}
                    />
                  </IconBox>
                  <SettingInfo>
                    <DangerText theme={theme}>{t.deleteAccount}</DangerText>
                    <SettingDescription theme={theme}>
                      {t.deleteAccountDesc}
                    </SettingDescription>
                  </SettingInfo>
                </SettingRow>
              </TouchableOpacity>
            </Section>
          </>
        )}

        <FooterNote theme={theme}>
          Koli One © {new Date().getFullYear()} • Made with ❤️
        </FooterNote>
        <View style={{ height: 40 }} />
      </Content>
    </Container>
  );
}
