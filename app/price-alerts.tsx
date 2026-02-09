import React, { useState, useEffect } from 'react';
import { useRouter } from 'expo-router';
import styled from 'styled-components/native';
import { FlatList, RefreshControl, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../src/styles/theme';
import { SavedSearchesService, PriceAlert } from '../src/services/SavedSearchesService';
import { useAuth } from '../src/contexts/AuthContext';
import { logger } from '../src/services/logger-service';

const Container = styled.SafeAreaView`
  flex: 1;
  background-color: ${props => props.theme.colors.background.default};
`;

const Header = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  background-color: ${props => props.theme.colors.background.paper};
  border-bottom-width: 1px;
  border-bottom-color: ${props => props.theme.colors.border.muted};
`;

const HeaderTitle = styled.Text`
  font-size: 20px;
  font-weight: 700;
  color: ${props => props.theme.colors.text.primary};
`;

const HeaderButton = styled.TouchableOpacity`
  padding: 8px;
`;

const HeaderButtonText = styled.Text`
  font-size: 14px;
  color: ${props => props.theme.colors.primary.main};
  font-weight: 600;
`;

const AlertCard = styled.TouchableOpacity<{ isRead: boolean }>`
  background-color: ${props => props.isRead 
    ? props.theme.colors.background.paper 
    : props.theme.colors.primary.light + '15'};
  margin: 8px 20px;
  padding: 16px;
  border-radius: 12px;
  border-width: ${props => props.isRead ? '1px' : '2px'};
  border-color: ${props => props.isRead 
    ? props.theme.colors.border.muted 
    : props.theme.colors.primary.main};
  shadow-color: #000;
  shadow-offset: 0px 2px;
  shadow-opacity: 0.1;
  shadow-radius: 4px;
  elevation: 2;
`;

const AlertHeader = styled.View`
  flex-direction: row;
  align-items: center;
  margin-bottom: 8px;
`;

const AlertIcon = styled.View`
  width: 40px;
  height: 40px;
  border-radius: 20px;
  background-color: ${props => props.theme.colors.status.success};
  align-items: center;
  justify-content: center;
  margin-right: 12px;
`;

const AlertContent = styled.View`
  flex: 1;
`;

const AlertTitle = styled.Text<{ isRead: boolean }>`
  font-size: 16px;
  font-weight: ${props => props.isRead ? '600' : '700'};
  color: ${props => props.theme.colors.text.primary};
`;

const AlertSubtitle = styled.Text`
  font-size: 14px;
  color: ${props => props.theme.colors.text.secondary};
  margin-top: 2px;
`;

const AlertPriceRow = styled.View`
  flex-direction: row;
  align-items: center;
  margin-top: 12px;
`;

const OldPrice = styled.Text`
  font-size: 16px;
  color: ${props => props.theme.colors.text.disabled};
  text-decoration-line: line-through;
  margin-right: 12px;
`;

const NewPrice = styled.Text`
  font-size: 18px;
  font-weight: 700;
  color: ${props => props.theme.colors.status.success};
  margin-right: 8px;
`;

const DiscountBadge = styled.View`
  background-color: ${props => props.theme.colors.status.success};
  padding: 4px 8px;
  border-radius: 4px;
`;

const DiscountText = styled.Text`
  font-size: 12px;
  font-weight: 700;
  color: #fff;
`;

const AlertTime = styled.Text`
  font-size: 12px;
  color: ${props => props.theme.colors.text.disabled};
  margin-top: 8px;
`;

const EmptyState = styled.View`
  flex: 1;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
`;

const EmptyIcon = styled.View`
  width: 80px;
  height: 80px;
  border-radius: 40px;
  background-color: ${props => props.theme.colors.background.paper};
  align-items: center;
  justify-content: center;
  margin-bottom: 16px;
`;

const EmptyTitle = styled.Text`
  font-size: 18px;
  font-weight: 700;
  color: ${props => props.theme.colors.text.primary};
  margin-bottom: 8px;
`;

const EmptySubtitle = styled.Text`
  font-size: 14px;
  color: ${props => props.theme.colors.text.secondary};
  text-align: center;
`;

const CreateButton = styled.TouchableOpacity`
  background-color: ${props => props.theme.colors.primary.main};
  padding: 12px 24px;
  border-radius: 8px;
  margin-top: 20px;
`;

const CreateButtonText = styled.Text`
  font-size: 16px;
  font-weight: 600;
  color: #fff;
`;

export default function PriceAlertsScreen() {
    const router = useRouter();
    const { user } = useAuth();
    const [alerts, setAlerts] = useState<PriceAlert[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        if (user) {
            loadAlerts();
        }
    }, [user]);

    const loadAlerts = async () => {
        try {
            const data = await SavedSearchesService.getUserPriceAlerts();
            setAlerts(data);
        } catch (error) {
            logger.error('Error loading price alerts', error);
        } finally {
            setLoading(false);
        }
    };

    const onRefresh = async () => {
        setRefreshing(true);
        await loadAlerts();
        setRefreshing(false);
    };

    const handleAlertPress = async (alert: PriceAlert) => {
        // Mark as read
        if (!alert.isRead) {
            await SavedSearchesService.markAlertAsRead(alert.id!);
            setAlerts(prev => 
                prev.map(a => a.id === alert.id ? { ...a, isRead: true } : a)
            );
        }

        // Navigate to car details
        router.push(`/car/${alert.carId}`);
    };

    const handleMarkAllRead = async () => {
        try {
            await SavedSearchesService.markAllAlertsAsRead();
            setAlerts(prev => prev.map(a => ({ ...a, isRead: true })));
        } catch (error) {
            logger.error('Error marking all alerts as read', error);
        }
    };

    const formatTime = (dateString: string): string => {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 60) {
            return `Преди ${diffMins} мин`;
        } else if (diffHours < 24) {
            return `Преди ${diffHours} ч`;
        } else if (diffDays < 7) {
            return `Преди ${diffDays} дни`;
        } else {
            return date.toLocaleDateString('bg-BG', { 
                day: 'numeric', 
                month: 'short' 
            });
        }
    };

    const renderAlert = ({ item }: { item: PriceAlert }) => (
        <AlertCard
            theme={theme}
            isRead={item.isRead}
            onPress={() => handleAlertPress(item)}
            activeOpacity={0.7}
        >
            <AlertHeader>
                <AlertIcon theme={theme}>
                    <Ionicons name="trending-down" size={24} color="#fff" />
                </AlertIcon>
                <AlertContent>
                    <AlertTitle theme={theme} isRead={item.isRead}>
                        {item.carMake} {item.carModel}
                    </AlertTitle>
                    <AlertSubtitle theme={theme}>
                        Спад на цената
                    </AlertSubtitle>
                </AlertContent>
            </AlertHeader>

            <AlertPriceRow>
                <OldPrice theme={theme}>€{item.oldPrice.toLocaleString()}</OldPrice>
                <NewPrice theme={theme}>€{item.newPrice.toLocaleString()}</NewPrice>
                <DiscountBadge theme={theme}>
                    <DiscountText>-{item.discountPercent}%</DiscountText>
                </DiscountBadge>
            </AlertPriceRow>

            <AlertTime theme={theme}>
                {formatTime(item.createdAt)}
            </AlertTime>
        </AlertCard>
    );

    const renderEmpty = () => (
        <EmptyState>
            <EmptyIcon theme={theme}>
                <Ionicons name="notifications-off-outline" size={40} color={theme.colors.text.disabled} />
            </EmptyIcon>
            <EmptyTitle theme={theme}>Няма ценови тревоги</EmptyTitle>
            <EmptySubtitle theme={theme}>
                Запазете търсене, за да получавате известия{'\n'}
                когато цената на кола спадне
            </EmptySubtitle>
            <CreateButton theme={theme} onPress={() => router.push('/saved-searches' as any)}>
                <CreateButtonText>Запазване на търсене</CreateButtonText>
            </CreateButton>
        </EmptyState>
    );

    const unreadCount = alerts.filter(a => !a.isRead).length;

    return (
        <Container theme={theme}>
            <Header theme={theme}>
                <TouchableOpacity onPress={() => router.back()}>
                    <Ionicons name="chevron-back" size={28} color={theme.colors.text.primary} />
                </TouchableOpacity>
                <HeaderTitle theme={theme}>
                    Ценови тревоги {unreadCount > 0 && `(${unreadCount})`}
                </HeaderTitle>
                {alerts.length > 0 && unreadCount > 0 && (
                    <HeaderButton onPress={handleMarkAllRead}>
                        <HeaderButtonText theme={theme}>Маркирай всички</HeaderButtonText>
                    </HeaderButton>
                )}
            </Header>

            <FlatList
                data={alerts}
                keyExtractor={(item) => item.id!}
                renderItem={renderAlert}
                contentContainerStyle={{ 
                    paddingVertical: 8,
                    flexGrow: 1 
                }}
                ListEmptyComponent={renderEmpty}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        tintColor={theme.colors.primary.main}
                    />
                }
            />
        </Container>
    );
}
