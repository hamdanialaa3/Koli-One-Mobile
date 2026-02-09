import React from 'react';
import styled from 'styled-components/native';
import { View, Text, ScrollView, Image } from 'react-native';
import { theme } from '../../../styles/theme';
import { VehicleFormData } from '../../../types/sellTypes';
import { Ionicons } from '@expo/vector-icons';

interface ReviewStepProps {
    data: Partial<VehicleFormData>;
}

const StepContainer = styled.View`
  padding: 24px 20px;
`;

const Title = styled.Text`
  font-size: 24px;
  font-weight: 800;
  color: ${props => props.theme.colors.text.primary};
  margin-bottom: 8px;
`;

const Subtitle = styled.Text`
  font-size: 15px;
  color: ${props => props.theme.colors.text.secondary};
  margin-bottom: 24px;
`;

const Section = styled.View`
  background-color: ${props => props.theme.colors.background.paper};
  border-radius: 16px;
  padding: 16px;
  margin-bottom: 20px;
  border-width: 1px;
  border-color: ${props => props.theme.colors.border.muted};
`;

const SectionTitle = styled.Text`
  font-size: 14px;
  font-weight: 700;
  color: ${props => props.theme.colors.primary.main};
  text-transform: uppercase;
  margin-bottom: 12px;
`;

const InfoRow = styled.View`
  flex-direction: row;
  justify-content: space-between;
  margin-bottom: 8px;
`;

const InfoLabel = styled.Text`
  font-size: 14px;
  color: ${props => props.theme.colors.text.secondary};
`;

const InfoValue = styled.Text`
  font-size: 14px;
  font-weight: 600;
  color: ${props => props.theme.colors.text.primary};
`;

const Badge = styled.View`
  background-color: ${props => props.theme.colors.primary.main + '20'};
  padding: 4px 10px;
  border-radius: 12px;
  margin-right: 8px;
  margin-bottom: 8px;
`;

const BadgeText = styled.Text`
  font-size: 12px;
  color: ${props => props.theme.colors.primary.main};
  font-weight: 700;
`;

const BadgeContainer = styled.View`
  flex-direction: row;
  flex-wrap: wrap;
`;

const ReviewStep: React.FC<ReviewStepProps> = ({ data }) => {
    return (
        <StepContainer theme={theme}>
            <Title theme={theme}>Review Ad</Title>
            <Subtitle theme={theme}>Please check all information before publishing.</Subtitle>

            <Section theme={theme}>
                <SectionTitle theme={theme}>Basic Info</SectionTitle>
                <InfoRow><InfoLabel theme={theme}>Vehicle</InfoLabel><InfoValue theme={theme}>{data.make} {data.model}</InfoValue></InfoRow>
                <InfoRow><InfoLabel theme={theme}>Year</InfoLabel><InfoValue theme={theme}>{data.year}</InfoValue></InfoRow>
                <InfoRow><InfoLabel theme={theme}>Price</InfoLabel><InfoValue theme={theme}>{data.price} EUR</InfoValue></InfoRow>
            </Section>

            <Section theme={theme}>
                <SectionTitle theme={theme}>Technicals</SectionTitle>
                <InfoRow><InfoLabel theme={theme}>Mileage</InfoLabel><InfoValue theme={theme}>{data.mileage} km</InfoValue></InfoRow>
                {data.vin && <InfoRow><InfoLabel theme={theme}>VIN</InfoLabel><InfoValue theme={theme}>{data.vin}</InfoValue></InfoRow>}
                <InfoRow><InfoLabel theme={theme}>Transmission</InfoLabel><InfoValue theme={theme}>{data.transmission}</InfoValue></InfoRow>
                <InfoRow><InfoLabel theme={theme}>Fuel</InfoLabel><InfoValue theme={theme}>{data.fuelType}</InfoValue></InfoRow>
            </Section>

            <Section theme={theme}>
                <SectionTitle theme={theme}>Equipment</SectionTitle>
                <BadgeContainer>
                    {Object.values(data.equipment || {}).flat().map(i => (
                        <Badge key={i} theme={theme}><BadgeText theme={theme}>{i}</BadgeText></Badge>
                    ))}
                    {Object.values(data.equipment || {}).flat().length === 0 && <InfoLabel theme={theme}>No equipment selected</InfoLabel>}
                </BadgeContainer>
            </Section>

            <Section theme={theme}>
                <SectionTitle theme={theme}>Contact</SectionTitle>
                <InfoRow><InfoLabel theme={theme}>Seller</InfoLabel><InfoValue theme={theme}>{data.contactName}</InfoValue></InfoRow>
                <InfoRow><InfoLabel theme={theme}>Phone</InfoLabel><InfoValue theme={theme}>{data.contactPhone}</InfoValue></InfoRow>
                <InfoRow><InfoLabel theme={theme}>Location</InfoLabel><InfoValue theme={theme}>{data.saleCity}, {data.saleProvince}</InfoValue></InfoRow>
            </Section>

            <View style={{ height: 20 }} />
        </StepContainer>
    );
};

export default ReviewStep;
