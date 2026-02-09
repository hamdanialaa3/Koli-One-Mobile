import React, { useEffect, useState } from 'react';
import styled from 'styled-components/native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../src/contexts/AuthContext';
import { MobileHeader } from '../../src/components/common/MobileHeader';
import { theme } from '../../src/styles/theme';
import { FlatList, RefreshControl, View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../src/services/firebase';

const Container = styled.SafeAreaView`
  flex: 1;
  background-color: ${props => props.theme.colors.background.default};
`;

const Content = styled.View`
  flex: 1;
  padding: 16px;
`;

const SearchCard = styled.TouchableOpacity`
  background-color: ${props => props.theme.colors.background.paper};
  border-radius: 16px;
  padding: 16px;
  margin-bottom: 12px;
  border-width: 1px;
  border-color: ${props => props.theme.colors.border.muted};
`;

const SearchHeader = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
`;

const SearchName = styled.Text`
  font-size: 16px;
  font-weight: 700;
  color: ${props => props.theme.colors.text.primary};
`;

const FilterChip = styled.View`
  background-color: ${props => props.theme.colors.primary.main}15;
  padding: 4px 8px;
  border-radius: 6px;
  align-self: flex-start;
  margin-right: 6px;
  margin-bottom: 4px;
`;

const FilterText = styled.Text`
  font-size: 11px;
  color: ${props => props.theme.colors.primary.main};
  font-weight: 700;
`;

const FilterRow = styled.View`
  flex-direction: row;
  flex-wrap: wrap;
`;

const EmptyState = styled.View`
  flex: 1;
  justify-content: center;
  align-items: center;
  padding: 40px;
`;

export default function SavedSearchesScreen() {
    const { user } = useAuth();
    const router = useRouter();
    const [searches, setSearches] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchSearches = async () => {
        if (!user) return;
        try {
            const q = query(
                collection(db, 'users', user.uid, 'savedSearches')
            );
            const snap = await getDocs(q);
            const data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setSearches(data);
        } catch (error) {
            console.error("Error fetching saved searches:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSearches();
    }, [user]);

    const handleSearchPress = (filters: any) => {
        router.push({
            pathname: '/(tabs)/search',
            params: filters
        });
    };

    return (
        <Container theme={theme}>
            <MobileHeader title="Saved Searches" back />
            <Content>
                <FlatList
                    data={searches}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => (
                        <SearchCard theme={theme} onPress={() => handleSearchPress(item.filters)}>
                            <SearchHeader>
                                <SearchName theme={theme}>{item.name || 'Untitled Search'}</SearchName>
                                <Ionicons name="notifications-outline" size={18} color={item.notificationsEnabled ? theme.colors.primary.main : theme.colors.text.disabled} />
                            </SearchHeader>
                            <FilterRow>
                                {item.filters && Object.entries(item.filters).map(([key, value]) => (
                                    value ? (
                                        <FilterChip key={key} theme={theme}>
                                            <FilterText theme={theme}>{key}: {String(value)}</FilterText>
                                        </FilterChip>
                                    ) : null
                                ))}
                            </FilterRow>
                        </SearchCard>
                    )}
                    ListEmptyComponent={
                        !loading ? (
                            <EmptyState>
                                <Ionicons name="search-outline" size={64} color={theme.colors.border.muted} />
                                <Text style={{ fontSize: 18, fontWeight: '800', marginTop: 16, color: theme.colors.text.primary }}>No saved searches</Text>
                                <Text style={{ fontSize: 14, color: theme.colors.text.secondary, textAlign: 'center', marginTop: 8 }}>Save your specific search criteria to get notified about new matches.</Text>
                            </EmptyState>
                        ) : null
                    }
                />
            </Content>
        </Container>
    );
}
