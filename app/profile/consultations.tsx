import React, { useState, useEffect } from 'react';
import styled from 'styled-components/native';
import { MobileHeader } from '../../src/components/common/MobileHeader';
import { theme } from '../../src/styles/theme';
import { View, ScrollView, TouchableOpacity, Text, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { db, auth } from '../../src/services/firebase';
import { collection, query, where, orderBy, onSnapshot, addDoc, serverTimestamp } from 'firebase/firestore';

const Container = styled.SafeAreaView`
  flex: 1;
  background-color: ${props => props.theme.colors.background.default};
`;

const Content = styled.ScrollView`
  flex: 1;
  padding: 20px;
`;

const ExpertCard = styled.View`
  background-color: ${props => props.theme.colors.background.paper};
  padding: 24px;
  border-radius: 20px;
  margin-bottom: 24px;
  border-width: 1px;
  border-color: ${props => props.theme.colors.border.muted};
  align-items: center;
`;

const IconCircle = styled.View`
  width: 64px;
  height: 64px;
  border-radius: 32px;
  background-color: ${props => props.theme.colors.primary.main}15;
  justify-content: center;
  align-items: center;
  margin-bottom: 16px;
`;

const Title = styled.Text`
  font-size: 20px;
  font-weight: 800;
  color: ${props => props.theme.colors.text.primary};
  margin-bottom: 8px;
`;

const Description = styled.Text`
  font-size: 14px;
  color: ${props => props.theme.colors.text.secondary};
  text-align: center;
  line-height: 20px;
  margin-bottom: 24px;
`;

const ActionButton = styled.TouchableOpacity`
  background-color: ${props => props.theme.colors.primary.main};
  padding: 14px 28px;
  border-radius: 12px;
  width: 100%;
  align-items: center;
`;

const ActionButtonText = styled.Text`
  color: white;
  font-weight: 700;
  font-size: 16px;
`;

const HistoryItem = styled.View`
  background-color: ${props => props.theme.colors.background.paper};
  padding: 16px;
  border-radius: 16px;
  margin-bottom: 12px;
  flex-direction: row;
  align-items: center;
  border-width: 1px;
  border-color: ${props => props.theme.colors.border.muted};
`;

export default function ConsultationsScreen() {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(false);

  useEffect(() => {
    if (!auth.currentUser) { setLoading(false); return; }
    const q = query(
      collection(db, 'consultation_requests'),
      where('userId', '==', auth.currentUser.uid),
      orderBy('createdAt', 'desc')
    );
    const unsub = onSnapshot(q, (snap) => {
      setRequests(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    }, () => setLoading(false));
    return unsub;
  }, []);

  const handleBook = async () => {
    if (!auth.currentUser) {
      Alert.alert('Вход', 'Моля, влезте в профила си.');
      return;
    }
    setBooking(true);
    try {
      await addDoc(collection(db, 'consultation_requests'), {
        userId: auth.currentUser.uid,
        type: 'general',
        status: 'pending',
        createdAt: serverTimestamp(),
      });
      Alert.alert('Успех', 'Заявката е изпратена! Ще се свържем с вас до 24 часа.');
    } catch (error) {
      Alert.alert('Грешка', 'Неуспешно изпращане. Опитайте отново.');
    } finally {
      setBooking(false);
    }
  };
  return (
    <Container theme={theme}>
      <MobileHeader title="Expert Support" back />
      <Content showsVerticalScrollIndicator={false}>

        <ExpertCard theme={theme}>
          <IconCircle theme={theme}>
            <Ionicons name="headset-outline" size={32} color={theme.colors.primary.main} />
          </IconCircle>
          <Title theme={theme}>Need Professional Advice?</Title>
          <Description theme={theme}>
            Our experts can help you with vehicle inspections, price negotiations,
            and documentation. Book a 1-on-1 session today.
          </Description>
          <ActionButton theme={theme} onPress={handleBook} disabled={booking}>
            <ActionButtonText>{booking ? 'Изпращане...' : 'Book a Consultation'}</ActionButtonText>
          </ActionButton>
        </ExpertCard>

        <View style={{ marginBottom: 16 }}>
          <Text style={{ fontSize: 18, fontWeight: '800', color: theme.colors.text.primary }}>Past Requests</Text>
        </View>

        {loading ? (
          <ActivityIndicator size="large" color={theme.colors.primary.main} />
        ) : requests.length === 0 ? (
          <Text style={{ textAlign: 'center', color: theme.colors.text.secondary }}>Няма предишни заявки</Text>
        ) : (
          requests.map((req) => (
            <HistoryItem key={req.id} theme={theme}>
              <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: theme.colors.background.default, justifyContent: 'center', alignItems: 'center' }}>
                <Ionicons name="document-text-outline" size={20} color={theme.colors.text.disabled} />
              </View>
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={{ fontWeight: '700', fontSize: 14 }}>{req.type || 'Consultation'}</Text>
                <Text style={{ fontSize: 12, color: theme.colors.text.secondary }}>
                  {req.status === 'completed' ? 'Завършена' : req.status === 'pending' ? 'Изчакване' : req.status}
                </Text>
              </View>
              <Ionicons
                name={req.status === 'completed' ? 'checkmark-circle' : 'time-outline'}
                size={20}
                color={req.status === 'completed' ? theme.colors.status.success : theme.colors.text.disabled}
              />
            </HistoryItem>
          ))
        )}

        <View style={{ height: 40 }} />
      </Content>
    </Container>
  );
}
