import React from 'react';
import styled from 'styled-components/native';
import { View, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../styles/theme';
import { CarListing } from '../../types/CarListing';

const Section = styled.View`
  padding: 20px;
  background-color: ${props => props.theme.colors.background.paper};
  margin-top: 12px;
`;

const SectionTitle = styled.Text`
  font-size: 18px;
  font-weight: 700;
  color: ${props => props.theme.colors.text.primary};
  margin-bottom: 16px;
`;

const SellerCard = styled.View`
  flex-direction: row;
  align-items: center;
  gap: 16px;
`;

const Avatar = styled.View`
  width: 60px;
  height: 60px;
  border-radius: 30px;
  background-color: ${props => props.theme.colors.background.dark};
  justify-content: center;
  align-items: center;
`;

const Info = styled.View`
  flex: 1;
`;

const Name = styled.Text`
  font-size: 16px;
  font-weight: 700;
  color: ${props => props.theme.colors.text.primary};
  margin-bottom: 4px;
`;

const Type = styled.Text`
  font-size: 13px;
  color: ${props => props.theme.colors.text.secondary};
  text-transform: capitalize;
  margin-bottom: 6px;
`;

const RatingRow = styled.View`
  flex-direction: row;
  align-items: center;
  gap: 4px;
`;

const RatingText = styled.Text`
  font-size: 13px;
  font-weight: 600;
  color: ${props => props.theme.colors.accent.main};
`;

interface CarDetailsSellerProps {
    car: CarListing;
}

export const CarDetailsSeller: React.FC<CarDetailsSellerProps> = ({ car }) => {
    return (
        <Section theme={theme}>
            <SectionTitle theme={theme}>Seller</SectionTitle>
            <SellerCard>
                <Avatar theme={theme}>
                    <Ionicons name="person" size={30} color={theme.colors.text.secondary} />
                </Avatar>
                <Info>
                    <Name theme={theme}>{car.sellerName || 'Private Seller'}</Name>
                    <Type theme={theme}>{car.sellerType || 'Private'}</Type>
                    <RatingRow>
                        <Ionicons name="star" size={14} color={theme.colors.accent.main} />
                        <RatingText theme={theme}>5.0 (Mock)</RatingText>
                    </RatingRow>
                </Info>
                <Ionicons name="chevron-forward" size={24} color={theme.colors.text.disabled} />
            </SellerCard>
        </Section>
    );
};
