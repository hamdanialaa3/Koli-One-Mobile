import React from 'react';
import styled from 'styled-components/native';
import { View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../styles/theme';

const Container = styled.View`
  background-color: rgba(16, 185, 129, 0.06);
  border-width: 1px;
  border-color: rgba(16, 185, 129, 0.12);
  border-radius: 12px;
  padding: 16px;
  margin: 16px 20px 0;
  align-items: center;
`;

const LabelRow = styled.View`
  flex-direction: row;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
`;

const Label = styled.Text`
  color: #10b981;
  font-size: 16px;
  font-weight: 700;
`;

const BarContainer = styled.View`
  height: 8px;
  width: 100%;
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 8px;
`;

const Description = styled.Text`
  font-size: 12px;
  color: ${props => props.theme.colors.text.secondary};
  text-align: center;
`;

interface PriceRatingProps {
    price: number;
}

export const PriceRating: React.FC<PriceRatingProps> = ({ price }) => {
    // Logic to determine fairness would go here. For now, mock "Good Price".
    return (
        <Container theme={theme}>
            <LabelRow>
                <Ionicons name="pricetag" size={18} color="#10b981" />
                <Label>Fair Price</Label>
            </LabelRow>
            <BarContainer>
                <LinearGradient
                    colors={['#ef4444', '#f59e0b', '#10b981']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={{ flex: 1 }}
                />
                {/* Pointer could be added here */}
            </BarContainer>
            <Description theme={theme}>
                This car is priced within the expected range for its specs.
            </Description>
        </Container>
    );
};
