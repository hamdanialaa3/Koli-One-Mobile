import React from 'react';
import styled from 'styled-components/native';
import { View, Platform, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

const dealers = [
  { id: '1', name: 'Auto Bavaria', location: 'Sofia', rating: 4.9 },
  { id: '2', name: 'Premium Cars', location: 'Plovdiv', rating: 4.8 },
  { id: '3', name: 'Varna Motors', location: 'Varna', rating: 4.7 },
];

const Container = styled.View`
  margin-bottom: 32px;
`;

const Header = styled.View`
  padding: 0 20px;
  margin-bottom: 16px;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
`;

const SectionTitle = styled.Text`
  font-size: 18px;
  font-weight: 800;
  color: #ffffff;
  text-transform: uppercase;
  letter-spacing: 1px;
`;

const ViewAll = styled.Text`
  font-size: 13px;
  font-weight: 700;
  color: #00f3ff;
  text-transform: uppercase;
`;

const ScrollContent = styled.ScrollView`
  padding-left: 20px;
`;

const DealerCard = styled.TouchableOpacity`
  width: 140px;
  height: 160px;
  background-color: rgba(30, 41, 59, 0.7);
  border-radius: 20px;
  margin-right: 16px;
  padding: 16px;
  align-items: center;
  justify-content: space-between;
  border-width: 1.5px;
  border-color: rgba(0, 243, 255, 0.2);
  ${Platform.OS === 'web' ? {
    boxShadow: '0px 0px 15px rgba(0, 243, 255, 0.1)'
  } : {}}
`;

const DealerLogoPlaceholder = styled.View`
  width: 54px;
  height: 54px;
  border-radius: 27px;
  background-color: rgba(0, 243, 255, 0.1);
  margin-bottom: 8px;
  align-items: center;
  justify-content: center;
  border-width: 1px;
  border-color: rgba(0, 243, 255, 0.3);
`;

const DealerName = styled.Text`
  font-size: 13px;
  font-weight: 700;
  text-align: center;
  color: #ffffff;
`;

const DealerLocation = styled.Text`
  font-size: 11px;
  color: rgba(255, 255, 255, 0.6);
  text-align: center;
  margin-top: 2px;
`;

const RatingBadge = styled.View`
  flex-direction: row;
  align-items: center;
  background-color: rgba(0, 243, 255, 0.1);
  padding: 4px 10px;
  border-radius: 12px;
  margin-top: 8px;
  border-width: 1px;
  border-color: rgba(0, 243, 255, 0.2);
`;

const RatingText = styled.Text`
  font-size: 10px;
  font-weight: 800;
  color: #00f3ff;
  margin-left: 4px;
`;

export default function DealersSpotlight() {
  const router = useRouter();
  return (
    <Container>
      <Header>
        <SectionTitle>Featured Dealers</SectionTitle>
        <TouchableOpacity onPress={() => router.push('/dealers')}>
          <ViewAll>View All</ViewAll>
        </TouchableOpacity>
      </Header>
      <ScrollContent horizontal showsHorizontalScrollIndicator={false}>
        {dealers.map((dealer) => (
          <DealerCard key={dealer.id} onPress={() => router.push(`/profile/${dealer.id}` as any)}>
            <View style={{ alignItems: 'center' }}>
              <DealerLogoPlaceholder>
                <Ionicons name="business" size={24} color="#00f3ff" />
              </DealerLogoPlaceholder>
              <DealerName numberOfLines={1}>{dealer.name}</DealerName>
              <DealerLocation>{dealer.location}</DealerLocation>
            </View>
            <RatingBadge>
              <Ionicons name="star" size={10} color="#00f3ff" />
              <RatingText>{dealer.rating}</RatingText>
            </RatingBadge>
          </DealerCard>
        ))}
        <View style={{ width: 20 }} />
      </ScrollContent>
    </Container>
  );
}
