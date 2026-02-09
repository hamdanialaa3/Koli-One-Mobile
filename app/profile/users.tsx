import React, { useState, useEffect } from 'react';
import styled from 'styled-components/native';
import { MobileHeader } from '../../src/components/common/MobileHeader';
import { theme } from '../../src/styles/theme';
import {
    View,
    FlatList,
    TextInput,
    TouchableOpacity,
    Image,
    ActivityIndicator,
    Text
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { collection, query, where, getDocs, limit } from 'firebase/firestore';
import { db } from '../../src/services/firebase';

const Container = styled.SafeAreaView`
  flex: 1;
  background-color: ${props => props.theme.colors.background.default};
`;

const SearchHeader = styled.View`
  background-color: ${props => props.theme.colors.background.paper};
  padding: 16px 20px;
  border-bottom-width: 1px;
  border-bottom-color: ${props => props.theme.colors.border.muted};
`;

const SearchInputRow = styled.View`
  flex-direction: row;
  align-items: center;
  background-color: ${props => props.theme.colors.background.default};
  border-radius: 12px;
  padding: 0 12px;
  height: 48px;
`;

const UserCard = styled.TouchableOpacity`
  background-color: ${props => props.theme.colors.background.paper};
  margin: 8px 20px;
  border-radius: 16px;
  padding: 16px;
  flex-direction: row;
  align-items: center;
  border-width: 1px;
  border-color: ${props => props.theme.colors.border.muted};
`;

const Avatar = styled.Image`
  width: 50px;
  height: 50px;
  border-radius: 25px;
  background-color: #eee;
`;

const UserInfo = styled.View`
  flex: 1;
  margin-left: 16px;
`;

const UserName = styled.Text`
  font-size: 16px;
  font-weight: 700;
  color: ${props => props.theme.colors.text.primary};
`;

const UserType = styled.Text`
  font-size: 12px;
  color: ${props => props.theme.colors.text.secondary};
  text-transform: uppercase;
  font-weight: 600;
  margin-top: 2px;
`;

const StatsRow = styled.View`
  flex-direction: row;
  margin-top: 8px;
  gap: 12px;
`;

const StatItem = styled.View`
  flex-direction: row;
  align-items: center;
`;

const StatValue = styled.Text`
  font-size: 12px;
  font-weight: 600;
  color: ${props => props.theme.colors.text.primary};
  margin-left: 4px;
`;

export default function UsersDirectoryScreen() {
    const router = useRouter();
    const [search, setSearch] = useState('');
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchUsers = async () => {
        try {
            const q = query(
                collection(db, 'users'),
                where('isActive', '==', true),
                limit(50)
            );
            const snap = await getDocs(q);
            const data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setUsers(data);
        } catch (error) {
            console.error("Error fetching users:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const filteredUsers = users.filter(u =>
        (u.displayName || '').toLowerCase().includes(search.toLowerCase())
    );

    return (
        <Container theme={theme}>
            <MobileHeader title="User Directory" back />
            <SearchHeader theme={theme}>
                <SearchInputRow theme={theme}>
                    <Ionicons name="search" size={20} color="#999" />
                    <TextInput
                        style={{ flex: 1, marginLeft: 10, fontSize: 16 }}
                        placeholder="Search users..."
                        value={search}
                        onChangeText={setSearch}
                    />
                </SearchInputRow>
            </SearchHeader>

            {loading ? (
                <ActivityIndicator style={{ marginTop: 40 }} color={theme.colors.primary.main} />
            ) : (
                <FlatList
                    data={filteredUsers}
                    keyExtractor={item => item.id}
                    renderItem={({ item }) => (
                        <UserCard theme={theme} onPress={() => router.push(`/profile/${item.id}` as any)}>
                            <Avatar source={{ uri: item.photoURL || `https://ui-avatars.com/api/?name=${item.displayName}&background=random` }} />
                            <UserInfo>
                                <UserName theme={theme}>{item.displayName}</UserName>
                                <UserType theme={theme}>{item.profileType || 'Individual'}</UserType>
                                <StatsRow>
                                    <StatItem>
                                        <Ionicons name="car-outline" size={14} color={theme.colors.primary.main} />
                                        <StatValue theme={theme}>{item.stats?.activeAds || 0}</StatValue>
                                    </StatItem>
                                    <StatItem>
                                        <Ionicons name="star-outline" size={14} color="#f59e0b" />
                                        <StatValue theme={theme}>{item.stats?.trustScore || 90}%</StatValue>
                                    </StatItem>
                                </StatsRow>
                            </UserInfo>
                            <Ionicons name="chevron-forward" size={20} color="#ccc" />
                        </UserCard>
                    )}
                    contentContainerStyle={{ paddingVertical: 10 }}
                />
            )}
        </Container>
    );
}
