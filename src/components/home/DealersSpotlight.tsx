import React from 'react';
import styled from 'styled-components/native';
import { View, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../styles/theme';

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
  font-weight: 700;
  color: ${props => props.theme.colors.text.primary};
`;

const ViewAll = styled.Text`
  font-size: 14px;
  font-weight: 600;
  color: ${props => props.theme.colors.primary.main};
`;

const ScrollContent = styled.ScrollView`
  padding-left: 20px;
`;

const DealerCard = styled.TouchableOpacity`
  width: 140px;
  height: 160px;
  background-color: ${props => props.theme.colors.background.paper};
  border-radius: 16px;
  margin-right: 16px;
  padding: 12px;
  align-items: center;
  justify-content: space-between;
  border-width: 1px;
  border-color: ${props => props.theme.colors.border.muted};
  elevation: 2;
  ${Platform.OS !== 'web' ? `
    shadow-color: #000;
    shadow-offset: 0px 2px;
    shadow-opacity: 0.05;
    shadow-radius: 8px;
  ` : `
    box-shadow: 0px 2px 8px rgba(0, 0, 0, 0.05);
  `}
`;

const DealerLogoPlaceholder = styled.View`
  width: 60px;
  height: 60px;
  border-radius: 30px;
  background-color: ${props => props.theme.colors.background.default};
  margin-bottom: 8px;
  align-items: center;
  justify-content: center;
`;

const DealerName = styled.Text`
  font-size: 14px;
  font-weight: 700;
  text-align: center;
  color: ${props => props.theme.colors.text.primary};
`;

const DealerLocation = styled.Text`
  font-size: 12px;
  color: ${props => props.theme.colors.text.secondary};
  text-align: center;
`;

const RatingBadge = styled.View`
  flex-direction: row;
  align-items: center;
  background-color: rgba(255, 215, 0, 0.15);
  padding: 4px 8px;
  border-radius: 12px;
  margin-top: 4px;
`;

const RatingText = styled.Text`
  font-size: 11px;
  font-weight: 700;
  color: #bfa100;
  margin-left: 4px;
`;

export default function DealersSpotlight() {
  return (
    <Container>
      <Header>
        <SectionTitle>Featured Dealers</SectionTitle>
        <ViewAll>View All</ViewAll>
      </Header>
      <ScrollContent horizontal showsHorizontalScrollIndicator={false}>
        {dealers.map((dealer) => (
          <DealerCard key={dealer.id}>
            <View style={{ alignItems: 'center' }}>
              <DealerLogoPlaceholder>
                <Ionicons name="business" size={24} color={theme.colors.text.disabled} />
              </DealerLogoPlaceholder>
              <DealerName numberOfLines={1}>{dealer.name}</DealerName>
              <DealerLocation>{dealer.location}</DealerLocation>
            </View>
            <RatingBadge>
              <Ionicons name="star" size={10} color="#fbbf24" />
              <RatingText>{dealer.rating}</RatingText>
            </RatingBadge>
          </DealerCard>
        ))}
        <View style={{ width: '20px' as any }} />
      </ScrollContent>
    </Container>
  );
}
