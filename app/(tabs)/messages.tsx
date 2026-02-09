import React, { useEffect, useState } from 'react';
import styled from 'styled-components/native';
import { FlatList, View, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../src/styles/theme';
import MobileHeader from '../../src/components/common/MobileHeader';
import { useAuth } from '../../src/contexts/AuthContext';
import { MessagingService, RealtimeChannel } from '../../src/services/MessagingService';
import { useRouter } from 'expo-router';
import { EmptyState } from '../../src/components/common/EmptyState';

const Container = styled.View`
  flex: 1;
  background-color: ${props => props.theme.colors.background.default};
`;

const ConversationItem = styled.TouchableOpacity`
  flex-direction: row;
  padding: 16px 20px;
  background-color: ${props => props.theme.colors.background.paper};
  border-bottom-width: 1px;
  border-bottom-color: ${props => props.theme.colors.border.default};
  align-items: center;
`;

const CarThumbnail = styled.Image`
  width: 60px;
  height: 60px;
  border-radius: 8px;
  background-color: ${props => props.theme.colors.background.dark};
`;

const Content = styled.View`
  flex: 1;
  margin-left: 16px;
`;

const HeaderRow = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;
`;

const CarTitle = styled.Text`
  font-size: 16px;
  font-weight: 700;
  color: ${props => props.theme.colors.text.primary};
`;

const DateText = styled.Text`
  font-size: 12px;
  color: ${props => props.theme.colors.text.disabled};
`;

const LastMessage = styled.Text`
  font-size: 14px;
  color: ${props => props.theme.colors.text.secondary};
`;

export default function MessagesScreen() {
    const { user, profile } = useAuth();
    const router = useRouter();
    const [channels, setChannels] = useState<RealtimeChannel[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!profile?.numericId) {
            if (!user) setLoading(false);
            return;
        }

        const unsubscribe = MessagingService.subscribeToUserChannels(profile.numericId, (data) => {
            setChannels(data);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [profile, user]);

    if (!user) {
        return (
            <Container theme={theme}>
                <MobileHeader title="Messages" />
                <EmptyState
                    icon="lock-closed"
                    title="Sign in to chat"
                    description="You need to be logged in to view your conversations."
                    buttonText="Sign In"
                    onButtonPress={() => router.push('/(tabs)/profile')}
                />
            </Container>
        );
    }

    return (
        <Container theme={theme}>
            <MobileHeader title="Messages" />
            {loading ? (
                <View style={{ flex: 1, justifyContent: 'center' }}>
                    <ActivityIndicator color={theme.colors.primary.main} />
                </View>
            ) : (
                <FlatList
                    data={channels}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => (
                        <ConversationItem
                            theme={theme}
                            onPress={() => router.push({ pathname: '/chat/[id]', params: { id: item.id } })}
                        >
                            <CarThumbnail source={item.carImage ? { uri: item.carImage } : require('../../assets/images/placeholder-car.png')} />
                            <Content>
                                <HeaderRow>
                                    <CarTitle theme={theme} numberOfLines={1}>{item.carTitle}</CarTitle>
                                    <DateText theme={theme}>{item.updatedAt ? new Date(item.updatedAt).toLocaleDateString() : ''}</DateText>
                                </HeaderRow>
                                <LastMessage theme={theme} numberOfLines={1}>
                                    {item.lastMessage?.content || 'No messages yet'}
                                </LastMessage>
                            </Content>
                        </ConversationItem>
                    )}
                    ListEmptyComponent={
                        <EmptyState
                            icon="chatbubbles-outline"
                            title="No Messages Yet"
                            description="Start a conversation with a seller to see it here."
                        />
                    }
                />
            )}
        </Container>
    );
}
