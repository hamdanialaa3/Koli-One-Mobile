/**
 * garage.tsx - My Garage / Personal Vehicles
 * Track your own vehicles, market value, reminders
 */

import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  FlatList,
  Alert,
  ActivityIndicator,
  RefreshControl,
  TextInput,
  Modal,
} from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import styled from 'styled-components/native';
import { theme } from '../src/styles/theme';
import MobileHeader from '../src/components/common/MobileHeader';
import { useAuth } from '../src/contexts/AuthContext';
import { collection, query, where, getDocs, addDoc, deleteDoc, doc, serverTimestamp } from 'firebase/firestore';
import { db } from '../src/services/firebase';
import { logger } from '../src/services/logger-service';

const Container = styled.View`
  flex: 1;
  background-color: ${props => props.theme.colors.background.default};
`;

const EmptyContainer = styled.View`
  flex: 1;
  justify-content: center;
  align-items: center;
  padding: 40px;
`;

const EmptyIcon = styled.View`
  width: 80px;
  height: 80px;
  border-radius: 40px;
  background-color: ${props => props.theme.colors.primary.main}20;
  align-items: center;
  justify-content: center;
  margin-bottom: 16px;
`;

const EmptyTitle = styled.Text`
  font-size: 20px;
  font-weight: 700;
  color: ${props => props.theme.colors.text.primary};
  text-align: center;
  margin-bottom: 8px;
`;

const EmptySubtitle = styled.Text`
  font-size: 14px;
  color: ${props => props.theme.colors.text.secondary};
  text-align: center;
  line-height: 20px;
`;

const AddButton = styled.TouchableOpacity`
  background-color: ${props => props.theme.colors.primary.main};
  padding: 14px 28px;
  border-radius: 12px;
  margin-top: 24px;
  flex-direction: row;
  align-items: center;
  gap: 8px;
`;

const AddButtonText = styled.Text`
  color: #fff;
  font-size: 16px;
  font-weight: 700;
`;

const VehicleCard = styled.TouchableOpacity`
  background-color: ${props => props.theme.colors.background.paper};
  border-radius: 16px;
  margin: 8px 16px;
  overflow: hidden;
  border-width: 1px;
  border-color: ${props => props.theme.colors.border.muted};
`;

const VehicleImage = styled(Image)`
  width: 100%;
  height: 180px;
`;

const VehicleInfo = styled.View`
  padding: 16px;
`;

const VehicleName = styled.Text`
  font-size: 18px;
  font-weight: 700;
  color: ${props => props.theme.colors.text.primary};
  margin-bottom: 4px;
`;

const VehicleMeta = styled.Text`
  font-size: 13px;
  color: ${props => props.theme.colors.text.secondary};
  margin-bottom: 12px;
`;

const StatsRow = styled.View`
  flex-direction: row;
  gap: 16px;
`;

const StatBox = styled.View`
  flex: 1;
  background-color: ${props => props.theme.colors.background.default};
  border-radius: 10px;
  padding: 12px;
  align-items: center;
`;

const StatValue = styled.Text`
  font-size: 16px;
  font-weight: 700;
  color: ${props => props.theme.colors.primary.main};
`;

const StatLabel = styled.Text`
  font-size: 11px;
  color: ${props => props.theme.colors.text.secondary};
  margin-top: 2px;
`;

const RemindersRow = styled.View`
  flex-direction: row;
  margin-top: 12px;
  gap: 8px;
`;

const ReminderBadge = styled.View<{ urgent?: boolean }>`
  flex-direction: row;
  align-items: center;
  gap: 4px;
  padding: 6px 10px;
  border-radius: 8px;
  background-color: ${props => props.urgent ? '#ef444420' : '#22c55e20'};
`;

const ReminderText = styled.Text<{ urgent?: boolean }>`
  font-size: 12px;
  font-weight: 600;
  color: ${props => props.urgent ? '#ef4444' : '#22c55e'};
`;

interface GarageVehicle {
  id: string;
  make: string;
  model: string;
  year: number;
  vin?: string;
  imageUrl?: string;
  mileage?: number;
  estimatedValue?: number;
  insuranceExpiry?: string;
  motExpiry?: string;
  userId: string;
}

export default function GarageScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [vehicles, setVehicles] = useState<GarageVehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newVehicle, setNewVehicle] = useState({ make: '', model: '', year: '' });

  const fetchVehicles = useCallback(async () => {
    if (!user) return;
    try {
      const q = query(
        collection(db, 'userVehicles'),
        where('userId', '==', user.uid)
      );
      const snap = await getDocs(q);
      const items = snap.docs.map(d => ({ id: d.id, ...d.data() } as GarageVehicle));
      setVehicles(items);
    } catch (err) {
      logger.error('Failed to fetch garage vehicles', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user]);

  useEffect(() => {
    fetchVehicles();
  }, [fetchVehicles]);

  const handleAddVehicle = async () => {
    if (!user || !newVehicle.make || !newVehicle.model || !newVehicle.year) {
      Alert.alert('Error', 'Please fill all fields');
      return;
    }
    try {
      await addDoc(collection(db, 'userVehicles'), {
        userId: user.uid,
        make: newVehicle.make,
        model: newVehicle.model,
        year: parseInt(newVehicle.year),
        estimatedValue: 0,
        mileage: 0,
        createdAt: serverTimestamp(),
      });
      setShowAddModal(false);
      setNewVehicle({ make: '', model: '', year: '' });
      fetchVehicles();
    } catch (err) {
      logger.error('Failed to add vehicle', err);
      Alert.alert('Error', 'Failed to add vehicle');
    }
  };

  const handleDeleteVehicle = (id: string) => {
    Alert.alert('Remove Vehicle', 'Are you sure you want to remove this vehicle from your garage?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteDoc(doc(db, 'userVehicles', id));
            setVehicles(prev => prev.filter(v => v.id !== id));
          } catch (err) {
            logger.error('Failed to delete vehicle', err);
          }
        },
      },
    ]);
  };

  const isExpiringSoon = (dateStr?: string) => {
    if (!dateStr) return false;
    const d = new Date(dateStr);
    const diff = d.getTime() - Date.now();
    return diff > 0 && diff < 30 * 24 * 60 * 60 * 1000; // within 30 days
  };

  if (!user) {
    return (
      <Container theme={theme}>
        <Stack.Screen options={{ headerShown: false }} />
        <MobileHeader title="My Garage" back />
        <EmptyContainer theme={theme}>
          <EmptyIcon theme={theme}>
            <Ionicons name="car-sport" size={36} color={theme.colors.primary.main} />
          </EmptyIcon>
          <EmptyTitle theme={theme}>Sign In Required</EmptyTitle>
          <EmptySubtitle theme={theme}>Log in to track your personal vehicles</EmptySubtitle>
          <AddButton theme={theme} onPress={() => router.push('/(auth)/login')}>
            <Ionicons name="log-in-outline" size={20} color="#fff" />
            <AddButtonText>Sign In</AddButtonText>
          </AddButton>
        </EmptyContainer>
      </Container>
    );
  }

  if (loading) {
    return (
      <Container theme={theme}>
        <Stack.Screen options={{ headerShown: false }} />
        <MobileHeader title="My Garage" back />
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={theme.colors.primary.main} />
        </View>
      </Container>
    );
  }

  return (
    <Container theme={theme}>
      <Stack.Screen options={{ headerShown: false }} />
      <MobileHeader title="My Garage" back />

      {vehicles.length === 0 ? (
        <EmptyContainer theme={theme}>
          <EmptyIcon theme={theme}>
            <Ionicons name="car-sport" size={36} color={theme.colors.primary.main} />
          </EmptyIcon>
          <EmptyTitle theme={theme}>Your Garage is Empty</EmptyTitle>
          <EmptySubtitle theme={theme}>
            Add your personal vehicles to track their market value, get maintenance reminders, and more.
          </EmptySubtitle>
          <AddButton theme={theme} onPress={() => setShowAddModal(true)}>
            <Ionicons name="add" size={20} color="#fff" />
            <AddButtonText>Add Vehicle</AddButtonText>
          </AddButton>
        </EmptyContainer>
      ) : (
        <FlatList
          data={vehicles}
          keyExtractor={item => item.id}
          contentContainerStyle={{ paddingVertical: 8 }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => { setRefreshing(true); fetchVehicles(); }}
              tintColor={theme.colors.primary.main}
            />
          }
          ListHeaderComponent={
            <TouchableOpacity
              onPress={() => setShowAddModal(true)}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                marginHorizontal: 16,
                marginTop: 8,
                marginBottom: 4,
                padding: 14,
                borderRadius: 12,
                borderWidth: 1.5,
                borderColor: theme.colors.primary.main,
                borderStyle: 'dashed',
              }}
            >
              <Ionicons name="add-circle-outline" size={20} color={theme.colors.primary.main} />
              <Text style={{ color: theme.colors.primary.main, fontWeight: '700', fontSize: 15 }}>Add Vehicle</Text>
            </TouchableOpacity>
          }
          renderItem={({ item }) => (
            <VehicleCard theme={theme} onPress={() => router.push({ pathname: '/ai/valuation', params: { make: item.make, model: item.model, year: String(item.year) } })}>
              {item.imageUrl ? (
                <VehicleImage source={{ uri: item.imageUrl }} contentFit="cover" />
              ) : (
                <View style={{ width: '100%', height: 140, backgroundColor: theme.colors.background.paper, justifyContent: 'center', alignItems: 'center' }}>
                  <Ionicons name="car" size={48} color={theme.colors.text.disabled} />
                </View>
              )}
              <VehicleInfo>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  <VehicleName theme={theme}>{item.year} {item.make} {item.model}</VehicleName>
                  <TouchableOpacity onPress={() => handleDeleteVehicle(item.id)}>
                    <Ionicons name="trash-outline" size={20} color={theme.colors.text.disabled} />
                  </TouchableOpacity>
                </View>
                {item.vin && <VehicleMeta theme={theme}>VIN: {item.vin}</VehicleMeta>}
                <StatsRow>
                  <StatBox theme={theme}>
                    <StatValue theme={theme}>
                      {item.estimatedValue ? `€${item.estimatedValue.toLocaleString()}` : '—'}
                    </StatValue>
                    <StatLabel theme={theme}>Est. Value</StatLabel>
                  </StatBox>
                  <StatBox theme={theme}>
                    <StatValue theme={theme}>
                      {item.mileage ? `${(item.mileage / 1000).toFixed(0)}K` : '—'}
                    </StatValue>
                    <StatLabel theme={theme}>Mileage</StatLabel>
                  </StatBox>
                </StatsRow>
                <RemindersRow>
                  {item.motExpiry && (
                    <ReminderBadge urgent={isExpiringSoon(item.motExpiry)}>
                      <Ionicons name="shield-checkmark" size={14} color={isExpiringSoon(item.motExpiry) ? '#ef4444' : '#22c55e'} />
                      <ReminderText urgent={isExpiringSoon(item.motExpiry)}>
                        MOT: {new Date(item.motExpiry).toLocaleDateString()}
                      </ReminderText>
                    </ReminderBadge>
                  )}
                  {item.insuranceExpiry && (
                    <ReminderBadge urgent={isExpiringSoon(item.insuranceExpiry)}>
                      <Ionicons name="document-text" size={14} color={isExpiringSoon(item.insuranceExpiry) ? '#ef4444' : '#22c55e'} />
                      <ReminderText urgent={isExpiringSoon(item.insuranceExpiry)}>
                        Insurance: {new Date(item.insuranceExpiry).toLocaleDateString()}
                      </ReminderText>
                    </ReminderBadge>
                  )}
                </RemindersRow>
              </VehicleInfo>
            </VehicleCard>
          )}
        />
      )}

      {/* Add Vehicle Modal */}
      <Modal visible={showAddModal} transparent animationType="slide">
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 24 }}>
          <View style={{ backgroundColor: theme.colors.background.paper, borderRadius: 20, padding: 24 }}>
            <Text style={{ fontSize: 20, fontWeight: '700', color: theme.colors.text.primary, marginBottom: 20 }}>
              Add Vehicle
            </Text>
            <TextInput
              placeholder="Make (e.g., BMW)"
              placeholderTextColor={theme.colors.text.disabled}
              value={newVehicle.make}
              onChangeText={t => setNewVehicle(p => ({ ...p, make: t }))}
              style={{
                borderWidth: 1,
                borderColor: theme.colors.border.muted,
                borderRadius: 12,
                padding: 14,
                marginBottom: 12,
                color: theme.colors.text.primary,
                backgroundColor: theme.colors.background.default,
              }}
            />
            <TextInput
              placeholder="Model (e.g., 320d)"
              placeholderTextColor={theme.colors.text.disabled}
              value={newVehicle.model}
              onChangeText={t => setNewVehicle(p => ({ ...p, model: t }))}
              style={{
                borderWidth: 1,
                borderColor: theme.colors.border.muted,
                borderRadius: 12,
                padding: 14,
                marginBottom: 12,
                color: theme.colors.text.primary,
                backgroundColor: theme.colors.background.default,
              }}
            />
            <TextInput
              placeholder="Year (e.g., 2020)"
              placeholderTextColor={theme.colors.text.disabled}
              value={newVehicle.year}
              onChangeText={t => setNewVehicle(p => ({ ...p, year: t }))}
              keyboardType="numeric"
              style={{
                borderWidth: 1,
                borderColor: theme.colors.border.muted,
                borderRadius: 12,
                padding: 14,
                marginBottom: 20,
                color: theme.colors.text.primary,
                backgroundColor: theme.colors.background.default,
              }}
            />
            <View style={{ flexDirection: 'row', gap: 12 }}>
              <TouchableOpacity
                onPress={() => setShowAddModal(false)}
                style={{
                  flex: 1,
                  padding: 14,
                  borderRadius: 12,
                  borderWidth: 1,
                  borderColor: theme.colors.border.muted,
                  alignItems: 'center',
                }}
              >
                <Text style={{ color: theme.colors.text.primary, fontWeight: '600' }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleAddVehicle}
                style={{
                  flex: 1,
                  padding: 14,
                  borderRadius: 12,
                  backgroundColor: theme.colors.primary.main,
                  alignItems: 'center',
                }}
              >
                <Text style={{ color: '#fff', fontWeight: '700' }}>Add</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </Container>
  );
}
