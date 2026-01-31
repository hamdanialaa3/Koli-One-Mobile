import React, { useState, useEffect, useRef } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import styled from 'styled-components/native';
import {
    FlatList,
    View,
    TextInput,
    TouchableOpacity,
    KeyboardAvoidingView,
    Platform,
    ActivityIndicator,
    Keyboard
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../src/styles/theme';
import { MessagingService, RealtimeMessage } from '../../src/services/MessagingService';
import { useAuth } from '../../src/contexts/AuthContext';
import { ListingService } from '../../src/services/ListingService';
import { CarListing } from '../../src/types/CarListing';

const Container = styled.SafeAreaView`
  flex: 1;
  background-color: ${props => props.theme.colors.background.default};
`;

const ChatHeader = styled.View`
  flex-direction: row;
  align-items: center;
  padding: 12px 20px;
  background-color: ${props => props.theme.colors.background.paper};
  border-bottom-width: 1px;
  border-bottom-color: ${props => props.theme.colors.border.muted};
`;

const HeaderInfo = styled.View`
  margin-left: 16px;
  flex: 1;
`;

const HeaderTitle = styled.Text`
  font-size: 16px;
  font-weight: 700;
  color: ${props => props.theme.colors.text.primary};
`;

const HeaderSubtitle = styled.Text`
  font-size: 12px;
  color: ${props => props.theme.colors.text.secondary};
`;

const MessageBubble = styled.View<{ isMe: boolean }>`
  max-width: 80%;
  padding: 12px 16px;
  border-radius: 20px;
  margin-bottom: 8px;
  margin-left: ${props => props.isMe ? 'auto' : '20px'};
  margin-right: ${props => props.isMe ? '20px' : 'auto'};
  background-color: ${props => props.isMe ? props.theme.colors.primary.main : props.theme.colors.background.paper};
  border-bottom-right-radius: ${props => props.isMe ? '4px' : '20px'};
  border-bottom-left-radius: ${props => props.isMe ? '20px' : '4px'};
`;

const MessageText = styled.Text<{ isMe: boolean }>`
  color: ${props => props.isMe ? '#fff' : props.theme.colors.text.primary};
  font-size: 15px;
`;

const TimeText = styled.Text<{ isMe: boolean }>`
  font-size: 10px;
  color: ${props => props.isMe ? 'rgba(255,255,255,0.7)' : props.theme.colors.text.disabled};
  margin-top: 4px;
  align-self: flex-end;
`;

const InputBar = styled.View`
  flex-direction: row;
  align-items: center;
  padding: 12px 16px;
  background-color: ${props => props.theme.colors.background.paper};
  border-top-width: 1px;
  border-top-color: ${props => props.theme.colors.border.muted};
`;

const StyledInput = styled.TextInput`
  flex: 1;
  background-color: ${props => props.theme.colors.background.default};
  border-radius: 24px;
  padding: 10px 16px;
  max-height: 100px;
  font-size: 16px;
  color: ${props => props.theme.colors.text.primary};
`;

const SendButton = styled.TouchableOpacity`
  width: 44px;
  height: 44px;
  border-radius: 22px;
  background-color: ${props => props.theme.colors.primary.main};
  align-items: center;
  justify-content: center;
  margin-left: 12px;
`;

export default function ChatScreen() {
    const { id } = useLocalSearchParams(); // This is the Car ID
    const { user, profile } = useAuth();
    const router = useRouter();
    const [messages, setMessages] = useState<RealtimeMessage[]>([]);
    const [inputText, setInputText] = useState('');
    const [car, setCar] = useState<CarListing | null>(null);
    const [loading, setLoading] = useState(true);
    const flatListRef = useRef<FlatList>(null);

    useEffect(() => {
        if (id) {
            loadCarAndMessages();
        }
    }, [id, profile]);

    const loadCarAndMessages = async () => {
        let carId = id as string;
        let activeChannelId = '';

        if (carId.startsWith('msg_')) {
            activeChannelId = carId;
            // Extract numeric carId from msg_u1_u2_car_N
            const parts = carId.split('_car_');
            if (parts.length > 1) {
                // In a perfect world we'd fetch car by numericId, 
                // but since our ListingService works by docId, 
                // we'll rely on the channel's car data if needed.
            }
        }

        const carData = await ListingService.getListingById(carId);
        setCar(carData);

        if (carData && profile) {
            const channelId = activeChannelId || MessagingService.generateChannelId(
                profile.numericId,
                carData.sellerNumericId || 0,
                carData.carNumericId || 0
            );

            const unsubscribe = MessagingService.subscribeToMessages(channelId, (msgs) => {
                setMessages(msgs);
                setLoading(false);
            });

            return () => unsubscribe();
        } else {
            setLoading(false);
        }
    };

    const handleSend = async () => {
        if (!inputText.trim() || !car || !profile || !user) return;

        const channelId = MessagingService.generateChannelId(
            profile.numericId,
            car.sellerNumericId || 0,
            car.carNumericId || 0
        );

        const msg: Partial<RealtimeMessage> = {
            senderId: profile.numericId,
            senderFirebaseId: user.uid,
            recipientId: car.sellerNumericId,
            recipientFirebaseId: car.sellerId,
            content: inputText.trim(),
            type: 'text'
        };

        setInputText('');
        try {
            await MessagingService.sendMessage(channelId, msg);
        } catch (e) {
            console.error(e);
        }
    };

    if (loading) return (
        <Container theme={theme} style={{ justifyContent: 'center' }}>
            <ActivityIndicator color={theme.colors.primary.main} />
        </Container>
    );

    return (
        <Container theme={theme}>
            <ChatHeader theme={theme}>
                <TouchableOpacity onPress={() => router.back()}>
                    <Ionicons name="chevron-back" size={28} color={theme.colors.text.primary} />
                </TouchableOpacity>
                <HeaderInfo>
                    <HeaderTitle theme={theme}>{car?.make} {car?.model}</HeaderTitle>
                    <HeaderSubtitle theme={theme}>{car?.sellerName}</HeaderSubtitle>
                </HeaderInfo>
                <TouchableOpacity>
                    <Ionicons name="call-outline" size={24} color={theme.colors.primary.main} />
                </TouchableOpacity>
            </ChatHeader>

            <FlatList
                ref={flatListRef}
                data={messages}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => {
                    const isMe = item.senderFirebaseId === user?.uid;
                    const time = new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                    return (
                        <MessageBubble theme={theme} isMe={isMe}>
                            <MessageText theme={theme} isMe={isMe}>{item.content}</MessageText>
                            <TimeText theme={theme} isMe={isMe}>{time}</TimeText>
                        </MessageBubble>
                    );
                }}
                contentContainerStyle={{ paddingVertical: 20 }}
                onContentSizeChange={() => flatListRef.current?.scrollToEnd()}
            />

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
            >
                <InputBar theme={theme}>
                    <TouchableOpacity style={{ marginRight: 12 }}>
                        <Ionicons name="add-circle-outline" size={28} color={theme.colors.text.secondary} />
                    </TouchableOpacity>
                    <StyledInput
                        theme={theme}
                        placeholder="Type a message..."
                        placeholderTextColor={theme.colors.text.disabled}
                        value={inputText}
                        onChangeText={setInputText}
                        multiline
                    />
                    <SendButton theme={theme} onPress={handleSend}>
                        <Ionicons name="send" size={20} color="#fff" />
                    </SendButton>
                </InputBar>
            </KeyboardAvoidingView>
        </Container>
    );
}
