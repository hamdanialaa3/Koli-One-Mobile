import React, { useEffect, useState } from 'react';
import styled from 'styled-components/native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../src/contexts/AuthContext';
import { ListingService } from '../../src/services/ListingService';
import { ListingBase } from '../../src/types/ListingBase';
import { MobileHeader } from '../../src/components/common/MobileHeader';
import { theme } from '../../src/styles/theme';
import { FlatList, RefreshControl, View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../src/services/firebase';
import { logger } from '../../src/services/logger-service';

const Container = styled.SafeAreaView`
  flex: 1;
  background-color: ${props => props.theme.colors.background.default};
`;

const Content = styled.View`
  flex: 1;
  padding: 16px;
`;

const DraftCard = styled.TouchableOpacity`
  background-color: ${props => props.theme.colors.background.paper};
  border-radius: 16px;
  padding: 16px;
  margin-bottom: 12px;
  border-width: 1px;
  border-color: ${props => props.theme.colors.border.muted};
  flex-direction: row;
  align-items: center;
`;

const DraftInfo = styled.View`
  flex: 1;
  margin-left: 12px;
`;

const DraftTitle = styled.Text`
  font-size: 16px;
  font-weight: 700;
  color: ${props => props.theme.colors.text.primary};
`;

const DraftMeta = styled.Text`
  font-size: 12px;
  color: ${props => props.theme.colors.text.secondary};
  margin-top: 4px;
`;

const EmptyState = styled.View`
  flex: 1;
  justify-content: center;
  align-items: center;
  padding: 40px;
`;

const EmptyTitle = styled.Text`
  font-size: 18px;
  font-weight: 800;
  color: ${props => props.theme.colors.text.primary};
  margin-top: 16px;
`;

const EmptySubtitle = styled.Text`
  font-size: 14px;
  color: ${props => props.theme.colors.text.secondary};
  text-align: center;
  margin-top: 8px;
`;

export default function DraftsScreen() {
    const { user } = useAuth();
    const router = useRouter();
    const [drafts, setDrafts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchDrafts = async () => {
        if (!user) return;
        try {
            // Check major collections for drafts
            const collections = ['passenger_cars', 'cars', 'suvs'];
            let allDrafts: any[] = [];

            for (const coll of collections) {
                const q = query(
                    collection(db, coll),
                    where('sellerId', '==', user.uid),
                    where('status', '==', 'draft')
                );
                const snap = await getDocs(q);
                snap.forEach(doc => allDrafts.push({ id: doc.id, collection: coll, ...doc.data() }));
            }
            setDrafts(allDrafts);
        } catch (error) {
            logger.error("Error fetching drafts:", error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchDrafts();
    }, [user]);

    const onRefresh = () => {
        setRefreshing(true);
        fetchDrafts();
    };

    return (
        <Container theme={theme}>
            <MobileHeader title="My Drafts" back />
            <Content>
                <FlatList
                    data={drafts}
                    keyExtractor={(item) => item.id}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.colors.primary.main} />
                    }
                    renderItem={({ item }) => (
                        <DraftCard theme={theme} onPress={() => router.push(`/(tabs)/sell?draftId=${item.id}` as any)}>
                            <View style={{ width: 44, height: 44, borderRadius: 10, backgroundColor: theme.colors.background.default, justifyContent: 'center', alignItems: 'center' }}>
                                <Ionicons name="document-text-outline" size={24} color={theme.colors.primary.main} />
                            </View>
                            <DraftInfo>
                                <DraftTitle theme={theme}>{item.make} {item.model || 'Unnamed Draft'}</DraftTitle>
                                <DraftMeta theme={theme}>Last edited: {item.updatedAt ? new Date(item.updatedAt.toDate()).toLocaleDateString() : 'Recently'}</DraftMeta>
                            </DraftInfo>
                            <Ionicons name="chevron-forward" size={20} color={theme.colors.text.disabled} />
                        </DraftCard>
                    )}
                    ListEmptyComponent={
                        !loading ? (
                            <EmptyState>
                                <Ionicons name="document-outline" size={64} color={theme.colors.border.muted} />
                                <EmptyTitle theme={theme}>No drafts found</EmptyTitle>
                                <EmptySubtitle theme={theme}>Your saved car listings will appear here so you can finish them later.</EmptySubtitle>
                                <TouchableOpacity
                                    onPress={() => router.push('/(tabs)/sell')}
                                    style={{ marginTop: 24, padding: 12, backgroundColor: theme.colors.primary.main, borderRadius: 12 }}
                                >
                                    <Text style={{ color: 'white', fontWeight: '700' }}>Start New Listing</Text>
                                </TouchableOpacity>
                            </EmptyState>
                        ) : null
                    }
                />
            </Content>
        </Container>
    );
}
