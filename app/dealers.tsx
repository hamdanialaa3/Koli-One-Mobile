import React, { useState, useEffect } from 'react';
import styled from 'styled-components/native';
import { MobileHeader } from '../src/components/common/MobileHeader';
import { theme } from '../src/styles/theme';
import {
    View,
    FlatList,
    TextInput,
    TouchableOpacity,
    Image,
    ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

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

const SearchInput = styled.View`
  flex-direction: row;
  align-items: center;
  background-color: ${props => props.theme.colors.background.default};
  border-radius: 12px;
  padding: 0 12px;
  height: 48px;
`;

const DealerCard = styled.TouchableOpacity`
  background-color: ${props => props.theme.colors.background.paper};
  margin: 10px 20px;
  border-radius: 16px;
  padding: 16px;
  flex-direction: row;
  align-items: center;
  border-width: 1px;
  border-color: ${props => props.theme.colors.border.muted};
`;

const DealerLogo = styled.Image`
  width: 60px;
  height: 60px;
  border-radius: 30px;
  background-color: #eee;
`;

const DealerInfo = styled.View`
  flex: 1;
  margin-left: 16px;
`;

const DealerName = styled.Text`
  font-size: 16px;
  font-weight: 700;
  color: ${props => props.theme.colors.text.primary};
`;

const DealerMeta = styled.Text`
  font-size: 13px;
  color: ${props => props.theme.colors.text.secondary};
  margin-top: 2px;
`;

const BadgeRow = styled.View`
  flex-direction: row;
  margin-top: 8px;
  gap: 8px;
`;

const Badge = styled.View<{ color: string }>`
  background-color: ${props => props.color}15;
  padding: 4px 8px;
  border-radius: 6px;
`;

const BadgeText = styled.Text<{ color: string }>`
  font-size: 10px;
  font-weight: 800;
  color: ${props => props.color};
  text-transform: uppercase;
`;

export default function DealersScreen() {
    const router = useRouter();
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(false);

    // Mock dealers data
    const dealers = [
        { id: '1', name: 'Elite Motors Sofia', city: 'Sofia', rating: 4.9, listings: 42, type: 'Official' },
        { id: '2', name: 'Bulgarian Car Group', city: 'Plovdiv', rating: 4.7, listings: 128, type: 'Verified' },
        { id: '3', name: 'Premium Auto Varna', city: 'Varna', rating: 4.8, listings: 15, type: 'Verified' },
        { id: '4', name: 'City Cars Burgas', city: 'Burgas', rating: 4.5, listings: 31, type: 'Standard' },
    ];

    const filteredDealers = dealers.filter(d =>
        d.name.toLowerCase().includes(search.toLowerCase()) ||
        d.city.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <Container theme={theme}>
            <MobileHeader title="Partner Dealers" back />
            <SearchHeader theme={theme}>
                <SearchInput theme={theme}>
                    <Ionicons name="search" size={20} color="#999" />
                    <TextInput
                        style={{ flex: 1, marginLeft: 10, fontSize: 16 }}
                        placeholder="Search by name or city..."
                        value={search}
                        onChangeText={setSearch}
                    />
                </SearchInput>
            </SearchHeader>

            {loading ? (
                <ActivityIndicator style={{ marginTop: 40 }} color={theme.colors.primary.main} />
            ) : (
                <FlatList
                    data={filteredDealers}
                    keyExtractor={item => item.id}
                    renderItem={({ item }) => (
                        <DealerCard theme={theme} onPress={() => router.push(`/profile/${item.id}` as any)}>
                            <DealerLogo source={{ uri: `https://ui-avatars.com/api/?name=${item.name}&background=003366&color=fff` }} />
                            <DealerInfo>
                                <DealerName theme={theme}>{item.name}</DealerName>
                                <DealerMeta theme={theme}>{item.city} • {item.listings} Listings</DealerMeta>
                                <BadgeRow>
                                    <Badge color={theme.colors.status.success}>
                                        <BadgeText color={theme.colors.status.success}>{item.rating} ★</BadgeText>
                                    </Badge>
                                    <Badge color={theme.colors.primary.main}>
                                        <BadgeText color={theme.colors.primary.main}>{item.type}</BadgeText>
                                    </Badge>
                                </BadgeRow>
                            </DealerInfo>
                            <Ionicons name="chevron-forward" size={20} color="#ccc" />
                        </DealerCard>
                    )}
                    contentContainerStyle={{ paddingVertical: 10 }}
                />
            )}
        </Container>
    );
}
