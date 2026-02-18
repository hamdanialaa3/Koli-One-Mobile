import React, { useState, useEffect } from 'react';
import { useRouter } from 'expo-router';
import styled from 'styled-components/native';
import { FlatList, RefreshControl, TouchableOpacity, Alert, Switch } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../src/styles/theme';
import { SavedSearchesService, SavedSearch } from '../src/services/SavedSearchesService';
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

const SearchCard = styled.View`
  background-color: ${props => props.theme.colors.background.paper};
  margin: 8px 20px;
  padding: 16px;
  border-radius: 12px;
  border-width: 1px;
  border-color: ${props => props.theme.colors.border.muted};
  shadow-color: #000;
  shadow-offset: 0px 2px;
  shadow-opacity: 0.1;
  shadow-radius: 4px;
  elevation: 2;
`;

const SearchHeader = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
`;

const SearchName = styled.Text`
  font-size: 18px;
  font-weight: 700;
  color: ${props => props.theme.colors.text.primary};
  flex: 1;
`;

const ActionButton = styled.TouchableOpacity`
  width: 36px;
  height: 36px;
  border-radius: 18px;
  background-color: ${props => props.theme.colors.background.default};
  align-items: center;
  justify-content: center;
  margin-left: 8px;
`;

const SearchDescription = styled.Text`
  font-size: 14px;
  color: ${props => props.theme.colors.text.secondary};
  line-height: 20px;
  margin-bottom: 12px;
`;

const SearchFooter = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  padding-top: 12px;
  border-top-width: 1px;
  border-top-color: ${props => props.theme.colors.border.muted};
`;

const NotificationRow = styled.View`
  flex-direction: row;
  align-items: center;
`;

const NotificationText = styled.Text`
  font-size: 14px;
  color: ${props => props.theme.colors.text.secondary};
  margin-right: 8px;
`;

const SearchDate = styled.Text`
  font-size: 12px;
  color: ${props => props.theme.colors.text.disabled};
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
  margin-bottom: 20px;
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

const FAB = styled.TouchableOpacity`
  position: absolute;
  bottom: 24px;
  right: 24px;
  width: 56px;
  height: 56px;
  border-radius: 28px;
  background-color: ${props => props.theme.colors.primary.main};
  align-items: center;
  justify-content: center;
  shadow-color: #000;
  shadow-offset: 0px 4px;
  shadow-opacity: 0.3;
  shadow-radius: 8px;
  elevation: 8;
`;

export default function SavedSearchesScreen() {
    const router = useRouter();
    const { user } = useAuth();
    const [searches, setSearches] = useState<SavedSearch[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        if (user) {
            loadSearches();
        }
    }, [user]);

    const loadSearches = async () => {
        try {
            const data = await SavedSearchesService.getUserSavedSearches();
            setSearches(data);
        } catch (error) {
            logger.error('Error loading saved searches', error);
        } finally {
            setLoading(false);
        }
    };

    const onRefresh = async () => {
        setRefreshing(true);
        await loadSearches();
        setRefreshing(false);
    };

    const handleToggleNotifications = async (search: SavedSearch, enabled: boolean) => {
        try {
            await SavedSearchesService.toggleNotifications(search.id!, enabled);
            setSearches(prev =>
                prev.map(s => s.id === search.id ? { ...s, notificationsEnabled: enabled } : s)
            );
        } catch (error) {
            logger.error('Error toggling notifications', error);
            Alert.alert('Грешка', 'Неуспешно актуализиране на известията');
        }
    };

    const handleDeleteSearch = (search: SavedSearch) => {
        Alert.alert(
            'Изтриване на търсене',
            `Сигурни ли сте, че искате да изтриете "${search.searchName}"?`,
            [
                { text: 'Отказ', style: 'cancel' },
                {
                    text: 'Изтрий',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await SavedSearchesService.deleteSavedSearch(search.id!);
                            setSearches(prev => prev.filter(s => s.id !== search.id));
                        } catch (error) {
                            logger.error('Error deleting search', error);
                            Alert.alert('Грешка', 'Неуспешно изтриване на търсенето');
                        }
                    }
                }
            ]
        );
    };

    const formatDate = (dateString: string): string => {
        const date = new Date(dateString);
        return date.toLocaleDateString('bg-BG', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        });
    };

    const renderSearch = ({ item }: { item: SavedSearch }) => (
        <SearchCard theme={theme}>
            <SearchHeader>
                <SearchName theme={theme}>{item.searchName}</SearchName>
                <ActionButton theme={theme} onPress={() => handleDeleteSearch(item)}>
                    <Ionicons name="trash-outline" size={20} color={theme.colors.status.error} />
                </ActionButton>
            </SearchHeader>

            <SearchDescription theme={theme}>
                {SavedSearchesService.getSearchDescription(item)}
            </SearchDescription>

            <SearchFooter theme={theme}>
                <NotificationRow>
                    <NotificationText theme={theme}>Известия</NotificationText>
                    <Switch
                        value={item.notificationsEnabled}
                        onValueChange={(enabled) => handleToggleNotifications(item, enabled)}
                        trackColor={{ 
                            false: theme.colors.border.muted, 
                            true: theme.colors.primary.light 
                        }}
                        thumbColor={item.notificationsEnabled ? theme.colors.primary.main : '#f4f3f4'}
                    />
                </NotificationRow>
                <SearchDate theme={theme}>
                    Създадено: {formatDate(item.createdAt)}
                </SearchDate>
            </SearchFooter>
        </SearchCard>
    );

    const renderEmpty = () => (
        <EmptyState>
            <EmptyIcon theme={theme}>
                <Ionicons name="bookmark-outline" size={40} color={theme.colors.text.disabled} />
            </EmptyIcon>
            <EmptyTitle theme={theme}>Няма запазени търсения</EmptyTitle>
            <EmptySubtitle theme={theme}>
                Запазете търсене, за да получавате{'\n'}
                известия при спад на цената
            </EmptySubtitle>
            <CreateButton theme={theme} onPress={() => router.push('/(tabs)/search')}>
                <CreateButtonText>Започнете търсене</CreateButtonText>
            </CreateButton>
        </EmptyState>
    );

    return (
        <Container theme={theme}>
            <Header theme={theme}>
                <TouchableOpacity onPress={() => router.back()}>
                    <Ionicons name="chevron-back" size={28} color={theme.colors.text.primary} />
                </TouchableOpacity>
                <HeaderTitle theme={theme}>Запазени търсения</HeaderTitle>
                <TouchableOpacity onPress={() => router.push('/price-alerts' as any)}>
                    <Ionicons name="notifications-outline" size={24} color={theme.colors.primary.main} />
                </TouchableOpacity>
            </Header>

            <FlatList
                data={searches}
                keyExtractor={(item) => item.id!}
                renderItem={renderSearch}
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

            {searches.length > 0 && (
                <FAB theme={theme} onPress={() => router.push('/(tabs)/search')}>
                    <Ionicons name="add" size={28} color="#fff" />
                </FAB>
            )}
        </Container>
    );
}
