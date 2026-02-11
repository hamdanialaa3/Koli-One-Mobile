import React, { useEffect, useState } from 'react';
import styled from 'styled-components/native';
import { FlatList, View, ActivityIndicator, TouchableOpacity } from 'react-native';
import { theme } from '../src/styles/theme';
import { db } from '../src/services/firebase';
import { collection, query, orderBy, onSnapshot, doc, updateDoc } from 'firebase/firestore';
import { useAuth } from '../src/contexts/AuthContext';
import { MobileHeader } from '../src/components/common/MobileHeader';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

const Container = styled.View`
  flex: 1;
  background-color: ${props => props.theme.colors.background.default};
`;

const NotificationItem = styled.TouchableOpacity<{ read: boolean }>`
  padding: 16px 20px;
  background-color: ${props => props.read ? props.theme.colors.background.paper : props.theme.colors.primary.main + '08'};
  flex-direction: row;
  align-items: center;
  border-bottom-width: 1px;
  border-bottom-color: ${props => props.theme.colors.border.muted};
`;

const IconCircle = styled.View<{ type: string }>`
  width: 44px;
  height: 44px;
  border-radius: 22px;
  background-color: ${props =>
        props.type === 'message' ? '#007AFF' :
            props.type === 'price_drop' ? '#34C759' :
                '#FF9500'};
  align-items: center;
  justify-content: center;
  margin-right: 16px;
`;

const Content = styled.View`
  flex: 1;
`;

const Title = styled.Text`
  font-size: 15px;
  font-weight: 700;
  color: ${props => props.theme.colors.text.primary};
  margin-bottom: 4px;
`;

const Message = styled.Text`
  font-size: 13px;
  color: ${props => props.theme.colors.text.secondary};
`;

const Time = styled.Text`
  font-size: 11px;
  color: ${props => props.theme.colors.text.disabled};
  margin-top: 6px;
`;

export default function NotificationsScreen() {
    const { user } = useAuth();
    const router = useRouter();
    const [notifications, setNotifications] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let isActive = true;
        if (user) {
            const q = query(
                collection(db, `users/${user.uid}/notifications`),
                orderBy('timestamp', 'desc')
            );

            const unsubscribe = onSnapshot(q, (snap) => {
                if (!isActive) return;
                const data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                setNotifications(data);
                setLoading(false);
            });

            return () => {
                isActive = false;
                unsubscribe();
            };
        }
    }, [user]);

    const markAsRead = async (id: string) => {
        const ref = doc(db, `users/${user!.uid}/notifications`, id);
        await updateDoc(ref, { read: true });
    };

    const getIcon = (type: string) => {
        switch (type) {
            case 'message': return 'chatbubble-outline';
            case 'price_drop': return 'trending-down-outline';
            default: return 'notifications-outline';
        }
    };

    return (
        <Container theme={theme}>
            <MobileHeader title="Notifications" showLogo={false} />

            {loading ? (
                <View style={{ flex: 1, justifyContent: 'center' }}><ActivityIndicator color={theme.colors.primary.main} /></View>
            ) : (
                <FlatList
                    data={notifications}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => (
                        <NotificationItem
                            read={item.read}
                            theme={theme}
                            onPress={() => markAsRead(item.id)}
                        >
                            <IconCircle type={item.type}>
                                <Ionicons name={getIcon(item.type) as any} size={22} color="#fff" />
                            </IconCircle>
                            <Content>
                                <Title theme={theme}>{item.title}</Title>
                                <Message theme={theme}>{item.message}</Message>
                                <Time theme={theme}>{new Date(item.timestamp?.toDate()).toLocaleString()}</Time>
                            </Content>
                            {!item.read && <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: theme.colors.primary.main }} />}
                        </NotificationItem>
                    )}
                />
            )}
        </Container>
    );
}
